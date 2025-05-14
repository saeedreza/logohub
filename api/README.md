# LogoHub API Documentation

This document describes the API for accessing and manipulating logos in the LogoHub repository.

## Base URL

```
https://api.logohub.dev/v1
```

## Authentication

API requests require authentication using an API key:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Get All Logos

```
GET /logos
```

Parameters:
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20, max: 100)
- `industry`: Filter by industry
- `format`: Filter by format (svg, png, webp)

Response:
```json
{
  "total": 100,
  "page": 1,
  "limit": 20,
  "logos": [
    {
      "id": "sample-company",
      "name": "Sample Company",
      "versions": ["standard", "monochrome"],
      "formats": ["svg", "png"],
      "url": "https://api.logohub.dev/v1/logos/sample-company"
    },
    // more logos...
  ]
}
```

### Get Logo by ID

```
GET /logos/:id
```

Response:
```json
{
  "id": "sample-company",
  "name": "Sample Company",
  "website": "https://samplecompany.com",
  "industry": ["technology", "software"],
  "colors": {
    "primary": "#0066cc",
    "secondary": "#ff9900"
  },
  "versions": [
    {
      "name": "standard",
      "formats": [
        {
          "format": "svg",
          "url": "https://api.logohub.dev/v1/logos/sample-company/standard.svg"
        },
        {
          "format": "png",
          "sizes": [
            {
              "width": 16,
              "height": 16,
              "url": "https://api.logohub.dev/v1/logos/sample-company/standard-16x16.png"
            },
            // more sizes...
          ]
        }
      ]
    },
    {
      "name": "monochrome",
      "formats": [
        {
          "format": "svg",
          "url": "https://api.logohub.dev/v1/logos/sample-company/monochrome.svg"
        },
        // more formats...
      ]
    }
  ]
}
```

### Get Logo File

```
GET /logos/:id/:version.:format
```

Parameters:
- `size`: Required for PNG format (e.g., 16x16, 32x32, 64x64)
- `color`: Override color (hex format without #, e.g., FF0000 for red)

Example:
```
GET /logos/sample-company/standard.svg?color=FF0000
```

Returns the logo file with the specified parameters.

## Error Responses

All errors return a JSON object with an error message:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Missing or invalid API key
- `404`: Not Found - Logo not found
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Something went wrong on our end

## Rate Limits

Free tier: 100 requests per hour
Premium tier: 1,000 requests per hour

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Total number of requests allowed per hour
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Time when the current rate limit window resets (Unix timestamp) 