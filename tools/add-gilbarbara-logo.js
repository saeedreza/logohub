#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

/**
 * Helper script to add logos from gilbarbara/logos repository
 * Usage: node tools/add-gilbarbara-logo.js <company-name> <logo-filename>
 * Example: node tools/add-gilbarbara-logo.js microsoft microsoft.svg
 */

const GILBARBARA_BASE_URL = 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos';

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(outputPath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function createMetadataTemplate(companyName, logoFilename) {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    "name": companyName,
    "website": `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    "industry": [
      "technology"
    ],
    "colors": {
      "primary": "#000000",
      "secondary": "#666666"
    },
    "guidelines": `https://brand.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    "lastUpdated": today,
    "contributor": "LogoHub Team",
    "versions": [
      {
        "version": "1.0",
        "date": today,
        "description": `Initial version imported from gilbarbara/logos (${logoFilename})`
      }
    ],
    "usage": {
      "restrictions": "For personal and commercial use in projects. Follow company brand guidelines.",
      "attribution": "Required when used in publications"
    }
  };
}

function extractColorsFromSVG(svgContent) {
  const colorRegex = /#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/g;
  const colors = svgContent.match(colorRegex) || [];
  return [...new Set(colors)]; // Remove duplicates
}

async function addLogo(companyName, logoFilename) {
  try {
    console.log(`Adding ${companyName} logo from gilbarbara/logos...`);
    
    // Create company directory
    const logoDir = path.join('logos', companyName.toLowerCase().replace(/\s+/g, '-'));
    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }
    
    // Download the SVG file
    const logoUrl = `${GILBARBARA_BASE_URL}/${logoFilename}`;
    const outputPath = path.join(logoDir, `${companyName.toLowerCase().replace(/\s+/g, '-')}-standard.svg`);
    
    console.log(`Downloading ${logoUrl}...`);
    await downloadFile(logoUrl, outputPath);
    
    // Read SVG content to extract colors
    const svgContent = fs.readFileSync(outputPath, 'utf8');
    const extractedColors = extractColorsFromSVG(svgContent);
    console.log(`Extracted colors: ${extractedColors.join(', ')}`);
    
    // Optimize the SVG
    console.log('Optimizing SVG...');
    try {
      execSync(`npm run logo:optimize -- "${outputPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.log('SVG optimization failed, continuing...');
    }
    
    // Create monochrome version using our existing tool
    console.log('Creating monochrome version...');
    const monochromeOutput = path.join(logoDir, `${companyName.toLowerCase().replace(/\s+/g, '-')}-monochrome.svg`);
    try {
      if (extractedColors.length > 0) {
        // Replace all colors with black
        const colorArgs = extractedColors.flatMap(color => [color, '#000000']);
        execSync(`node tools/svg-color-replacer.js "${outputPath}" "${monochromeOutput}" ${colorArgs.map(arg => `"${arg}"`).join(' ')}`, { stdio: 'inherit' });
      } else {
        fs.copyFileSync(outputPath, monochromeOutput);
      }
    } catch (error) {
      console.log('Monochrome generation failed, copying original...');
      fs.copyFileSync(outputPath, monochromeOutput);
    }
    
    // Create metadata.json with extracted colors
    console.log('Creating metadata...');
    const metadata = createMetadataTemplate(companyName, logoFilename);
    if (extractedColors.length > 0) {
      metadata.colors.primary = extractedColors[0];
      if (extractedColors.length > 1) {
        metadata.colors.secondary = extractedColors[1];
      }
    }
    const metadataPath = path.join(logoDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Validate the logo
    console.log('Validating logo...');
    try {
      const companyId = companyName.toLowerCase().replace(/\s+/g, '-');
      execSync(`npm run logo:validate -- "${companyId}"`, { stdio: 'inherit' });
    } catch (error) {
      console.log('Validation warnings (check manually)');
    }
    
    console.log(`✅ Successfully added ${companyName} logo!`);
    console.log(`📁 Location: ${logoDir}`);
    console.log(`🎨 Colors extracted: ${extractedColors.join(', ')}`);
    console.log(`🔗 Remember to update the metadata with accurate information (website, guidelines)`);
    
  } catch (error) {
    console.error(`❌ Error adding ${companyName} logo:`, error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Usage: node tools/add-gilbarbara-logo.js <company-name> <logo-filename>');
  console.log('Example: node tools/add-gilbarbara-logo.js "Microsoft" microsoft.svg');
  process.exit(1);
}

const [companyName, logoFilename] = args;
addLogo(companyName, logoFilename); 