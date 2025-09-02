# TikTok Shop API Documentation

This document provides information about the TikTok Shop API integration used in TikTokFlow.

## Overview

TikTokFlow integrates with the TikTok Shop API to automate order ingestion, update inventory levels, and manage product information. The integration uses OAuth 2.0 for authentication and provides real-time data synchronization between TikTok Shop and TikTokFlow.

## Authentication

TikTok Shop uses OAuth 2.0 for API authentication. The authentication flow is as follows:

1. Redirect the user to the TikTok Shop OAuth authorization URL
2. User authorizes the application
3. TikTok Shop redirects back to the application with an authorization code
4. Exchange the authorization code for an access token and refresh token
5. Use the access token for API requests
6. Refresh the access token when it expires

### OAuth URLs

- **Authorization URL**: `https://auth.tiktok-shops.com/oauth/authorize`
- **Token URL**: `https://open-api.tiktokglobalshop.com/api/v2/token/get`
- **Refresh Token URL**: `https://open-api.tiktokglobalshop.com/api/v2/token/refresh`

### Required Parameters

- `client_id`: Your TikTok Shop App ID
- `redirect_uri`: Your application's redirect URI
- `state`: A random string to prevent CSRF attacks
- `response_type`: Set to `code`

## API Endpoints

### Orders

#### Get Orders

```
GET /api/orders/search
```

Retrieves a list of orders from TikTok Shop.

**Parameters:**
- `page_size`: Number of orders to return per page (default: 10)
- `page_number`: Page number (default: 1)
- `order_status`: Filter orders by status (optional)
- `create_time_from`: Filter orders created after this time (ISO 8601 format)
- `create_time_to`: Filter orders created before this time (ISO 8601 format)

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orders": [
      {
        "order_id": "123456789",
        "order_status": "AWAITING_SHIPMENT",
        "payment_method": "CREDIT_CARD",
        "shipping_provider": "USPS",
        "tracking_number": "",
        "recipient": {
          "name": "John Doe",
          "phone": "1234567890",
          "address": {
            "street1": "123 Main St",
            "street2": "Apt 4B",
            "city": "New York",
            "state": "NY",
            "zipcode": "10001",
            "country": "US"
          }
        },
        "items": [
          {
            "id": "product_123",
            "sku_id": "sku_456",
            "product_name": "Wireless Earbuds",
            "quantity": 2,
            "price": 29.99
          }
        ],
        "create_time": "2023-01-15T12:00:00Z",
        "update_time": "2023-01-15T12:00:00Z"
      }
    ],
    "total": 100
  }
}
```

#### Get Order Details

```
GET /api/orders/detail/query
```

Retrieves detailed information about a specific order.

**Parameters:**
- `order_id`: The ID of the order to retrieve

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_id": "123456789",
    "order_status": "AWAITING_SHIPMENT",
    "payment_method": "CREDIT_CARD",
    "shipping_provider": "USPS",
    "tracking_number": "",
    "recipient": {
      "name": "John Doe",
      "phone": "1234567890",
      "address": {
        "street1": "123 Main St",
        "street2": "Apt 4B",
        "city": "New York",
        "state": "NY",
        "zipcode": "10001",
        "country": "US"
      }
    },
    "items": [
      {
        "id": "product_123",
        "sku_id": "sku_456",
        "product_name": "Wireless Earbuds",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "create_time": "2023-01-15T12:00:00Z",
    "update_time": "2023-01-15T12:00:00Z"
  }
}
```

#### Update Order Status

```
POST /api/orders/update
```

Updates the status of an order.

**Request Body:**
```json
{
  "order_id": "123456789",
  "status": "SHIPPED",
  "tracking_number": "TK1234567890"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_id": "123456789",
    "status": "SHIPPED"
  }
}
```

### Products

#### Get Products

```
GET /api/products/search
```

Retrieves a list of products from TikTok Shop.

**Parameters:**
- `page_size`: Number of products to return per page (default: 10)
- `page_number`: Page number (default: 1)

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "products": [
      {
        "id": "product_123",
        "name": "Wireless Earbuds",
        "description": "High-quality wireless earbuds with noise cancellation",
        "price": 29.99,
        "skus": [
          {
            "id": "sku_456",
            "seller_sku": "WE001",
            "price": 29.99
          }
        ],
        "stock_infos": [
          {
            "warehouse_id": "default",
            "available_stock": 45
          }
        ],
        "create_time": "2023-01-01T12:00:00Z",
        "update_time": "2023-01-15T12:00:00Z"
      }
    ],
    "total": 50
  }
}
```

#### Get Product Details

```
GET /api/products/details
```

Retrieves detailed information about a specific product.

**Parameters:**
- `product_id`: The ID of the product to retrieve

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "product_123",
    "name": "Wireless Earbuds",
    "description": "High-quality wireless earbuds with noise cancellation",
    "price": 29.99,
    "skus": [
      {
        "id": "sku_456",
        "seller_sku": "WE001",
        "price": 29.99
      }
    ],
    "stock_infos": [
      {
        "warehouse_id": "default",
        "available_stock": 45
      }
    ],
    "create_time": "2023-01-01T12:00:00Z",
    "update_time": "2023-01-15T12:00:00Z"
  }
}
```

#### Update Product Inventory

```
POST /api/products/stocks
```

Updates the inventory level of a product.

**Request Body:**
```json
{
  "product_id": "product_123",
  "skus": [
    {
      "id": "sku_456",
      "stock_infos": [
        {
          "warehouse_id": "default",
          "available_stock": 50
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "product_id": "product_123",
    "skus": [
      {
        "id": "sku_456",
        "stock_infos": [
          {
            "warehouse_id": "default",
            "available_stock": 50
          }
        ]
      }
    ]
  }
}
```

## Error Handling

The TikTok Shop API returns error responses in the following format:

```json
{
  "code": 1000,
  "message": "Error message",
  "data": null
}
```

Common error codes:
- `1000`: General error
- `1001`: Invalid parameter
- `1002`: Missing parameter
- `1003`: Invalid access token
- `1004`: Access token expired
- `1005`: Rate limit exceeded
- `1006`: Permission denied

## Rate Limits

The TikTok Shop API has rate limits that vary by endpoint. In general, the rate limits are:

- 1000 requests per minute per app
- 10000 requests per day per app

If you exceed the rate limits, the API will return a `1005` error code.

## Webhooks

TikTok Shop provides webhooks for real-time notifications of events such as order creation, order status changes, and inventory updates. To use webhooks, you need to register a webhook URL in the TikTok Shop Developer Portal.

### Webhook Events

- `order.created`: Triggered when a new order is created
- `order.updated`: Triggered when an order is updated
- `product.updated`: Triggered when a product is updated
- `inventory.updated`: Triggered when inventory levels are updated

### Webhook Payload

```json
{
  "event_type": "order.created",
  "timestamp": "2023-01-15T12:00:00Z",
  "data": {
    "order_id": "123456789"
  }
}
```

## Best Practices

1. **Token Management**: Store access tokens securely and refresh them before they expire.
2. **Error Handling**: Implement robust error handling for API requests.
3. **Rate Limiting**: Respect the API rate limits and implement retry logic with exponential backoff.
4. **Webhooks**: Use webhooks for real-time updates instead of polling the API.
5. **Logging**: Log API requests and responses for debugging purposes.

## Resources

- [TikTok Shop Developer Portal](https://developers.tiktok-shops.com/)
- [TikTok Shop API Documentation](https://affiliate.tiktok.com/shop/api-docs/)
- [TikTok Shop API Reference](https://affiliate.tiktok.com/shop/api-reference/)

