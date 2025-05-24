# Packages

## @logohub/core

[![npm](https://img.shields.io/npm/v/@logohub/core)](https://www.npmjs.com/package/@logohub/core)

Core TypeScript client for LogoHub API. Provides essential functionality for fetching and working with brand logos.

[Guide](/guide/core) • [NPM](https://www.npmjs.com/package/@logohub/core) • [Source](https://github.com/saeedreza/logohub/tree/main/packages/core)

## @logohub/react

[![npm](https://img.shields.io/npm/v/@logohub/react)](https://www.npmjs.com/package/@logohub/react)

React components and hooks for LogoHub. Includes `<Logo>` component, `<LogoGrid>` component, and helpful hooks for React applications.

[Guide](/guide/react) • [NPM](https://www.npmjs.com/package/@logohub/react) • [Source](https://github.com/saeedreza/logohub/tree/main/packages/react)

## Installation

### Core Package

```bash
npm install @logohub/core
```

### React Package

```bash
npm install @logohub/react @logohub/core
```

## Quick Start

### Using Core

```typescript
import { LogoHubClient } from '@logohub/core';

const client = new LogoHubClient();
const logos = await client.getLogos();
```

### Using React

```jsx
import { Logo, LogoGrid } from '@logohub/react';

function App() {
  return (
    <div>
      <Logo name="google" />
      <LogoGrid logos={['microsoft', 'stripe', 'vercel']} />
    </div>
  );
}
``` 