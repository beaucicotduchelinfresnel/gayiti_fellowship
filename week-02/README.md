# Referral Partner Program — Workflow Automation & API Integration

## Overview

The Referral Partner Program is an automated workflow built with **n8n** to process partner referrals, validate incoming data, verify partner eligibility, validate prospect email addresses through an external API, log API errors, and notify the relevant stakeholders.

The workflow exposes a REST webhook endpoint that receives referral submissions and automatically routes them through validation, API integration, notification, and database-style logging steps.

## Workflow Architecture

```text
Webhook
   ↓
Required Fields Valid?
   ├── No → Required Fields Error → HTTP 400
   │
   └── Yes
        ↓
   Get Partner from Google Sheets
        ↓
   Partner Valid & Active?
   ├── No → Partner Validation Error → HTTP 400
   │
   └── Yes
        ↓
   Validate Prospect Email
        ├── API Error → API Error Handler
        │                  ↓
        │             API Error Log
        │
        └── Success
              ↓
        Email Deliverable?
        ├── No → Email Validation Error → HTTP response
        │
        └── Yes
              ↓
        ┌───────────────┬──────────────────┬─────────────────┐
        ↓               ↓                  ↓                 ↓
   Sales Notification  Partner Email   Prospect Email   Referral Log
                                                            ↓
                                                   Success Response
```

## Technologies Used

* **n8n** — workflow automation
* **Google Sheets** — partner directory, referral storage, and API error logging
* **Abstract API Email Reputation API** — prospect email validation
* **Gmail** — automated notifications
* **Postman** — API testing
* **REST Webhook** — referral submission endpoint

## Input API

The workflow accepts a `POST` request through the `/referral` webhook.

### Example Request

```json
{
  "partner_code": "PARTNER001",
  "prospect": {
    "name": "Eberson Jean",
    "email": "john@example.com",
    "phone": "+50912345678"
  },
  "intent": "Insurance consultation"
}
```

## Validation

The workflow validates the following required fields:

* `partner_code`
* `prospect.name`
* `prospect.email`
* `prospect.phone`
* `intent`

If one of these fields is missing, the workflow stops the request and returns an HTTP `400` response.

## Partner Validation

The submitted `partner_code` is checked against the **Partner Directory** Google Sheet.

The workflow verifies:

1. The partner code exists.
2. The partner is active.

If the partner is unknown or inactive, the workflow returns an HTTP `400` response.

## External API Integration

After partner validation, the prospect's email address is sent to the Abstract API Email Reputation service.

The API response is used to determine whether the email is deliverable.

If the email is deliverable, the workflow continues to the notification and referral logging stages.

If the email is rejected, the workflow returns an appropriate error response.

## Error Handling

The workflow includes a dedicated API error-handling path.

If the external email validation API returns an error, the workflow captures:

* `timestamp`
* `error_type`
* `error_message`
* `status_code`

These values are processed by the **API Error Handler** and stored in the **API Error Log** Google Sheet.

This prevents API failures from being silently ignored and creates a persistent record for debugging and monitoring.

## Notifications

When a referral passes all validations, the workflow sends:

1. A notification to the sales team.
2. A confirmation email to the partner.
3. A welcome email to the prospect.

The referral is also stored in the **Referral Leads** Google Sheet.

## API Responses

### Successful Request

```json
{
  "success": true,
  "message": "Referral received"
}
```

HTTP status:

```text
200 OK
```

### Validation Error

```json
{
  "success": false,
  "error": "Missing required field: prospect.email"
}
```

HTTP status:

```text
400 Bad Request
```

### Partner Validation Error

```json
{
  "success": false,
  "error": "Unknown or inactive partner code: PARTNER001"
}
```

HTTP status:

```text
400 Bad Request
```

## Error Log Structure

The `API Error Log` sheet contains:

| Column        | Description                          |
| ------------- | ------------------------------------ |
| timestamp     | Time when the API error occurred     |
| error_type    | API error code/type                  |
| error_message | Detailed error message               |
| status_code   | HTTP status code returned by the API |

## Testing

The workflow was tested using Postman with multiple scenarios:

### Test 1 — Successful Referral

A valid partner code and valid prospect information were submitted.

**Expected result:**

* Partner validated
* Email validated
* Notifications sent
* Referral logged
* HTTP `200` response returned

### Test 2 — Missing Required Field

A required field was removed from the request.

**Expected result:**

* Workflow stops at required-field validation
* HTTP `400` response returned

### Test 3 — Invalid/Inactive Partner

An invalid partner code was submitted.

**Expected result:**

* Partner validation fails
* HTTP `400` response returned

### Test 4 — External API Failure

The external API was intentionally configured with an invalid API key.

**Expected result:**

* API request fails
* Error is captured by `API Error Handler`
* Error details are written to `API Error Log`

## Key Learning Outcomes

This project demonstrates practical experience with:

* REST APIs
* Webhooks
* n8n workflow automation
* External API integration
* Conditional logic
* Error handling
* Google Sheets integration
* Automated email notifications
* API testing with Postman
* Structured logging
* HTTP status codes

## Project Deliverables

* n8n workflow JSON export
* Workflow architecture screenshot
* Google Sheets screenshots
* Postman test screenshots
* Loom demonstration
* Project documentation
