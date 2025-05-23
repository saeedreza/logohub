# LogoHub

**🚀 An open-source brand logo repository service for front-end developers**

[![API Status](https://img.shields.io/badge/API-Live-brightgreen)](https://logohub.dev/api/health)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Phase](https://img.shields.io/badge/Phase%201-Complete-success)](./roadmap/implementation-steps.md)

## 🎯 Vision

LogoHub provides front-end developers with instant access to company logos in multiple formats and sizes. No more hunting for logo files or dealing with inconsistent formats - just clean, scalable, and customizable logos through a simple API.

> **Current Status**: Phase 1 Foundation Complete ✅ | **Progress**: 2/25 logos (Google + sample-company)

## ✨ Features

- **🔄 Dynamic Format Conversion**: SVG → PNG/WebP on-demand with aspect ratio preservation
- **🎨 Enhanced Color Customization**: Multi-color logo support + monochrome conversion
- **📏 Flexible Sizing**: Any size from 16px to 2048px (maintains aspect ratios)
- **⚡ Performance Optimized**: CDN-cached with aggressive caching headers  
- **🌐 CORS Enabled**: Ready for browser-based applications
- **📱 Multiple Formats**: SVG (scalable), PNG (compatible), WebP (efficient)
- **🔍 Searchable API**: Filter by industry, format, and more
- **🛠️ Logo Management**: Complete toolchain for creating and validating logos

## 🚀 Live API

**Base URL**: `https://logohub.dev/api/v1`

### Quick Examples

```bash
# Get all available logos
curl "https://logohub.dev/api/v1/logos"

# Get Google logo metadata
curl "https://logohub.dev/api/v1/logos/google"

# SVG with original colors
curl "https://logohub.dev/api/v1/logos/google?file=standard.svg"

# SVG with custom color (red) - replaces ALL colors
curl "https://logohub.dev/api/v1/logos/google?file=standard.svg&color=ff0000"

# Monochrome conversion (black)
curl "https://logohub.dev/api/v1/logos/google?file=standard.svg&color=black"

# PNG conversion (128px max dimension, preserves aspect ratio)
curl "https://logohub.dev/api/v1/logos/google?file=standard.png&size=128"

# WebP conversion with color customization
curl "https://logohub.dev/api/v1/logos/google?file=standard.webp&size=128&color=00ff00"
```

## 📖 API Documentation

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/logos` | GET | List all available logos |
| `/v1/logos/{id}` | GET | Get logo metadata with dynamic URLs |
| `/v1/logos/{id}?file={name}.{format}` | GET | Get logo file with customization |
| `/health` | GET | API health check |

### Parameters

#### Logo List (`/v1/logos`)
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20, max: 100)
- `industry` (string): Filter by industry
- `format` (string): Filter by supported format

#### Logo File (`/v1/logos/{id}?file={name}.{format}`)
- `file` (required): Filename with format (e.g., `standard.svg`)
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

# Run locally with Vercel CLI
vercel dev
```

### Logo Management Commands

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

### Project Structure

```
logohub/
├── api/                       # Vercel serverless functions
│   ├── health.js             # Health check endpoint
│   └── v1/
│       └── logos/
│           ├── index.js      # Logo listing API
│           └── [id].js       # Individual logo API
├── logos/                    # Logo repository
│   ├── sample-company/       # Example logo structure
│   └── google/               # Google logo (first real company)
│       ├── metadata.json     # Company metadata with brand colors
│       ├── google-standard.svg     # Main logo variant
│       └── google-monochrome.svg   # Single color version
├── tools/                    # Development utilities  
│   ├── image-converter.js    # Sharp-based conversion with aspect ratio preservation
│   ├── logo-template.js      # Logo directory generator
│   └── logo-validator.js     # Logo validation & testing
├── docs/                     # GitHub Pages documentation
├── roadmap/                  # Implementation roadmap & guides
└── guidelines/               # Contribution guidelines
```

### Adding New Logos (Recommended Method)

1. **Use the Logo Template Generator**:
   ```bash
   npm run logo:create
   # Follow interactive prompts
   ```

2. **Add SVG files** following naming convention: `{company-id}-{variant}.svg`

3. **Validate your logo**:
   ```bash
   npm run logo:validate logos/company-name
   ```

4. **Optimize SVGs**:
   ```bash
   npm run logo:optimize logos/company-name/*.svg
   ```

5. **Test locally** and submit pull request

#### Metadata Schema (Auto-generated by template tool)
```json
{
  "name": "Company Name",
  "website": "https://company.com",
  "industry": ["technology", "software"],
  "colors": {
    "primary": "#0066cc",
    "secondary": "#ff9900"
  },
  "guidelines": "https://brand-guidelines-url.com",
  "lastUpdated": "2024-12-01",
  "contributor": "Your Name"
}
```

## 🌟 Usage Examples

### JavaScript/React
```javascript
// Get logo metadata with dynamic sizing URLs
const response = await fetch('https://logohub.dev/api/v1/logos/google');
const logoData = await response.json();

// Use in React component (aspect ratio preserved)
<img 
  src="https://logohub.dev/api/v1/logos/google?file=standard.png&size=128"
  alt="Google Logo"
  style={{maxWidth: '128px', height: 'auto'}}
/>
```

### HTML
```html
<!-- SVG with custom color (all colors replaced) -->
<img src="https://logohub.dev/api/v1/logos/google?file=standard.svg&color=ff0000" 
     alt="Google Logo in Red" />

<!-- Monochrome version -->
<img src="https://logohub.dev/api/v1/logos/google?file=standard.svg&color=black" 
     alt="Google Logo Monochrome" />

<!-- WebP for modern browsers (aspect ratio preserved) -->
<picture>
  <source srcset="https://logohub.dev/api/v1/logos/google?file=standard.webp&size=128" 
          type="image/webp">
  <img src="https://logohub.dev/api/v1/logos/google?file=standard.png&size=128" 
       alt="Google Logo">
</picture>
```

### CSS
```css
.google-logo {
  background-image: url('https://logohub.dev/api/v1/logos/google?file=standard.svg&color=ffffff');
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

We welcome contributions! Use our logo management tools for the best experience:

1. **Fork the repository**
2. **Create logos** using `npm run logo:create`  
3. **Validate logos** with `npm run logo:validate`
4. **Test locally** with `vercel dev`
5. **Submit Pull Request**

See our [Contributing Guidelines](./guidelines/CONTRIBUTING.md) for detailed standards.

## 📊 Roadmap

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Core API development
- [x] SVG to PNG/WebP conversion with aspect ratio preservation  
- [x] Enhanced color customization (multi-color + monochrome)
- [x] Vercel deployment
- [x] Custom domain setup
- [x] **NEW**: Logo management system (create/validate/optimize)
- [x] **NEW**: Google logo added as first real company

### 🚧 Phase 2: Logo Collection Growth (IN PROGRESS - 2/25)
- [ ] Add 23 more high-quality company logos
- [ ] GitHub Actions for automated validation
- [ ] Enhanced documentation with interactive browser
- [ ] Community logo request system

### 🔮 Phase 3: Framework Packages (PLANNED)
- [ ] Framework-specific packages (React, Vue, Angular) 
- [ ] Advanced search and filtering
- [ ] Analytics and usage tracking
- [ ] Optional authentication system

See [implementation-steps.md](./roadmap/implementation-steps.md) for detailed roadmap.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **API Base**: https://logohub.dev/api/v1
- **Documentation**: https://logohub.dev/
- **GitHub Repository**: https://github.com/saeedreza/logohub
- **Issues & Feature Requests**: https://github.com/saeedreza/logohub/issues
- **Development Guide**: [./roadmap/development-guide.md](./roadmap/development-guide.md)

## ⚖️ Legal Notice

LogoHub is a tool for developers. All logos remain the property of their respective owners. Please ensure you have the right to use any logo in your project and comply with the respective company's brand guidelines.

---

**Made with ❤️ for the developer community** 

**Phase 1 Complete ✅ | Next: 25 Company Logos by Q1 2025** 