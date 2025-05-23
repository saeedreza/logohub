const fs = require('fs').promises;
const path = require('path');
const { 
  convertSvgBufferToPng, 
  convertSvgBufferToWebp, 
  isValidSize,
  parseSizeFromFilename,
  STANDARD_SIZES 
} = require('../../../tools/image-converter');

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
    const { id } = req.query;
    const { file, color, size } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing id parameter' });
    }

    const logoPath = path.join(process.cwd(), 'logos', id);
    
    // Check if logo exists
    try {
      await fs.access(logoPath);
    } catch (err) {
      return res.status(404).json({ error: 'Logo not found' });
    }

    // If no file parameter, return metadata
    if (!file) {
      return await handleMetadata(req, res, id, logoPath);
    }

    // Handle file request
    return await handleFile(req, res, id, logoPath, file, color, size);
    
  } catch (err) {
    console.error('Error in logo API:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function handleMetadata(req, res, id, logoPath) {
  // Read metadata
  const metadataPath = path.join(logoPath, 'metadata.json');
  let metadata;
  try {
    metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
  } catch (err) {
    return res.status(500).json({ error: 'Could not read logo metadata' });
  }
  
  // Get files to determine versions and formats
  const files = await fs.readdir(logoPath);
  const svgFiles = files.filter(f => f.endsWith('.svg'));
  
  // Group by version
  const versions = [];
  const versionMap = new Map();
  
  // Process SVG files
  for (const file of svgFiles) {
    const parts = file.split('.');
    const baseName = parts[0]; // e.g., "sample-company-standard"
    const versionParts = baseName.split('-');
    // Remove company name prefix to get version (e.g., "sample-company" -> "standard")
    versionParts.shift(); // Remove first part
    if (versionParts[0] === 'company') {
      versionParts.shift(); // Remove "company" if present
    }
    const versionName = versionParts.join('-');
    
    if (!versionMap.has(versionName)) {
      const version = { 
        name: versionName, 
        formats: {
          svg: {
            url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${id}?file=${versionName}.svg`
          },
          png: {
            sizes: STANDARD_SIZES.map(size => ({
              size,
              width: size,
              height: size,
              url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${id}?file=${versionName}-${size}x${size}.png`
            })),
            // Also provide size-flexible URL
            dynamic: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${id}?file=${versionName}.png&size={size}`
          },
          webp: {
            sizes: STANDARD_SIZES.map(size => ({
              size,
              width: size,
              height: size,
              url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${id}?file=${versionName}-${size}x${size}.webp`
            })),
            // Also provide size-flexible URL
            dynamic: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${id}?file=${versionName}.webp&size={size}`
          }
        }
      };
      versions.push(version);
      versionMap.set(versionName, version);
    }
  }
  
  const response = {
    id,
    name: metadata.name,
    website: metadata.website,
    industry: metadata.industry,
    colors: metadata.colors,
    versions,
    capabilities: {
      colorCustomization: !!metadata.colors?.primary,
      formats: ['svg', 'png', 'webp'],
      standardSizes: STANDARD_SIZES,
      dynamicSizing: true
    }
  };

  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.json(response);
}

async function handleFile(req, res, id, logoPath, file, color, size) {
  // Parse file parts
  const [name, format] = file.split('.');
  
  if (!format || !['svg', 'png', 'webp'].includes(format)) {
    return res.status(400).json({ error: 'Invalid format. Supported formats: svg, png, webp' });
  }

  // Handle SVG files
  if (format === 'svg') {
    try {
      // Try different naming patterns to find the file
      let svgPath;
      let svgContent;
      
      // Pattern 1: id-name.svg (e.g., sample-company-standard.svg)
      svgPath = path.join(logoPath, `${id}-${name}.svg`);
      try {
        svgContent = await fs.readFile(svgPath, 'utf8');
      } catch (err) {
        // Pattern 2: id-company-name.svg (e.g., sample-company-company-standard.svg)
        svgPath = path.join(logoPath, `${id}-company-${name}.svg`);
        try {
          svgContent = await fs.readFile(svgPath, 'utf8');
        } catch (err2) {
          return res.status(404).json({ error: 'SVG file not found' });
        }
      }
      
      // Handle color replacement if requested
      if (color) {
        const metadataPath = path.join(logoPath, 'metadata.json');
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
      // Try different naming patterns to find the SVG file
      let svgPath;
      let svgBuffer;
      
      // Pattern 1: id-name.svg (e.g., sample-company-standard.svg)
      svgPath = path.join(logoPath, `${id}-${name}.svg`);
      try {
        svgBuffer = await fs.readFile(svgPath);
      } catch (err) {
        // Pattern 2: id-company-name.svg (e.g., sample-company-company-standard.svg)
        svgPath = path.join(logoPath, `${id}-company-${name}.svg`);
        try {
          svgBuffer = await fs.readFile(svgPath);
        } catch (err2) {
          return res.status(404).json({ error: 'SVG file not found for conversion' });
        }
      }
      
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
} 