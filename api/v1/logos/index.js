const fs = require('fs').promises;
const path = require('path');
const { analytics } = require('../../utils/analytics');

// Simple rate limiting
const rateLimits = new Map();

const rateLimit = (req, res) => {
  const apiKey = req.headers.authorization?.split(' ')[1];
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const identifier = apiKey || clientIP;
  
  if (!rateLimits.has(identifier)) {
    rateLimits.set(identifier, {
      limit: 100,
      remaining: 100,
      reset: Date.now() + 3600000,
    });
  }
  
  const limit = rateLimits.get(identifier);
  
  if (Date.now() > limit.reset) {
    limit.remaining = limit.limit;
    limit.reset = Date.now() + 3600000;
  }
  
  res.setHeader('X-RateLimit-Limit', limit.limit);
  res.setHeader('X-RateLimit-Remaining', limit.remaining);
  res.setHeader('X-RateLimit-Reset', Math.floor(limit.reset / 1000));
  
  if (limit.remaining <= 0) {
    console.warn(`Rate limit exceeded for ${identifier}`);
  }
  
  limit.remaining--;
  
  return true;
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  // Track API call
  await analytics.trackApiCall(req, '/api/v1/logos', {
    hasFilters: !!(req.query.industry || req.query.format),
    pagination: { page: req.query.page, limit: req.query.limit }
  });
  
  rateLimit(req, res);
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const industry = req.query.industry;
    const format = req.query.format;
    const search = req.query.search; // Add search support
    
    // Track search queries if present
    if (search) {
      await analytics.trackSearch(req, search, {
        filters: { industry, format }
      });
    }
    
    // Get the absolute path to the logos directory
    const logosPath = path.join(process.cwd(), 'logos');
    
    let companies;
    try {
      companies = await fs.readdir(logosPath);
      // Filter out non-directory entries and hidden files
      companies = companies.filter(name => !name.startsWith('.'));
    } catch (err) {
      // Logos directory doesn't exist yet - return empty result
      await analytics.trackError(err, { endpoint: '/api/v1/logos', context: 'logos_directory_missing' });
      return res.json({
        total: 0,
        page,
        limit,
        logos: [],
        capabilities: {
          formats: ['svg', 'png', 'webp'],
          dynamicConversion: true,
          colorCustomization: true,
          standardSizes: [16, 32, 64, 128, 256, 512]
        },
        message: 'LogoHub API is running! Add logos to the /logos directory to see them here.'
      });
    }
    
    // Filter and format results
    const logos = await Promise.all(
      companies.map(async (company) => {
        try {
          const companyPath = path.join(logosPath, company);
          const stat = await fs.stat(companyPath);
          
          // Skip if not a directory
          if (!stat.isDirectory()) {
            return null;
          }
          
          const metadataPath = path.join(companyPath, 'metadata.json');
          let metadata;
          
          try {
            metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          } catch (err) {
            // Skip companies without proper metadata
            console.warn(`No metadata found for ${company}`);
            return null;
          }
          
          // Apply search filter if specified
          if (search) {
            const searchLower = search.toLowerCase();
            const matchesName = metadata.name?.toLowerCase().includes(searchLower);
            const matchesTitle = metadata.title?.toLowerCase().includes(searchLower);
            const matchesTags = metadata.tags?.some(tag => tag.toLowerCase().includes(searchLower));
            const matchesCategory = metadata.category?.toLowerCase().includes(searchLower);
            
            if (!matchesName && !matchesTitle && !matchesTags && !matchesCategory) {
              return null;
            }
          }
          
          // Apply industry filter if specified  
          if (industry && metadata.category !== industry) {
            return null;
          }
          
          // Get available versions and formats
          const files = await fs.readdir(companyPath);
          const versions = files
            .filter(f => f.endsWith('.svg') && !f.endsWith('metadata.json'))
            .map(f => {
              const parts = f.split('.');
              const versionParts = parts[0].split('-');
              // Remove company name prefix to get version
              versionParts.shift();
              return versionParts.join('-');
            });
          
          // Available formats - SVG from files, PNG/WebP via conversion
          const availableFormats = ['svg', 'png', 'webp'];
          
          // Apply format filter if specified
          if (format && !availableFormats.includes(format)) {
            return null;
          }
          
          return {
            id: company,
            name: metadata.name,
            title: metadata.title,
            category: metadata.category,
            tags: metadata.tags || [],
            versions: [...new Set(versions)],
            formats: availableFormats,
            capabilities: {
              colorCustomization: !!metadata.colors?.length,
              dynamicSizing: true
            },
            url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${company}`
          };
        } catch (err) {
          console.error(`Error processing ${company}:`, err);
          return null;
        }
      })
    );
    
    // Remove null entries (filtered out)
    const filteredLogos = logos.filter(Boolean);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedLogos = filteredLogos.slice(startIndex, endIndex);
    
    const response = {
      total: filteredLogos.length,
      page,
      limit,
      logos: paginatedLogos,
      categories: [...new Set(filteredLogos.map(logo => logo.category))].sort(),
      capabilities: {
        formats: ['svg', 'png', 'webp'],
        dynamicConversion: true,
        colorCustomization: true,
        searchEnabled: true,
        standardSizes: [16, 32, 64, 128, 256, 512]
      }
    };
    
    // Track search results
    if (search) {
      await analytics.trackSearch(req, search, {
        resultsCount: filteredLogos.length,
        filters: { industry, format }
      });
    }
    
    // Add helpful message if no logos found
    if (filteredLogos.length === 0) {
      response.message = search 
        ? `No logos found for "${search}". Try a different search term.`
        : 'No logos found. Add logos to the /logos directory to get started!';
    }
    
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.json(response);
  } catch (err) {
    console.error('Error fetching logos:', err);
    await analytics.trackError(err, { endpoint: '/api/v1/logos', statusCode: 500 });
    res.status(500).json({ error: 'Internal server error' });
  }
}; 