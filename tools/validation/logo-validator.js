#!/usr/bin/env node

/**
 * @fileoverview Logo Validation System for LogoHub (Simplified Schema)
 * @description Comprehensive validation tool for logo submissions that checks compliance with simplified LogoHub standards,
 * including directory structure, metadata completeness, and SVG file validity.
 * 
 * @category Validation
 * @requires fs/promises
 * @requires path
 * @requires jsdom
 * @version 2.0.0
 * @author LogoHub Team
 * 
 * @example
 * # Validate a specific logo
 * node validation/logo-validator.js company-name
 * 
 * # Use programmatically
 * const { LogoValidator } = require('./validation/logo-validator.js');
 * const validator = new LogoValidator();
 * const report = await validator.validateLogo('company-name');
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Logo validation class for checking compliance with simplified LogoHub standards
 * @class LogoValidator
 */
class LogoValidator {
  /**
   * Create a new LogoValidator instance
   * @constructor
   */
  constructor() {
    /** @type {string[]} Array of error messages */
    this.errors = [];
    /** @type {string[]} Array of warning messages */
    this.warnings = [];
    /** @type {string[]} Array of info messages */
    this.info = [];
  }

  /**
   * Add an error message to the validation report
   * @method addError
   * @param {string} message - Error message to add
   */
  addError(message) {
    this.errors.push(message);
  }

  /**
   * Add a warning message to the validation report
   * @method addWarning
   * @param {string} message - Warning message to add
   */
  addWarning(message) {
    this.warnings.push(message);
  }

  /**
   * Add an info message to the validation report
   * @method addInfo
   * @param {string} message - Info message to add
   */
  addInfo(message) {
    this.info.push(message);
  }

  /**
   * Validate a complete logo submission
   * @async
   * @method validateLogo
   * @param {string} companyId - Company identifier (directory name)
   * @returns {Promise<Object>} Validation report with errors, warnings, and info
   * 
   * @example
   * const validator = new LogoValidator();
   * const report = await validator.validateLogo('company-name');
   * if (report.success) console.log('Logo passed validation!');
   */
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

  /**
   * Validate directory structure and required files
   * @async
   * @method validateDirectoryStructure
   * @param {string} logoDir - Path to logo directory
   * @param {string} companyId - Company identifier
   * @returns {Promise<void>}
   */
  async validateDirectoryStructure(logoDir, companyId) {
    const files = await fs.readdir(logoDir);
    
    // Check required files (simplified structure)
    const requiredFiles = [
      'metadata.json',
      `${companyId}.svg`
    ];
    
    const optionalFiles = [
      `${companyId}-symbol.svg`
    ];

    for (const file of requiredFiles) {
      if (!files.includes(file)) {
        this.addError(`Missing required file: ${file}`);
      }
    }

    // Check for old naming convention files (should not exist after migration)
    const deprecatedFiles = [
      `${companyId}-standard.svg`,
      `${companyId}-monochrome.svg`
    ];

    for (const file of deprecatedFiles) {
      if (files.includes(file)) {
        this.addWarning(`Deprecated file found: ${file}. Use migration tool to update structure.`);
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

  /**
   * Validate metadata.json file structure and content (simplified schema)
   * @async
   * @method validateMetadata
   * @param {string} logoDir - Path to logo directory
   * @returns {Promise<void>}
   */
  async validateMetadata(logoDir) {
    const metadataPath = path.join(logoDir, 'metadata.json');
    
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataContent);

      // Required fields (simplified schema)
      const requiredFields = ['name', 'title', 'website', 'colors', 'hasSymbol', 'license', 'created', 'updated'];
      for (const field of requiredFields) {
        if (metadata[field] === undefined || metadata[field] === null) {
          this.addError(`Missing required metadata field: ${field}`);
        }
      }

      // Validate specific fields
      if (metadata.name && typeof metadata.name !== 'string') {
        this.addError('Metadata field "name" must be a string');
      }

      if (metadata.title && typeof metadata.title !== 'string') {
        this.addError('Metadata field "title" must be a string');
      }

      if (metadata.website && !this.isValidUrl(metadata.website)) {
        this.addError('Metadata field "website" must be a valid URL');
      }

      if (metadata.colors) {
        if (!Array.isArray(metadata.colors)) {
          this.addError('Metadata field "colors" must be an array');
        } else {
          metadata.colors.forEach((color, index) => {
            if (!this.isValidColor(color)) {
              this.addError(`Invalid color format at index ${index}: ${color} (use #RRGGBB)`);
            }
          });
          
          if (metadata.colors.length === 0) {
            this.addError('Colors array cannot be empty');
          }
        }
      }

      if (metadata.hasSymbol !== undefined && typeof metadata.hasSymbol !== 'boolean') {
        this.addError('Metadata field "hasSymbol" must be a boolean');
      }

      if (metadata.created && !this.isValidDate(metadata.created)) {
        this.addError('Invalid created format (use YYYY-MM-DD)');
      }

      if (metadata.updated && !this.isValidDateTime(metadata.updated)) {
        this.addError('Invalid updated format (use ISO 8601 datetime)');
      }

      // Check for deprecated fields
      const deprecatedFields = ['category', 'tags', 'description', 'variants', 'industry'];
      for (const field of deprecatedFields) {
        if (metadata[field] !== undefined) {
          this.addWarning(`Deprecated field found: ${field}. Use migration tool to update metadata.`);
        }
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

  /**
   * Validate all SVG files in the logo directory
   * @async
   * @method validateSvgFiles
   * @param {string} logoDir - Path to logo directory
   * @param {string} companyId - Company identifier
   * @returns {Promise<void>}
   */
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

  /**
   * Validate individual SVG file
   * @async
   * @method validateSvgFile
   * @param {string} svgPath - Path to SVG file
   * @param {string} filename - SVG filename
   * @returns {Promise<void>}
   */
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

  /**
   * Validate URL format
   * @method isValidUrl
   * @param {string} url - URL to validate
   * @returns {boolean} True if URL is valid
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate color format (hex color)
   * @method isValidColor
   * @param {string} color - Color string to validate
   * @returns {boolean} True if color format is valid
   */
  isValidColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @method isValidDate
   * @param {string} date - Date string to validate
   * @returns {boolean} True if date format is valid
   */
  isValidDate(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
  }

  /**
   * Validate datetime format (ISO 8601)
   * @method isValidDateTime
   * @param {string} dateTime - DateTime string to validate
   * @returns {boolean} True if datetime format is valid
   */
  isValidDateTime(dateTime) {
    try {
      const date = new Date(dateTime);
      return date.toISOString() === dateTime;
    } catch {
      return false;
    }
  }

  /**
   * Generate validation report
   * @method getReport
   * @returns {Object} Validation report with errors, warnings, info, and validity status
   * 
   * @example
   * const report = validator.getReport();
   * console.log(`Validation ${report.success ? 'passed' : 'failed'}`);
   * console.log(`Errors: ${report.errors.length}`);
   */
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
🔍 LogoHub Logo Validator (Simplified Schema)

Usage:
  node validation/logo-validator.js <company-id>

Examples:
  node validation/logo-validator.js google
  node validation/logo-validator.js sample-company

This tool validates:
✅ Directory structure and required files
✅ Simplified metadata.json format and required fields  
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