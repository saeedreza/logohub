const fs = require('fs').promises;
const path = require('path');
const { STANDARD_SIZES } = require('../../../../tools/image-converter');

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
      const versionParts = parts[0].split('-');
      // Remove company name prefix to get version
      versionParts.shift();
      const versionName = versionParts.join('-');
      
      if (!versionMap.has(versionName)) {
        const version = { 
          name: versionName, 
          formats: {
            svg: {
              url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${id}/${versionName}.svg`
            },
            png: {
              sizes: STANDARD_SIZES.map(size => ({
                size,
                width: size,
                height: size,
                url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${id}/${versionName}-${size}x${size}.png`
              })),
              // Also provide size-flexible URL
              dynamic: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${id}/${versionName}.png?size={size}`
            },
            webp: {
              sizes: STANDARD_SIZES.map(size => ({
                size,
                width: size,
                height: size,
                url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${id}/${versionName}-${size}x${size}.webp`
              })),
              // Also provide size-flexible URL
              dynamic: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${id}/${versionName}.webp?size={size}`
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
  } catch (err) {
    console.error('Error fetching logo:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 