#!/usr/bin/env node

/**
 * @fileoverview Logo Data Generator for VitePress Website (Simplified Schema)
 * @description Generates optimized logo data for the VitePress website by reading simplified logo metadata
 * and creating a JSON file for the website to consume via API endpoints.
 *
 * @category Development
 * @requires fs
 * @requires path
 * @version 3.0.0
 * @author LogoHub Team
 *
 * @example
 * # Generate logo data for website
 * node development/generate-logo-data.js
 *
 * # Use programmatically
 * const { generateLogoData } = require('./development/generate-logo-data.js');
 * const data = generateLogoData();
 */

const fs = require('fs');
const path = require('path');

/**
 * Directory containing logo files
 * @constant {string}
 */
const LOGOS_DIR = 'logos';

/**
 * Output file for generated logo data
 * @constant {string}
 */
const OUTPUT_FILE = 'docs/.vitepress/data/logos.json';

/**
 * Generate optimized logo data for the VitePress website
 * @function generateLogoData
 * @description Reads all logo directories, processes simplified metadata, and generates website-optimized JSON data
 * @returns {Object} Website data object containing logos and statistics
 *
 * @example
 * const websiteData = generateLogoData();
 * console.log(`Generated data for ${websiteData.stats.total} logos`);
 */
function generateLogoData() {
  console.log('📊 Generating simplified logo data for website...\n');

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const logos = [];
  const websites = new Set(); // Track unique domains
  const colors = new Set(); // Track all colors used

  // Read all logo directories
  const logoDirs = fs
    .readdirSync(LOGOS_DIR)
    .filter(dir => !dir.startsWith('.'))
    .filter(dir => fs.statSync(path.join(LOGOS_DIR, dir)).isDirectory());

  console.log(`Found ${logoDirs.length} logo directories`);

  for (const logoDir of logoDirs) {
    const metadataPath = path.join(LOGOS_DIR, logoDir, 'metadata.json');

    if (!fs.existsSync(metadataPath)) {
      console.warn(`⚠️ No metadata found for ${logoDir}`);
      continue;
    }

    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

      // Check if main SVG file exists
      const svgPath = path.join(LOGOS_DIR, logoDir, `${logoDir}.svg`);
      const hasMainSvg = fs.existsSync(svgPath);

      // Check if symbol variant exists
      const symbolPath = path.join(LOGOS_DIR, logoDir, `${logoDir}-symbol.svg`);
      const hasSymbolSvg = fs.existsSync(symbolPath);

      if (!hasMainSvg) {
        console.warn(`⚠️ No main SVG file found for ${logoDir}`);
      }

      // Process logo data (simplified version)
      const logoData = {
        id: logoDir,
        name: metadata.title || metadata.name || logoDir,
        website: metadata.website || '',
        colors: metadata.colors || ['#000000'],
        hasSymbol: metadata.hasSymbol || hasSymbolSvg,
        hasMainSvg: hasMainSvg,
        created: metadata.created || '',
        updated: metadata.updated || '',
      };

      logos.push(logoData);

      // Track website domains for statistics
      if (logoData.website) {
        try {
          const domain = new URL(logoData.website).hostname;
          websites.add(domain);
        } catch (err) {
          // Invalid URL, skip
        }
      }

      // Track colors for statistics
      logoData.colors.forEach(color => colors.add(color));

      console.log(
        `✅ Processed ${logoData.name}${logoData.hasSymbol ? ' (with symbol)' : ''}`
      );
    } catch (error) {
      console.error(`❌ Error processing ${logoDir}:`, error.message);
    }
  }

  // Sort logos by name
  logos.sort((a, b) => a.name.localeCompare(b.name));

  // Generate final data structure (simplified)
  const websiteData = {
    logos,
    stats: {
      total: logos.length,
      withSymbols: logos.filter(l => l.hasSymbol).length,
      withMainSvg: logos.filter(l => l.hasMainSvg).length,
      uniqueWebsites: websites.size,
      uniqueColors: colors.size,
      lastUpdated: new Date().toISOString(),
    },
    meta: {
      version: '3.0.0',
      schema: 'simplified',
      generatedBy: 'LogoHub Data Generator',
      apiEndpoint: '/api/v1/logos',
    },
  };

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(websiteData, null, 2));

  console.log('\n📋 GENERATION SUMMARY\n');
  console.log(`Total logos: ${logos.length}`);
  console.log(`With symbols: ${websiteData.stats.withSymbols}`);
  console.log(`With main SVG: ${websiteData.stats.withMainSvg}`);
  console.log(`Unique websites: ${websiteData.stats.uniqueWebsites}`);
  console.log(`Unique colors: ${websiteData.stats.uniqueColors}`);
  console.log(`\n💾 Data saved to: ${OUTPUT_FILE}`);
  console.log('🚀 Website uses API endpoints for logo display');
  console.log('📋 Simplified schema (no categories/tags)');

  return websiteData;
}

// Execute if run directly
if (require.main === module) {
  generateLogoData();
}

module.exports = { generateLogoData };
