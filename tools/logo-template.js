#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * Create a new logo directory with proper structure and metadata template
 * Usage: node tools/logo-template.js company-name "Company Display Name"
 */

async function createLogoTemplate(companyId, companyName, options = {}) {
  const logoDir = path.join(process.cwd(), 'logos', companyId);
  
  // Check if directory already exists
  try {
    await fs.access(logoDir);
    console.error(`❌ Logo directory already exists: ${companyId}`);
    process.exit(1);
  } catch (err) {
    // Directory doesn't exist, which is what we want
  }

  // Create directory
  await fs.mkdir(logoDir, { recursive: true });

  // Create metadata template
  const metadata = {
    name: companyName,
    website: options.website || `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    industry: options.industry || ["technology"],
    colors: {
      primary: options.primaryColor || "#000000",
      secondary: options.secondaryColor || "#666666"
    },
    guidelines: options.guidelines || "",
    lastUpdated: new Date().toISOString().split('T')[0],
    contributor: options.contributor || "Community",
    versions: [
      {
        version: "1.0",
        date: new Date().toISOString().split('T')[0],
        description: "Initial version"
      }
    ],
    usage: {
      restrictions: "For personal and commercial use in projects",
      attribution: "Required when used in publications"
    }
  };

  // Write metadata file
  const metadataPath = path.join(logoDir, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  // Create SVG file templates
  const standardSvgPath = path.join(logoDir, `${companyId}-standard.svg`);
  const monochromeSvgPath = path.join(logoDir, `${companyId}-monochrome.svg`);

  const standardSvgTemplate = createSvgTemplate(companyName, options.primaryColor || "#000000");
  const monochromeSvgTemplate = createSvgTemplate(companyName, "#000000", true);

  await fs.writeFile(standardSvgPath, standardSvgTemplate);
  await fs.writeFile(monochromeSvgPath, monochromeSvgTemplate);

  console.log(`✅ Created logo template for: ${companyName}`);
  console.log(`📁 Directory: logos/${companyId}/`);
  console.log(`📝 Files created:`);
  console.log(`   - metadata.json`);
  console.log(`   - ${companyId}-standard.svg (template)`);
  console.log(`   - ${companyId}-monochrome.svg (template)`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Replace SVG templates with actual logo files`);
  console.log(`   2. Update metadata.json with correct information`);
  console.log(`   3. Run: npx svgo logos/${companyId}/*.svg`);
  console.log(`   4. Test: curl "http://localhost:3000/api/v1/logos/${companyId}"`);

  return logoDir;
}

function createSvgTemplate(companyName, color, isMonochrome = false) {
  const variant = isMonochrome ? "monochrome" : "standard";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Replace this template with actual ${companyName} logo -->
  <rect width="200" height="200" fill="${color}" rx="20"/>
  <text x="100" y="100" text-anchor="middle" dominant-baseline="central" 
        fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
    ${companyName}
  </text>
  <text x="100" y="130" text-anchor="middle" dominant-baseline="central" 
        fill="white" font-family="Arial, sans-serif" font-size="12">
    ${variant} logo
  </text>
</svg>`;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
🎨 LogoHub Logo Template Generator

Usage:
  node tools/logo-template.js <company-id> "<Company Name>" [options]

Examples:
  node tools/logo-template.js google "Google"
  node tools/logo-template.js microsoft "Microsoft" --website="https://microsoft.com" --primary="#00BCF2"

Options:
  --website=<url>          Company website
  --primary=<color>        Primary brand color (hex)
  --secondary=<color>      Secondary brand color (hex)
  --industry=<type>        Industry category
  --contributor=<name>     Contributor name
  --guidelines=<url>       Brand guidelines URL
`);
    process.exit(1);
  }

  const companyId = args[0];
  const companyName = args[1];
  
  // Parse options
  const options = {};
  args.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      switch (key) {
        case 'website':
          options.website = value;
          break;
        case 'primary':
          options.primaryColor = value.startsWith('#') ? value : `#${value}`;
          break;
        case 'secondary':
          options.secondaryColor = value.startsWith('#') ? value : `#${value}`;
          break;
        case 'industry':
          options.industry = [value];
          break;
        case 'contributor':
          options.contributor = value;
          break;
        case 'guidelines':
          options.guidelines = value;
          break;
      }
    }
  });

  createLogoTemplate(companyId, companyName, options)
    .catch(err => {
      console.error('❌ Error creating logo template:', err.message);
      process.exit(1);
    });
}

module.exports = { createLogoTemplate }; 