#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Validate a logo submission for compliance with LogoHub standards
 * Usage: node tools/logo-validator.js company-name
 */

class LogoValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  addError(message) {
    this.errors.push(message);
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  addInfo(message) {
    this.info.push(message);
  }

  async validateLogo(companyId) {
    const logoDir = path.join(process.cwd(), 'logos', companyId);
    
    console.log(`🔍 Validating logo: ${companyId}`);
    console.log(`📁 Directory: ${logoDir}`);

    // Check if directory exists
    try {
      await fs.access(logoDir);
    } catch (err) {
      this.addError(`Logo directory does not exist: ${logoDir}`);
      return this.getReport();
    }

    // Validate directory structure
    await this.validateDirectoryStructure(logoDir, companyId);
    
    // Validate metadata
    await this.validateMetadata(logoDir);
    
    // Validate SVG files
    await this.validateSvgFiles(logoDir, companyId);

    return this.getReport();
  }

  async validateDirectoryStructure(logoDir, companyId) {
    const files = await fs.readdir(logoDir);
    
    // Check required files
    const requiredFiles = [
      'metadata.json',
      `${companyId}-standard.svg`
    ];
    
    const optionalFiles = [
      `${companyId}-monochrome.svg`,
      `${companyId}-symbol.svg`
    ];

    for (const file of requiredFiles) {
      if (!files.includes(file)) {
        this.addError(`Missing required file: ${file}`);
      }
    }

    // Check for extra files
    const validFiles = [...requiredFiles, ...optionalFiles];
    for (const file of files) {
      if (!validFiles.includes(file)) {
        this.addWarning(`Unexpected file in directory: ${file}`);
      }
    }

    this.addInfo(`Found ${files.length} files in directory`);
  }

  async validateMetadata(logoDir) {
    const metadataPath = path.join(logoDir, 'metadata.json');
    
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataContent);

      // Required fields
      const requiredFields = ['name', 'website', 'industry', 'colors', 'lastUpdated'];
      for (const field of requiredFields) {
        if (!metadata[field]) {
          this.addError(`Missing required metadata field: ${field}`);
        }
      }

      // Validate specific fields
      if (metadata.name && typeof metadata.name !== 'string') {
        this.addError('Metadata field "name" must be a string');
      }

      if (metadata.website && !this.isValidUrl(metadata.website)) {
        this.addError('Metadata field "website" must be a valid URL');
      }

      if (metadata.industry && !Array.isArray(metadata.industry)) {
        this.addError('Metadata field "industry" must be an array');
      }

      if (metadata.colors) {
        if (!metadata.colors.primary) {
          this.addError('Missing required color: primary');
        } else if (!this.isValidColor(metadata.colors.primary)) {
          this.addError('Invalid primary color format (use #RRGGBB)');
        }

        if (metadata.colors.secondary && !this.isValidColor(metadata.colors.secondary)) {
          this.addError('Invalid secondary color format (use #RRGGBB)');
        }
      }

      if (metadata.lastUpdated && !this.isValidDate(metadata.lastUpdated)) {
        this.addError('Invalid lastUpdated format (use YYYY-MM-DD)');
      }

      this.addInfo('Metadata structure validation complete');

    } catch (err) {
      if (err.code === 'ENOENT') {
        this.addError('metadata.json file not found');
      } else if (err instanceof SyntaxError) {
        this.addError('metadata.json contains invalid JSON');
      } else {
        this.addError(`Error reading metadata.json: ${err.message}`);
      }
    }
  }

  async validateSvgFiles(logoDir, companyId) {
    const files = await fs.readdir(logoDir);
    const svgFiles = files.filter(f => f.endsWith('.svg'));

    for (const svgFile of svgFiles) {
      await this.validateSvgFile(path.join(logoDir, svgFile), svgFile);
    }

    if (svgFiles.length === 0) {
      this.addError('No SVG files found');
    } else {
      this.addInfo(`Validated ${svgFiles.length} SVG files`);
    }
  }

  async validateSvgFile(svgPath, filename) {
    try {
      const svgContent = await fs.readFile(svgPath, 'utf8');
      
      // Check if it's valid XML/SVG
      try {
        const dom = new JSDOM(svgContent, { contentType: 'image/svg+xml' });
        const svg = dom.window.document.querySelector('svg');
        
        if (!svg) {
          this.addError(`${filename}: Not a valid SVG file`);
          return;
        }

        // Check for viewBox or width/height
        if (!svg.getAttribute('viewBox') && (!svg.getAttribute('width') || !svg.getAttribute('height'))) {
          this.addWarning(`${filename}: Missing viewBox or width/height attributes`);
        }

        // Check file size
        const stats = await fs.stat(svgPath);
        if (stats.size > 50000) { // 50KB
          this.addWarning(`${filename}: File size is large (${Math.round(stats.size / 1000)}KB). Consider optimization.`);
        }

        // Check for text elements (usually indicates template)
        const textElements = svg.querySelectorAll('text');
        if (textElements.length > 0) {
          this.addWarning(`${filename}: Contains text elements. Make sure this is not a placeholder template.`);
        }

      } catch (err) {
        this.addError(`${filename}: Invalid SVG XML format`);
      }

    } catch (err) {
      this.addError(`Error reading ${filename}: ${err.message}`);
    }
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  isValidColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  isValidDate(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
  }

  getReport() {
    const hasErrors = this.errors.length > 0;
    const hasWarnings = this.warnings.length > 0;

    console.log('\n📋 Validation Report:');
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`   ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (this.info.length > 0) {
      console.log('\n✅ Info:');
      this.info.forEach(info => console.log(`   ${info}`));
    }

    if (!hasErrors && !hasWarnings) {
      console.log('\n🎉 All validation checks passed!');
    } else if (!hasErrors) {
      console.log('\n✅ Validation passed with warnings');
    } else {
      console.log('\n❌ Validation failed');
    }

    return {
      success: !hasErrors,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.log(`
🔍 LogoHub Logo Validator

Usage:
  node tools/logo-validator.js <company-id>

Examples:
  node tools/logo-validator.js google
  node tools/logo-validator.js sample-company

This tool validates:
✅ Directory structure and required files
✅ Metadata.json format and required fields  
✅ SVG file validity and best practices
✅ Color format and URL validation
`);
    process.exit(1);
  }

  const companyId = args[0];
  const validator = new LogoValidator();
  
  validator.validateLogo(companyId)
    .then(report => {
      process.exit(report.success ? 0 : 1);
    })
    .catch(err => {
      console.error('❌ Validation error:', err.message);
      process.exit(1);
    });
}

module.exports = { LogoValidator }; 