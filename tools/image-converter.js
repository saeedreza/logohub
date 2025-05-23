const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Standard sizes for logo variants
 */
const STANDARD_SIZES = [16, 32, 64, 128, 256, 512];

/**
 * Convert SVG to PNG with specified size, preserving aspect ratio
 * @param {string} svgPath - Path to the SVG file
 * @param {string} outputPath - Path for the PNG output
 * @param {number} size - Maximum size in pixels (width or height)
 * @returns {Promise<void>}
 */
async function convertSvgToPng(svgPath, outputPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size, {
        fit: 'inside',
        withoutEnlargement: false,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
  } catch (error) {
    throw new Error(`Failed to convert SVG to PNG: ${error.message}`);
  }
}

/**
 * Convert SVG to WebP with specified size, preserving aspect ratio
 * @param {string} svgPath - Path to the SVG file
 * @param {string} outputPath - Path for the WebP output
 * @param {number} size - Maximum size in pixels (width or height)
 * @returns {Promise<void>}
 */
async function convertSvgToWebp(svgPath, outputPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size, {
        fit: 'inside',
        withoutEnlargement: false,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 90 })
      .toFile(outputPath);
  } catch (error) {
    throw new Error(`Failed to convert SVG to WebP: ${error.message}`);
  }
}

/**
 * Convert SVG buffer to PNG buffer with specified size, preserving aspect ratio
 * @param {Buffer} svgBuffer - SVG file buffer
 * @param {number} size - Maximum size in pixels (width or height)
 * @returns {Promise<Buffer>}
 */
async function convertSvgBufferToPng(svgBuffer, size) {
  try {
    return await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'inside',
        withoutEnlargement: false,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
  } catch (error) {
    throw new Error(`Failed to convert SVG buffer to PNG: ${error.message}`);
  }
}

/**
 * Convert SVG buffer to WebP buffer with specified size, preserving aspect ratio
 * @param {Buffer} svgBuffer - SVG file buffer
 * @param {number} size - Maximum size in pixels (width or height)
 * @returns {Promise<Buffer>}
 */
async function convertSvgBufferToWebp(svgBuffer, size) {
  try {
    return await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'inside',
        withoutEnlargement: false,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 90 })
      .toBuffer();
  } catch (error) {
    throw new Error(`Failed to convert SVG buffer to WebP: ${error.message}`);
  }
}

/**
 * Generate all standard size variants for a logo
 * @param {string} svgPath - Path to the SVG file
 * @param {string} outputDir - Directory to save variants
 * @param {string} baseName - Base name for the files (without extension)
 * @returns {Promise<Object>} - Object with generated file info
 */
async function generateAllVariants(svgPath, outputDir, baseName) {
  const variants = {
    png: [],
    webp: []
  };

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Generate PNG variants
  for (const size of STANDARD_SIZES) {
    const pngPath = path.join(outputDir, `${baseName}-${size}.png`);
    await convertSvgToPng(svgPath, pngPath, size);
    variants.png.push({
      size,
      maxDimension: size,
      path: pngPath,
      filename: `${baseName}-${size}.png`
    });
  }

  // Generate WebP variants
  for (const size of STANDARD_SIZES) {
    const webpPath = path.join(outputDir, `${baseName}-${size}.webp`);
    await convertSvgToWebp(svgPath, webpPath, size);
    variants.webp.push({
      size,
      maxDimension: size,
      path: webpPath,
      filename: `${baseName}-${size}.webp`
    });
  }

  return variants;
}

/**
 * Parse size from filename (e.g., "logo-64.png" -> 64)
 * @param {string} filename - Filename to parse
 * @returns {number|null} - Size in pixels or null if not found
 */
function parseSizeFromFilename(filename) {
  const match = filename.match(/(\d+)\.(png|webp)$/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Check if a size is valid
 * @param {number} size - Size to check
 * @returns {boolean}
 */
function isValidSize(size) {
  return Number.isInteger(size) && size > 0 && size <= 2048;
}

/**
 * Replace colors in SVG content for better color customization
 * @param {string} svgContent - SVG content as string
 * @param {string} targetColor - Color to replace colors with (hex format)
 * @param {boolean} monochrome - Whether to make it monochrome
 * @returns {string} - Modified SVG content
 */
function replaceColorsInSvg(svgContent, targetColor, monochrome = false) {
  if (monochrome) {
    // Replace all fill colors with the target color (usually black)
    return svgContent.replace(/fill="[^"]*"/g, `fill="${targetColor}"`);
  } else {
    // Replace specific colors - this is more complex and could be improved
    // For now, replace common Google colors
    const colorMap = {
      '#4285F4': targetColor, // Google Blue -> target
      '#EA4335': targetColor, // Google Red -> target  
      '#FBBC05': targetColor, // Google Yellow -> target
      '#34A853': targetColor  // Google Green -> target
    };
    
    let modifiedSvg = svgContent;
    Object.entries(colorMap).forEach(([oldColor, newColor]) => {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      modifiedSvg = modifiedSvg.replace(regex, newColor);
    });
    
    return modifiedSvg;
  }
}

module.exports = {
  convertSvgToPng,
  convertSvgToWebp,
  convertSvgBufferToPng,
  convertSvgBufferToWebp,
  generateAllVariants,
  parseSizeFromFilename,
  isValidSize,
  replaceColorsInSvg,
  STANDARD_SIZES
}; 