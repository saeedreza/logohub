# LogoHub Tools

Essential tools for running the LogoHub API and documentation website.

## Directory Structure

```
tools/
├── development/    # API and website development tools
└── processing/     # Image processing for API
```

## Tools

### 🚀 Development (`development/`)

#### `dev-test.js`
Test API and website functionality.
```bash
node development/dev-test.js
```

#### `generate-logo-data.js`
Generate logo data for VitePress website.
```bash
node development/generate-logo-data.js
```

### 🎨 Processing (`processing/`)

#### `image-converter.js`
Convert SVG to PNG/WebP for API endpoints.
```javascript
const { convertSvgBufferToPng } = require('./processing/image-converter.js');
```

## Usage

### Development Workflow
1. Start API server: `npm start`
2. Start website: `npm run website:dev`
3. Run tests: `node development/dev-test.js`
4. Update website data: `node development/generate-logo-data.js`

## Dependencies

- `sharp` - Image processing
- `axios` - HTTP requests
- `fs/promises` - File operations 