const fs = require('fs');
const path = require('path');

class MetadataMigrator {
  constructor() {
    this.categoryMapping = {
      // Map existing industry terms to new categories
      'technology': 'tech',
      'search': 'tech',
      'advertising': 'marketing',
      'cloud': 'cloud',
      'streaming': 'streaming',
      'social-media': 'social',
      'design': 'design',
      'productivity': 'productivity',
      'development': 'devtools',
      'database': 'database',
      'containerization': 'infrastructure',
      'framework': 'frameworks',
      'runtime': 'backend',
      'version-control': 'devtools',
      'collaboration': 'productivity'
    };

    this.companyCategories = {
      // Specific company mappings
      'google': 'tech',
      'microsoft': 'tech',
      'apple': 'tech', 
      'meta': 'social',
      'netflix': 'streaming',
      'adobe': 'design',
      'spotify': 'streaming',
      'aws': 'cloud',
      'slack': 'communication',
      'discord': 'communication',
      'github': 'devtools',
      'gitlab': 'devtools',
      'figma': 'design',
      'notion': 'productivity',
      'docker': 'infrastructure',
      'kubernetes': 'infrastructure',
      'node.js': 'backend',
      'react': 'frameworks',
      'vue.js': 'frameworks',
      'angular': 'frameworks',
      'tailwind-css': 'css',
      'typescript': 'backend',
      'vercel': 'cloud',
      'linear': 'productivity',
      'postgresql': 'database',
      'sample-company': 'general'
    };
  }

  async migrateAllLogos() {
    const logosDir = path.join(__dirname, '..', 'logos');
    const logos = fs.readdirSync(logosDir).filter(d => !d.startsWith('.'));
    
    console.log(`🔄 Migrating ${logos.length} logo metadata files...`);
    
    let migrated = 0;
    let errors = 0;
    
    for (const logoId of logos) {
      try {
        await this.migrateLogo(logoId);
        migrated++;
        console.log(`✅ Migrated ${logoId}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${logoId}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📊 Migration Results:`);
    console.log(`  ✅ Migrated: ${migrated}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  📈 Success Rate: ${((migrated / logos.length) * 100).toFixed(1)}%`);
  }

  async migrateLogo(logoId) {
    const logoDir = path.join(__dirname, '..', 'logos', logoId);
    const metadataPath = path.join(logoDir, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error('metadata.json not found');
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const updatedMetadata = this.transformMetadata(logoId, metadata);
    
    // Write updated metadata
    fs.writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, 2) + '\n');
  }

  transformMetadata(logoId, metadata) {
    const updated = { ...metadata };
    
    // Add/update basic fields
    updated.name = logoId;
    updated.title = updated.title || this.generateTitle(logoId, metadata.name);
    updated.description = updated.description || `${updated.title} logo`;
    
    // Determine category
    updated.category = this.determineCategory(logoId, metadata);
    
    // Convert industry to tags if present
    if (metadata.industry) {
      updated.tags = [
        ...(updated.tags || []),
        ...metadata.industry.filter(tag => !updated.tags?.includes(tag))
      ];
      delete updated.industry;
    }
    
    // Normalize colors
    if (metadata.colors) {
      updated.colors = this.normalizeColors(metadata.colors);
    }
    
    // Add missing standard fields
    if (!updated.website) {
      updated.website = this.guessWebsite(logoId);
    }
    
    // Ensure variants exist
    if (!updated.variants) {
      updated.variants = {
        standard: `${logoId}.svg`,
        monochrome: `${logoId}.svg`
      };
    }
    
    // Ensure files object exists
    if (!updated.files) {
      updated.files = {
        svg: `${logoId}.svg`
      };
    }
    
    // Add license if missing
    if (!updated.license) {
      updated.license = "Please check company's brand guidelines";
    }
    
    // Add/update timestamps
    updated.updated = new Date().toISOString();
    if (!updated.created) {
      updated.created = updated.lastUpdated || updated.updated;
    }
    
    // Remove deprecated fields
    delete updated.lastUpdated;
    delete updated.contributor;
    delete updated.versions;
    delete updated.usage;
    delete updated.guidelines;
    
    return updated;
  }

  determineCategory(logoId, metadata) {
    // Direct mapping
    if (this.companyCategories[logoId]) {
      return this.companyCategories[logoId];
    }
    
    // Map from industry
    if (metadata.industry) {
      for (const industry of metadata.industry) {
        if (this.categoryMapping[industry]) {
          return this.categoryMapping[industry];
        }
      }
    }
    
    // Guess from name
    const name = logoId.toLowerCase();
    if (name.includes('db') || name.includes('sql')) return 'database';
    if (name.includes('cloud') || name.includes('aws')) return 'cloud';
    if (name.includes('js') || name.includes('script')) return 'frameworks';
    if (name.includes('css')) return 'css';
    
    return 'general';
  }

  generateTitle(logoId, existingName) {
    if (existingName && existingName !== logoId) {
      return existingName;
    }
    
    // Convert kebab-case to Title Case
    return logoId.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  normalizeColors(colors) {
    if (typeof colors === 'object' && !Array.isArray(colors)) {
      // Convert object format to array
      const colorArray = [];
      if (colors.primary) colorArray.push(colors.primary);
      if (colors.secondary) colorArray.push(colors.secondary);
      return colorArray;
    }
    
    if (Array.isArray(colors)) {
      return colors;
    }
    
    return [];
  }

  guessWebsite(logoId) {
    const websiteMap = {
      'google': 'https://google.com',
      'microsoft': 'https://microsoft.com',
      'apple': 'https://apple.com',
      'meta': 'https://meta.com',
      'netflix': 'https://netflix.com',
      'adobe': 'https://adobe.com',
      'spotify': 'https://spotify.com',
      'aws': 'https://aws.amazon.com',
      'slack': 'https://slack.com',
      'discord': 'https://discord.com',
      'github': 'https://github.com',
      'gitlab': 'https://gitlab.com',
      'figma': 'https://figma.com',
      'notion': 'https://notion.so',
      'docker': 'https://docker.com',
      'kubernetes': 'https://kubernetes.io',
      'vercel': 'https://vercel.com',
      'linear': 'https://linear.app',
      'postgresql': 'https://postgresql.org'
    };
    
    return websiteMap[logoId] || `https://${logoId.replace(/-/g, '')}.com`;
  }
}

// CLI Usage
if (require.main === module) {
  const migrator = new MetadataMigrator();
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🔄 LogoHub Metadata Migrator

Usage:
  node tools/migrate-metadata.js                    Migrate all logos
  node tools/migrate-metadata.js <logoId>           Migrate specific logo

Examples:
  node tools/migrate-metadata.js                    # Migrate all
  node tools/migrate-metadata.js google            # Migrate just Google logo
`);
    process.exit(0);
  }
  
  const specificLogo = process.argv[2];
  
  if (specificLogo) {
    migrator.migrateLogo(specificLogo)
      .then(() => console.log(`✅ Successfully migrated ${specificLogo}`))
      .catch(err => {
        console.error(`❌ Failed to migrate ${specificLogo}:`, err.message);
        process.exit(1);
      });
  } else {
    migrator.migrateAllLogos();
  }
}

module.exports = { MetadataMigrator }; 