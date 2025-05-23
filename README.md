# LogoHub

**An open-source brand logo repository with a simple API**

[![API Status](https://img.shields.io/badge/API-Live-brightgreen)](https://logohub.dev/api/health)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

LogoHub provides developers with instant access to company logos in multiple formats. Get SVG, PNG, or WebP versions of 55+ popular brand logos through a simple API.

## ✨ Features

- **Multiple Formats**: SVG, PNG, and WebP
- **Dynamic Sizing**: Any size from 16px to 2048px (maintains aspect ratios)
- **Color Customization**: Change logo colors via URL parameters
- **Search & Filter**: Find logos by name or company
- **CORS Enabled**: Ready for web applications
- **Fast & Cached**: Optimized for performance

## 🚀 API

**Base URL**: `https://logohub.dev/api/v1`

### Quick Examples

```bash
# Get all available logos
curl "https://logohub.dev/api/v1/logos"

# Get Google logo (SVG)
curl "https://logohub.dev/api/v1/logos/google"

# Get as PNG with custom size
curl "https://logohub.dev/api/v1/logos/google?format=png&size=128"

# Get with custom color (red)
curl "https://logohub.dev/api/v1/logos/google?color=ff0000"

# Get as WebP with color and size
curl "https://logohub.dev/api/v1/logos/google?format=webp&size=64&color=333333"
```

## 📖 API Documentation

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/logos` | GET | List all available logos |
| `/v1/logos/{id}` | GET | Get individual logo |
| `/health` | GET | API health check |

### Parameters

- `format` (string): Output format - `svg`, `png`, `webp` (default: `svg`)
- `size` (int): Max dimension in pixels for PNG/WebP (16-2048, preserves aspect ratio)
- `color` (hex): Color replacement (without #) - e.g., `ff0000` for red
- `search` (string): Search logos by name (for list endpoint)
- `limit` (int): Items per page (default: 20, max: 100)

## 🛠️ Development

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

### Adding New Logos

1. Create a folder in `logos/company-name/`
2. Add `metadata.json`:
   ```json
   {
     "name": "company-name",
     "title": "Company Name",
     "website": "https://company.com",
     "colors": ["#0066cc"],
     "created": "2024-12-01",
     "updated": "2024-12-01"
   }
   ```
3. Add `company-name.svg` logo file
4. Test locally and submit a pull request

## 🌟 Usage Examples

### JavaScript/React
```javascript
// Use directly in React
<img 
  src="https://logohub.dev/api/v1/logos/google?format=png&size=128"
  alt="Google Logo"
/>

// Fetch logo data
const response = await fetch('https://logohub.dev/api/v1/logos/google');
const svgContent = await response.text();
```

### HTML
```html
<!-- SVG (default) -->
<img src="https://logohub.dev/api/v1/logos/google" alt="Google Logo" />

<!-- PNG with custom size -->
<img src="https://logohub.dev/api/v1/logos/google?format=png&size=64" alt="Google Logo" />

<!-- Custom color -->
<img src="https://logohub.dev/api/v1/logos/google?color=ff0000" alt="Google Logo in Red" />
```

## 🚀 Deployment

Deploy your own instance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/saeedreza/logohub)

## 🤝 Contributing

1. Fork the repository
2. Add logos following the structure above
3. Test locally with `npm start`
4. Submit a pull request


## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **API**: https://logohub.dev/api/v1
- **Website**: https://logohub.dev
- **GitHub**: https://github.com/saeedreza/logohub

## ⚖️ Legal Notice

All logos remain the property of their respective owners. Please ensure you have the right to use any logo in your project and comply with the respective company's brand guidelines. 