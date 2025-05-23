const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,  // Allow cross-origin resources
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "*"],  // Allow images from any origin
    },
  },
}));
app.use(cors());
app.use(express.json());

// Global OPTIONS handler for CORS preflight requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Health endpoint
app.get('/api/health', require('./health'));

// V1 API Routes
app.get('/api/v1/logos', require('./v1/logos/index'));

// Individual logo endpoint with dynamic sizing and format conversion
app.get('/api/v1/logos/:logoId', async (req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    const { logoId } = req.params;
    const { size, format = 'svg', color } = req.query;
    
    const logoPath = path.join(process.cwd(), 'logos', logoId);
    const svgPath = path.join(logoPath, `${logoId}-standard.svg`);
    
    // Check if logo exists
    try {
      await fs.access(svgPath);
    } catch (err) {
      // Try fallback to simple naming
      const simpleSvgPath = path.join(logoPath, `${logoId}.svg`);
      try {
        await fs.access(simpleSvgPath);
        // Read the simple SVG file
        let svgContent = await fs.readFile(simpleSvgPath, 'utf8');
        
        // Apply color customization if requested
        if (color && color.match(/^[0-9a-fA-F]{6}$/)) {
          svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="#${color}"`);
          svgContent = svgContent.replace(/stroke="[^"]*"/g, `stroke="#${color}"`);
        }
        
        // Return SVG directly if no conversion needed
        if (format === 'svg') {
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=31536000');
          return res.send(svgContent);
        }
        
        // Convert to other formats using Sharp
        const buffer = Buffer.from(svgContent);
        let image = sharp(buffer);
        
        if (size) {
          const sizeInt = parseInt(size);
          if (sizeInt > 0 && sizeInt <= 2048) {
            image = image.resize(sizeInt, sizeInt);
          }
        }
        
        if (format === 'png') {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=31536000');
          return res.send(await image.png().toBuffer());
        } else if (format === 'webp') {
          res.setHeader('Content-Type', 'image/webp');
          res.setHeader('Cache-Control', 'public, max-age=31536000');
          return res.send(await image.webp().toBuffer());
        }
      } catch (simpleErr) {
        // Try fallback to template
        const templatePath = path.join(process.cwd(), 'templates', 'logo-template.svg');
        try {
          await fs.access(templatePath);
          let templateSvg = await fs.readFile(templatePath, 'utf8');
          
          // Replace placeholders
          templateSvg = templateSvg.replace(/{{name}}/g, logoId);
          templateSvg = templateSvg.replace(/{{title}}/g, logoId.charAt(0).toUpperCase() + logoId.slice(1));
          
          if (format === 'svg') {
            res.setHeader('Content-Type', 'image/svg+xml');
            return res.send(templateSvg);
          } else {
            // Convert template to other formats
            const buffer = Buffer.from(templateSvg);
            let image = sharp(buffer);
            
            if (size) {
              image = image.resize(parseInt(size), parseInt(size));
            }
            
            if (format === 'png') {
              res.setHeader('Content-Type', 'image/png');
              return res.send(await image.png().toBuffer());
            } else if (format === 'webp') {
              res.setHeader('Content-Type', 'image/webp');
              return res.send(await image.webp().toBuffer());
            }
          }
        } catch (templateErr) {
          return res.status(404).json({ error: 'Logo not found' });
        }
      }
    }
    
    // Read the SVG file
    let svgContent = await fs.readFile(svgPath, 'utf8');
    
    // Apply color customization if requested
    if (color && color.match(/^[0-9a-fA-F]{6}$/)) {
      // Simple color replacement - replace black/dark colors with the specified color
      svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="#${color}"`);
      svgContent = svgContent.replace(/stroke="[^"]*"/g, `stroke="#${color}"`);
    }
    
    // Return SVG directly if no conversion needed
    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      return res.send(svgContent);
    }
    
    // Convert to other formats using Sharp
    const buffer = Buffer.from(svgContent);
    let image = sharp(buffer);
    
    // Apply sizing if requested
    if (size) {
      const sizeInt = parseInt(size);
      if (sizeInt > 0 && sizeInt <= 2048) {
        image = image.resize(sizeInt, sizeInt);
      }
    }
    
    // Convert to requested format
    if (format === 'png') {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(await image.png().toBuffer());
    } else if (format === 'webp') {
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(await image.webp().toBuffer());
    } else {
      res.status(400).json({ error: 'Unsupported format' });
    }
    
  } catch (error) {
    console.error('Error serving logo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Metadata endpoint
app.get('/api/v1/logos/:logoId/metadata', async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    const { logoId } = req.params;
    const metadataPath = path.join(process.cwd(), 'logos', logoId, 'metadata.json');
    
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    res.json(metadata);
  } catch (error) {
    res.status(404).json({ error: 'Logo metadata not found' });
  }
});

// Serve static assets for development
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static('public'));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LogoHub API running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 API docs: http://localhost:${PORT}/api/v1/logos`);
});

module.exports = app; 