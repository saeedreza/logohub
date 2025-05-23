# LogoHub

**🚀 An open-source brand logo repository service for front-end developers**

[![API Status](https://img.shields.io/badge/API-Live-brightgreen)](https://logohub.dev/api/health)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Vision

LogoHub provides front-end developers with instant access to company logos in multiple formats and sizes. No more hunting for logo files or dealing with inconsistent formats - just clean, scalable, and customizable logos through a simple API.

## ✨ Features

- **🔄 Dynamic Format Conversion**: SVG → PNG/WebP on-demand
- **🎨 Color Customization**: Real-time SVG color modification
- **📏 Flexible Sizing**: Any size from 16px to 2048px
- **⚡ Performance Optimized**: CDN-cached with aggressive caching headers
- **🌐 CORS Enabled**: Ready for browser-based applications
- **📱 Multiple Formats**: SVG (scalable), PNG (compatible), WebP (efficient)
- **🔍 Searchable API**: Filter by industry, format, and more

## 🚀 Live API

**Base URL**: `https://logohub.dev/api/v1`

### Quick Examples

```bash
# Get all available logos
curl "https://logohub.dev/api/v1/logos"

# Get logo metadata
curl "https://logohub.dev/api/v1/logos/sample-company"

# SVG with original colors
curl "https://logohub.dev/api/v1/logos/sample-company?file=standard.svg"

# SVG with custom color (red)
curl "https://logohub.dev/api/v1/logos/sample-company?file=standard.svg&color=ff0000"

# PNG conversion (64x64)
curl "https://logohub.dev/api/v1/logos/sample-company?file=standard.png&size=64"

# WebP conversion (128x128)  
curl "https://logohub.dev/api/v1/logos/sample-company?file=standard.webp&size=128"
```

## 📖 API Documentation

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/logos` | GET | List all available logos |
| `/v1/logos/{id}` | GET | Get logo metadata |
| `/v1/logos/{id}?file={name}.{format}` | GET | Get logo file |
| `/health` | GET | API health check |

### Parameters

#### Logo List (`/v1/logos`)
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20, max: 100)
- `industry` (string): Filter by industry
- `format` (string): Filter by supported format

#### Logo File (`/v1/logos/{id}?file={name}.{format}`)
- `file` (required): Filename with format (e.g., `standard.svg`)
- `size` (int): Size in pixels for PNG/WebP (1-2048)
- `color` (hex): Color replacement for SVG (without #)

### Standard Sizes
`16, 32, 64, 128, 256, 512` pixels

### Supported Formats
- **SVG**: Scalable vector graphics with color customization
- **PNG**: Raster format with transparency
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

# Run locally (requires local server setup)
npm run dev
```

### Project Structure

```
logohub/
├── api/                    # Vercel serverless functions
│   ├── health.js          # Health check endpoint
│   └── v1/
│       └── logos/
│           ├── index.js   # Logo listing API
│           └── [id].js    # Individual logo API
├── logos/                 # Logo repository
│   └── {company-id}/
│       ├── metadata.json  # Company metadata
│       └── *.svg         # Logo variants
├── tools/                 # Conversion utilities
│   └── image-converter.js # Sharp-based conversion
├── docs/                  # GitHub Pages documentation
├── roadmap/              # Internal planning documents
└── guidelines/           # Contribution guidelines
```

### Adding New Logos

1. Create a directory in `/logos/{company-id}/`
2. Add `metadata.json` with company information
3. Add SVG files following naming convention: `{company-id}-{variant}.svg`
4. Submit a pull request

#### Metadata Schema
```json
{
  "name": "Company Name",
  "website": "https://company.com",
  "industry": ["technology", "software"],
  "colors": {
    "primary": "#0066cc",
    "secondary": "#ff9900"
  }
}
```

## 🌟 Usage Examples

### JavaScript/React
```javascript
// Get logo metadata
const response = await fetch('https://logohub.dev/api/v1/logos/sample-company');
const logoData = await response.json();

// Use in React component
<img 
  src="https://logohub.dev/api/v1/logos/sample-company?file=standard.png&size=64"
  alt="Company Logo"
  width="64"
  height="64"
/>
```

### HTML
```html
<!-- SVG with custom color -->
<img src="https://logohub.dev/api/v1/logos/sample-company?file=standard.svg&color=ff0000" 
     alt="Company Logo" />

<!-- WebP for modern browsers -->
<picture>
  <source srcset="https://logohub.dev/api/v1/logos/sample-company?file=standard.webp&size=128" 
          type="image/webp">
  <img src="https://logohub.dev/api/v1/logos/sample-company?file=standard.png&size=128" 
       alt="Company Logo">
</picture>
```

### CSS
```css
.company-logo {
  background-image: url('https://logohub.dev/api/v1/logos/sample-company?file=standard.svg&color=ffffff');
  width: 200px;
  height: 200px;
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

We welcome contributions! Please see our [Contributing Guidelines](./guidelines/CONTRIBUTING.md) for details on:

- Logo submission standards
- Code contribution process
- Design guidelines
- Legal considerations

## 📊 Roadmap

- [x] Core API development
- [x] SVG to PNG/WebP conversion
- [x] Color customization
- [x] Vercel deployment
- [x] Custom domain setup
- [ ] Framework-specific packages (React, Vue, Angular)
- [ ] Logo optimization tools
- [ ] Community submission portal
- [ ] Advanced search and filtering
- [ ] Analytics and usage tracking

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **API Base**: https://logohub.dev/api/v1
- **Documentation**: https://logohub.dev/
- **GitHub Repository**: https://github.com/saeedreza/logohub
- **Issues & Feature Requests**: https://github.com/saeedreza/logohub/issues

## ⚖️ Legal Notice

LogoHub is a tool for developers. All logos remain the property of their respective owners. Please ensure you have the right to use any logo in your project and comply with the respective company's brand guidelines.

---

**Made with ❤️ for the developer community** 