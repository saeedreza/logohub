# LogoHub Documentation

🚀 **Live Documentation Site**: https://logohub.dev/

> **Current Status**: Phase 1 Foundation Complete ✅ | **Progress**: 2/25 logos (Google + sample-company)

## Quick Links

- **Live API**: https://logohub.dev/api/v1
- **GitHub Repository**: https://github.com/saeedreza/logohub
- **API Health Check**: https://logohub.dev/api/health
- **Development Guide**: [../roadmap/development-guide.md](../roadmap/development-guide.md)

## Features

- ✅ **Dynamic Format Conversion**: SVG → PNG/WebP on-demand with aspect ratio preservation
- ✅ **Enhanced Color Customization**: Multi-color logo support + monochrome conversion  
- ✅ **Flexible Sizing**: Any size from 16px to 2048px (maintains aspect ratios)
- ✅ **Performance Optimized**: CDN-cached with aggressive caching
- ✅ **CORS Enabled**: Ready for browser-based applications
- ✅ **Logo Management**: Complete toolchain for creating and validating logos

## Quick Examples

```bash
# Get Google logo in PNG format (128px max dimension, preserves aspect ratio)
curl "https://logohub.dev/api/v1/logos/google?file=standard.png&size=128"

# Get Google logo with custom color (red) - replaces ALL colors
curl "https://logohub.dev/api/v1/logos/google?file=standard.svg&color=ff0000"

# Get monochrome version (black)
curl "https://logohub.dev/api/v1/logos/google?file=standard.svg&color=black"
```

## Available Logos

- **google**: Google logo with proper brand colors and metadata
- **sample-company**: Example logo structure for development

**Target**: 25 company logos by Q1 2025

---

**Visit the full documentation at**: https://logohub.dev/ 