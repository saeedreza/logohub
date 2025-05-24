/**
 * Logo Listing API Endpoint
 *
 * Provides a paginated list of all available logos with search and filtering capabilities.
 * Supports format filtering and full-text search across logo metadata.
 * Returns structured data about each logo including available formats and capabilities.
 */

const fs = require('fs').promises;
const path = require('path');
const { analytics } = require('../../utils/analytics');

/**
 * Handle GET /api/v1/logos endpoint
 *
 * Query Parameters:
 * - page: Page number for pagination (default: 1)
 * - limit: Results per page (default: 20, max: 100)
 * - format: Filter by supported format (svg, png, webp)
 * - search: Search term for logo names, titles, tags
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
module.exports = async (req, res) => {
  // Enable CORS for public API access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Track API usage for analytics
  await analytics.trackApiCall(req, '/api/v1/logos', {
    hasFilters: !!req.query.format,
    pagination: { page: req.query.page, limit: req.query.limit },
  });

  try {
    // Parse and validate query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Cap at 100 for performance
    const format = req.query.format;
    const search = req.query.search;

    // Track search queries for analytics
    if (search) {
      await analytics.trackSearch(req, search, {
        filters: { format },
      });
    }

    // Get the logos directory path
    const logosPath = path.join(process.cwd(), 'logos');

    let companies;
    try {
      // Read all company directories from logos folder
      companies = await fs.readdir(logosPath);
      // Filter out hidden files and non-directories
      companies = companies.filter(name => !name.startsWith('.'));
    } catch (err) {
      // Handle case where logos directory doesn't exist yet
      await analytics.trackError(err, {
        endpoint: '/api/v1/logos',
        context: 'logos_directory_missing',
      });
      return res.json({
        total: 0,
        page,
        limit,
        logos: [],
        capabilities: {
          formats: ['svg', 'png', 'webp'],
          dynamicConversion: true,
          colorCustomization: true,
          standardSizes: [16, 32, 64, 128, 256, 512],
        },
        message:
          'LogoHub API is running! Add logos to the /logos directory to see them here.',
      });
    }

    // Process each company directory to extract logo metadata
    const logos = await Promise.all(
      companies.map(async company => {
        try {
          const companyPath = path.join(logosPath, company);
          const stat = await fs.stat(companyPath);

          // Skip non-directory entries
          if (!stat.isDirectory()) {
            return null;
          }

          // Read logo metadata
          const metadataPath = path.join(companyPath, 'metadata.json');
          let metadata;

          try {
            metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          } catch (err) {
            // Skip logos without proper metadata
            console.warn(`No metadata found for ${company}`);
            return null;
          }

          // Apply search filter if specified
          if (search) {
            const searchLower = search.toLowerCase();
            const matchesName = metadata.name
              ?.toLowerCase()
              .includes(searchLower);
            const matchesTitle = metadata.title
              ?.toLowerCase()
              .includes(searchLower);
            const matchesTags = metadata.tags?.some(tag =>
              tag.toLowerCase().includes(searchLower)
            );

            // Skip if no search matches found
            if (!matchesName && !matchesTitle && !matchesTags) {
              return null;
            }
          }

          // Discover available logo versions from SVG files
          const files = await fs.readdir(companyPath);
          const versions = files
            .filter(f => f.endsWith('.svg') && !f.endsWith('metadata.json'))
            .map(f => {
              const parts = f.split('.');
              const versionParts = parts[0].split('-');
              // Remove company name prefix to get version name
              versionParts.shift();
              return versionParts.join('-');
            });

          // All logos support these formats (SVG native, PNG/WebP via conversion)
          const availableFormats = ['svg', 'png', 'webp'];

          // Apply format filter if specified
          if (format && !availableFormats.includes(format)) {
            return null;
          }

          // Build logo entry for API response
          return {
            id: company,
            name: metadata.name,
            title: metadata.title,
            tags: metadata.tags || [],
            versions: [...new Set(versions)], // Remove duplicates
            formats: availableFormats,
            capabilities: {
              colorCustomization: !!metadata.colors?.length,
              dynamicSizing: true,
            },
            url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${company}`,
          };
        } catch (err) {
          console.error(`Error processing ${company}:`, err);
          return null;
        }
      })
    );

    // Remove null entries (logos that were filtered out or had errors)
    const filteredLogos = logos.filter(Boolean);

    // Apply pagination to results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedLogos = filteredLogos.slice(startIndex, endIndex);

    // Build API response
    const response = {
      total: filteredLogos.length,
      page,
      limit,
      logos: paginatedLogos,
      capabilities: {
        formats: ['svg', 'png', 'webp'],
        dynamicConversion: true,
        colorCustomization: true,
        searchEnabled: true,
        standardSizes: [16, 32, 64, 128, 256, 512],
      },
    };

    // Track search results for analytics
    if (search) {
      await analytics.trackSearch(req, search, {
        resultsCount: filteredLogos.length,
        filters: { format },
      });
    }

    // Add helpful messages when no results found
    if (filteredLogos.length === 0) {
      response.message = search
        ? `No logos found for "${search}". Try a different search term.`
        : 'No logos found. Add logos to the /logos directory to get started!';
    }

    // Set cache headers and return response
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.json(response);
  } catch (err) {
    // Handle unexpected errors
    console.error('Error fetching logos:', err);
    await analytics.trackError(err, {
      endpoint: '/api/v1/logos',
      statusCode: 500,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};
