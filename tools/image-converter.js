const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Standard sizes for logo variants
 */
const STANDARD_SIZES = [16, 32, 64, 128, 256, 512];

/**
 * Convert SVG to PNG with specified size
 * @param {string} svgPath - Path to the SVG file
 * @param {string} outputPath - Path for the PNG output
 * @param {number} size - Size in pixels (width = height)
 * @returns {Promise<void>}
 */
async function convertSvgToPng(svgPath, outputPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
  } catch (error) {
    throw new Error(`Failed to convert SVG to PNG: ${error.message}`);
  }
}

/**
 * Convert SVG to WebP with specified size
 * @param {string} svgPath - Path to the SVG file
 * @param {string} outputPath - Path for the WebP output
 * @param {number} size - Size in pixels (width = height)
 * @returns {Promise<void>}
 */
async function convertSvgToWebp(svgPath, outputPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size)
      .webp({ quality: 90 })
      .toFile(outputPath);
  } catch (error) {
    throw new Error(`Failed to convert SVG to WebP: ${error.message}`);
  }
}

/**
 * Convert SVG buffer to PNG buffer with specified size
 * @param {Buffer} svgBuffer - SVG file buffer
 * @param {number} size - Size in pixels (width = height)
 * @returns {Promise<Buffer>}
 */
async function convertSvgBufferToPng(svgBuffer, size) {
  try {
    return await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
  } catch (error) {
    throw new Error(`Failed to convert SVG buffer to PNG: ${error.message}`);
  }
}

/**
 * Convert SVG buffer to WebP buffer with specified size
 * @param {Buffer} svgBuffer - SVG file buffer
 * @param {number} size - Size in pixels (width = height)
 * @returns {Promise<Buffer>}
 */
async function convertSvgBufferToWebp(svgBuffer, size) {
  try {
    return await sharp(svgBuffer)
      .resize(size, size)
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
    const pngPath = path.join(outputDir, `${baseName}-${size}x${size}.png`);
    await convertSvgToPng(svgPath, pngPath, size);
    variants.png.push({
      size,
      width: size,
      height: size,
      path: pngPath,
      filename: `${baseName}-${size}x${size}.png`
    });
  }

  // Generate WebP variants
  for (const size of STANDARD_SIZES) {
    const webpPath = path.join(outputDir, `${baseName}-${size}x${size}.webp`);
    await convertSvgToWebp(svgPath, webpPath, size);
    variants.webp.push({
      size,
      width: size,
      height: size,
      path: webpPath,
      filename: `${baseName}-${size}x${size}.webp`
    });
  }

  return variants;
}

/**
 * Parse size from filename (e.g., "logo-64x64.png" -> 64)
 * @param {string} filename - Filename to parse
 * @returns {number|null} - Size in pixels or null if not found
 */
function parseSizeFromFilename(filename) {
  const match = filename.match(/(\d+)x\d+\.(png|webp)$/);
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

module.exports = {
  convertSvgToPng,
  convertSvgToWebp,
  convertSvgBufferToPng,
  convertSvgBufferToWebp,
  generateAllVariants,
  parseSizeFromFilename,
  isValidSize,
  STANDARD_SIZES
}; 