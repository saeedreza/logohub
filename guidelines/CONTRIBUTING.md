# Contribution Guidelines

Thank you for your interest in contributing to LogoHub! This document outlines the standards and processes for adding or updating logos in our repository.

## Logo Requirements

### Formats
- **Primary format**: SVG (vector-based)
- **Additional formats**: PNG (with transparent backgrounds) at standard sizes (16x16, 32x32, 64x64, 128x128, 256x256)
- **Optional**: WebP format for optimized web usage

### Technical Specifications
- SVG files should be optimized (using tools like SVGO)
- Include viewBox attribute for proper scaling
- Ensure the SVG is properly formatted and validated
- Avoid embedded raster images in SVGs
- Use relative paths for internal references
- Keep file sizes under 50KB when possible

### Logo Variants
Each brand should include:
- Standard logo
- Monochrome version (if applicable)
- Symbol/icon only version (if the brand has a recognizable symbol)
- Text-only version (if applicable)

### Naming Conventions
Files should follow this naming pattern:
```
/logos/[company-name]/[company-name]-[variant]-[color-scheme].[format]
```

For example:
- `logos/acme-corp/acme-corp-standard.svg`
- `logos/acme-corp/acme-corp-monochrome.svg`
- `logos/acme-corp/acme-corp-symbol.svg`
- `logos/acme-corp/acme-corp-standard-dark.svg` (for dark mode versions)

## Metadata

Each logo should include a metadata.json file with:
```json
{
  "name": "Company Name",
  "website": "https://company-website.com",
  "industry": ["category1", "category2"],
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode"
  },
  "guidelines": "https://link-to-brand-guidelines.com",
  "lastUpdated": "YYYY-MM-DD",
  "contributor": "Your Name or GitHub Username",
  "versions": [
    {
      "version": "1.0",
      "date": "YYYY-MM-DD",
      "description": "Initial version"
    }
  ]
}
```

## Legal Considerations

Before submitting a logo:
1. Ensure you have the right to distribute the logo
2. Include appropriate attribution if required
3. Note any usage restrictions in the metadata.json file
4. Follow the brand's official guidelines

## Submission Process

1. Fork the repository
2. Add your logo files in the appropriate directory
3. Add or update the metadata.json file
4. Submit a pull request with a brief description
5. Maintainers will review and provide feedback

Thank you for helping make LogoHub a valuable resource for developers! 