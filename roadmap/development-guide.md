# LogoHub Development Guide

This guide provides detailed information for developers who want to contribute to or build upon the LogoHub project.

> **Current Status**: LogoHub is in **Phase 1** - **FOUNDATION COMPLETE** ✅. See [implementation-steps.md](./implementation-steps.md) for the full roadmap.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- Vercel CLI (for deployment)

### Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/saeedreza/logohub.git
   cd logohub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Test the API locally using Vercel CLI:
   ```bash
   # Install Vercel CLI globally
   npm install -g vercel

   # Run locally (simulates Vercel environment)
   vercel dev
   ```

4. Access the local API:
   ```
   http://localhost:3000/api/v1/logos
   http://localhost:3000/api/health
   ```

## 📁 Current Project Structure

```
logohub/
├── api/                           # Vercel serverless functions
│   ├── health.js                 # ✅ Health check endpoint
│   └── v1/
│       └── logos/
│           ├── index.js          # ✅ Logo listing API (/api/v1/logos)
│           └── [id].js           # ✅ Individual logo API (/api/v1/logos/{id})
├── logos/                        # ✅ Logo repository
│   ├── sample-company/           # Example logo structure
│   └── google/                   # ✅ NEW: Google logo (first real company)
│       ├── metadata.json         # Company information & brand colors
│       ├── google-standard.svg   # Main logo variant
│       └── google-monochrome.svg # Single color version
├── tools/                        # ✅ Development utilities
│   ├── image-converter.js        # Sharp-based SVG→PNG/WebP conversion
│   ├── logo-template.js          # ✅ NEW: Logo directory generator
│   └── logo-validator.js         # ✅ NEW: Logo validation & testing
├── docs/                         # ✅ GitHub Pages documentation site
│   ├── index.html               # Live at https://logohub.dev
│   └── README.md
├── roadmap/                      # 📋 Planning documents
│   ├── implementation-steps.md   # Development phases & roadmap
│   ├── development-guide.md      # This file
│   ├── reference-models.md       # Lucide inspiration
│   └── legal-considerations.md   # Usage guidelines
├── guidelines/                   # 📝 Contribution standards
├── vercel.json                   # ✅ Vercel deployment configuration
└── package.json                  # ✅ Dependencies & npm scripts
```

### What's NOT Implemented Yet

- `/packages` directory (future framework-specific packages)
- Main `api/index.js` entry point (using serverless functions instead)
- Authentication system (planned for Phase 2)
- Framework components (React, Vue, etc. - planned)

## 🔧 Current Features (Phase 1)

### ✅ Working API Endpoints

| Endpoint | Status | Description |
|----------|--------|-------------|
| `GET /api/v1/logos` | ✅ Live | List all logos with pagination/filtering |
| `GET /api/v1/logos/{id}` | ✅ Live | Get logo metadata and format options |
| `GET /api/v1/logos/{id}?file={name}.{format}` | ✅ Live | Get logo file with customization |
| `GET /api/health` | ✅ Live | API health check |

### ✅ Working Features

- **Dynamic Format Conversion**: SVG → PNG/WebP using Sharp with aspect ratio preservation
- **Enhanced Color Customization**: Multi-color logo support + monochrome conversion
- **Flexible Sizing**: 1-2048px for raster formats (maintains aspect ratios)
- **Rate Limiting**: Basic IP-based rate limiting
- **CORS Support**: Enabled for browser applications
- **Caching**: Aggressive caching headers for performance
- **Logo Management**: Complete toolchain for creating and validating logos

### ✅ Live Documentation

- **Main Site**: https://logohub.dev
- **API Base**: https://logohub.dev/api/v1

## 🏗️ Development Workflows

### Logo Management Commands

LogoHub now includes powerful npm scripts for logo management:

```bash
# Create new logo directory structure
npm run logo:create

# Validate individual logo
npm run logo:validate logos/company-name

# Validate all logos
npm run validate:all

# Optimize SVG files
npm run logo:optimize logos/company-name/*.svg
```

### Adding New Logos (Recommended Method)

1. **Use the Logo Template Generator**:
   ```bash
   npm run logo:create
   # Follow the interactive prompts to create directory structure
   ```

2. **Or Manual Creation**:
   ```bash
   # Create company directory
   mkdir -p logos/company-name
   
   # Use the template tool for proper structure
   node tools/logo-template.js
   ```

3. **Add SVG Files** (naming convention):
   ```
   company-name-standard.svg     # Main logo
   company-name-monochrome.svg   # Single color version
   company-name-symbol.svg       # Icon/symbol only (optional)
   ```

4. **Validate Your Logo**:
   ```bash
   # Validate single logo
   npm run logo:validate logos/company-name
   
   # Validate all logos
   npm run validate:all
   ```

5. **Optimize SVGs**:
   ```bash
   npm run logo:optimize logos/company-name/*.svg
   ```

6. **Test Locally**:
   ```bash
   vercel dev
   # Test: http://localhost:3000/api/v1/logos/company-name
   ```

### Logo Metadata Schema

The logo validator ensures this structure:

```json
{
  "name": "Company Name",
  "website": "https://company-website.com",
  "industry": ["technology", "software"],
  "colors": {
    "primary": "#0066cc",
    "secondary": "#ff9900"
  },
  "guidelines": "https://link-to-brand-guidelines.com",
  "lastUpdated": "2024-12-01",
  "contributor": "Your Name",
  "versions": [
    {
      "version": "1.0",
      "date": "2024-12-01",
      "description": "Initial version"
    }
  ]
}
```

### Logo Validation

The validator checks:
- ✅ Directory structure (metadata.json + SVG files)
- ✅ Metadata format and required fields
- ✅ SVG file validity and structure
- ✅ File naming conventions
- ✅ Color format validation
- ✅ URL format validation

### API Development

#### Current Architecture: Vercel Serverless Functions

The API uses Vercel's serverless function model instead of a traditional Express server:

- Each endpoint is a separate file in `/api`
- Functions are automatically deployed and scaled
- No central server setup required

#### Adding New Endpoints

1. **Create Function File**:
   ```javascript
   // api/v1/new-endpoint.js
   module.exports = async (req, res) => {
     // Enable CORS
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
     
     if (req.method === 'OPTIONS') {
       res.status(200).end();
       return;
     }
     
     // Your logic here
     res.json({ message: 'Hello from new endpoint' });
   };
   ```

2. **Test Locally**:
   ```bash
   vercel dev
   # Access: http://localhost:3000/api/v1/new-endpoint
   ```

#### Working with the Image Converter

```javascript
const { 
  convertSvgBufferToPng, 
  convertSvgBufferToWebp, 
  replaceColorsInSvg,
  isValidSize 
} = require('../../tools/image-converter');

// Convert SVG buffer to PNG (with aspect ratio preservation)
const pngBuffer = await convertSvgBufferToPng(svgBuffer, 64);

// Convert SVG buffer to WebP
const webpBuffer = await convertSvgBufferToWebp(svgBuffer, 128);

// Apply color customization
const coloredSvg = replaceColorsInSvg(svgContent, '#ff0000', false);

// Apply monochrome conversion
const monoSvg = replaceColorsInSvg(svgContent, '#000000', true);
```

## 🚀 Deployment

### Current Deployment: Vercel

The project is configured for automatic deployment on Vercel:

1. **Automatic Deployment**: Pushes to `main` branch deploy automatically
2. **Preview Deployments**: PRs get preview URLs
3. **Environment Variables**: Configure in Vercel dashboard

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Current Vercel Configuration

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/",
      "dest": "/docs/index.html"
    },
    {
      "src": "/(?!api).*",
      "dest": "/docs/index.html"
    }
  ]
}
```

## 🧪 Testing

### Logo Validation Testing

```bash
# Validate single logo
npm run logo:validate logos/google

# Validate all logos at once
npm run validate:all

# Create test logo for development
npm run logo:create
```

### API Testing

```bash
# Test logo listing
curl "https://logohub.dev/api/v1/logos"

# Test specific logo (Google)
curl "https://logohub.dev/api/v1/logos/google"

# Test file conversion with aspect ratio preservation
curl "https://logohub.dev/api/v1/logos/google?file=standard.png&size=128"

# Test improved color customization
curl "https://logohub.dev/api/v1/logos/google?file=standard.svg&color=ff0000"

# Test monochrome conversion
curl "https://logohub.dev/api/v1/logos/google?file=standard.svg&color=black"
```

### Local Testing

```bash
# Start local development server
vercel dev

# Test locally
curl "http://localhost:3000/api/v1/logos"

# Test logo management tools
npm run validate:all
```

### Future: Automated Testing

```bash
# Will be added in future phases
npm test
```

## 🔮 Future Development (Roadmap)

### Phase 2: Logo Collection Growth (In Progress)

- **Target**: 25 company logos by Q1 2025 (currently 2/25)
- **GitHub Actions**: Automated logo validation on PRs
- **Enhanced Documentation**: Interactive logo browser
- **Community**: Logo request/voting system

### Phase 3: Framework Packages (Planned)

- **NPM Packages**: React, Vue, Svelte components following Lucide model
- **Authentication System**: Optional API key management
- **Advanced Documentation**: Interactive logo browser
- **Monitoring**: Analytics and error tracking

See [implementation-steps.md](./implementation-steps.md) for detailed roadmap.

## 🤝 Contributing

### Current Contribution Process

1. **Fork the repository**
2. **Create logos** using `npm run logo:create`
3. **Validate logos** with `npm run logo:validate`
4. **Test locally** with `vercel dev`
5. **Submit Pull Request** with clear description
6. **Wait for review** and address feedback

### Code Standards

- **Logo Validation**: ✅ Automated via `npm run validate:all`
- **SVG Optimization**: ✅ Automated via `npm run logo:optimize`
- **ESLint**: Will be added in future (currently manual)
- **Prettier**: Will be added in future (currently manual)
- **Testing**: Will be added in future phases

### Logo Submission Guidelines

Use the logo management tools for the best experience:

1. Run `npm run logo:create` for proper directory structure
2. Add your SVG files following naming conventions
3. Run `npm run logo:validate` to ensure compliance
4. Run `npm run logo:optimize` to optimize SVGs

See [../guidelines/CONTRIBUTING.md](../guidelines/CONTRIBUTING.md) for detailed standards.

### Legal Considerations

Review [legal-considerations.md](./legal-considerations.md) before submitting logos.

## 📚 Reference Models

This project follows patterns from [Lucide Icons](https://lucide.dev/). See [reference-models.md](./reference-models.md) for detailed comparison and inspiration.

## 🆘 Troubleshooting

### Common Issues

1. **"Logo not found" errors**: Check file naming conventions, run validator
2. **CORS issues**: Verify headers in serverless functions
3. **Image conversion fails**: Check Sharp dependencies, aspect ratios now preserved
4. **Local dev not working**: Ensure Vercel CLI is installed
5. **Validation errors**: Run `npm run logo:validate` for detailed feedback

### Logo Management Issues

```bash
# Fix common validation issues
npm run logo:validate logos/company-name

# Optimize problematic SVGs  
npm run logo:optimize logos/company-name/*.svg

# Recreate logo structure
npm run logo:create
```

### Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **Discussions**: Ask questions and share ideas
- **Logo Validator**: Run `npm run validate:all` for automated feedback

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

**Current Version**: 0.1.0 - Phase 1 Implementation 