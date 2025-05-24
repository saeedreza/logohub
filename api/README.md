# API

Simple Express.js API for serving logos with dynamic conversion and customization.

## Files

### `index.js`

Main server entry point. Handles logo serving with format conversion (SVG→PNG/WebP), color customization, and dynamic sizing.

### `health.js`

Health check endpoint. Returns API status and version.

### `utils/analytics.js`

Analytics utility for tracking API usage, logo views, downloads, searches, and errors.

### `v1/logos/index.js`

Lists all logos with pagination, filtering, and search. Includes rate limiting.

### `v1/logos/[id].js`

Individual logo endpoint. Returns metadata or files with dynamic conversion and color customization.

## Usage

```bash
npm start
```

API runs on `http://localhost:3000`

## Endpoints

### Health Check

```
GET /api/health
```

### List Logos

```
GET /api/v1/logos
GET /api/v1/logos?page=2&limit=50
GET /api/v1/logos?search=google&industry=technology
GET /api/v1/logos?format=svg
```

### Logo Metadata

```
GET /api/v1/logos/google
GET /api/v1/logos/microsoft
```

### Logo Files

```
GET /api/v1/logos/google?file=google.svg
GET /api/v1/logos/google?file=google.png&size=64
GET /api/v1/logos/google?file=google.webp&size=256
GET /api/v1/logos/google?file=google.svg&color=ff0000
GET /api/v1/logos/microsoft?file=microsoft.png&size=128&color=000000
```
