const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple rate limiting middleware (optional for now)
const rateLimits = new Map();
const rateLimit = (req, res, next) => {
  const apiKey = req.headers.authorization?.split(' ')[1];
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const identifier = apiKey || clientIP;
  
  // For development, we'll be more lenient with rate limiting
  if (!rateLimits.has(identifier)) {
    rateLimits.set(identifier, {
      limit: 100,
      remaining: 100,
      reset: Date.now() + 3600000, // 1 hour from now
    });
  }
  
  const limit = rateLimits.get(identifier);
  
  // Reset if time expired
  if (Date.now() > limit.reset) {
    limit.remaining = limit.limit;
    limit.reset = Date.now() + 3600000;
  }
  
  // Set headers
  res.setHeader('X-RateLimit-Limit', limit.limit);
  res.setHeader('X-RateLimit-Remaining', limit.remaining);
  res.setHeader('X-RateLimit-Reset', Math.floor(limit.reset / 1000));
  
  // For now, we'll warn but not block
  if (limit.remaining <= 0) {
    console.warn(`Rate limit exceeded for ${identifier}`);
    // Don't block for now, just log
  }
  
  // Decrement remaining requests
  limit.remaining--;
  
  next();
};

// Apply rate limiting to API routes
app.use('/v1', rateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all logos
app.get('/v1/logos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const industry = req.query.industry;
    const format = req.query.format;
    
    // Read logos directory
    const logosPath = path.join(process.cwd(), 'logos');
    const companies = await fs.readdir(logosPath);
    
    // Filter and format results
    const logos = await Promise.all(
      companies.map(async (company) => {
        try {
          const metadataPath = path.join(logosPath, company, 'metadata.json');
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          
          // Apply industry filter if specified
          if (industry && !metadata.industry.includes(industry)) {
            return null;
          }
          
          // Get available versions and formats
          const files = await fs.readdir(path.join(logosPath, company));
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
            url: `${req.protocol}://${req.get('host')}/v1/logos/${company}`
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
    
    res.json({
      total: filteredLogos.length,
      page,
      limit,
      logos: paginatedLogos
    });
  } catch (err) {
    console.error('Error fetching logos:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get logo by ID
app.get('/v1/logos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const logoPath = path.join(process.cwd(), 'logos', id);
    
    // Check if logo exists
    try {
      await fs.access(logoPath);
    } catch (err) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    // Read metadata
    const metadataPath = path.join(logoPath, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    
    // Get files to determine versions and formats
    const files = await fs.readdir(logoPath);
    const svgFiles = files.filter(f => f.endsWith('.svg'));
    const pngFiles = files.filter(f => f.endsWith('.png'));
    
    // Group by version
    const versions = [];
    const versionMap = new Map();
    
    // Process SVG files
    for (const file of svgFiles) {
      const parts = file.split('.');
      const versionParts = parts[0].split('-');
      // Remove company name prefix to get version
      versionParts.shift();
      const versionName = versionParts.join('-');
      
      if (!versionMap.has(versionName)) {
        const version = { name: versionName, formats: [] };
        versions.push(version);
        versionMap.set(versionName, version);
      }
      
      versionMap.get(versionName).formats.push({
        format: 'svg',
        url: `${req.protocol}://${req.get('host')}/v1/logos/${id}/${versionName}.svg`
      });
    }
    
    // Process PNG files (group by size)
    for (const file of pngFiles) {
      const parts = file.split('.');
      const nameParts = parts[0].split('-');
      const sizePart = nameParts[nameParts.length - 1]; // Get size part (e.g., 16x16)
      
      // Remove company name prefix and size suffix to get version
      nameParts.shift();
      nameParts.pop();
      const versionName = nameParts.join('-');
      
      if (!versionMap.has(versionName)) {
        const version = { name: versionName, formats: [] };
        versions.push(version);
        versionMap.set(versionName, version);
      }
      
      // Find or create PNG format entry
      let pngFormat = versionMap.get(versionName).formats.find(f => f.format === 'png');
      if (!pngFormat) {
        pngFormat = { format: 'png', sizes: [] };
        versionMap.get(versionName).formats.push(pngFormat);
      }
      
      // Parse size
      const [width, height] = sizePart.split('x').map(Number);
      
      // Add size
      pngFormat.sizes.push({
        width,
        height,
        url: `${req.protocol}://${req.get('host')}/v1/logos/${id}/${versionName}-${width}x${height}.png`
      });
    }
    
    res.json({
      id,
      name: metadata.name,
      website: metadata.website,
      industry: metadata.industry,
      colors: metadata.colors,
      versions
    });
  } catch (err) {
    console.error('Error fetching logo:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get logo file
app.get('/v1/logos/:id/:file', async (req, res) => {
  try {
    const id = req.params.id;
    const file = req.params.file;
    const color = req.query.color;
    const size = req.query.size;
    
    const logoDir = path.join(process.cwd(), 'logos', id);
    
    // Check if directory exists
    try {
      await fs.access(logoDir);
    } catch (err) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    // Parse file parts
    const [name, format] = file.split('.');
    
    // Handle SVG with color replacement
    if (format === 'svg' && color) {
      try {
        // Get original SVG
        const svgPath = path.join(logoDir, `${id}-${name}.svg`);
        const svgContent = await fs.readFile(svgPath, 'utf8');
        
        // Get metadata to find original colors
        const metadataPath = path.join(logoDir, 'metadata.json');
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
        
        // Replace primary color with requested color
        const primaryColor = metadata.colors.primary;
        const modifiedSvg = svgContent.replace(
          new RegExp(primaryColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          `#${color}`
        );
        
        res.setHeader('Content-Type', 'image/svg+xml');
        return res.send(modifiedSvg);
      } catch (err) {
        console.error('Error processing SVG:', err);
        return res.status(500).json({ error: 'Error processing SVG' });
      }
    }
    
    // Handle PNG with size
    if (format === 'png' && size) {
      const pngPath = path.join(logoDir, `${id}-${name}-${size}.png`);
      try {
        await fs.access(pngPath);
        res.setHeader('Content-Type', 'image/png');
        return res.sendFile(pngPath);
      } catch (err) {
        return res.status(404).json({ error: 'Logo with specified size not found' });
      }
    }
    
    // Handle standard file (no modifications)
    const filePath = path.join(logoDir, `${id}-${name}.${format}`);
    try {
      await fs.access(filePath);
      
      if (format === 'svg') {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (format === 'png') {
        res.setHeader('Content-Type', 'image/png');
      } else if (format === 'webp') {
        res.setHeader('Content-Type', 'image/webp');
      }
      
      return res.sendFile(filePath);
    } catch (err) {
      return res.status(404).json({ error: 'Logo file not found' });
    }
  } catch (err) {
    console.error('Error fetching logo file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// For Vercel serverless functions, export the app
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(port, () => {
    console.log(`LogoHub API server running on port ${port}`);
  });
} 