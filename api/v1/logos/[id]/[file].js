const fs = require('fs').promises;
const path = require('path');
const { 
  convertSvgBufferToPng, 
  convertSvgBufferToWebp, 
  isValidSize,
  parseSizeFromFilename 
} = require('../../../../tools/image-converter');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { id, file } = req.query;
    const { color, size } = req.query;
    
    if (!id || !file) {
      return res.status(400).json({ error: 'Missing id or file parameter' });
    }

    const logoDir = path.join(process.cwd(), 'logos', id);
    
    // Check if logo directory exists
    try {
      await fs.access(logoDir);
    } catch (err) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    // Parse file parts
    const [name, format] = file.split('.');
    
    if (!format || !['svg', 'png', 'webp'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Supported formats: svg, png, webp' });
    }

    // Handle SVG files
    if (format === 'svg') {
      try {
        const svgPath = path.join(logoDir, `${id}-${name}.svg`);
        let svgContent = await fs.readFile(svgPath, 'utf8');
        
        // Handle color replacement if requested
        if (color) {
          const metadataPath = path.join(logoDir, 'metadata.json');
          try {
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
            const primaryColor = metadata.colors?.primary;
            
            if (primaryColor) {
              // Replace primary color with requested color (ensure # prefix)
              const targetColor = color.startsWith('#') ? color : `#${color}`;
              svgContent = svgContent.replace(
                new RegExp(primaryColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                targetColor
              );
            }
          } catch (metaErr) {
            console.warn(`Could not read metadata for color replacement: ${metaErr.message}`);
          }
        }
        
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        return res.send(svgContent);
      } catch (err) {
        return res.status(404).json({ error: 'SVG file not found' });
      }
    }

    // Handle PNG and WebP files (converted from SVG)
    if (format === 'png' || format === 'webp') {
      try {
        // First, try to find the original SVG file
        const svgPath = path.join(logoDir, `${id}-${name}.svg`);
        const svgBuffer = await fs.readFile(svgPath);
        
        // Determine size - from query param, filename, or default
        let targetSize = 256; // default size
        
        if (size) {
          const requestedSize = parseInt(size);
          if (!isValidSize(requestedSize)) {
            return res.status(400).json({ error: 'Invalid size. Must be between 1 and 2048 pixels' });
          }
          targetSize = requestedSize;
        } else {
          // Try to parse size from filename (e.g., "logo-64x64.png")
          const parsedSize = parseSizeFromFilename(file);
          if (parsedSize) {
            targetSize = parsedSize;
          }
        }
        
        // Convert SVG to requested format
        let buffer;
        let contentType;
        
        if (format === 'png') {
          buffer = await convertSvgBufferToPng(svgBuffer, targetSize);
          contentType = 'image/png';
        } else {
          buffer = await convertSvgBufferToWebp(svgBuffer, targetSize);
          contentType = 'image/webp';
        }
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.setHeader('Content-Length', buffer.length);
        
        return res.send(buffer);
        
      } catch (err) {
        console.error('Error converting image:', err);
        return res.status(404).json({ error: 'Logo file not found or conversion failed' });
      }
    }
    
  } catch (err) {
    console.error('Error fetching logo file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 