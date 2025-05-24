/**
 * Individual Logo API Endpoint - Vercel Serverless Function
 *
 * Serves individual logos with dynamic format conversion and color customization.
 * Supports SVG, PNG, and WebP formats with real-time image processing.
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

// Environment configuration
const MAX_IMAGE_SIZE = parseInt(process.env.MAX_IMAGE_SIZE) || 2048;
const CACHE_MAX_AGE = process.env.CACHE_MAX_AGE || '31536000';

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
    // Get logo ID from route parameter
    const logoId = req.params.id;
    if (!logoId) {
      return res
        .status(400)
        .json({ error: 'Logo ID is required in the URL path' });
    }

    // Parse other query parameters
    const { size, format = 'svg', color } = req.query;

    // Build paths to logo files
    const logoPath = path.join(process.cwd(), 'logos', logoId);
    const svgPath = path.join(logoPath, `${logoId}.svg`);

    let svgContent;

    try {
      // Try to read the logo file
      svgContent = await fs.readFile(svgPath, 'utf8');
    } catch (err) {
      // If logo not found, return 404
      return res.status(404).json({
        error: 'Logo not found',
        available: 'Use /api/v1/logos to see available logos',
      });
    }

    // Apply color customization if requested
    if (color && color.match(/^[0-9a-fA-F]{6}$/)) {
      // Replace fill and stroke colors in SVG
      svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="#${color}"`);
      svgContent = svgContent.replace(/stroke="[^"]*"/g, `stroke="#${color}"`);
    }

    // Return SVG directly if no conversion needed
    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE}`);
      return res.send(svgContent);
    }

    // Convert SVG to raster formats using Sharp
    const buffer = Buffer.from(svgContent);
    let image = sharp(buffer);

    // Apply sizing if requested (maintain aspect ratio)
    if (size) {
      const sizeInt = parseInt(size);
      if (sizeInt > 0 && sizeInt <= MAX_IMAGE_SIZE) {
        image = image.resize(sizeInt, sizeInt, {
          fit: 'inside',
          withoutEnlargement: false,
        });
      }
    }

    // Convert to requested format
    if (format === 'png') {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE}`);
      res.send(await image.png().toBuffer());
    } else if (format === 'webp') {
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE}`);
      res.send(await image.webp().toBuffer());
    } else {
      res.status(400).json({
        error: 'Unsupported format',
        supported: ['svg', 'png', 'webp'],
      });
    }
  } catch (error) {
    console.error('Error serving logo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
