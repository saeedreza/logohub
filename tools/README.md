# LogoHub Tools Directory

This directory contains various tools for managing, processing, and maintaining the LogoHub logo collection. Tools are organized into categories for better discoverability and maintenance.

## Directory Structure

```
tools/
├── development/        # Development and testing tools
├── import-export/      # Logo import and export utilities
├── processing/         # Image processing and conversion tools
├── validation/         # Quality assurance and validation tools
├── metadata/          # Metadata management tools
├── data-files/        # Static data files (JSON, CSV)
└── downloaded-logos/  # Temporary download cache (can be deleted)
```

## Tool Categories

### 🚀 Development (`development/`)

Tools for development workflow and testing the LogoHub system.

#### `dev-test.js`
**Purpose**: Development testing script that verifies API and website functionality  
**Usage**: `node development/dev-test.js`  
**Description**: Automated testing tool that checks:
- API endpoints (health, logos list, specific logos, metadata)
- PNG conversion functionality  
- CORS headers configuration
- Website homepage and logo browser functionality

#### `generate-logo-data.js`
**Purpose**: Generates optimized logo data for the VitePress website  
**Usage**: `node development/generate-logo-data.js`  
**Description**: Creates `docs/.vitepress/data/logos.json` with:
- Logo metadata without embedded SVG content (uses API endpoints instead)
- Category and tag organization
- Statistics and counts
- Website-optimized data structure

---

### 📥 Import/Export (`import-export/`)

Tools for importing logos from external sources and managing logo data.

#### `logo-batch-import.js`
**Purpose**: Bulk import logos from CSV/JSON files with downloaded SVGs  
**Usage**: `node import-export/logo-batch-import.js`  
**Features**:
- Import from CSV with automatic category detection
- Process downloaded SVG files from external sources
- Generate logo templates for missing SVGs
- Batch metadata creation and validation

#### `simple-logo-importer.js`
**Purpose**: Simple CLI tool for importing individual logos  
**Usage**: `node import-export/simple-logo-importer.js`  
**Description**: Interactive tool for adding single logos with proper metadata structure.

#### `logo-downloader.js`
**Purpose**: Download logos from external sources (Simple Icons, Gilbarbara)  
**Usage**: `node import-export/logo-downloader.js`  
**Features**:
- Download from multiple logo repositories
- Automatic filename normalization
- Source tracking and attribution

#### `add-gilbarbara-logo.js`
**Purpose**: Specialized tool for importing logos from Gilbarbara's collection  
**Usage**: `node import-export/add-gilbarbara-logo.js`  
**Features**:
- Direct integration with Gilbarbara's logo repository
- Automatic metadata extraction
- Color analysis and tagging

---

### 🎨 Processing (`processing/`)

Tools for image processing, conversion, and logo manipulation.

#### `image-converter.js`
**Purpose**: Convert SVG logos to PNG and WebP formats with multiple sizes  
**Usage**: `require('./processing/image-converter.js')`  
**Features**:
- SVG to PNG/WebP conversion
- Multiple standard sizes (16, 32, 64, 128, 256, 512px)
- Aspect ratio preservation
- Transparent backgrounds
- Buffer and file-based processing

#### `svg-color-replacer.js`
**Purpose**: Replace colors in SVG files for theming and customization  
**Usage**: `node processing/svg-color-replacer.js`  
**Features**:
- Color replacement in SVG content
- Monochrome conversion
- Brand color mapping

#### `logo-template.js`
**Purpose**: Generate SVG templates for logos without real assets  
**Usage**: `node processing/logo-template.js`  
**Features**:
- Consistent template generation
- Placeholder text with company names
- Standard dimensions and styling

---

### ✅ Validation (`validation/`)

Tools for quality assurance and validation of logo submissions.

#### `logo-validator.js`
**Purpose**: Comprehensive validation tool for logo quality and compliance  
**Usage**: `node validation/logo-validator.js company-name`  
**Validates**:
- Directory structure compliance
- Metadata completeness and format
- SVG file validity and optimization
- File sizes and formats
- Required vs optional files

#### `logo-source-checker.js`
**Purpose**: Verify logo sources and check for updates  
**Usage**: `node validation/logo-source-checker.js`  
**Features**:
- Source availability checking
- Version comparison
- Update notifications
- Source attribution validation

---

### 📊 Metadata (`metadata/`)

Tools for managing and migrating logo metadata.

#### `migrate-metadata.js`
**Purpose**: Migrate logo metadata to new schema versions  
**Usage**: `node metadata/migrate-metadata.js`  
**Features**:
- Batch metadata migration
- Category normalization
- Field mapping and transformation
- Schema version updates
- Deprecated field cleanup

---

### 📁 Data Files (`data-files/`)

Static data files used by various tools.

#### `logo-categories.json`
**Purpose**: Category definitions and logo mappings  
**Contains**: Category hierarchies, logo-to-category mappings, display names

#### `popular-logos-2024.csv`
**Purpose**: List of popular logos for prioritization  
**Contains**: Logo names, popularity metrics, import priority

#### `logo-availability-report.json`
**Purpose**: Automated report of logo availability and status  
**Contains**: Availability status, missing logos, source information

---

### 🗂️ Downloaded Logos (`downloaded-logos/`)

**Purpose**: Temporary cache for downloaded SVG files  
**Status**: ⚠️ **Can be safely deleted**  
**Description**: This folder contains SVG files downloaded from external sources during the import process. These files are temporary and can be regenerated by running the download tools again.

**Recommendation**: Delete this folder periodically to save space, especially after successful imports.

## Tool Dependencies

### Required Node.js Packages
- `axios` - HTTP requests
- `sharp` - Image processing
- `jsdom` - SVG validation
- `fs/promises` - File system operations

### Optional Dependencies
- Logo validation requires `jsdom`
- Image conversion requires `sharp`
- API testing requires running LogoHub server

## Usage Patterns

### Adding a New Logo
1. Use `logo-downloader.js` to download from external sources
2. Run `logo-batch-import.js` to process downloads
3. Validate with `logo-validator.js`
4. Update website data with `generate-logo-data.js`

### Development Workflow
1. Start API server: `npm start`
2. Start website: `npm run website:dev`
3. Run tests: `node development/dev-test.js`

### Maintenance Tasks
1. Validate all logos: Run validator on each logo directory
2. Update metadata: Use `migrate-metadata.js` for schema changes
3. Check sources: Use `logo-source-checker.js` for updates
4. Clean cache: Delete `downloaded-logos/` folder

## Contributing

When adding new tools:
1. Place in appropriate category directory
2. Add comprehensive JSDoc comments
3. Include usage examples
4. Update this README
5. Add error handling and validation
6. Follow existing naming conventions

## Troubleshooting

### Common Issues
- **Import failures**: Check SVG file validity and metadata format
- **Conversion errors**: Ensure Sharp is properly installed
- **API test failures**: Verify servers are running on correct ports
- **Validation errors**: Check file permissions and directory structure

### Performance Tips
- Run batch operations during off-peak hours
- Use specific logo names instead of processing all logos
- Clean temporary files regularly
- Monitor disk space during bulk operations 