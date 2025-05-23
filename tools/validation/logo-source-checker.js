#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Logo Source Checker
 * Checks which logos from our CSV are available in various sources
 */

const CSV_FILE = 'tools/popular-logos-2024.csv';
const SOURCES = {
  gilbarbara: 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos',
  simpleIcons: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons'
};

function downloadFileInfo(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      resolve({
        url,
        status: response.statusCode,
        available: response.statusCode === 200
      });
    });
    
    request.on('error', () => {
      resolve({
        url,
        status: 'error',
        available: false
      });
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      resolve({
        url,
        status: 'timeout',
        available: false
      });
    });
  });
}

async function checkLogoAvailability(logoName) {
  const results = {};
  
  // Check gilbarbara (try multiple common filename formats)
  const gilbarbaraVariants = [
    `${logoName}.svg`,
    `${logoName}-icon.svg`,
    `${logoName}-logo.svg`
  ];
  
  for (const variant of gilbarbaraVariants) {
    const url = `${SOURCES.gilbarbara}/${variant}`;
    const result = await downloadFileInfo(url);
    if (result.available) {
      results.gilbarbara = {
        available: true,
        filename: variant,
        url: url
      };
      break;
    }
  }
  
  if (!results.gilbarbara) {
    results.gilbarbara = { available: false };
  }
  
  // Check simple-icons
  const simpleIconsUrl = `${SOURCES.simpleIcons}/${logoName}.svg`;
  const simpleIconsResult = await downloadFileInfo(simpleIconsUrl);
  results.simpleIcons = {
    available: simpleIconsResult.available,
    url: simpleIconsResult.available ? simpleIconsUrl : null
  };
  
  return results;
}

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const logo = {};
    headers.forEach((header, index) => {
      logo[header] = values[index];
    });
    return logo;
  });
}

async function main() {
  console.log('🔍 Logo Source Checker\n');
  console.log('Checking availability of logos in external sources...\n');
  
  // Read CSV file
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ CSV file not found: ${CSV_FILE}`);
    process.exit(1);
  }
  
  const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  const logos = parseCSV(csvContent);
  
  console.log(`📊 Found ${logos.length} logos to check\n`);
  
  const results = [];
  let available = 0;
  let total = logos.length;
  
  for (const logo of logos) {
    console.log(`Checking ${logo.name}...`);
    
    const sources = await checkLogoAvailability(logo.name);
    const logoResult = {
      name: logo.name,
      title: logo.title,
      category: logo.category,
      sources: sources,
      hasSource: sources.gilbarbara.available || sources.simpleIcons.available
    };
    
    if (logoResult.hasSource) {
      available++;
      console.log(`  ✅ Available in: ${sources.gilbarbara.available ? 'gilbarbara' : ''} ${sources.simpleIcons.available ? 'simple-icons' : ''}`);
    } else {
      console.log(`  ❌ Not found in any source`);
    }
    
    results.push(logoResult);
  }
  
  // Generate report
  console.log('\n📋 AVAILABILITY REPORT\n');
  console.log(`Total logos: ${total}`);
  console.log(`Available: ${available} (${Math.round(available/total*100)}%)`);
  console.log(`Missing: ${total - available} (${Math.round((total-available)/total*100)}%)`);
  
  console.log('\n✅ AVAILABLE LOGOS:');
  results.filter(r => r.hasSource).forEach(logo => {
    const source = logo.sources.gilbarbara.available ? 'gilbarbara' : 'simple-icons';
    console.log(`  • ${logo.name} (${logo.title}) - ${source}`);
  });
  
  console.log('\n❌ MISSING LOGOS:');
  results.filter(r => !r.hasSource).forEach(logo => {
    console.log(`  • ${logo.name} (${logo.title}) - Need manual collection`);
  });
  
  // Save detailed results
  const reportPath = 'tools/logo-availability-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Run: npm run logo:download:available');
  console.log('2. Manually collect missing logos from company brand kits');
  console.log('3. Run: npm run logo:import:csv');
}

main().catch(console.error); 