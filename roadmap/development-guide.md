# LogoHub Development Guide

This guide provides detailed information for developers who want to contribute to or build upon the LogoHub project.

> **Current Status**: LogoHub is in **Phase 1** of development. See [implementation-steps.md](./implementation-steps.md) for the full roadmap.

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
│   └── {company-id}/
│       ├── metadata.json         # Company information
│       └── *.svg                # Logo variants
├── tools/                        # ✅ Conversion utilities
│   └── image-converter.js        # Sharp-based SVG→PNG/WebP conversion
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
└── package.json                  # ✅ Dependencies & scripts
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

- **Dynamic Format Conversion**: SVG → PNG/WebP using Sharp
- **Color Customization**: Real-time SVG color replacement
- **Flexible Sizing**: 1-2048px for raster formats
- **Rate Limiting**: Basic IP-based rate limiting
- **CORS Support**: Enabled for browser applications
- **Caching**: Aggressive caching headers for performance

### ✅ Live Documentation

- **Main Site**: https://logohub.dev
- **API Base**: https://logohub.dev/api/v1

## 🏗️ Development Workflows

### Adding New Logos

1. **Create Company Directory**:
   ```bash
   mkdir -p logos/company-name
   ```

2. **Add Metadata** (`logos/company-name/metadata.json`):
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
     "lastUpdated": "2024-01-15",
     "contributor": "Your Name",
     "versions": [
       {
         "version": "1.0",
         "date": "2024-01-15",
         "description": "Initial version"
       }
     ]
   }
   ```

3. **Add SVG Files** (naming convention):
   ```
   company-name-standard.svg     # Main logo
   company-name-monochrome.svg   # Single color version
   company-name-symbol.svg       # Icon/symbol only (optional)
   ```

4. **Optimize SVGs**:
   ```bash
   npx svgo logos/company-name/*.svg
   ```

5. **Test Locally**:
   ```bash
   vercel dev
   # Test: http://localhost:3000/api/v1/logos/company-name
   ```

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
  isValidSize 
} = require('../../tools/image-converter');

// Convert SVG buffer to PNG
const pngBuffer = await convertSvgBufferToPng(svgBuffer, 64);

// Convert SVG buffer to WebP
const webpBuffer = await convertSvgBufferToWebp(svgBuffer, 128);
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

### API Testing

```bash
# Test logo listing
curl "https://logohub.dev/api/v1/logos"

# Test specific logo
curl "https://logohub.dev/api/v1/logos/sample-company"

# Test file conversion
curl "https://logohub.dev/api/v1/logos/sample-company?file=standard.png&size=64"

# Test color customization
curl "https://logohub.dev/api/v1/logos/sample-company?file=standard.svg&color=ff0000"
```

### Local Testing

```bash
# Start local development server
vercel dev

# Test locally
curl "http://localhost:3000/api/v1/logos"
```

### Future: Automated Testing

```bash
# Will be added in future phases
npm test
```

## 🔮 Future Development (Roadmap)

### Phase 2: Advanced Features (Planned)

- **Authentication System**: API key management
- **Framework Packages**: React, Vue, Svelte components
- **Advanced Documentation**: Interactive logo browser
- **Caching Layer**: Redis/CDN optimization
- **Monitoring**: Analytics and error tracking

### Phase 3: Community Features (Planned)

- **Company Management**: Logo claim/update process
- **Contribution Portal**: Web-based logo submission
- **API Management**: Rate limiting tiers
- **Governance**: Community guidelines and moderation

See [implementation-steps.md](./implementation-steps.md) for detailed roadmap.

## 🤝 Contributing

### Current Contribution Process

1. **Fork the repository**
2. **Add logos** following the metadata schema above
3. **Test locally** with `vercel dev`
4. **Submit Pull Request** with clear description
5. **Wait for review** and address feedback

### Code Standards

- **ESLint**: Will be added in future (currently manual)
- **Prettier**: Will be added in future (currently manual)
- **Testing**: Will be added in future phases

### Logo Submission Guidelines

See [../guidelines/CONTRIBUTING.md](../guidelines/CONTRIBUTING.md) for detailed logo submission standards.

### Legal Considerations

Review [legal-considerations.md](./legal-considerations.md) before submitting logos.

## 📚 Reference Models

This project follows patterns from [Lucide Icons](https://lucide.dev/). See [reference-models.md](./reference-models.md) for detailed comparison and inspiration.

## 🆘 Troubleshooting

### Common Issues

1. **"Logo not found" errors**: Check file naming conventions
2. **CORS issues**: Verify headers in serverless functions
3. **Image conversion fails**: Check Sharp dependencies
4. **Local dev not working**: Ensure Vercel CLI is installed

### Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **Discussions**: Ask questions and share ideas
- **Discord**: (Future) Community chat

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

**Current Version**: 0.1.0 - Phase 1 Implementation 