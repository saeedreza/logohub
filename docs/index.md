---
layout: home

hero:
  name: "LogoHub"
  text: "Open-source Logo Repository"
  tagline: "High-quality SVG logos for your next project"
  image:
    src: /logo.svg
    alt: LogoHub
  actions:
    - theme: brand
      text: Browse Logos
      link: /logos
    - theme: alt
      text: View on GitHub
      link: https://github.com/saeedreza/logohub

features:
  - icon: 🎨
    title: High-Quality SVGs
    details: Carefully curated collection of optimized SVG logos from top brands and companies.
  
  - icon: 🔍
    title: Easy to Search
    details: Find logos by category, brand name, or tags with our powerful search functionality.
  
  - icon: ⚡
    title: Developer Friendly
    details: Simple API, React components, and multiple download formats for seamless integration.
  
  - icon: 📦
    title: Package Support
    details: Available as NPM packages for React, Vue, and vanilla JavaScript projects.
  
  - icon: 🆓
    title: Completely Free
    details: Open-source and free to use in your commercial and personal projects.
  
  - icon: 🚀
    title: CDN Delivery
    details: Fast global CDN delivery ensures your logos load quickly anywhere in the world.
---

## Quick Start

Get started with LogoHub in seconds:

### CDN

```html
<!-- Direct SVG access -->
<img src="https://logohub.dev/logos/openai.svg" alt="OpenAI" />

<!-- Or use our API -->
<script src="https://cdn.logohub.dev/logohub.min.js"></script>
<script>
  LogoHub.render('openai', { size: 64 });
</script>
```

### NPM

```bash
npm install @logohub/react
```

```jsx
import { Logo } from '@logohub/react';

function App() {
  return <Logo name="stripe" size={48} />;
}
```

### API

```javascript
// Get logo metadata
fetch('https://api.logohub.dev/v1/logos/anthropic')
  .then(res => res.json())
  .then(logo => console.log(logo));

// Search logos
fetch('https://api.logohub.dev/v1/logos?category=ai&search=openai')
  .then(res => res.json())
  .then(results => console.log(results));
```

## Categories

Our logo collection spans across multiple categories:

- **AI & ML** - OpenAI, Anthropic, Hugging Face
- **Fintech** - Stripe, PayPal, Coinbase
- **Cloud** - DigitalOcean, Cloudflare, Supabase
- **Design** - Canva, Framer, Linear
- **Gaming** - Unity, Steam, Epic Games
- **And many more...**

<div style="text-align: center; margin: 2rem 0;">
  <a href="/logos" style="
    display: inline-block;
    padding: 12px 24px;
    background: #646cff;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
  ">
    Explore All Logos →
  </a>
</div> 