# LogoHub Development Guide

This guide provides detailed information for developers who want to contribute to or build upon the LogoHub project.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/logohub.git
   cd logohub
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

- `/logos`: Contains all brand logos organized by company name
- `/api`: API implementation for accessing logos
- `/tools`: Utility scripts for logo manipulation
- `/guidelines`: Documentation on contribution standards
- `/doc`: Project documentation and guides
- `/packages`: Framework-specific packages (React, Vue, etc.)

## Working with Logos

### Adding a New Logo

1. Create a new directory under `/logos` with the company name:
   ```
   mkdir -p logos/company-name
   ```

2. Create the metadata.json file with company information:
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
     "contributor": "Your Name",
     "versions": [
       {
         "version": "1.0",
         "date": "YYYY-MM-DD",
         "description": "Initial version"
       }
     ]
   }
   ```

3. Add the logo SVG files following the naming convention:
   ```
   company-name-standard.svg
   company-name-monochrome.svg
   company-name-symbol.svg (if applicable)
   ```

4. Optimize SVG files using SVGO:
   ```
   npx svgo logos/company-name/*.svg
   ```

### Customizing Logos

Use the SVG color replacement tool to modify logo colors:

```
node tools/svg-color-replacer.js input.svg output.svg "#oldColor" "#newColor"
```

## API Development

### API Endpoints

The API follows RESTful design principles:

- `GET /v1/logos`: Get all logos with pagination and filtering
- `GET /v1/logos/:id`: Get a specific logo's metadata and variants
- `GET /v1/logos/:id/:version.:format`: Get a specific logo file

### API Authentication

(To be implemented) The API uses API keys for authentication:

```
Authorization: Bearer YOUR_API_KEY
```

### Adding New Endpoints

To add a new endpoint:

1. Open `api/index.js`
2. Add a new route handler following the existing patterns
3. Ensure proper error handling and validation
4. Update the API documentation in `api/README.md`

## Framework-Specific Packages

LogoHub follows a multi-package architecture (similar to Lucide) with specific integrations for popular frameworks:

### Package Structure

- `packages/logohub-core`: Core functionality and utilities
- `packages/logohub-react`: React components
- `packages/logohub-vue`: Vue components
- `packages/logohub-svelte`: Svelte components
- `packages/logohub-angular`: Angular components

### Developing Packages

Each package should:

1. Provide a consistent API across frameworks
2. Support customization options (color, size, etc.)
3. Include TypeScript typings
4. Be tree-shakable (only import used logos)
5. Have comprehensive documentation

## Deployment

### Development

```
npm run dev
```

### Vercel Deployment

LogoHub uses Vercel for hosting the API and documentation site.

#### Setting Up Vercel

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy for development:
   ```
   vercel
   ```

4. Deploy to production:
   ```
   vercel --prod
   ```

#### Environment Variables

Important environment variables to configure in Vercel:

- `NODE_ENV`: Set to "production" for production deployments
- `API_KEY_SECRET`: Secret for API key generation
- `ALLOWED_ORIGINS`: CORS allowed origins

#### Vercel Configuration

Create a `vercel.json` file in the root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/v1/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

## Testing

Run tests using Jest:

```
npm test
```

### Writing Tests

1. Create test files with the `.test.js` extension
2. Place them in the appropriate directory
3. Follow the Jest testing conventions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [CONTRIBUTING.md](../guidelines/CONTRIBUTING.md) file for detailed information on contributing logos.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 