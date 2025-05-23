#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Logo Downloader
 * Downloads available logos from external sources
 */

const REPORT_FILE = 'tools/logo-availability-report.json';
const DOWNLOAD_DIR = 'tools/downloaded-logos';

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
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

async function downloadLogos() {
  console.log('📥 Logo Downloader\n');
  
  // Check if report exists
  if (!fs.existsSync(REPORT_FILE)) {
    console.error(`❌ Report file not found: ${REPORT_FILE}`);
    console.log('Please run: node tools/logo-source-checker.js first');
    process.exit(1);
  }
  
  // Read report
  const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
  const availableLogos = report.filter(logo => logo.hasSource);
  
  if (availableLogos.length === 0) {
    console.log('❌ No logos available for download');
    process.exit(0);
  }
  
  console.log(`📊 Found ${availableLogos.length} logos available for download\n`);
  
  // Create download directory
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }
  
  let downloaded = 0;
  let failed = 0;
  
  for (const logo of availableLogos) {
    console.log(`Downloading ${logo.name}...`);
    
    try {
      let url, filename;
      
      if (logo.sources.gilbarbara.available) {
        url = logo.sources.gilbarbara.url;
        filename = `${logo.name}-gilbarbara.svg`;
      } else if (logo.sources.simpleIcons.available) {
        url = logo.sources.simpleIcons.url;
        filename = `${logo.name}-simple-icons.svg`;
      }
      
      const outputPath = path.join(DOWNLOAD_DIR, filename);
      await downloadFile(url, outputPath);
      
      console.log(`  ✅ Downloaded: ${filename}`);
      downloaded++;
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n📋 DOWNLOAD SUMMARY\n');
  console.log(`Total: ${availableLogos.length}`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Failed: ${failed}`);
  
  if (downloaded > 0) {
    console.log(`\n📁 Files saved to: ${DOWNLOAD_DIR}`);
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Review downloaded SVG files');
    console.log('2. Run: npm run logo:import:csv (to import with metadata)');
    console.log('3. For missing logos, check company brand kits manually');
  }
}

downloadLogos().catch(console.error); 