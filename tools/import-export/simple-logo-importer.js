#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Simple Logo Importer
 * Creates logo packages from CSV + downloaded SVG files
 */

const CSV_FILE = 'tools/popular-logos-2024.csv';
const DOWNLOADS_DIR = 'tools/downloaded-logos';
const LOGOS_DIR = 'logos';

function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const logoData = {};
    
    headers.forEach((header, index) => {
      logoData[header] = values[index];
    });
    
    return logoData;
  });
}

function createLogoPackage(logoData, svgPath) {
  const logoId = logoData.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const logoDir = path.join(LOGOS_DIR, logoId);
  
  // Create directory
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }
  
  // Copy SVG file
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const svgFileName = `${logoId}.svg`;
  fs.writeFileSync(path.join(logoDir, svgFileName), svgContent);
  
  // Extract colors if possible (simple approach)
  const colorMatches = svgContent.match(/#[a-fA-F0-9]{6}/g) || [];
  const extractedColors = [...new Set(colorMatches)];
  
  // Create metadata
  const metadata = {
    name: logoId,
    title: logoData.title || logoData.name,
    description: logoData.description || `${logoData.title || logoData.name} logo`,
    website: logoData.website || '',
    category: logoData.category || 'general',
    tags: logoData.tags ? logoData.tags.split(',').map(t => t.trim()) : [],
    colors: {
      primary: extractedColors[0] || logoData.colors || '#000000',
      secondary: extractedColors[1] || '#666666'
    },
    variants: {
      standard: svgFileName
    },
    files: {
      svg: svgFileName
    },
    license: "Please check company's brand guidelines",
    created: new Date().toISOString()
  };
  
  // Write metadata
  fs.writeFileSync(
    path.join(logoDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  return logoId;
}

function generateTemplate(logoData) {
  const logoId = logoData.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const logoDir = path.join(LOGOS_DIR, logoId);
  
  // Create directory
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }
  
  // Create template SVG
  const primaryColor = logoData.colors || '#000000';
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${primaryColor}" rx="8"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="12" font-weight="bold" 
        text-anchor="middle" dominant-baseline="middle" fill="white">
    ${logoData.title || logoData.name}
  </text>
</svg>`;
  
  const svgFileName = `${logoId}.svg`;
  fs.writeFileSync(path.join(logoDir, svgFileName), svgContent);
  
  // Create metadata
  const metadata = {
    name: logoId,
    title: logoData.title || logoData.name,
    description: logoData.description || `${logoData.title || logoData.name} logo`,
    website: logoData.website || '',
    category: logoData.category || 'general',
    tags: logoData.tags ? logoData.tags.split(',').map(t => t.trim()) : [],
    colors: {
      primary: primaryColor,
      secondary: '#666666'
    },
    variants: {
      standard: svgFileName
    },
    files: {
      svg: svgFileName
    },
    license: "Please check company's brand guidelines",
    created: new Date().toISOString(),
    template: true
  };
  
  fs.writeFileSync(
    path.join(logoDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  return logoId;
}

async function main() {
  console.log('🚀 Simple Logo Importer\n');
  
  // Read CSV
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ CSV file not found: ${CSV_FILE}`);
    process.exit(1);
  }
  
  const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  const logos = parseCSV(csvContent);
  
  console.log(`📊 Processing ${logos.length} logos from CSV\n`);
  
  // Map downloaded files
  const downloadedFiles = {};
  if (fs.existsSync(DOWNLOADS_DIR)) {
    fs.readdirSync(DOWNLOADS_DIR)
      .filter(file => file.endsWith('.svg'))
      .forEach(file => {
        const logoName = file.replace(/-(gilbarbara|simple-icons)\.svg$/, '');
        downloadedFiles[logoName] = path.join(DOWNLOADS_DIR, file);
      });
  }
  
  console.log(`📁 Found ${Object.keys(downloadedFiles).length} downloaded SVG files\n`);
  
  let imported = 0;
  let templates = 0;
  let skipped = 0;
  
  for (const logoData of logos) {
    const logoName = logoData.name;
    const logoId = logoName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const logoDir = path.join(LOGOS_DIR, logoId);
    
    // Skip if already exists
    if (fs.existsSync(logoDir)) {
      console.log(`⚠️ Skipping ${logoName}: Already exists`);
      skipped++;
      continue;
    }
    
    if (downloadedFiles[logoName]) {
      console.log(`✅ Importing ${logoName} with downloaded SVG`);
      createLogoPackage(logoData, downloadedFiles[logoName]);
      imported++;
    } else {
      console.log(`📦 Creating template for ${logoName}`);
      generateTemplate(logoData);
      templates++;
    }
  }
  
  console.log('\n📋 IMPORT SUMMARY\n');
  console.log(`Total processed: ${logos.length}`);
  console.log(`✅ Imported with SVG: ${imported}`);
  console.log(`📦 Created templates: ${templates}`);
  console.log(`⚠️ Skipped (exists): ${skipped}`);
  
  if (imported + templates > 0) {
    console.log('\n🎉 Import completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log('1. Check imported logos: npm run logo:count');
    console.log('2. View categories: npm run logo:categories');
    console.log('3. For template logos, replace with real SVGs when available');
  }
}

main().catch(console.error); 