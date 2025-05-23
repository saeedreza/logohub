# API Reference

LogoHub provides a simple REST API for accessing logo data and files.

## Base URL

```
https://api.logohub.dev/v1
```

## Endpoints

### Get all logos

```http
GET /logos
```

**Query Parameters:**
- `category` - Filter by category (e.g., `ai`, `fintech`, `cloud`)
- `search` - Search by name or description
- `limit` - Number of results to return (default: 50)
- `offset` - Number of results to skip (default: 0)

**Example:**
```bash
curl https://api.logohub.dev/v1/logos?category=ai&search=openai
```

**Response:**
```json
{
  "logos": [
    {
      "id": "openai",
      "name": "OpenAI",
      "description": "OpenAI artificial intelligence research company",
      "website": "https://openai.com",
      "category": "ai",
      "tags": ["ai", "machine-learning"],
      "colors": {
        "primary": "#000000",
        "secondary": "#666666"
      },
      "files": {
        "svg": "https://logohub.dev/logos/openai/openai.svg"
      }
    }
  ],
  "total": 1,
  "page": {
    "limit": 50,
    "offset": 0
  }
}
```

### Get specific logo

```http
GET /logos/{id}
```

**Example:**
```bash
curl https://api.logohub.dev/v1/logos/stripe
```

**Response:**
```json
{
  "id": "stripe",
  "name": "Stripe",
  "description": "Online payment processing platform",
  "website": "https://stripe.com",
  "category": "fintech",
  "tags": ["payments", "fintech", "api"],
  "colors": {
    "primary": "#635BFF",
    "secondary": "#0A2540"
  },
  "variants": {
    "standard": "stripe.svg"
  },
  "files": {
    "svg": "https://logohub.dev/logos/stripe/stripe.svg"
  },
  "created": "2024-12-07T12:00:00.000Z"
}
```

### Get logo categories

```http
GET /categories
```

**Response:**
```json
{
  "categories": [
    "ai",
    "analytics", 
    "cloud",
    "design",
    "fintech",
    "gaming"
  ]
}
```

## Direct File Access

You can directly access logo files via CDN:

```
https://logohub.dev/logos/{id}/{id}.svg
```

**Examples:**
- `https://logohub.dev/logos/openai/openai.svg`
- `https://logohub.dev/logos/stripe/stripe.svg`
- `https://logohub.dev/logos/anthropic/anthropic.svg`

## Rate Limits

- **Free tier**: 1000 requests per hour
- **No authentication required** for public logos
- **CORS enabled** for browser requests

## Error Responses

```json
{
  "error": {
    "code": 404,
    "message": "Logo not found",
    "details": "The requested logo 'nonexistent' does not exist"
  }
}
```

## Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Logo not found
- `429` - Rate limit exceeded
- `500` - Internal server error 