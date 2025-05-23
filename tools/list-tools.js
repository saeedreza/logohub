#!/usr/bin/env node

/**
 * @fileoverview LogoHub Tools Directory Listing
 * @description Interactive tool discovery and help system for the LogoHub tools directory.
 * Lists all available tools organized by category with descriptions and usage examples.
 * 
 * @category Utility
 * @version 1.0.0
 * @author LogoHub Team
 * 
 * @example
 * # List all tools
 * node tools/list-tools.js
 * 
 * # List tools in specific category
 * node tools/list-tools.js development
 * 
 * # Show detailed help for a tool
 * node tools/list-tools.js --help dev-test
 */

const fs = require('fs');
const path = require('path');

/**
 * Tool categories and their descriptions
 */
const CATEGORIES = {
  development: {
    icon: '🚀',
    name: 'Development',
    description: 'Development workflow and testing tools'
  },
  'import-export': {
    icon: '📥',
    name: 'Import/Export',
    description: 'Logo import and export utilities'
  },
  processing: {
    icon: '🎨',
    name: 'Processing',
    description: 'Image processing and conversion tools'
  },
  validation: {
    icon: '✅',
    name: 'Validation',
    description: 'Quality assurance and validation tools'
  },
  metadata: {
    icon: '📊',
    name: 'Metadata',
    description: 'Metadata management tools'
  },
  'data-files': {
    icon: '📁',
    name: 'Data Files',
    description: 'Static data files (JSON, CSV)'
  }
};

/**
 * Tool descriptions and usage information
 */
const TOOLS = {
  // Development Tools
  'dev-test.js': {
    category: 'development',
    name: 'Development Test Suite',
    description: 'Automated testing for API and website functionality',
    usage: 'node development/dev-test.js',
    features: [
      'API endpoint testing',
      'PNG conversion verification',
      'CORS header validation',
      'Website accessibility checks'
    ]
  },
  'generate-logo-data.js': {
    category: 'development',
    name: 'Website Data Generator',
    description: 'Generates optimized logo data for VitePress website',
    usage: 'node development/generate-logo-data.js',
    features: [
      'Metadata aggregation',
      'Statistics generation',
      'Category organization',
      'API-optimized output'
    ]
  },

  // Import/Export Tools
  'logo-batch-import.js': {
    category: 'import-export',
    name: 'Batch Logo Importer',
    description: 'Bulk import logos from CSV/JSON with downloaded SVGs',
    usage: 'node import-export/logo-batch-import.js',
    features: [
      'CSV/JSON processing',
      'Automatic categorization',
      'Template generation',
      'Batch validation'
    ]
  },
  'simple-logo-importer.js': {
    category: 'import-export',
    name: 'Simple Logo Importer',
    description: 'Interactive CLI tool for importing individual logos',
    usage: 'node import-export/simple-logo-importer.js',
    features: [
      'Interactive prompts',
      'Metadata creation',
      'File validation',
      'Single logo import'
    ]
  },
  'logo-downloader.js': {
    category: 'import-export',
    name: 'Logo Downloader',
    description: 'Download logos from external sources',
    usage: 'node import-export/logo-downloader.js',
    features: [
      'Multiple source support',
      'Filename normalization',
      'Source attribution',
      'Batch downloads'
    ]
  },
  'add-gilbarbara-logo.js': {
    category: 'import-export',
    name: 'Gilbarbara Logo Importer',
    description: 'Specialized importer for Gilbarbara logo collection',
    usage: 'node import-export/add-gilbarbara-logo.js',
    features: [
      'Gilbarbara integration',
      'Automatic metadata',
      'Color analysis',
      'Direct import'
    ]
  },

  // Processing Tools
  'image-converter.js': {
    category: 'processing',
    name: 'Image Converter',
    description: 'Convert SVG logos to PNG/WebP with multiple sizes',
    usage: 'require("./processing/image-converter.js")',
    features: [
      'SVG to PNG/WebP',
      'Multiple size variants',
      'Aspect ratio preservation',
      'Buffer processing'
    ]
  },
  'svg-color-replacer.js': {
    category: 'processing',
    name: 'SVG Color Replacer',
    description: 'Replace colors in SVG files for theming',
    usage: 'node processing/svg-color-replacer.js',
    features: [
      'Color replacement',
      'Monochrome conversion',
      'Brand color mapping',
      'Batch processing'
    ]
  },
  'logo-template.js': {
    category: 'processing',
    name: 'Logo Template Generator',
    description: 'Generate SVG templates for logos without assets',
    usage: 'node processing/logo-template.js',
    features: [
      'Template generation',
      'Standard styling',
      'Placeholder text',
      'Consistent dimensions'
    ]
  },

  // Validation Tools
  'logo-validator.js': {
    category: 'validation',
    name: 'Logo Validator',
    description: 'Comprehensive validation for logo quality and compliance',
    usage: 'node validation/logo-validator.js company-name',
    features: [
      'Directory structure validation',
      'Metadata completeness',
      'SVG file validity',
      'Quality checks'
    ]
  },
  'logo-source-checker.js': {
    category: 'validation',
    name: 'Logo Source Checker',
    description: 'Verify logo sources and check for updates',
    usage: 'node validation/logo-source-checker.js',
    features: [
      'Source availability',
      'Version comparison',
      'Update notifications',
      'Attribution validation'
    ]
  },

  // Metadata Tools
  'migrate-metadata.js': {
    category: 'metadata',
    name: 'Metadata Migrator',
    description: 'Migrate logo metadata to new schema versions',
    usage: 'node metadata/migrate-metadata.js',
    features: [
      'Batch migration',
      'Schema updates',
      'Field mapping',
      'Cleanup deprecated fields'
    ]
  }
};

/**
 * Display help for all tools or specific category
 */
function showTools(categoryFilter = null) {
  console.log('🛠️  LogoHub Tools Directory\n');
  
  if (categoryFilter && !CATEGORIES[categoryFilter]) {
    console.error(`❌ Unknown category: ${categoryFilter}`);
    console.log('\nAvailable categories:', Object.keys(CATEGORIES).join(', '));
    return;
  }

  const categoriesToShow = categoryFilter ? [categoryFilter] : Object.keys(CATEGORIES);

  for (const categoryId of categoriesToShow) {
    const category = CATEGORIES[categoryId];
    console.log(`${category.icon} ${category.name}`);
    console.log(`   ${category.description}\n`);

    // Find tools in this category
    const categoryTools = Object.entries(TOOLS).filter(([_, tool]) => tool.category === categoryId);
    
    if (categoryTools.length === 0) {
      console.log('   (No tools in this category)\n');
      continue;
    }

    for (const [filename, tool] of categoryTools) {
      console.log(`   📄 ${tool.name}`);
      console.log(`      ${tool.description}`);
      console.log(`      Usage: ${tool.usage}`);
      
      if (tool.features && tool.features.length > 0) {
        console.log(`      Features: ${tool.features.join(', ')}`);
      }
      console.log();
    }
  }
}

/**
 * Show detailed help for a specific tool
 */
function showToolHelp(toolName) {
  const tool = TOOLS[toolName];
  
  if (!tool) {
    console.error(`❌ Tool not found: ${toolName}`);
    console.log('\nAvailable tools:');
    Object.keys(TOOLS).forEach(name => console.log(`  - ${name}`));
    return;
  }

  const category = CATEGORIES[tool.category];
  
  console.log(`🔧 ${tool.name}\n`);
  console.log(`Category: ${category.icon} ${category.name}`);
  console.log(`Description: ${tool.description}\n`);
  console.log(`Usage: ${tool.usage}\n`);
  
  if (tool.features) {
    console.log('Features:');
    tool.features.forEach(feature => console.log(`  • ${feature}`));
    console.log();
  }

  // Try to show file-specific help if available
  const toolPath = path.join(__dirname, tool.category, toolName);
  if (fs.existsSync(toolPath)) {
    console.log(`File location: tools/${tool.category}/${toolName}`);
  }
}

/**
 * Main function - parse arguments and show appropriate help
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') && args.length > 1) {
    const toolName = args.find(arg => arg !== '--help');
    showToolHelp(toolName);
  } else if (args.length === 1 && !args[0].startsWith('--')) {
    showTools(args[0]);
  } else if (args.length === 0) {
    showTools();
  } else {
    console.log('Usage:');
    console.log('  node tools/list-tools.js                    # List all tools');
    console.log('  node tools/list-tools.js <category>         # List tools in category');
    console.log('  node tools/list-tools.js --help <tool>      # Show detailed help for tool');
    console.log('\nCategories:', Object.keys(CATEGORIES).join(', '));
  }
}

if (require.main === module) {
  main();
}

module.exports = { CATEGORIES, TOOLS, showTools, showToolHelp }; 