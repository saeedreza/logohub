/**
 * LogoHub API Server
 * 
 * Main Express.js server providing a public API for logo access and manipulation.
 * Supports dynamic format conversion, color customization, and real-time image processing.
 * 
 * Key Features:
 * - RESTful API endpoints for logo discovery and retrieval
 * - Dynamic SVG→PNG/WebP conversion using Sharp
 * - Real-time color customization for SVG logos
 * - Flexible sizing and format options
 * - Template fallback system for missing logos
 * - Comprehensive CORS support for web applications
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const sharp = require('sharp');              // Image processing library
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// === SECURITY & MIDDLEWARE CONFIGURATION ===

/**
 * Security middleware setup using Helmet
 * Configured to allow cross-origin resources and images from any domain
 * for maximum compatibility with web applications and CDN usage
 */
app.use(helmet({
  crossOriginResourcePolicy: false,  // Allow cross-origin resources for CDN usage
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "*"],  // Allow images from any origin for flexibility
    },
  },
}));

// Enable CORS for all routes (public API)
app.use(cors());

// JSON parsing middleware for request bodies
app.use(express.json());

// === GLOBAL CORS HANDLER ===

/**
 * Global OPTIONS handler for CORS preflight requests
 * Ensures all endpoints support cross-origin requests from web applications
 */
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

// === API ENDPOINTS ===

// Health monitoring endpoint
app.get('/api/health', require('./health'));

// V1 API Routes - Logo listing and discovery
app.get('/api/v1/logos', require('./v1/logos/index'));

// V1 Individual logo endpoint with advanced file handling
app.get('/api/v1/logos/:id', require('./v1/logos/[id]'));

/**
 * Legacy Individual Logo Endpoint (Fallback)
 * 
 * This endpoint provides fallback functionality for the main logo serving.
 * The primary endpoint is now handled by ./v1/logos/[id] which supports
 * more advanced features like proper file discovery and conversion.
 * 
 * URL: GET /api/v1/logos/:logoId/legacy
 * Query Parameters:
 * - size: Target size for raster formats (1-2048 pixels)
 * - format: Output format (svg, png, webp) - defaults to svg
 * - color: Color override (hex format without #, e.g., "ff0000")
 */
app.get('/api/v1/logos/:logoId/legacy', async (req, res) => {
  // Set CORS headers for cross-origin access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    const { logoId } = req.params;
    const { size, format = 'svg', color } = req.query;
    
    const logoPath = path.join(process.cwd(), 'logos', logoId);
    const svgPath = path.join(logoPath, `${logoId}-standard.svg`);
    
    // === LOGO FILE DISCOVERY STRATEGY ===
    // Try multiple naming patterns to find the logo file
    
    try {
      // Primary strategy: Check for standard naming pattern
      await fs.access(svgPath);
    } catch (err) {
      // Fallback Strategy 1: Try simplified naming pattern
      const simpleSvgPath = path.join(logoPath, `${logoId}.svg`);
      try {
        await fs.access(simpleSvgPath);
        
        // Read and process the simplified SVG file
        let svgContent = await fs.readFile(simpleSvgPath, 'utf8');
        
        // Apply color customization if requested
        if (color && color.match(/^[0-9a-fA-F]{6}$/)) {
          // Simple color replacement for SVG elements
          svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="#${color}"`);
          svgContent = svgContent.replace(/stroke="[^"]*"/g, `stroke="#${color}"`);
        }
        
        // Return SVG directly if no format conversion needed
        if (format === 'svg') {
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
          return res.send(svgContent);
        }
        
        // === DYNAMIC FORMAT CONVERSION ===
        // Convert SVG to PNG or WebP using Sharp image processing
        const buffer = Buffer.from(svgContent);
        let image = sharp(buffer);
        
        // Apply sizing if requested
        if (size) {
          const sizeInt = parseInt(size);
          if (sizeInt > 0 && sizeInt <= 2048) { // Size validation for safety
            image = image.resize(sizeInt, sizeInt);
          }
        }
        
        // Convert to requested format
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
        // Fallback Strategy 2: Use template-based logo generation
        const templatePath = path.join(process.cwd(), 'templates', 'logo-template.svg');
        try {
          await fs.access(templatePath);
          let templateSvg = await fs.readFile(templatePath, 'utf8');
          
          // Replace template placeholders with logo information
          templateSvg = templateSvg.replace(/{{name}}/g, logoId);
          templateSvg = templateSvg.replace(/{{title}}/g, logoId.charAt(0).toUpperCase() + logoId.slice(1));
          
          // Return template SVG or convert to other formats
          if (format === 'svg') {
            res.setHeader('Content-Type', 'image/svg+xml');
            return res.send(templateSvg);
          } else {
            // Convert template to raster formats
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
          // Final fallback: Return 404 if no logo or template found
          return res.status(404).json({ error: 'Logo not found' });
        }
      }
    }
    
    // === PRIMARY LOGO PROCESSING ===
    // Process the standard named logo file
    
    let svgContent = await fs.readFile(svgPath, 'utf8');
    
    // Apply color customization if requested
    if (color && color.match(/^[0-9a-fA-F]{6}$/)) {
      // Replace fill and stroke colors in SVG with specified color
      svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="#${color}"`);
      svgContent = svgContent.replace(/stroke="[^"]*"/g, `stroke="#${color}"`);
    }
    
    // Return SVG directly if no conversion needed
    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      return res.send(svgContent);
    }
    
    // === IMAGE CONVERSION PIPELINE ===
    // Convert SVG to raster formats using Sharp
    
    const buffer = Buffer.from(svgContent);
    let image = sharp(buffer);
    
    // Apply sizing if requested
    if (size) {
      const sizeInt = parseInt(size);
      if (sizeInt > 0 && sizeInt <= 2048) { // Validate size limits
        image = image.resize(sizeInt, sizeInt);
      }
    }
    
    // Convert to requested format with appropriate headers
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

/**
 * Logo Metadata Endpoint
 * 
 * Returns structured metadata for a specific logo without serving the actual file.
 * Useful for applications that need logo information before deciding which format to request.
 * 
 * URL: GET /api/v1/logos/:logoId/metadata
 */
app.get('/api/v1/logos/:logoId/metadata', async (req, res) => {
  // Set CORS headers for cross-origin access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    const { logoId } = req.params;
    const metadataPath = path.join(process.cwd(), 'logos', logoId, 'metadata.json');
    
    // Read and return logo metadata
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    res.json(metadata);
  } catch (error) {
    res.status(404).json({ error: 'Logo metadata not found' });
  }
});

// === STATIC FILE SERVING ===

/**
 * Development static file serving
 * Serves static assets from the public directory during development
 * Disabled in production for security and performance
 */
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static('public'));
}

// === ERROR HANDLING ===

/**
 * Global error handling middleware
 * Catches any unhandled errors and returns a generic error response
 * Logs detailed error information for debugging
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// === SERVER STARTUP ===

/**
 * Start the Express server and log startup information
 * Provides useful URLs for development and monitoring
 */
app.listen(PORT, () => {
  console.log(`🚀 LogoHub API running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 API docs: http://localhost:${PORT}/api/v1/logos`);
});

// Export app for testing and deployment
module.exports = app; 