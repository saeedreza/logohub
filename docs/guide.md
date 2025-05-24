# Getting Started

LogoHub is an open-source logo repository that provides high-quality SVG logos for your projects.

## Quick Start

### CDN Usage

The simplest way to use LogoHub is via direct CDN links:

```html
<img
  src="https://logohub.dev/logos/openai/openai.svg"
  alt="OpenAI"
  width="64"
  height="64"
/>
<img
  src="https://logohub.dev/logos/stripe/stripe.svg"
  alt="Stripe"
  width="64"
  height="64"
/>
<img
  src="https://logohub.dev/logos/anthropic/anthropic.svg"
  alt="Anthropic"
  width="64"
  height="64"
/>
```

### API Usage

Fetch logo metadata and files programmatically:

```javascript
// Get all logos
const response = await fetch('https://api.logohub.dev/v1/logos');
const data = await response.json();

// Get specific logo
const logo = await fetch('https://api.logohub.dev/v1/logos/openai').then(res =>
  res.json()
);

// Search logos
const results = await fetch(
  'https://api.logohub.dev/v1/logos?category=ai&search=openai'
).then(res => res.json());
```

### React Component (Coming Soon)

```jsx
import { Logo } from '@logohub/react';

function App() {
  return (
    <div>
      <Logo name="openai" size={48} />
      <Logo name="stripe" size={48} color="primary" />
      <Logo name="anthropic" size={48} variant="monochrome" />
    </div>
  );
}
```

## Available Categories

Our logos are organized into the following categories:

- **AI** - OpenAI, Anthropic, Hugging Face
- **Analytics** - Mixpanel, Segment, Datadog
- **Cloud** - DigitalOcean, Cloudflare, Supabase
- **Design** - Canva, Framer, Linear
- **DevTools** - Postman, Insomnia, Railway
- **Ecommerce** - Shopify, Stripe, PayPal
- **Fintech** - Stripe, PayPal, Coinbase
- **Gaming** - Unity, Steam, Epic Games
- **Infrastructure** - Railway, Render, Fly.io
- **Monitoring** - Sentry, Datadog, Mixpanel
- **Productivity** - Linear, Airtable, Obsidian
- **Social** - Bluesky, Mattermost, Zoom
- **Streaming** - Zoom, Steam
- **General** - Various other brands

## Logo Formats

All logos are provided as:

- **SVG** - Vector format, scalable without quality loss
- **Optimized** - Cleaned and optimized for web use
- **Consistent** - Standardized viewBox and styling

## Quality Standards

LogoHub maintains high quality standards:

✅ **Vector SVG format** - Scalable without pixelation  
✅ **Optimized file size** - Compressed and cleaned  
✅ **Consistent styling** - Standardized colors and dimensions  
✅ **Official sources** - Sourced from official brand resources  
✅ **Regular updates** - Kept current with brand changes

## License & Usage

- **Open Source** - MIT licensed repository
- **Trademark Notice** - Logos remain property of respective owners
- **Commercial Use** - Check individual brand guidelines
- **Attribution** - Not required but appreciated

## Contributing

Help expand LogoHub:

1. **Request logos** - Open an issue for missing brands
2. **Submit logos** - Contribute high-quality SVGs
3. **Improve tooling** - Enhance build and validation tools
4. **Documentation** - Help improve guides and examples

## Browser Support

LogoHub works in all modern browsers:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

For IE11 support, use PNG fallbacks or polyfills.

## Performance Tips

- **Lazy loading** - Load logos on demand
- **CDN caching** - Logos are cached globally
- **SVG sprites** - Combine multiple logos for efficiency
- **Preload critical** - Preload above-the-fold logos

```html
<!-- Preload critical logos -->
<link
  rel="preload"
  href="https://logohub.dev/logos/openai/openai.svg"
  as="image"
  type="image/svg+xml"
/>

<!-- Lazy load with intersection observer -->
<img
  src="placeholder.svg"
  data-src="https://logohub.dev/logos/stripe/stripe.svg"
  class="lazy"
  alt="Stripe"
/>
```

Ready to explore? [Browse all logos →](/logos)
