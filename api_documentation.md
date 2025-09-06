# API_DOCUMENTATION.md - Local Inventory Finder API Reference

## 🚀 API Overview

The Local Inventory Finder API provides endpoints for searching products, managing inventory, and handling real-time updates from Square POS systems.

**Base URL:** `https://your-app.vercel.app/api`  
**Content Type:** `application/json`  
**Rate Limiting:** 100 requests per minute per IP

## 🔍 Search API

### Search Products by Query and Location

Search for products within a specified radius of a location.

```http
GET /api/search?query={search_term}&lat={latitude}&lng={longitude}&radius={km}&limit={number}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search term for products |
| `lat` | number | Yes | - | User latitude (-90 to 90) |
| `lng` | number | Yes | - | User longitude (-180 to 180) |
| `radius` | number | No | 10 | Search radius in kilometers (1-50) |
| `limit` | number | No | 20 | Maximum results to return (1-100) |
| `category` | string | No | - | Filter by product category |
| `inStock` | boolean | No | true | Only show products in stock |

#### Example Request

```bash
curl -X GET "https://your-app.vercel.app/api/search?query=black%20hoodie&lat=-28.6434&lng=153.6148&radius=5&limit=10"
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "clxxx123456789",
        "name": "Classic Black Hoodie",
        "description": "Comfortable cotton blend hoodie",
        "category": "Clothing",
        "imageUrl": "https://images.squarecdn.com/abc123.jpg",
        "basePrice": 59.99,
        "merchant": {
          "id": "merchant_123",
          "name": "Byron Bay Clothing Co.",
          "address": {
            "street": "123 Jonson Street",
            "city": "Byron Bay",
            "state": "NSW",
            "postcode": "2481",
            "country": "Australia"
          },
          "latitude": -28.6434,
          "longitude": 153.6148,
          "distance": 2.3
        },
        "variations": [
          {
            "id": "var_123",
            "name": "Black Hoodie - Medium",
            "price": 59.99,
            "attributes": {
              "size": "M",
              "color": "Black"
            },
            "inventory": {
              "quantity": 5,
              "lastUpdated": "2024-01-15T10:30:00Z"
            }
          }
        ],
        "totalStock": 12
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "hasMore": true
    },
    "searchMeta": {
      "query": "black hoodie",
      "location": {
        "lat": -28.6434,
        "lng": 153.6148
      },
      "radius": 5,
      "executionTime": 245
    }
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_LOCATION",
    "message": "Invalid latitude or longitude provided",
    "details": {
      "lat": "Must be between -90 and 90",
      "lng": "Must be between -180 and 180"
    }
  }
}
```

### Search Suggestions

Get search suggestions based on partial query input.

```http
GET /api/search/suggestions?query={partial_query}&limit={number}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Partial search term |
| `limit` | number | No | 5 | Maximum suggestions (1-10) |

#### Example Response

```json
{
  "success": true,
  "data": {
    "suggestions": [
      "black hoodie",
      "black jacket",
      "black t-shirt",
      "hoodie mens",
      "hoodie womens"
    ]
  }
}
```

## 📦 Product API

### Get Product Details

Retrieve detailed information about a specific product.

```http
GET /api/products/{product_id}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product_id` | string | Yes | Unique product identifier |
| `lat` | number | No | User latitude for distance calculation |
| `lng` | number | No | User longitude for distance calculation |

#### Example Response

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "clxxx123456789",
      "squareItemId": "LGNHVLQK7VGXVQWX3QJXK23H",
      "name": "Classic Black Hoodie",
      "description": "Premium quality cotton blend hoodie with kangaroo pocket",
      "category": "Clothing > Hoodies",
      "imageUrl": "https://images.squarecdn.com/abc123.jpg",
      "basePrice": 59.99,
      "merchant": {
        "id": "merchant_123",
        "name": "Byron Bay Clothing Co.",
        "email": "info@byronbayclothing.com",
        "phone": "+61 2 6685 1234",
        "address": {
          "street": "123 Jonson Street",
          "city": "Byron Bay",
          "state": "NSW",
          "postcode": "2481",
          "country": "Australia"
        },
        "latitude": -28.6434,
        "longitude": 153.6148,
        "distance": 2.3,
        "openingHours": {
          "monday": "9:00-