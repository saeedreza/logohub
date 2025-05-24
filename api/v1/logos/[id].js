/**
 * Individual Logo API Endpoint
 *
 * Handles requests for specific logos, supporting both metadata retrieval and file serving.
 * Provides dynamic format conversion (SVG→PNG/WebP), color customization, and sizing.
 * Supports fallback patterns for different file naming conventions.
 */

const fs = require('fs').promises;
const path = require('path');
const { analytics } = require('../../utils/analytics');
const {
  convertSvgBufferToPng,
  convertSvgBufferToWebp,
  isValidSize,
  parseSizeFromFilename,
  replaceColorsInSvg,
  STANDARD_SIZES,
} = require('../../../tools/processing/image-converter');

/**
 * Handle GET /api/v1/logos/:id endpoint
 *
 * Two modes of operation:
 * 1. Metadata mode (no file param): Returns logo metadata and available formats
 * 2. File mode (with file param): Returns actual logo files with optional conversion
 *
 * Query Parameters:
 * - file: Filename to serve (e.g., "logo.svg", "logo.png")
 * - color: Color override for SVG (hex without #, e.g., "ff0000")
 * - size: Target size for PNG/WebP conversion (pixels)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
module.exports = async (req, res) => {
  // Enable CORS for public API access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS requests
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
    const { id } = req.params;
    const { file, color, size } = req.query;

    // Validate required logo ID parameter
    if (!id) {
      return res.status(400).json({ error: 'Missing id parameter' });
    }

    // Track API usage for analytics
    await analytics.trackApiCall(req, `/api/v1/logos/${id}`, {
      hasFile: !!file,
      hasColorCustomization: !!color,
      hasSizeCustomization: !!size,
    });

    const logoPath = path.join(process.cwd(), 'logos', id);

    // Verify logo directory exists
    try {
      await fs.access(logoPath);
    } catch (err) {
      await analytics.trackError(new Error('Logo not found'), {
        endpoint: `/api/v1/logos/${id}`,
        statusCode: 404,
        logoId: id,
      });
      return res.status(404).json({ error: 'Logo not found' });
    }

    // Route to appropriate handler based on request type
    if (!file) {
      // Metadata mode: Return logo information and available formats
      await analytics.trackLogoView(req, id, {
        format: 'metadata',
        requestType: 'metadata',
      });
      return await handleMetadata(req, res, id, logoPath);
    }

    // File mode: Serve actual logo files with optional conversion
    const [name, format] = file.split('.');
    await analytics.trackLogoView(req, id, {
      format: format || 'unknown',
      size: size,
      color: color,
      variant: name,
      requestType: 'file',
    });

    return await handleFile(req, res, id, logoPath, file, color, size);
  } catch (err) {
    // Handle unexpected errors
    console.error('Error in logo API:', err);
    await analytics.trackError(err, {
      endpoint: `/api/v1/logos/${req.params.id}`,
      statusCode: 500,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Handle metadata requests for a specific logo
 *
 * Returns structured information about the logo including:
 * - Basic metadata (name, website, colors)
 * - Available versions and formats
 * - Download URLs for different formats and sizes
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} id - Logo identifier
 * @param {string} logoPath - Absolute path to logo directory
 */
async function handleMetadata(req, res, id, logoPath) {
  // Read logo metadata from JSON file
  const metadataPath = path.join(logoPath, 'metadata.json');
  let metadata;
  try {
    metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
  } catch (err) {
    await analytics.trackError(err, {
      endpoint: `/api/v1/logos/${id}`,
      context: 'metadata_read_failed',
      logoId: id,
    });
    return res.status(500).json({ error: 'Could not read logo metadata' });
  }

  // Discover available logo files and versions
  const files = await fs.readdir(logoPath);
  const svgFiles = files.filter(f => f.endsWith('.svg'));

  // Build version information with format URLs
  const versions = [];
  const versionMap = new Map();

  // Process each SVG file to extract version information
  for (const file of svgFiles) {
    const parts = file.split('.');
    const baseName = parts[0]; // e.g., "google" or "google-logo" or "sample-company-standard"

    let versionName;
    if (baseName === id) {
      // Simple naming: "google.svg" -> version name is the logo name
      versionName = id;
    } else {
      // Complex naming: extract version by removing company prefix
      const versionParts = baseName.split('-');
      versionParts.shift(); // Remove first part (company name)
      if (versionParts[0] === 'company') {
        versionParts.shift(); // Remove "company" if present in naming
      }
      versionName = versionParts.join('-') || 'default';
    }

    // Create version entry with download URLs for all formats
    if (!versionMap.has(versionName)) {
      const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/${id}`;

      const version = {
        name: versionName,
        formats: {
          // SVG format (native)
          svg: {
            url: `${baseUrl}?file=${versionName}.svg`,
          },
          // PNG format (converted from SVG)
          png: {
            // Predefined standard sizes
            sizes: STANDARD_SIZES.map(size => ({
              size,
              maxDimension: size,
              url: `${baseUrl}?file=${versionName}-${size}.png`,
            })),
            // Dynamic sizing URL template
            dynamic: `${baseUrl}?file=${versionName}.png&size={size}`,
          },
          // WebP format (converted from SVG)
          webp: {
            // Predefined standard sizes
            sizes: STANDARD_SIZES.map(size => ({
              size,
              maxDimension: size,
              url: `${baseUrl}?file=${versionName}-${size}.webp`,
            })),
            // Dynamic sizing URL template
            dynamic: `${baseUrl}?file=${versionName}.webp&size={size}`,
          },
        },
      };
      versions.push(version);
      versionMap.set(versionName, version);
    }
  }

  // Build comprehensive metadata response
  const response = {
    id,
    name: metadata.name,
    website: metadata.website,
    colors: metadata.colors,
    versions,
    capabilities: {
      colorCustomization: !!metadata.colors?.primary,
      formats: ['svg', 'png', 'webp'],
      standardSizes: STANDARD_SIZES,
      dynamicSizing: true,
    },
  };

  // Set cache headers and return metadata
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.json(response);
}

/**
 * Handle file requests for a specific logo
 *
 * Supports multiple file formats and dynamic conversion:
 * - SVG: Native format with optional color replacement
 * - PNG: Converted from SVG with custom sizing
 * - WebP: Converted from SVG with custom sizing
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} id - Logo identifier
 * @param {string} logoPath - Absolute path to logo directory
 * @param {string} file - Requested filename (e.g., "logo.svg")
 * @param {string} color - Optional color override (hex without #)
 * @param {string} size - Optional size for PNG/WebP conversion
 */
async function handleFile(req, res, id, logoPath, file, color, size) {
  // Parse filename to extract name and format
  const [name, format] = file.split('.');

  // Validate requested format
  if (!format || !['svg', 'png', 'webp'].includes(format)) {
    return res
      .status(400)
      .json({ error: 'Invalid format. Supported formats: svg, png, webp' });
  }

  // Handle SVG file requests (native format)
  if (format === 'svg') {
    try {
      let svgPath;
      let svgContent;

      // Try multiple naming patterns to find the SVG file
      // Pattern 1: Simple naming (e.g., "google.svg")
      svgPath = path.join(logoPath, `${id}.svg`);
      try {
        svgContent = await fs.readFile(svgPath, 'utf8');
      } catch (err) {
        // Pattern 2: id-name.svg (e.g., "google-logo.svg")
        svgPath = path.join(logoPath, `${id}-${name}.svg`);
        try {
          svgContent = await fs.readFile(svgPath, 'utf8');
        } catch (err2) {
          // Pattern 3: id-company-name.svg (legacy naming)
          svgPath = path.join(logoPath, `${id}-company-${name}.svg`);
          try {
            svgContent = await fs.readFile(svgPath, 'utf8');
          } catch (err3) {
            return res.status(404).json({ error: 'SVG file not found' });
          }
        }
      }

      // Apply color customization if requested
      if (color) {
        const metadataPath = path.join(logoPath, 'metadata.json');
        try {
          const _metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

          // Prepare color for replacement
          const targetColor = color.startsWith('#') ? color : `#${color}`;

          // Detect monochrome requests (black/white colors)
          const isMonochrome =
            color.toLowerCase() === 'black' ||
            color.toLowerCase() === 'white' ||
            color === '000000' ||
            color === 'ffffff';

          // Apply intelligent color replacement
          svgContent = replaceColorsInSvg(
            svgContent,
            targetColor,
            isMonochrome
          );
        } catch (metaErr) {
          console.warn(
            `Could not read metadata for color replacement: ${metaErr.message}`
          );
        }
      }

      // Return SVG with appropriate headers
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      return res.send(svgContent);
    } catch (err) {
      return res.status(404).json({ error: 'SVG file not found' });
    }
  }

  // Handle PNG and WebP file requests (converted from SVG)
  if (format === 'png' || format === 'webp') {
    try {
      let svgPath;
      let svgBuffer;

      // Find source SVG file using multiple naming patterns
      // Pattern 1: Simple naming (e.g., "google.svg")
      svgPath = path.join(logoPath, `${id}.svg`);
      try {
        svgBuffer = await fs.readFile(svgPath);
      } catch (err) {
        // Pattern 2: id-name.svg
        svgPath = path.join(logoPath, `${id}-${name}.svg`);
        try {
          svgBuffer = await fs.readFile(svgPath);
        } catch (err2) {
          // Pattern 3: id-company-name.svg (legacy naming)
          svgPath = path.join(logoPath, `${id}-company-${name}.svg`);
          try {
            svgBuffer = await fs.readFile(svgPath);
          } catch (err3) {
            return res
              .status(404)
              .json({ error: 'SVG file not found for conversion' });
          }
        }
      }

      // Apply color customization if requested
      if (color) {
        const metadataPath = path.join(logoPath, 'metadata.json');
        try {
          const _metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

          // Convert buffer to string for color processing
          let svgContent = svgBuffer.toString('utf8');

          // Prepare color for replacement
          const targetColor = color.startsWith('#') ? color : `#${color}`;

          // Detect monochrome requests
          const isMonochrome =
            color.toLowerCase() === 'black' ||
            color.toLowerCase() === 'white' ||
            color === '000000' ||
            color === 'ffffff';

          // Apply color replacement and convert back to buffer
          svgContent = replaceColorsInSvg(
            svgContent,
            targetColor,
            isMonochrome
          );
          svgBuffer = Buffer.from(svgContent, 'utf8');
        } catch (metaErr) {
          console.warn(
            `Could not read metadata for color replacement: ${metaErr.message}`
          );
        }
      }

      // Determine target size for conversion
      let targetSize = 256; // Default size

      if (size) {
        // Use size from query parameter
        const requestedSize = parseInt(size);
        if (!isValidSize(requestedSize)) {
          return res
            .status(400)
            .json({ error: 'Invalid size. Must be between 1 and 2048 pixels' });
        }
        targetSize = requestedSize;
      } else {
        // Try to extract size from filename (e.g., "logo-64.png")
        const parsedSize = parseSizeFromFilename(file);
        if (parsedSize) {
          targetSize = parsedSize;
        }
      }

      // Convert SVG to requested raster format
      let buffer;
      let contentType;

      if (format === 'png') {
        buffer = await convertSvgBufferToPng(svgBuffer, targetSize);
        contentType = 'image/png';
      } else {
        buffer = await convertSvgBufferToWebp(svgBuffer, targetSize);
        contentType = 'image/webp';
      }

      // Return converted image with appropriate headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.setHeader('Content-Length', buffer.length);

      return res.send(buffer);
    } catch (err) {
      console.error('Error converting image:', err);
      return res
        .status(404)
        .json({ error: 'Logo file not found or conversion failed' });
    }
  }
}
