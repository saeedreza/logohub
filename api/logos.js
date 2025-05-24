/**
 * Logos Listing API Endpoint - Vercel Serverless Function
 *
 * Provides a paginated list of all available logos with search and filtering capabilities.
 * Supports format filtering and full-text search across logo metadata.
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Vercel serverless function handler
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 */
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Parse and validate query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const format = req.query.format;
    const search = req.query.search;

    // Get the logos directory path
    const logosPath = path.join(process.cwd(), 'logos');

    let companies;
    try {
      // Read all company directories from logos folder
      companies = await fs.readdir(logosPath);
      companies = companies.filter(name => !name.startsWith('.'));
    } catch (err) {
      // Handle case where logos directory doesn't exist yet
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
              versionParts.shift();
              return versionParts.join('-') || company;
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
            versions: [...new Set(versions)],
            formats: availableFormats,
            capabilities: {
              colorCustomization: !!metadata.colors?.length,
              dynamicSizing: true,
            },
            url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${company}`,
          };
        } catch (err) {
          return null;
        }
      })
    );

    // Remove null entries
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

    // Add helpful messages when no results found
    if (filteredLogos.length === 0) {
      response.message = search
        ? `No logos found for "${search}". Try a different search term.`
        : 'No logos found. Add logos to the /logos directory to get started!';
    }

    // Set cache headers and return response
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(response);
  } catch (err) {
    console.error('Error fetching logos:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
