# LogoHub Development Guide

This guide provides detailed information for developers who want to contribute to or build upon the LogoHub project.

> **Current Status**: Phase 2 Complete ✅ | **55 Logos** | **Simplified Structure** | **Beautiful Website**

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/saeedreza/logohub.git
   cd logohub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the API server**:
   ```bash
   npm start  # http://localhost:3000
   ```

4. **Start the website** (in another terminal):
   ```bash
   npm run website:dev  # http://localhost:5173
   ```

5. **Test the API**:
   ```bash
   curl "http://localhost:3000/api/v1/logos"
   ```

## 📁 Current Project Structure

```
logohub/
├── api/                           # Vercel serverless functions
│   ├── health.js                 # Health check endpoint
│   └── v1/
│       └── logos/
│           ├── index.js          # Logo listing API
│           └── [id].js           # Individual logo API
├── logos/                        # ✅ 55 Logos (simplified structure)
│   ├── google/                   # Example logo structure
│   │   ├── metadata.json         # 7-field simplified metadata
│   │   └── google.svg            # Single logo file
│   └── [54 other companies]/     # Each with same structure
├── tools/                        # ✅ Organized development utilities
│   ├── development/              # Testing and development tools
│   ├── import-export/            # Data generation and export tools
│   ├── processing/               # Image processing utilities
│   ├── validation/               # Logo validation tools
│   ├── metadata/                 # Metadata management tools
│   └── data-files/               # Configuration and schema files
├── docs/                         # ✅ VitePress website
│   ├── .vitepress/
│   │   └── components/
│   │       └── LogoGrid.vue     # Interactive logo browser
│   └── logos.md                 # Logo browsing page
├── packages/                     # ✅ NPM packages
│   ├── core/                    # @logohub/core
│   └── react/                   # @logohub/react
├── roadmap/                      # Development roadmap & guides
├── guidelines/                   # Contribution and legal guidelines
└── vercel.json                   # Vercel deployment configuration
```

## ✨ Current Features

### ✅ **Live API** (https://logohub.dev/api/v1)

| Endpoint | Description |
|----------|-------------|
| `GET /v1/logos` | List all 55 logos with pagination and search |
| `GET /v1/logos/{id}` | Get logo metadata with dynamic URLs |
| `GET /v1/logos/{id}.{format}` | Get logo file with customization |
| `GET /health` | API health check |

### ✅ **Dynamic Capabilities**

- **Format Conversion**: SVG → PNG/WebP on-demand with aspect ratio preservation
- **Color Customization**: Real-time color replacement and monochrome conversion
- **Flexible Sizing**: Any size from 16px to 2048px (maintains aspect ratios)
- **Performance**: CDN-cached with aggressive caching headers
- **CORS Enabled**: Ready for browser applications

### ✅ **Website Features**

- **Interactive Logo Browser**: Search through all 55 logos in real-time
- **Grid & List Views**: Flexible viewing options with responsive design
- **API Integration**: Direct integration with LogoHub API
- **Clean Interface**: Search-driven without category clutter

## 🛠️ Development Workflows

### **Recommended Tools Usage**

Our organized toolchain provides everything you need:

```bash
# Interactive tool discovery
node tools/development/list-tools.js

# Logo validation
node tools/validation/logo-validator.js [logo-path]
node tools/validation/validate-all.js

# Data generation
node tools/import-export/generate-logo-data.js

# Image processing
node tools/processing/image-converter.js
node tools/processing/svg-optimizer.js
```

### **Adding New Logos**

1. **Create logo directory**:
   ```bash
   mkdir logos/company-name
   ```

2. **Add simplified metadata.json**:
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

5. **Test locally**:
   ```bash
   npm start
   # Test: http://localhost:3000/api/v1/logos/company-name
   ```

### **Simplified Metadata Schema**

After our major migration, we use a streamlined 7-field schema:

```json
{
  "name": "google",           // Unique identifier (lowercase, hyphenated)
  "title": "Google",          // Display name
  "website": "https://google.com",
  "colors": ["#4285f4", "#ea4335", "#fbbc05", "#34a853"],
  "license": "Fair Use",
  "hasSymbol": false,         // Future: symbol vs wordmark support
  "created": "2024-12-01",
  "updated": "2024-12-01"
}
```

**Key Changes from Old Schema:**
- ❌ Removed: `category`, `tags`, `description`, `variants`
- ✅ Simplified: Single `colors` array
- ✅ Added: `hasSymbol` for future symbol/wordmark support
- ✅ Reduced: From 8-10 fields to 7 essential fields

### **Logo File Structure**

Each logo now uses a simplified file structure:

```
logos/company-name/
├── metadata.json           # 7-field metadata
└── company-name.svg       # Single logo file

# Future: Symbol variant support
└── company-name-symbol.svg # Optional for hasSymbol: true
```

**Previous Complex Structure** (eliminated):
```
❌ company-name-standard.svg
❌ company-name-monochrome.svg
❌ company-name-dark.svg
❌ Multiple category/tag files
```

## 🔧 API Development

### **Current Architecture**

The API uses Vercel serverless functions for optimal performance:

- **Auto-scaling**: Functions scale automatically with demand
- **Global distribution**: Deployed across Vercel's edge network
- **Zero configuration**: No server management required

### **Adding New Endpoints**

1. **Create function file**:
   ```javascript
   // api/v1/new-endpoint.js
   export default async function handler(req, res) {
     // Enable CORS
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
     
     if (req.method === 'OPTIONS') {
       res.status(200).end();
       return;
     }
     
     // Your logic here
     res.json({ message: 'Hello from new endpoint' });
   }
   ```

2. **Test locally**:
   ```bash
   npm start
   # Access: http://localhost:3000/api/v1/new-endpoint
   ```

### **Working with Image Conversion**

```javascript
const { 
  convertSvgBufferToPng, 
  convertSvgBufferToWebp, 
  replaceColorsInSvg 
} = require('../../tools/processing/image-converter');

// Convert with aspect ratio preservation
const pngBuffer = await convertSvgBufferToPng(svgBuffer, 64);

// Apply color customization (all colors replaced)
const coloredSvg = replaceColorsInSvg(svgContent, '#ff0000', false);

// Monochrome conversion
const monoSvg = replaceColorsInSvg(svgContent, '#000000', true);
```

## 🌐 Website Development

### **VitePress Setup**

The website uses VitePress with Vue components:

```bash
# Start website development
npm run website:dev

# Build website
npm run website:build
```

### **Key Components**

- **LogoGrid.vue**: Interactive logo browser with search
- **Logo display**: Grid and list views
- **Search functionality**: Real-time logo filtering
- **API integration**: Direct API calls (no file duplication)

### **Website Structure**

```
docs/
├── .vitepress/
│   ├── config.js              # VitePress configuration
│   └── components/
│       └── LogoGrid.vue       # Main logo browser component
├── index.md                   # Homepage
├── logos.md                   # Logo browser page
└── api.md                     # API documentation
```

## 📦 Package Development

### **Current Packages**

- **@logohub/core**: Core functionality and utilities
- **@logohub/react**: React components and hooks

### **Package Structure**

```
packages/
├── core/
│   ├── src/
│   ├── package.json
│   └── README.md
└── react/
    ├── src/
    ├── package.json
    └── README.md
```

### **Building Packages**

```bash
# Build core package
cd packages/core
npm run build

# Build React package  
cd packages/react
npm run build

# Publish (maintainers only)
npm publish
```

## 🧪 Testing

### **Logo Validation**

```bash
# Validate single logo
node tools/validation/logo-validator.js logos/google

# Validate all logos
node tools/validation/validate-all.js

# Check simplified schema compliance
node tools/data-files/simplified-schema.json
```

### **API Testing**

```bash
# Test logo listing
curl "http://localhost:3000/api/v1/logos"

# Test specific logo
curl "http://localhost:3000/api/v1/logos/google"

# Test format conversion
curl "http://localhost:3000/api/v1/logos/google.png?size=128"

# Test color customization
curl "http://localhost:3000/api/v1/logos/google.svg?color=ff0000"
```

### **Website Testing**

```bash
# Start both API and website
npm start                # Terminal 1: API server
npm run website:dev      # Terminal 2: Website

# Test integration
open http://localhost:5173/logos
```

## 🚀 Deployment

### **Vercel Deployment**

The project auto-deploys on Vercel:

1. **Automatic**: Pushes to `main` branch deploy automatically
2. **Preview**: PRs get preview URLs
3. **Custom Domain**: https://logohub.dev

### **Manual Deployment**

```bash
# Deploy to production
vercel --prod

# Deploy for preview
vercel
```

## 🤝 Contributing

### **Contribution Process**

1. **Fork the repository**
2. **Add/update logos** following simplified structure
3. **Validate changes** with our tools
4. **Test locally** with both API and website
5. **Submit Pull Request** with clear description

### **Guidelines & Legal**

- **Logo Guidelines**: See [guidelines/CONTRIBUTING.md](../guidelines/CONTRIBUTING.md)
- **Legal Guidelines**: See [guidelines/LEGAL.md](../guidelines/LEGAL.md)
- **Code Standards**: Enforced through validation tools

### **Logo Submission Standards**

1. **Use simplified metadata** (7 fields only)
2. **Single SVG file** per logo (+ optional symbol variant)
3. **Official sources only** (company websites, press kits)
4. **Validate before submission** using our tools
5. **Test API integration** locally

## 🔮 Future Development

### **Planned Features**

- **Symbol vs Wordmark Support**: API endpoints for distinct logo variants
- **Vue/Angular/Svelte Packages**: Complete framework ecosystem
- **Enhanced Search**: Fuzzy matching and autocomplete
- **Batch Operations**: Multiple logo requests in single API call
- **Usage Analytics**: Logo popularity and usage tracking

### **Package Roadmap**

- **Q1 2025**: `@logohub/vue` package
- **Q2 2025**: `@logohub/angular` and `@logohub/svelte` packages
- **Q3 2025**: `@logohub/elements` (Web Components)

See [ROADMAP.md](./ROADMAP.md) for complete future plans.

## 🆘 Troubleshooting

### **Common Issues**

1. **"Logo not found"**: Check simplified file naming (company-name.svg)
2. **Metadata validation fails**: Ensure 7-field schema compliance
3. **Website shows no logos**: Verify API server is running on port 3000
4. **Image conversion errors**: Check SVG file validity

### **Debugging Tools**

```bash
# Check API health
curl "http://localhost:3000/api/health"

# Validate specific logo
node tools/validation/logo-validator.js logos/[company]

# Test logo data generation
node tools/import-export/generate-logo-data.js

# Interactive tool help
node tools/development/list-tools.js
```

### **Getting Help**

- **GitHub Issues**: Report bugs and feature requests
- **Discussions**: Ask questions and share ideas
- **Validation Tools**: Run automated checks for immediate feedback

---

## 📊 Current Status

- **✅ 55 Logos**: Migrated to simplified structure
- **✅ 32% Storage Reduction**: From 81 to 55 files
- **✅ API & Website**: Both fully operational
- **✅ NPM Packages**: Core and React packages published
- **✅ Comprehensive Tools**: 39 tools across 6 categories
- **✅ Zero Data Loss**: Successful migration with backups

## 🎯 Next Steps

1. **Scale logo collection** to 200+ companies
2. **Add Vue package** for broader framework support
3. **Implement symbol vs wordmark** support
4. **Enhanced search features** and community tools

---

**Current Version**: 2.0.0 - Simplified Architecture | **Next**: Scale & Framework Ecosystem

**🚀 Ready for massive growth while maintaining clean, simple structure** 