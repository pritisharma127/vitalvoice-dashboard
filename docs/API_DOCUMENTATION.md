# Vital Voice Dashboard - API Documentation

## Overview

This document provides comprehensive API documentation for the Vital Voice Dashboard REST APIs. These APIs allow external applications to integrate with the Vital Voice system for managing blood requests and searching donors.

## Base URL

```
https://<>.supabase.co/functions/v1
```

## Authentication

These APIs are **public** and do not require authentication. No API key or authorization header is needed.

---

## Blood Requests API

Full CRUD operations for managing blood donation requests.

### List Blood Requests

Retrieve a paginated list of all blood requests with optional filtering.

**Endpoint:** `GET /blood-requests`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20, max: 100) |
| `status` | string | No | Filter by status: `pending`, `in_progress`, `fulfilled`, `cancelled` |
| `blood_type` | string | No | Filter by blood type: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-` |
| `urgency` | string | No | Filter by urgency: `immediate`, `within_3_hours`, `within_6_hours`, `within_24_hours`, `within_48_hours` |

**Example Request:**

```bash
curl "https://<>.supabase.co/functions/v1/blood-requests?page=1&limit=10&status=pending"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "request_id": "abc123-uuid",
      "patient_name": "John Doe",
      "blood_type": "O+",
      "quantity_units": 2,
      "urgency": "immediate",
      "status": "pending",
      "hospital_name": "City Hospital",
      "hospital_city": "Bangalore",
      "hospital_zipcode": "560001",
      "caretaker_name": "Jane Doe",
      "caretaker_phone": "+91-9876543210",
      "caretaker_email": "jane@example.com",
      "patient_age": 45,
      "patient_gender": "male",
      "notes": "Urgent surgery",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "total_pages": 5
  }
}
```

---

### Get Blood Request by ID

Retrieve a specific blood request by its request_id.

**Endpoint:** `GET /blood-requests/{request_id}`

**Example Request:**

```bash
curl "https://<>.supabase.co/functions/v1/blood-requests/abc123-uuid"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "request_id": "abc123-uuid",
    "patient_name": "John Doe",
    "blood_type": "O+",
    "quantity_units": 2,
    "urgency": "immediate",
    "status": "pending",
    "hospital_name": "City Hospital",
    "hospital_city": "Bangalore",
    "hospital_zipcode": "560001",
    "caretaker_name": "Jane Doe",
    "caretaker_phone": "+91-9876543210",
    "caretaker_email": "jane@example.com",
    "patient_age": 45,
    "patient_gender": "male",
    "notes": "Urgent surgery",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Create Blood Request

Create a new blood donation request.

**Endpoint:** `POST /blood-requests`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_name` | string | Yes | Patient's full name (max 100 chars) |
| `blood_type` | string | Yes | `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-` |
| `quantity_units` | number | Yes | Units of blood needed (1-20) |
| `urgency` | string | Yes | `immediate`, `within_3_hours`, `within_6_hours`, `within_24_hours`, `within_48_hours` |
| `reason` | string | No | Reason for blood requirement (e.g., surgery, accident) |
| `patient_age` | number | Yes | Patient's age (0-120) |
| `patient_gender` | string | Yes | `male`, `female`, `other` |
| `caretaker_phone` | string | Yes | Contact phone number |
| `caretaker_email` | string | Yes | Valid email address |
| `hospital_name` | string | Yes | Name of the hospital |
| `hospital_city` | string | Yes | City where hospital is located |
| `hospital_zipcode` | string | Yes | Hospital ZIP/PIN code |
| `caretaker_name` | string | No | Caretaker's name (max 100 chars) |
| `notes` | string | No | Additional notes (max 1000 chars) |

**Example Request:**

```bash
curl -X POST "https://<>.supabase.co/functions/v1/blood-requests" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "John Doe",
    "blood_type": "O+",
    "quantity_units": 2,
    "urgency": "immediate",
    "reason": "Emergency surgery",
    "patient_age": 45,
    "patient_gender": "male",
    "caretaker_name": "Jane Doe",
    "caretaker_phone": "+91-9876543210",
    "caretaker_email": "jane@example.com",
    "hospital_name": "City Hospital",
    "hospital_city": "Bangalore",
    "hospital_zipcode": "560001",
    "notes": "Urgent surgery required"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "request_id": "generated-uuid-v4",
    "patient_name": "John Doe",
    "blood_type": "O+",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "request_id": "generated-uuid-v4"
}
```

---

### Update Blood Request

Update an existing blood request.

**Endpoint:** `PATCH /blood-requests/{request_id}`

**Request Body (all fields optional):**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `pending`, `in_progress`, `fulfilled`, `cancelled` |
| `notes` | string | Additional notes (max 1000 chars) |
| `quantity_units` | number | Units needed (1-20) |
| `urgency` | string | Urgency level |
| `caretaker_name` | string | Caretaker name |
| `caretaker_phone` | string | Contact phone |
| `caretaker_email` | string | Contact email |
| `patient_name` | string | Patient name |
| `patient_age` | number | Patient age (0-120) |
| `patient_gender` | string | `male`, `female`, `other` |
| `blood_type` | string | Blood type |

**Example Request:**

```bash
curl -X PATCH "https://<>.supabase.co/functions/v1/blood-requests/abc123-uuid" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "notes": "Donor found, blood being processed"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "request_id": "abc123-uuid",
    "status": "in_progress",
    "notes": "Donor found, blood being processed",
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

---

### Delete (Cancel) Blood Request

Cancel a blood request. This performs a soft delete by setting the status to 'cancelled'.

**Endpoint:** `DELETE /blood-requests/{request_id}`

**Example Request:**

```bash
curl -X DELETE "https://<>.supabase.co/functions/v1/blood-requests/abc123-uuid"
```

**Example Response:**

```json
{
  "success": true,
  "message": "Request cancelled",
  "data": {
    "id": "uuid",
    "request_id": "abc123-uuid",
    "status": "cancelled"
  }
}
```

---

## Donors API

Search and retrieve blood donors with filtering, pagination, and proximity-based search.

### List Donors

Retrieve a paginated list of donors with optional filtering.

**Endpoint:** `GET /donors`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20, max: 100) |
| `blood_type` | string | No | Filter by blood type |
| `zipcode` | string | No | Filter by exact zipcode |
| `city` | string | No | Filter by city (case-insensitive) |
| `area` | string | No | Filter by area (case-insensitive, partial match) |
| `available_only` | boolean | No | Only show available donors (default: false) |

**Example Request:**

```bash
curl "https://<>.supabase.co/functions/v1/donors?blood_type=O%2B&city=Bangalore&available_only=true"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "donor-uuid",
      "name": "Rajesh Kumar",
      "blood_type": "O+",
      "phone_number": "+91-9876543210",
      "email": "rajesh@example.com",
      "address": "123 Main Street",
      "area": "Koramangala",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipcode": "560034",
      "age": 32,
      "is_available": true,
      "last_donation_date": "2024-01-01",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

### Get Donor by ID

Retrieve a specific donor by their ID.

**Endpoint:** `GET /donors/{donor_id}`

**Example Request:**

```bash
curl "https://<>.supabase.co/functions/v1/donors/donor-uuid"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "donor-uuid",
    "name": "Rajesh Kumar",
    "blood_type": "O+",
    "phone_number": "+91-9876543210",
    "email": "rajesh@example.com",
    "address": "123 Main Street",
    "area": "Koramangala",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipcode": "560034",
    "age": 32,
    "is_available": true,
    "last_donation_date": "2024-01-01"
  }
}
```

---

### Proximity Search

Search for donors near a specific location using ZIP code-based distance calculation.

**Endpoint:** `GET /donors`

**Query Parameters for Proximity Search:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `proximity_search` | boolean | Yes | Set to `true` to enable proximity search |
| `search_zipcode` | string | Yes | ZIP code to search around |
| `max_distance_km` | number | No | Maximum distance in kilometers (default: 50) |
| `blood_type` | string | No | Filter by blood type |
| `available_only` | boolean | No | Only show available donors |

**Example Request:**

```bash
curl "https://<>.supabase.co/functions/v1/donors?proximity_search=true&search_zipcode=560034&max_distance_km=10&blood_type=O%2B"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "donor-uuid",
      "name": "Rajesh Kumar",
      "blood_type": "O+",
      "city": "Bangalore",
      "zipcode": "560034",
      "distance_km": 2.5,
      "is_available": true
    }
  ],
  "search_location": {
    "zipcode": "560034",
    "lat": 12.9352,
    "lng": 77.6245
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25
  }
}
```

---

## Update Blood Request API (Legacy)

Alternative endpoint for retrieving and updating blood requests. Provides the same functionality as the main Blood Requests API.

### List All Requests

**Endpoint:** `GET /update-blood-request`

### Get Specific Request

**Endpoint:** `GET /update-blood-request/{request_id}`

### Update Request

**Endpoint:** `PATCH /update-blood-request/{request_id}`

---

## Call Transactions API

Manage voice agent call transactions for donor outreach campaigns.

### List Call Transactions

Retrieve a paginated list of call transactions with optional filtering.

**Endpoint:** `GET /call-transactions`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20, max: 100) |
| `campaign_id` | string | No | Filter by campaign (request_id) |
| `donor_id` | string | No | Filter by donor ID |
| `availability` | string | No | Filter by availability (YES/NO/NA) |
| `blood_type` | string | No | Filter by blood type |

**Example Request:**

```bash
curl "https://<>.supabase.co/functions/v1/call-transactions?campaign_id=abc123-uuid"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "transaction-uuid",
      "campaign_id": "abc123-uuid",
      "donor_id": "donor-uuid",
      "phone_number": "+91-9876543210",
      "name": "Rajesh Kumar",
      "address": "123 Main Street, Koramangala",
      "zip": "560034",
      "gender": "male",
      "blood_type": "O+",
      "urgency": "immediate",
      "reason": "Emergency surgery",
      "hospital_location": "City Hospital, Bangalore - 560001",
      "availability": "YES",
      "alternate_phone": "+91-9123456789",
      "current_location": "Electronic City",
      "pincode": "560100",
      "eligibility": "Eligible - No recent donations",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "total_pages": 3
  }
}
```

---

### Get Call Transaction by ID

Retrieve a specific call transaction by ID or all transactions for a campaign.

**Endpoint:** `GET /call-transactions/{id_or_campaign_id}`

**Example Request (by transaction ID):**

```bash
curl "https://<>.supabase.co/functions/v1/call-transactions/transaction-uuid"
```

**Example Request (by campaign ID):**

```bash
curl "https://<>.supabase.co/functions/v1/call-transactions/abc123-uuid"
```

---

### Create Call Transaction

Create a new call transaction record for voice agent campaigns.

**Endpoint:** `POST /call-transactions`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `campaign_id` | string | Yes | The request_id from blood_requests |
| `donor_id` | string | Yes | UUID of the donor |
| `phone_number` | string | Yes | Donor's phone number |
| `name` | string | Yes | Donor's name |
| `address` | string | Yes | Donor's address |
| `zip` | string | Yes | Donor's ZIP code |
| `blood_type` | string | Yes | Donor's blood type |
| `urgency` | string | Yes | Urgency level of the request |
| `hospital_location` | string | Yes | Hospital location with ZIP |
| `gender` | string | No | Donor's gender (default: NA) |
| `reason` | string | No | Reason for blood requirement (default: NA) |
| `availability` | string | No | Donor availability (default: NA) |
| `alternate_phone` | string | No | Alternate phone number (default: NA) |
| `current_location` | string | No | Current location (default: NA) |
| `pincode` | string | No | Current pincode (default: NA) |
| `eligibility` | string | No | Eligibility status (default: NA) |

**Example Request:**

```bash
curl -X POST "https://<>.supabase.co/functions/v1/call-transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "abc123-uuid",
    "donor_id": "donor-uuid-here",
    "phone_number": "+91-9876543210",
    "name": "Rajesh Kumar",
    "address": "123 Main Street, Koramangala",
    "zip": "560034",
    "blood_type": "O+",
    "urgency": "immediate",
    "reason": "Emergency surgery",
    "hospital_location": "City Hospital, Bangalore - 560001"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "new-transaction-uuid",
    "campaign_id": "abc123-uuid",
    "donor_id": "donor-uuid-here",
    "phone_number": "+91-9876543210",
    "name": "Rajesh Kumar",
    "availability": "NA",
    "eligibility": "NA",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Update Call Transaction

Update a call transaction with post-call information from the voice agent.

**Endpoint:** `PATCH /call-transactions/{transaction_id}`

**Request Body (all fields optional):**

| Field | Type | Description |
|-------|------|-------------|
| `availability` | string | Donor's availability (YES/NO) |
| `alternate_phone` | string | Alternate phone number provided |
| `current_location` | string | Donor's current location |
| `pincode` | string | Donor's current pincode |
| `eligibility` | string | Eligibility status with reason |
| `gender` | string | Donor's gender if updated |
| `reason` | string | Updated reason if needed |

**Example Request:**

```bash
curl -X PATCH "https://<>.supabase.co/functions/v1/call-transactions/transaction-uuid" \
  -H "Content-Type: application/json" \
  -d '{
    "availability": "YES",
    "alternate_phone": "+91-9123456789",
    "current_location": "Electronic City, Bangalore",
    "pincode": "560100",
    "eligibility": "Eligible - Last donation was 4 months ago"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "transaction-uuid",
    "campaign_id": "abc123-uuid",
    "availability": "YES",
    "alternate_phone": "+91-9123456789",
    "current_location": "Electronic City, Bangalore",
    "pincode": "560100",
    "eligibility": "Eligible - Last donation was 4 months ago",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created (for POST requests) |
| 400 | Bad Request - Invalid parameters or validation failed |
| 404 | Not Found - Resource doesn't exist |
| 405 | Method Not Allowed |
| 500 | Internal Server Error |

---

## Data Types

### Blood Types
- `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`

### Urgency Levels
- `immediate` - Needed immediately
- `within_3_hours` - Needed within 3 hours
- `within_6_hours` - Needed within 6 hours
- `within_24_hours` - Needed within 24 hours
- `within_48_hours` - Needed within 48 hours

### Request Status
- `pending` - Request created, awaiting fulfillment
- `in_progress` - Donor found, processing
- `fulfilled` - Blood delivered successfully
- `cancelled` - Request was cancelled

### Gender Types
- `male`
- `female`
- `other`

### Availability Status (Call Transactions)
- `NA` - Not yet determined
- `YES` - Donor is available
- `NO` - Donor is not available

---

## Rate Limits

Currently, there are no rate limits on these APIs. However, please use them responsibly.

---

## Support

For API-related issues or questions, please refer to the application documentation or contact the system administrator.
