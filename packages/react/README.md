# @logohub/react

React components for LogoHub.

## Install

```bash
npm install @logohub/react @logohub/core
```

## Usage

### Logo Component

```jsx
import { Logo } from '@logohub/react';

<Logo name="google" />
<Logo name="microsoft" format="png" size={128} />
<Logo name="stripe" color="#ff0000" />
```

### LogoGrid Component

```jsx
import { LogoGrid } from '@logohub/react';

// Specific logos
<LogoGrid logos={['google', 'microsoft', 'stripe']} />

// Fetch all logos
<LogoGrid fetchAll />

// With search
<LogoGrid fetchAll search="tech" />
```

### Hooks

```jsx
import { useLogos, useLogo } from '@logohub/react';

const { data, loading, error } = useLogos();
const { data: logo } = useLogo('google');
```

## Props

### Logo
- `name` - Logo ID (required)
- `format` - 'svg' | 'png' | 'webp' (default: 'svg')
- `size` - Number (default: 64)
- `color` - Hex color without #

### LogoGrid
- `logos` - Array of logo IDs
- `fetchAll` - Fetch from API
- `search` - Search term
- `format`, `size`, `color` - Applied to all logos 