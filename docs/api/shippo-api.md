# Shippo API Documentation

This document provides information about the Shippo API integration used in TikTokFlow.

## Overview

TikTokFlow integrates with the Shippo API to generate shipping labels, track shipments, and validate addresses. Shippo provides a unified API for multiple shipping carriers, including USPS, UPS, FedEx, and DHL.

## Authentication

Shippo uses API keys for authentication. You need to include your API key in the `Authorization` header of all requests:

```
Authorization: ShippoToken <your_api_key>
```

## API Endpoints

### Addresses

#### Create Address

```
POST /addresses/
```

Creates a new address object.

**Request Body:**
```json
{
  "name": "John Doe",
  "company": "TikTokFlow",
  "street1": "123 Main St",
  "street2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "country": "US",
  "phone": "+1 123 456 7890",
  "email": "john@example.com",
  "validate": true
}
```

**Response:**
```json
{
  "object_id": "addr_1234567890",
  "name": "John Doe",
  "company": "TikTokFlow",
  "street1": "123 Main St",
  "street2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "country": "US",
  "phone": "+1 123 456 7890",
  "email": "john@example.com",
  "is_complete": true,
  "validation_results": {
    "is_valid": true,
    "messages": []
  }
}
```

#### Validate Address

```
GET /addresses/{address_id}/validate/
```

Validates an existing address.

**Response:**
```json
{
  "is_valid": true,
  "messages": []
}
```

### Shipments

#### Create Shipment

```
POST /shipments/
```

Creates a new shipment object.

**Request Body:**
```json
{
  "address_from": "addr_1234567890",
  "address_to": "addr_0987654321",
  "parcels": [
    {
      "length": "10",
      "width": "8",
      "height": "4",
      "distance_unit": "in",
      "weight": "2",
      "mass_unit": "lb"
    }
  ],
  "async": false
}
```

**Response:**
```json
{
  "object_id": "shp_1234567890",
  "address_from": {
    "object_id": "addr_1234567890",
    "name": "John Doe",
    "company": "TikTokFlow",
    "street1": "123 Main St",
    "street2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US",
    "phone": "+1 123 456 7890",
    "email": "john@example.com"
  },
  "address_to": {
    "object_id": "addr_0987654321",
    "name": "Jane Smith",
    "street1": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90210",
    "country": "US"
  },
  "parcels": [
    {
      "length": "10",
      "width": "8",
      "height": "4",
      "distance_unit": "in",
      "weight": "2",
      "mass_unit": "lb"
    }
  ],
  "rates": [
    {
      "object_id": "rate_1234567890",
      "amount": "5.50",
      "currency": "USD",
      "provider": "USPS",
      "service": "Priority",
      "estimated_days": 2
    },
    {
      "object_id": "rate_0987654321",
      "amount": "8.50",
      "currency": "USD",
      "provider": "UPS",
      "service": "Ground",
      "estimated_days": 3
    }
  ]
}
```

#### Get Shipping Rates

```
GET /shipments/{shipment_id}/rates/
```

Retrieves the rates for a shipment.

**Response:**
```json
[
  {
    "object_id": "rate_1234567890",
    "amount": "5.50",
    "currency": "USD",
    "provider": "USPS",
    "service": "Priority",
    "estimated_days": 2
  },
  {
    "object_id": "rate_0987654321",
    "amount": "8.50",
    "currency": "USD",
    "provider": "UPS",
    "service": "Ground",
    "estimated_days": 3
  }
]
```

### Transactions

#### Purchase Label

```
POST /transactions/
```

Purchases a shipping label.

**Request Body:**
```json
{
  "rate": "rate_1234567890",
  "async": false
}
```

**Response:**
```json
{
  "object_id": "txn_1234567890",
  "status": "SUCCESS",
  "label_url": "https://shippo-delivery.s3.amazonaws.com/label-1234567890.pdf",
  "tracking_number": "9400123456789012345678",
  "tracking_url_provider": "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400123456789012345678",
  "eta": "2023-01-18T12:00:00Z",
  "tracking_status": "UNKNOWN",
  "carrier": "USPS"
}
```

### Tracking

#### Track Shipment

```
POST /tracks/
```

Creates a new tracking object.

**Request Body:**
```json
{
  "carrier": "USPS",
  "tracking_number": "9400123456789012345678"
}
```

**Response:**
```json
{
  "carrier": "USPS",
  "tracking_number": "9400123456789012345678",
  "tracking_status": {
    "status": "TRANSIT",
    "status_details": "Your shipment is in transit",
    "status_date": "2023-01-16T12:00:00Z",
    "location": {
      "city": "Chicago",
      "state": "IL",
      "zip": "60601",
      "country": "US"
    }
  },
  "eta": "2023-01-18T12:00:00Z",
  "tracking_history": [
    {
      "status": "UNKNOWN",
      "status_details": "The carrier has received the electronic shipment information",
      "status_date": "2023-01-15T12:00:00Z",
      "location": {
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "country": "US"
      }
    },
    {
      "status": "TRANSIT",
      "status_details": "Your shipment is in transit",
      "status_date": "2023-01-16T12:00:00Z",
      "location": {
        "city": "Chicago",
        "state": "IL",
        "zip": "60601",
        "country": "US"
      }
    }
  ]
}
```

## Error Handling

The Shippo API returns error responses in the following format:

```json
{
  "detail": "Error message"
}
```

Common HTTP status codes:
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid API key
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limits

The Shippo API has rate limits that vary by plan. In general, the rate limits are:

- 90 requests per minute for the Starter plan
- 120 requests per minute for the Professional plan
- 300 requests per minute for the Premier plan

If you exceed the rate limits, the API will return a `429 Too Many Requests` status code.

## Best Practices

1. **Address Validation**: Always validate addresses before creating shipments to avoid delivery issues.
2. **Error Handling**: Implement robust error handling for API requests.
3. **Rate Limiting**: Respect the API rate limits and implement retry logic with exponential backoff.
4. **Caching**: Cache shipping rates and tracking information to reduce API calls.
5. **Logging**: Log API requests and responses for debugging purposes.

## Resources

- [Shippo API Documentation](https://goshippo.com/docs/api)
- [Shippo API Reference](https://goshippo.com/docs/reference)
- [Shippo Developer Dashboard](https://apps.goshippo.com/)

