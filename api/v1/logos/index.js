const fs = require('fs').promises;
const path = require('path');

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
  
  rateLimit(req, res);
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const industry = req.query.industry;
    const format = req.query.format;
    
    // Get the absolute path to the logos directory
    const logosPath = path.join(process.cwd(), 'logos');
    
    let companies;
    try {
      companies = await fs.readdir(logosPath);
      // Filter out non-directory entries and hidden files
      companies = companies.filter(name => !name.startsWith('.'));
    } catch (err) {
      // Logos directory doesn't exist yet - return empty result
      return res.json({
        total: 0,
        page,
        limit,
        logos: [],
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
          
          // Apply industry filter if specified
          if (industry && !metadata.industry.includes(industry)) {
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
          
          // Get available formats
          const formats = [...new Set(files
            .filter(f => !f.endsWith('metadata.json'))
            .map(f => f.split('.').pop())
          )];
          
          // Apply format filter if specified
          if (format && !formats.includes(format)) {
            return null;
          }
          
          return {
            id: company,
            name: metadata.name,
            versions: [...new Set(versions)],
            formats,
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
      logos: paginatedLogos
    };
    
    // Add helpful message if no logos found
    if (filteredLogos.length === 0) {
      response.message = 'No logos found. Add logos to the /logos directory to get started!';
    }
    
    res.json(response);
  } catch (err) {
    console.error('Error fetching logos:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 