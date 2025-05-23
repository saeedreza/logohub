const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { LogoValidator } = require('./logo-validator');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);

class LogoBatchImporter {
  constructor() {
    this.validator = new LogoValidator();
    this.categories = this.loadCategories();
    this.stats = {
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0
    };
  }

  loadCategories() {
    try {
      const categoriesPath = path.join(__dirname, 'logo-categories.json');
      if (fs.existsSync(categoriesPath)) {
        return JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️ Categories file not found, using default categories');
    }
    
    return {
      "ai": ["openai", "anthropic", "huggingface", "stability-ai", "midjourney"],
      "fintech": ["stripe", "paypal", "square", "plaid", "coinbase", "binance"],
      "ecommerce": ["shopify", "amazon", "ebay", "etsy", "woocommerce"],
      "gaming": ["unity", "unreal", "steam", "epic-games", "roblox"],
      "cloud": ["digitalocean", "linode", "cloudflare", "fastly"],
      "mobile": ["flutter", "react-native", "xamarin", "ionic"],
      "design": ["canva", "sketch", "invision", "framer"],
      "analytics": ["google-analytics", "mixpanel", "amplitude", "hotjar"],
      "devtools": ["bitbucket", "sourcegraph", "postman", "insomnia"],
      "enterprise": ["salesforce", "oracle", "sap", "workday"],
      "communication": ["whatsapp", "telegram", "signal", "teams"],
      "streaming": ["twitch", "youtube", "tiktok", "instagram"]
    };
  }

  getCategoryForLogo(logoName) {
    // Try to auto-detect category based on logo name
    for (const [category, logos] of Object.entries(this.categories)) {
      if (logos.some(logo => logo.toLowerCase() === logoName.toLowerCase())) {
        return category;
      }
    }
    return 'general';
  }

  parseCSV(csvContent) {
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

  async importFromCSV(csvPath) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log(`📊 Processing ${lines.length - 1} logos from CSV...`);
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const logoData = {};
      
      headers.forEach((header, index) => {
        logoData[header] = values[index];
      });
      
      await this.processLogo(logoData);
    }
    
    this.printStats();
  }

  async importFromJSON(jsonPath) {
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const logos = Array.isArray(jsonContent) ? jsonContent : jsonContent.logos;
    
    console.log(`📊 Processing ${logos.length} logos from JSON...`);
    
    for (const logoData of logos) {
      await this.processLogo(logoData);
    }
    
    this.printStats();
  }

  async importFromCSVWithDownloads(csvPath, downloadsDir = 'tools/downloaded-logos') {
    console.log('📥 Importing logos from CSV with downloaded SVGs...\n');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }
    
    if (!fs.existsSync(downloadsDir)) {
      throw new Error(`Downloads directory not found: ${downloadsDir}`);
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const logos = this.parseCSV(csvContent);
    
    console.log(`📊 Found ${logos.length} logos in CSV`);
    
    // Map downloaded files
    const downloadedFiles = fs.readdirSync(downloadsDir)
      .filter(file => file.endsWith('.svg'))
      .reduce((map, file) => {
        // Extract logo name from filename (remove source suffix)
        const logoName = file.replace(/-(gilbarbara|simple-icons)\.svg$/, '');
        map[logoName] = path.join(downloadsDir, file);
        return map;
      }, {});
    
    console.log(`📁 Found ${Object.keys(downloadedFiles).length} downloaded SVG files\n`);
    
    for (const logoData of logos) {
      const logoName = logoData.name;
      
      if (downloadedFiles[logoName]) {
        console.log(`🔄 Processing ${logoName} with downloaded SVG...`);
        await this.processLogo({
          ...logoData,
          svgPath: downloadedFiles[logoName]
        });
      } else {
        console.log(`⚠️ No SVG file found for ${logoName}, generating template...`);
        await this.generateFromTemplate(logoData);
      }
    }
    
    this.printStats();
  }

  async processLogo(logoData) {
    this.stats.processed++;
    
    const {
      name,
      title,
      description,
      website,
      svgUrl,
      svgPath,
      category,
      tags = [],
      colors = []
    } = logoData;

    if (!name || (!svgUrl && !svgPath)) {
      console.log(`❌ Skipping ${name || 'unnamed'}: Missing required fields`);
      this.stats.skipped++;
      return;
    }

    const logoId = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const logoDir = path.join(__dirname, '..', 'logos', logoId);

    // Check if logo already exists
    if (fs.existsSync(logoDir)) {
      console.log(`⚠️ Skipping ${logoId}: Already exists`);
      this.stats.skipped++;
      return;
    }

    try {
      // Create logo directory
      await mkdir(logoDir, { recursive: true });

      // Handle SVG file
      let svgContent;
      if (svgPath && fs.existsSync(svgPath)) {
        svgContent = fs.readFileSync(svgPath, 'utf8');
      } else if (svgUrl) {
        // In a real implementation, you'd fetch from URL
        console.log(`⚠️ URL fetching not implemented for ${logoId}`);
        this.stats.failed++;
        return;
      } else {
        throw new Error('No valid SVG source');
      }

      // Write SVG file
      const svgFileName = `${logoId}.svg`;
      await writeFile(path.join(logoDir, svgFileName), svgContent);

      // Generate metadata
      const metadata = {
        name: logoId,
        title: title || name,
        description: description || `${title || name} logo`,
        website: website || '',
        category: category || this.getCategoryForLogo(logoId),
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
        colors: Array.isArray(colors) ? colors : (colors ? colors.split(',').map(c => c.trim()) : []),
        variants: {
          standard: svgFileName,
          monochrome: svgFileName // Will be processed later
        },
        files: {
          svg: svgFileName
        },
        license: "Please check company's brand guidelines",
        created: new Date().toISOString()
      };

      // Write metadata
      await writeFile(
        path.join(logoDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      // Validate the logo
      const validation = await this.validator.validateLogo(logoId);
      if (validation.success) {
        console.log(`✅ Successfully imported ${logoId}`);
        this.stats.success++;
      } else {
        console.log(`⚠️ Imported ${logoId} with warnings: ${validation.errors.join(', ')}`);
        this.stats.success++;
      }

    } catch (error) {
      console.error(`❌ Failed to import ${logoId}:`, error.message);
      this.stats.failed++;
      
      // Clean up on failure
      if (fs.existsSync(logoDir)) {
        fs.rmSync(logoDir, { recursive: true, force: true });
      }
    }
  }

  async generateFromTemplate(logoData) {
    const {
      name,
      title,
      colors = ['#000000'],
      width = 100,
      height = 100,
      type = 'text'
    } = logoData;

    const logoId = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    let svgContent;
    if (type === 'text') {
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" font-weight="bold" 
        text-anchor="middle" dominant-baseline="middle" fill="${colors[0]}">
    ${title}
  </text>
</svg>`;
    } else {
      // Simple rectangle placeholder
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${colors[0]}" rx="8"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="12" font-weight="bold" 
        text-anchor="middle" dominant-baseline="middle" fill="white">
    ${title}
  </text>
</svg>`;
    }

    return this.processLogo({
      name,
      title,
      svgPath: null,
      svgUrl: null,
      colors,
      category: this.getCategoryForLogo(logoId)
    });
  }

  printStats() {
    console.log('\n📊 Import Statistics:');
    console.log(`  Processed: ${this.stats.processed}`);
    console.log(`  ✅ Success: ${this.stats.success}`);
    console.log(`  ❌ Failed: ${this.stats.failed}`);
    console.log(`  ⚠️ Skipped: ${this.stats.skipped}`);
    console.log(`  Success Rate: ${((this.stats.success / this.stats.processed) * 100).toFixed(1)}%`);
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const importer = new LogoBatchImporter();

  if (args.length === 0) {
    console.log(`
🔧 LogoHub Batch Importer

Usage:
  node tools/logo-batch-import.js --csv <path>              Import from CSV
  node tools/logo-batch-import.js --csv-downloads <path>    Import from CSV with downloaded SVGs
  node tools/logo-batch-import.js --json <path>             Import from JSON
  node tools/logo-batch-import.js --template <name>         Generate from template

Examples:
  node tools/logo-batch-import.js --csv tools/popular-logos-2024.csv
  node tools/logo-batch-import.js --csv-downloads tools/popular-logos-2024.csv
  node tools/logo-batch-import.js --json tools/ai-companies.json
  node tools/logo-batch-import.js --template openai
`);
    process.exit(1);
  }

  const command = args[0];
  const value = args[1];

  switch (command) {
    case '--csv':
      importer.importFromCSV(value);
      break;
    case '--csv-downloads':
      importer.importFromCSVWithDownloads(value);
      break;
    case '--json':
      importer.importFromJSON(value);
      break;
    case '--template':
      importer.generateFromTemplate({ name: value, title: value });
      break;
    default:
      console.error('❌ Unknown command:', command);
      process.exit(1);
  }
}

module.exports = { LogoBatchImporter }; 