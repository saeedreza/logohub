# @logohub/react

React components and hooks for LogoHub - An open-source brand logo repository for front-end developers.

## Features

- 🎨 **26+ High-Quality Logos** - Google, Microsoft, Apple, Meta, AWS, and more
- ⚛️ **React Components** - Drop-in `<Logo>` component with TypeScript support
- 🎯 **Smart Loading** - Lazy loading, error handling, and fallbacks
- 🎨 **Customizable** - Size, format, color, and variant options
- 🪝 **React Hooks** - Powerful hooks for logo data and management
- 📱 **Responsive** - Works on all devices and screen sizes
- 🚀 **Fast** - CDN-delivered SVGs with optimized loading

## Installation

```bash
npm install @logohub/react
# or
yarn add @logohub/react
# or
pnpm add @logohub/react
```

## Usage

### Logo Component

The main `Logo` component for displaying brand logos:

```tsx
import { Logo } from '@logohub/react';

function App() {
  return (
    <div>
      {/* Basic usage */}
      <Logo id="google" />
      
      {/* With customization */}
      <Logo 
        id="microsoft" 
        size={128} 
        variant="monochrome"
        color="#000000"
        className="my-logo"
        style={{ margin: '10px' }}
      />
      
      {/* With fallback */}
      <Logo 
        id="unknown-company" 
        fallback={<div>Logo not found</div>}
      />
    </div>
  );
}
```

### LogoGrid Component

Display multiple logos in a responsive grid:

```tsx
import { LogoGrid } from '@logohub/react';

function LogoShowcase() {
  const logoIds = ['google', 'microsoft', 'apple', 'meta'];
  
  return (
    <LogoGrid 
      logos={logoIds}
      size={64}
      variant="standard"
      columns={4}
      gap={16}
      className="logo-showcase"
    />
  );
}
```

### Hooks

#### useLogos

Fetch all available logos:

```tsx
import { useLogos } from '@logohub/react';

function LogoBrowser() {
  const { data, loading, error, refetch } = useLogos();
  
  if (loading) return <div>Loading logos...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>Available Logos ({data?.total})</h2>
      {data?.logos.map(logo => (
        <div key={logo.id}>{logo.name}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

#### useLogo

Fetch detailed information about a specific logo:

```tsx
import { useLogo } from '@logohub/react';

function LogoDetails({ logoId }: { logoId: string }) {
  const { data, loading, error } = useLogo(logoId);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Logo not found</div>;
  
  return (
    <div>
      <h2>{data.name}</h2>
      <p>Primary Color: {data.colors.primary}</p>
      <p>Website: {data.metadata.website}</p>
      <p>Industry: {data.metadata.industry.join(', ')}</p>
    </div>
  );
}
```

#### useLogoUrl

Generate logo URLs with customization:

```tsx
import { useLogoUrl } from '@logohub/react';

function CustomLogo() {
  const logoUrl = useLogoUrl({
    id: 'google',
    size: 128,
    variant: 'monochrome',
    format: 'png',
    color: '#ff0000'
  });
  
  return <img src={logoUrl} alt="Google Logo" />;
}
```

#### useLogoDataUrl

Download logos as data URLs:

```tsx
import { useLogoDataUrl } from '@logohub/react';

function DownloadableLogo() {
  const { dataUrl, loading, error, download, reset } = useLogoDataUrl({
    id: 'microsoft',
    size: 256,
    format: 'png'
  });
  
  return (
    <div>
      <button onClick={download} disabled={loading}>
        {loading ? 'Downloading...' : 'Download Logo'}
      </button>
      
      {dataUrl && (
        <div>
          <img src={dataUrl} alt="Downloaded logo" />
          <button onClick={reset}>Clear</button>
        </div>
      )}
      
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

#### useLogoExists

Check if a logo exists:

```tsx
import { useLogoExists } from '@logohub/react';

function LogoChecker({ logoId }: { logoId: string }) {
  const { exists, loading, error } = useLogoExists(logoId);
  
  if (loading) return <div>Checking...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      Logo "{logoId}" {exists ? 'exists' : 'does not exist'}
    </div>
  );
}
```

#### useLogoHubClient

Create a custom client instance:

```tsx
import { useLogoHubClient } from '@logohub/react';

function CustomClientExample() {
  const client = useLogoHubClient({
    baseUrl: 'https://my-custom-logohub.com',
    defaultSize: 128,
    defaultVariant: 'monochrome'
  });
  
  // Use client for custom API calls
  const handleCustomFetch = async () => {
    const logos = await client.getLogos(1, 10);
    console.log(logos);
  };
  
  return <button onClick={handleCustomFetch}>Fetch with custom client</button>;
}
```

## TypeScript Support

This package includes full TypeScript definitions:

```tsx
import type { LogoProps, LogoGridProps } from '@logohub/react';
import type { LogoConfig, LogoSize } from '@logohub/react';

const logoConfig: LogoConfig = {
  id: 'google',
  size: 64,
  variant: 'standard',
  format: 'svg'
};

const logoProps: LogoProps = {
  id: 'microsoft',
  size: 128,
  className: 'custom-logo'
};
```

## Styling

### CSS Classes

The components include default CSS classes for styling:

```css
.logohub-logo {
  /* Default logo styles */
}

.logohub-logo-grid {
  /* Default grid container styles */
}

.logohub-logo-grid-item {
  /* Default grid item styles */
}
```

### Custom Styling

```tsx
// Using className
<Logo id="google" className="my-custom-logo" />

// Using inline styles
<Logo 
  id="microsoft" 
  style={{ 
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px'
  }} 
/>

// Using CSS-in-JS
const logoStyle = {
  filter: 'grayscale(100%)',
  transition: 'filter 0.3s ease',
  '&:hover': {
    filter: 'grayscale(0%)'
  }
};

<Logo id="apple" style={logoStyle} />
```

## Performance

- **Tree Shaking**: Only import what you need
- **Lazy Loading**: Components support lazy loading
- **Caching**: Built-in caching for API responses
- **Optimized Images**: Automatic format optimization

## Examples

### Logo Gallery

```tsx
import { useLogos, LogoGrid } from '@logohub/react';

function LogoGallery() {
  const { data, loading } = useLogos();
  
  if (loading) return <div>Loading...</div>;
  
  const logoIds = data?.logos.map(logo => logo.id) || [];
  
  return (
    <LogoGrid 
      logos={logoIds}
      size={80}
      columns={6}
      gap={20}
      className="logo-gallery"
    />
  );
}
```

### Interactive Logo Customizer

```tsx
import { useState } from 'react';
import { Logo } from '@logohub/react';

function LogoCustomizer() {
  const [logoId, setLogoId] = useState('google');
  const [size, setSize] = useState(64);
  const [variant, setVariant] = useState<'standard' | 'monochrome'>('standard');
  const [color, setColor] = useState('#000000');
  
  return (
    <div>
      <div>
        <label>
          Logo:
          <select value={logoId} onChange={e => setLogoId(e.target.value)}>
            <option value="google">Google</option>
            <option value="microsoft">Microsoft</option>
            <option value="apple">Apple</option>
          </select>
        </label>
        
        <label>
          Size:
          <input 
            type="range" 
            min="16" 
            max="256" 
            value={size} 
            onChange={e => setSize(Number(e.target.value))} 
          />
        </label>
        
        <label>
          Variant:
          <select value={variant} onChange={e => setVariant(e.target.value as any)}>
            <option value="standard">Standard</option>
            <option value="monochrome">Monochrome</option>
          </select>
        </label>
        
        {variant === 'monochrome' && (
          <label>
            Color:
            <input 
              type="color" 
              value={color} 
              onChange={e => setColor(e.target.value)} 
            />
          </label>
        )}
      </div>
      
      <Logo 
        id={logoId}
        size={size}
        variant={variant}
        color={variant === 'monochrome' ? color : undefined}
      />
    </div>
  );
}
```

## License

MIT - See [LICENSE](../../LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](../../guidelines/CONTRIBUTING.md) for contribution guidelines.

## Related Packages

- [`@logohub/core`](../core) - Core functionality
- [`@logohub/vue`](../vue) - Vue.js components (coming soon)
- [`@logohub/svelte`](../svelte) - Svelte components (coming soon) 