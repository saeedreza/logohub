# @logohub/core

Core TypeScript client for LogoHub API.

## Install

```bash
npm install @logohub/core
```

## Usage

```typescript
import { LogoHubClient } from '@logohub/core';

const client = new LogoHubClient();

// Get all logos
const logos = await client.getLogos();

// Get specific logo
const logo = await client.getLogo('google');

// Generate logo URL
const url = client.getLogoUrl({
  id: 'google',
  format: 'png',
  size: 128,
  color: 'ff0000',
});
```

## API

- `getLogos(params)` - List logos with search/filter
- `getLogo(id)` - Get logo details
- `getLogoUrl(config)` - Generate logo URL
- `downloadLogo(config)` - Download as blob
- `logoExists(id)` - Check if logo exists

## License

MIT - See [LICENSE](../../LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](../../guidelines/CONTRIBUTING.md) for contribution guidelines.
