# @logohub/core

Core functionality for LogoHub - An open-source brand logo repository for front-end developers.

## Installation

```bash
npm install @logohub/core
```

## Usage

### Basic Client Usage

```typescript
import { LogoHubClient } from '@logohub/core';

const client = new LogoHubClient({
  baseUrl: 'https://logohub.dev', // optional, defaults to logohub.dev
  defaultSize: 64,
  defaultVariant: 'standard',
  defaultFormat: 'svg'
});

// Get all logos
const logos = await client.getLogos();

// Get a specific logo
const googleLogo = await client.getLogo('google');

// Get logo URL with customization
const logoUrl = client.getLogoUrl({
  id: 'google',
  size: 128,
  variant: 'monochrome',
  format: 'png',
  color: '#000000'
});

// Download logo as data URL
const dataUrl = await client.getLogoDataUrl({
  id: 'google',
  size: 64,
  format: 'svg'
});
```

### Utility Functions

```typescript
import { 
  validateLogoId, 
  formatLogoId, 
  isValidLogoSize, 
  getClosestLogoSize,
  LOGO_SIZES,
  LOGO_VARIANTS,
  LOGO_FORMATS 
} from '@logohub/core';

// Validate logo ID format
const isValid = validateLogoId('google'); // true
const isInvalid = validateLogoId('Google!'); // false

// Format company name to logo ID
const logoId = formatLogoId('Microsoft Corporation'); // 'microsoft-corporation'

// Check if size is supported
const validSize = isValidLogoSize(64); // true
const invalidSize = isValidLogoSize(65); // false

// Get closest supported size
const closestSize = getClosestLogoSize(65); // 64

// Available constants
console.log(LOGO_SIZES); // [16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128, 256]
console.log(LOGO_VARIANTS); // { STANDARD: 'standard', MONOCHROME: 'monochrome' }
console.log(LOGO_FORMATS); // { SVG: 'svg', PNG: 'png', WEBP: 'webp' }
```

## TypeScript Support

This package includes full TypeScript definitions:

```typescript
import type { 
  LogoConfig, 
  LogoMetadata, 
  LogoApiResponse,
  LogoDetailResponse,
  LogoSize,
  LogoHubConfig 
} from '@logohub/core';

const config: LogoConfig = {
  id: 'google',
  size: 64,
  variant: 'standard',
  format: 'svg'
};
```

## API Reference

### LogoHubClient

The main client for interacting with the LogoHub API.

#### Constructor

```typescript
new LogoHubClient(config?: LogoHubConfig)
```

#### Methods

- `getLogos(page?: number, limit?: number): Promise<LogoApiResponse>` - Get paginated list of logos
- `getLogo(id: string): Promise<LogoDetailResponse>` - Get detailed logo information
- `getLogoUrl(config: LogoConfig): string` - Generate logo URL with customization
- `getLogoDataUrl(config: LogoConfig): Promise<string>` - Download logo as data URL

## License

MIT - See [LICENSE](../../LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](../../guidelines/CONTRIBUTING.md) for contribution guidelines. 