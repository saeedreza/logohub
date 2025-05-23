#!/usr/bin/env node

/**
 * @fileoverview Logo Structure Migration Tool
 * @description Migrates existing logo structure to simplified format:
 * - Removes categories, tags, description, variants
 * - Renames -standard.svg to .svg
 * - Removes -monochrome.svg files
 * - Updates metadata to new schema
 * 
 * @category Metadata
 * @requires fs
 * @requires path
 * @version 1.0.0
 * @author LogoHub Team
 * 
 * @example
 * # Migrate all logos
 * node metadata/structure-migrator.js
 * 
 * # Migrate specific logo
 * node metadata/structure-migrator.js google
 * 
 * # Dry run (preview changes)
 * node metadata/structure-migrator.js --dry-run
 */

const fs = require('fs');
const path = require('path');

/**
 * Migration configuration
 */
const CONFIG = {
  LOGOS_DIR: 'logos',
  BACKUP_DIR: 'logos-backup',
  PROGRESS_FILE: 'tools/logo-structure-migration-progress.md'
};

/**
 * Migration statistics
 */
let stats = {
  processed: 0,
  migrated: 0,
  errors: 0,
  filesRenamed: 0,
  filesRemoved: 0,
  metadataUpdated: 0
};

/**
 * Migration class for converting logo structure
 */
class StructureMigrator {
  constructor(dryRun = false) {
    this.dryRun = dryRun;
    this.errors = [];
    this.changes = [];
  }

  /**
   * Migrate all logos or specific logo
   * @param {string|null} specificLogo - Logo name to migrate, or null for all
   */
  async migrateLogos(specificLogo = null) {
    console.log('🚀 Logo Structure Migration Started\n');
    
    if (this.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }

    // Get list of logos to migrate
    const logosToMigrate = specificLogo 
      ? [specificLogo] 
      : this.getLogoDirectories();

    console.log(`📊 Found ${logosToMigrate.length} logos to migrate\n`);

    // Create backup if not dry run
    if (!this.dryRun) {
      await this.createBackup();
    }

    // Migrate each logo
    for (const logoName of logosToMigrate) {
      await this.migrateLogo(logoName);
    }

    // Update progress tracking
    await this.updateProgress();

    // Show final summary
    this.showSummary();
  }

  /**
   * Get list of logo directories
   */
  getLogoDirectories() {
    return fs.readdirSync(CONFIG.LOGOS_DIR)
      .filter(item => {
        const fullPath = path.join(CONFIG.LOGOS_DIR, item);
        return fs.statSync(fullPath).isDirectory() && !item.startsWith('.');
      });
  }

  /**
   * Create backup of logos directory
   */
  async createBackup() {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const backupDir = `${CONFIG.BACKUP_DIR}-${timestamp}`;
    
    console.log(`💾 Creating backup: ${backupDir}`);
    
    if (!this.dryRun) {
      await this.copyDirectory(CONFIG.LOGOS_DIR, backupDir);
    }
    
    console.log('✅ Backup created\n');
  }

  /**
   * Migrate a single logo
   * @param {string} logoName - Name of the logo to migrate
   */
  async migrateLogo(logoName) {
    stats.processed++;
    const logoDir = path.join(CONFIG.LOGOS_DIR, logoName);
    
    console.log(`🔄 Migrating ${logoName}...`);

    try {
      // Check if directory exists
      if (!fs.existsSync(logoDir)) {
        throw new Error(`Directory not found: ${logoDir}`);
      }

      // Process files
      await this.processLogoFiles(logoDir, logoName);
      
      // Update metadata
      await this.updateMetadata(logoDir, logoName);
      
      stats.migrated++;
      console.log(`   ✅ ${logoName} migrated successfully`);
      
    } catch (error) {
      stats.errors++;
      this.errors.push(`${logoName}: ${error.message}`);
      console.log(`   ❌ ${logoName} failed: ${error.message}`);
    }
  }

  /**
   * Process logo files (rename/remove)
   * @param {string} logoDir - Logo directory path
   * @param {string} logoName - Logo name
   */
  async processLogoFiles(logoDir, logoName) {
    const files = fs.readdirSync(logoDir);
    
    // Rename -standard.svg to .svg
    const standardFile = `${logoName}-standard.svg`;
    const mainFile = `${logoName}.svg`;
    
    if (files.includes(standardFile)) {
      const oldPath = path.join(logoDir, standardFile);
      const newPath = path.join(logoDir, mainFile);
      
      if (!this.dryRun) {
        fs.renameSync(oldPath, newPath);
      }
      
      stats.filesRenamed++;
      this.changes.push(`Renamed ${standardFile} → ${mainFile}`);
      console.log(`   📝 Renamed ${standardFile} → ${mainFile}`);
    }

    // Remove -monochrome.svg file
    const monochromeFile = `${logoName}-monochrome.svg`;
    
    if (files.includes(monochromeFile)) {
      const filePath = path.join(logoDir, monochromeFile);
      
      if (!this.dryRun) {
        fs.unlinkSync(filePath);
      }
      
      stats.filesRemoved++;
      this.changes.push(`Removed ${monochromeFile}`);
      console.log(`   🗑️  Removed ${monochromeFile}`);
    }

    // Check for potential symbol variant
    const symbolFile = `${logoName}-symbol.svg`;
    if (files.includes(symbolFile)) {
      console.log(`   🎯 Found symbol variant: ${symbolFile}`);
    }
  }

  /**
   * Update metadata to new schema
   * @param {string} logoDir - Logo directory path
   * @param {string} logoName - Logo name
   */
  async updateMetadata(logoDir, logoName) {
    const metadataPath = path.join(logoDir, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error('metadata.json not found');
    }

    const oldMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Convert to new schema
    const newMetadata = {
      name: logoName,
      title: oldMetadata.title || oldMetadata.name || this.generateTitle(logoName),
      website: oldMetadata.website || this.guessWebsite(logoName),
      colors: this.normalizeColors(oldMetadata.colors),
      hasSymbol: this.checkForSymbol(logoDir, logoName),
      license: oldMetadata.license || "Please check company's brand guidelines",
      created: oldMetadata.created || oldMetadata.lastUpdated || new Date().toISOString().split('T')[0],
      updated: new Date().toISOString()
    };

    if (!this.dryRun) {
      fs.writeFileSync(metadataPath, JSON.stringify(newMetadata, null, 2) + '\n');
    }

    stats.metadataUpdated++;
    this.changes.push(`Updated metadata for ${logoName}`);
    console.log(`   📄 Updated metadata.json`);
  }

  /**
   * Normalize colors to array format
   * @param {any} colors - Colors in various formats
   * @returns {string[]} Array of hex colors
   */
  normalizeColors(colors) {
    if (Array.isArray(colors)) {
      return colors.filter(color => typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color));
    }
    
    if (typeof colors === 'object' && colors !== null) {
      const colorArray = [];
      if (colors.primary) colorArray.push(colors.primary);
      if (colors.secondary) colorArray.push(colors.secondary);
      return colorArray.filter(color => /^#[0-9A-Fa-f]{6}$/.test(color));
    }
    
    // Default fallback
    return ['#000000'];
  }

  /**
   * Check if symbol variant exists
   * @param {string} logoDir - Logo directory path
   * @param {string} logoName - Logo name
   * @returns {boolean}
   */
  checkForSymbol(logoDir, logoName) {
    const symbolFile = `${logoName}-symbol.svg`;
    return fs.existsSync(path.join(logoDir, symbolFile));
  }

  /**
   * Generate title from logo name
   * @param {string} logoName - Logo name
   * @returns {string}
   */
  generateTitle(logoName) {
    return logoName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Guess website URL from logo name
   * @param {string} logoName - Logo name
   * @returns {string}
   */
  guessWebsite(logoName) {
    // Handle special cases
    const specialCases = {
      'node.js': 'https://nodejs.org',
      'vue.js': 'https://vuejs.org',
      'next.js': 'https://nextjs.org'
    };

    if (specialCases[logoName]) {
      return specialCases[logoName];
    }

    // Default pattern
    const cleanName = logoName.replace(/[.-]/g, '');
    return `https://${cleanName}.com`;
  }

  /**
   * Copy directory recursively
   * @param {string} src - Source directory
   * @param {string} dest - Destination directory
   */
  async copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Update progress tracking file
   */
  async updateProgress() {
    if (this.dryRun) return;

    try {
      let progressContent = fs.readFileSync(CONFIG.PROGRESS_FILE, 'utf8');
      
      // Update statistics
      progressContent = progressContent.replace(
        /- \*\*Total logos\*\*: \d+/,
        `- **Total logos**: ${stats.processed}`
      );
      
      progressContent = progressContent.replace(
        /- \*\*With -standard files\*\*: TBD/,
        `- **With -standard files**: ${stats.filesRenamed}`
      );
      
      progressContent = progressContent.replace(
        /- \*\*With -monochrome files\*\*: TBD/,
        `- **With -monochrome files**: ${stats.filesRemoved}`
      );

      // Update phase status
      progressContent = progressContent.replace(
        /### ✅ Phase 1: Design New Structure\n\*\*Status\*\*: 🚧 IN PROGRESS/,
        '### ✅ Phase 1: Design New Structure\n**Status**: ✅ COMPLETED'
      );

      progressContent = progressContent.replace(
        /### ⏳ Phase 2: Update Metadata Schema\n\*\*Status\*\*: 📋 PLANNED/,
        '### ✅ Phase 2: Update Metadata Schema\n**Status**: ✅ COMPLETED'
      );

      // Update timestamp
      const now = new Date().toISOString();
      progressContent = progressContent.replace(
        /\*\*Last Updated\*\*: 2024-01-XX by Logo Migration Tool/,
        `**Last Updated**: ${now} by Structure Migration Tool`
      );

      fs.writeFileSync(CONFIG.PROGRESS_FILE, progressContent);
      
    } catch (error) {
      console.warn('⚠️ Could not update progress file:', error.message);
    }
  }

  /**
   * Show migration summary
   */
  showSummary() {
    console.log('\n📋 MIGRATION SUMMARY\n');
    console.log(`Processed: ${stats.processed} logos`);
    console.log(`Migrated: ${stats.migrated} successfully`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`Files renamed: ${stats.filesRenamed}`);
    console.log(`Files removed: ${stats.filesRemoved}`);
    console.log(`Metadata updated: ${stats.metadataUpdated}`);

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:\n');
      this.errors.forEach(error => console.log(`  ${error}`));
    }

    if (this.dryRun && this.changes.length > 0) {
      console.log('\n🔍 CHANGES PREVIEW:\n');
      this.changes.forEach(change => console.log(`  ${change}`));
    }

    console.log(this.dryRun ? '\n🔍 Dry run completed' : '\n🎉 Migration completed!');
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const specificLogo = args.find(arg => !arg.startsWith('--'));

  const migrator = new StructureMigrator(dryRun);
  migrator.migrateLogos(specificLogo).catch(console.error);
}

module.exports = { StructureMigrator }; 