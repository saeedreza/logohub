# Development Tools

Tools for development workflow, testing, and data generation for the LogoHub system.

## Tools Overview

### 🧪 `dev-test.js` - Development Testing Suite
**Purpose**: Automated testing tool that verifies API and website functionality  
**Usage**: `node dev-test.js`

**What it tests**:
- ✅ API health endpoint
- ✅ Logo list endpoint with pagination
- ✅ Individual logo retrieval (SVG)
- ✅ PNG conversion functionality
- ✅ Metadata endpoint
- ✅ CORS headers configuration
- ✅ Website homepage accessibility
- ✅ Logo browser page functionality

**Example Output**:
```
🧪 Testing API endpoints...

1. Testing health endpoint...
   ✅ Health: ok

2. Testing logos list...
   ✅ Found 150 logos
   📊 Categories: 12
   🎯 First 5: google, apple, microsoft, github, docker

🎉 All systems operational!
```

### 📊 `generate-logo-data.js` - Website Data Generator
**Purpose**: Creates optimized logo data for the VitePress website  
**Usage**: `node generate-logo-data.js`

**Features**:
- 📖 Reads all logo metadata files
- 🏗️ Generates website-optimized JSON structure
- 📈 Creates statistics and category summaries
- 🚀 Optimized for API-based logo display
- 💾 Outputs to `docs/.vitepress/data/logos.json`

**Generated Data Structure**:
```json
{
  "logos": [...],
  "categories": [...],
  "tags": [...],
  "stats": {
    "total": 150,
    "templates": 20,
    "real": 130,
    "categories": 12,
    "lastUpdated": "2024-01-01T12:00:00.000Z"
  }
}
```

## Quick Start

1. **Start the development servers**:
   ```bash
   # Terminal 1 - API Server
   npm start
   
   # Terminal 2 - Website
   npm run website:dev
   ```

2. **Run tests**:
   ```bash
   node development/dev-test.js
   ```

3. **Update website data**:
   ```bash
   node development/generate-logo-data.js
   ```

## Development Workflow

### Testing Changes
1. Make changes to logos or API
2. Run `dev-test.js` to verify functionality
3. Fix any issues reported
4. Update website data with `generate-logo-data.js`

### Adding New Features
1. Implement feature in API or website
2. Add test cases to `dev-test.js`
3. Update data generation if needed
4. Test full workflow

## Troubleshooting

### Common Issues

**API Tests Failing**:
- ✅ Verify API server is running on port 3000
- ✅ Check if logos directory exists and has content
- ✅ Ensure all required npm packages are installed

**Website Tests Failing**:
- ✅ Verify VitePress is running on port 5173
- ✅ Check if website builds without errors
- ✅ Ensure `npm run website:dev` completed successfully

**Data Generation Issues**:
- ✅ Verify logos directory structure
- ✅ Check metadata.json files are valid JSON
- ✅ Ensure write permissions for output directory

### Performance Tips
- Run tests during development to catch issues early
- Generate website data after batch logo operations
- Use specific logo IDs for debugging instead of testing all logos
- Monitor console output for warnings and optimization suggestions 