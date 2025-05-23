# LogoHub

**🚀 An open-source brand logo repository service for front-end developers**

[![API Status](https://img.shields.io/badge/API-Live-brightgreen)](https://logohub.dev/api/health)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Vision

LogoHub provides front-end developers with instant access to company logos in multiple formats and sizes. No more hunting for logo files or dealing with inconsistent formats - just clean, scalable, and customizable logos through a simple API.

> **Current Status**: Phase 2 Complete ✅ | **Progress**: 55 logos with simplified structure

## ✨ Features

- **🔄 Dynamic Format Conversion**: SVG → PNG/WebP on-demand with aspect ratio preservation
- **🎨 API-Powered Color Customization**: Real-time color replacement and monochrome conversion
- **📏 Flexible Sizing**: Any size from 16px to 2048px (maintains aspect ratios)
- **⚡ Performance Optimized**: CDN-cached with aggressive caching headers  
- **🌐 CORS Enabled**: Ready for browser-based applications
- **📱 Multiple Formats**: SVG (scalable), PNG (compatible), WebP (efficient)
- **🔍 Searchable API**: Filter and search through 55+ logos
- **🛠️ Comprehensive Toolchain**: Complete logo management and validation system
- **📖 Beautiful Website**: Interactive logo browser with search and filtering

## 🚀 Live API

**Base URL**: `https://logohub.dev/api/v1`

### Quick Examples

```bash
# Get all available logos
curl "https://logohub.dev/api/v1/logos"

# Get Google logo metadata
curl "https://logohub.dev/api/v1/logos/google"

# SVG with original colors
curl "https://logohub.dev/api/v1/logos/google.svg"

# SVG with custom color (red) - replaces ALL colors
curl "https://logohub.dev/api/v1/logos/google.svg?color=ff0000"

# Monochrome conversion (black)
curl "https://logohub.dev/api/v1/logos/google.svg?color=black"

# PNG conversion (128px max dimension, preserves aspect ratio)
curl "https://logohub.dev/api/v1/logos/google.png?size=128"

# WebP conversion with color customization
curl "https://logohub.dev/api/v1/logos/google.webp?size=128&color=00ff00"

# Symbol vs Wordmark (Future Feature)
# For logos with hasSymbol: true
curl "https://logohub.dev/api/v1/logos/google-symbol.svg"     # Symbol only
curl "https://logohub.dev/api/v1/logos/google.svg"           # Full wordmark
```

## 📖 API Documentation

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/logos` | GET | List all available logos |
| `/v1/logos/{id}` | GET | Get logo metadata with dynamic URLs |
| `/v1/logos/{id}.{format}` | GET | Get logo file with customization |
| `/health` | GET | API health check |

### Parameters

#### Logo List (`/v1/logos`)
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20, max: 100)
- `search` (string): Search by company name or website

#### Logo File (`/v1/logos/{id}.{format}`)
- `size` (int): Max dimension in pixels for PNG/WebP (1-2048, preserves aspect ratio)
- `color` (hex): Color replacement for SVG (without #) - supports monochrome (black/white)

### Standard Sizes
`16, 32, 64, 128, 256, 512` pixels (max dimension)

### Supported Formats
- **SVG**: Scalable vector graphics with enhanced color customization
- **PNG**: Raster format with transparency and aspect ratio preservation
- **WebP**: Modern format with superior compression

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn  
- Vercel CLI (for deployment)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/saeedreza/logohub.git
cd logohub

# Install dependencies
npm install

# Start API server
npm start

# Start website (separate terminal)
npm run website:dev
```

### Logo Management

Our comprehensive toolchain is organized into categories:

```bash
# Development Tools
node tools/development/dev-test.js              # Test API endpoints locally
node tools/development/list-tools.js            # Interactive tool discovery

# Import/Export Tools  
node tools/import-export/generate-logo-data.js  # Generate logos.json
node tools/import-export/export-metadata.js     # Export all metadata

# Processing Tools
node tools/processing/image-converter.js        # Convert SVG to PNG/WebP
node tools/processing/svg-optimizer.js          # Optimize SVG files

# Validation Tools
node tools/validation/logo-validator.js         # Validate logo structure
node tools/validation/validate-all.js           # Validate entire repository

# Metadata Tools
node tools/metadata/metadata-updater.js         # Update metadata fields
node tools/metadata/schema-migrator.js          # Migrate between schemas
```

### Project Structure

```
logohub/
├── api/                          # Vercel serverless functions
│   ├── health.js                # Health check endpoint
│   └── v1/
│       └── logos/
│           ├── index.js         # Logo listing API
│           └── [id].js          # Individual logo API
├── logos/                       # Logo repository (55 logos)
│   ├── google/                  # Example: Google logo
│   │   ├── metadata.json        # Simplified metadata (7 fields)
│   │   └── google.svg           # Single logo file
│   └── ...                      # 54 other company logos
├── tools/                       # Development utilities (organized)
│   ├── development/             # Testing and development tools
│   ├── import-export/           # Data generation and export tools
│   ├── processing/              # Image processing utilities
│   ├── validation/              # Logo validation tools
│   ├── metadata/                # Metadata management tools
│   └── data-files/              # Configuration and schema files
├── docs/                        # VitePress website
│   ├── .vitepress/
│   │   └── components/
│   │       └── LogoGrid.vue     # Interactive logo browser
│   └── logos.md                 # Logo browsing page
├── roadmap/                     # Implementation roadmap & guides
└── guidelines/                  # Contribution guidelines
```

### Adding New Logos

1. **Create logo directory**:
   ```bash
   mkdir logos/company-name
   ```

2. **Add metadata.json** with simplified schema:
   ```json
   {
     "name": "Company Name",
     "title": "Company Inc.",
     "website": "https://company.com",
     "colors": ["#0066cc", "#ff9900"],
     "license": "Fair Use",
     "hasSymbol": false,
     "created": "2024-12-01",
     "updated": "2024-12-01"
   }
   ```

3. **Add company-name.svg** (single main logo file)

4. **Validate your logo**:
   ```bash
   node tools/validation/logo-validator.js logos/company-name
   ```

5. **Test locally** and submit pull request

#### Adding Logos with Symbol Variants (Future)

For companies with distinct symbols (like Apple's apple icon vs "Apple Inc." wordmark):

1. **Add both files**:
   ```
   logos/apple/
   ├── metadata.json        # Set "hasSymbol": true
   ├── apple.svg           # Full wordmark with text
   └── apple-symbol.svg    # Symbol/icon only
   ```

2. **Update metadata**:
   ```json
   {
     "name": "apple",
     "hasSymbol": true,
     "...": "..."
   }
   ```

**Examples of companies that would benefit**:
- **Apple**: Apple icon vs "Apple" wordmark
- **Nike**: Swoosh vs "Nike" text
- **McDonald's**: Golden arches vs "McDonald's" text
- **Twitter/X**: Bird/X icon vs full logo
- **Instagram**: Camera icon vs "Instagram" wordmark

## 🌟 Usage Examples

### JavaScript/React
```javascript
// Get logo metadata with dynamic sizing URLs
const response = await fetch('https://logohub.dev/api/v1/logos/google');
const logoData = await response.json();

// Use in React component (aspect ratio preserved)
<img 
  src="https://logohub.dev/api/v1/logos/google.png?size=128"
  alt="Google Logo"
  style={{maxWidth: '128px', height: 'auto'}}
/>

// Check for symbol vs wordmark variants
if (logoData.hasSymbol) {
  // Use symbol for compact spaces (planned feature)
  <img 
    src="https://logohub.dev/api/v1/logos/google-symbol.svg?color=333333"
    alt="Google Symbol"
    className="icon-small"
  />
  
  // Use full wordmark for headers
  <img 
    src="https://logohub.dev/api/v1/logos/google.svg"
    alt="Google Logo"
    className="logo-header"
  />
} else {
  // Use single logo file
  <img 
    src="https://logohub.dev/api/v1/logos/google.svg"
    alt="Google Logo"
  />
}
```

### HTML
```html
<!-- SVG with custom color (all colors replaced) -->
<img src="https://logohub.dev/api/v1/logos/google.svg?color=ff0000" 
     alt="Google Logo in Red" />

<!-- Monochrome version -->
<img src="https://logohub.dev/api/v1/logos/google.svg?color=black" 
     alt="Google Logo Monochrome" />

<!-- WebP for modern browsers (aspect ratio preserved) -->
<picture>
  <source srcset="https://logohub.dev/api/v1/logos/google.webp?size=128" 
          type="image/webp">
  <img src="https://logohub.dev/api/v1/logos/google.png?size=128" 
       alt="Google Logo">
</picture>
```

### CSS
```css
.google-logo {
  background-image: url('https://logohub.dev/api/v1/logos/google.svg?color=ffffff');
  width: 200px;
  height: auto;
  background-size: contain;
  background-repeat: no-repeat;
}
```

## 🚀 Deployment

The project is deployed on Vercel with automatic deployments from the main branch.

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/saeedreza/logohub)

Or manually:
```bash
vercel login
vercel --prod
```

## 🤝 Contributing

We welcome contributions! Use our organized toolchain for the best experience:

1. **Fork the repository**
2. **Add logos** following the simplified structure
3. **Validate logos** with our validation tools
4. **Test locally** with `npm start` and `npm run website:dev`
5. **Submit Pull Request**

See our [Legal Guidelines](./guidelines/LEGAL.md) for detailed standards.


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **API Base**: https://logohub.dev/api/v1
- **Logo Browser**: https://logohub.dev/logos
- **Documentation**: https://logohub.dev/
- **GitHub Repository**: https://github.com/saeedreza/logohub
- **Issues & Feature Requests**: https://github.com/saeedreza/logohub/issues

## ⚖️ Legal Notice

LogoHub is a tool for developers. All logos remain the property of their respective owners. Please ensure you have the right to use any logo in your project and comply with the respective company's brand guidelines.

---

**Made with ❤️ for the developer community** 

**Phase 2 Complete ✅ | 55 Logos with Simplified Structure | Next: Scale & Enhancement**

## 🚀 Quick Start

### API Server
```bash
npm start  # Starts API server on http://localhost:3000
```

### Website Development
```bash
npm run website:dev  # Starts VitePress site on http://localhost:5173
```

## 📊 Current Status

- **55 Logos** with simplified structure
- **32% Storage Reduction** (81→55 files after migration)
- **Comprehensive Toolchain** across 6 organized categories
- **Full API Integration** with dynamic sizing and format conversion
- **Beautiful Website** with search-driven logo browser
- **Zero Data Loss** migration with automated backups

## 🌐 Website Features

Our VitePress-powered website includes:

- **Interactive Logo Browser**: Search through all 55 logos in real-time
- **API Integration**: Direct integration with LogoHub API (no file duplication)
- **Grid & List Views**: Flexible viewing options
- **Logo Details**: Modal system with usage examples and download options
- **Responsive Design**: Mobile-friendly interface
- **Format Support**: SVG, PNG, WebP with dynamic conversion
- **Color Customization**: API-powered color parameter support

### Website URLs

- **Homepage**: http://localhost:5173
- **Logo Browser**: http://localhost:5173/logos
- **API Documentation**: http://localhost:5173/api
- **Usage Guide**: http://localhost:5173/guide

## 🔧 API Endpoints

### List All Logos
```bash
GET http://localhost:3000/api/v1/logos
```

### Get Specific Logo
```bash
GET http://localhost:3000/api/v1/logos/{logoId}
GET http://localhost:3000/api/v1/logos/{logoId}.png?size=64
GET http://localhost:3000/api/v1/logos/{logoId}.svg?color=ff0000
```

### Logo Metadata
```bash
GET http://localhost:3000/api/v1/logos/{logoId}/metadata
```

### Symbol vs Wordmark Support (Planned)

For companies with both symbol and wordmark variants:

```bash
# Check if logo has symbol variant
curl "https://logohub.dev/api/v1/logos/google"
# Returns: { "hasSymbol": true, ... }

# Get symbol only (icon/mark)
curl "https://logohub.dev/api/v1/logos/google-symbol.svg"

# Get full wordmark (logo + text)  
curl "https://logohub.dev/api/v1/logos/google.svg"

# Works with all formats and customizations
curl "https://logohub.dev/api/v1/logos/google-symbol.png?size=64&color=ff0000"
```

> **Note**: Currently all 55 logos have `hasSymbol: false`. This feature will be added as we expand the collection with companies that have distinct symbol variants. 