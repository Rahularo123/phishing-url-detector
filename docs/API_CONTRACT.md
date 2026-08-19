# API Contract — AI-Powered Phishing URL Detector

This document defines every backend endpoint the frontend needs to work with.
Build the frontend against this contract using **mock/fake data** that matches
these exact shapes. Once the real backend is ready, only the `fetch()` URLs
and a base URL need to change — nothing else in the UI should need rework.

Base URL during development: `http://localhost:5000`

All request/response bodies are JSON. All authenticated routes require a
header: `Authorization: Bearer <token>` (token comes from login/register).

---

## 1. Auth

### POST /api/auth/register
Request:
```json
{ "name": "Rahul Arora", "email": "rahul@example.com", "password": "somepassword" }
```
Success response (201):
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "64f...", "name": "Rahul Arora", "email": "rahul@example.com" }
}
```
Error response (400):
```json
{ "error": "Email already registered" }
```

### POST /api/auth/login
Request:
```json
{ "email": "rahul@example.com", "password": "somepassword" }
```
Success response (200): same shape as register's success response.
Error response (401):
```json
{ "error": "Invalid email or password" }
```

### GET /api/auth/me
Requires auth header. Returns the currently logged-in user.
Response (200):
```json
{ "id": "64f...", "name": "Rahul Arora", "email": "rahul@example.com" }
```

---

## 2. URL Scan (the core feature)

### POST /api/scan
Requires auth header. Submits a URL for real-time phishing analysis.

Request:
```json
{ "url": "http://paypa1-secure-login.com" }
```

Success response (200):
```json
{
  "id": "66f1a2...",
  "url": "http://paypa1-secure-login.com",
  "riskScore": 87,
  "verdict": "Phishing",
  "flags": [
    { "label": "No HTTPS", "severity": "high" },
    { "label": "Domain registered 4 days ago", "severity": "high" },
    { "label": "Similar to known brand: paypal.com", "severity": "high" },
    { "label": "Uses IP-style subdomain pattern", "severity": "medium" }
  ],
  "scannedAt": "2026-08-19T10:15:00.000Z"
}
```

Notes for the frontend:
- `riskScore` is a number from 0–100 (higher = more dangerous)
- `verdict` is always one of exactly three strings: `"Safe"`, `"Suspicious"`, `"Phishing"`
  - 0–39 → `"Safe"`, 40–69 → `"Suspicious"`, 70–100 → `"Phishing"`
  - Build the UI's color coding (e.g. green/amber/red) around these three exact strings
- `flags` is an array of 0 or more objects — could be empty (`[]`) for a totally clean URL
- `severity` is always one of: `"low"`, `"medium"`, `"high"`

Error response (400) — invalid/malformed URL submitted:
```json
{ "error": "Please enter a valid URL" }
```

---

## 3. Scan History

### GET /api/history
Requires auth header. Returns all past scans for the logged-in user, most recent first.

Response (200):
```json
[
  {
    "id": "66f1a2...",
    "url": "http://paypa1-secure-login.com",
    "riskScore": 87,
    "verdict": "Phishing",
    "scannedAt": "2026-08-19T10:15:00.000Z"
  },
  {
    "id": "66f1a1...",
    "url": "https://github.com",
    "riskScore": 4,
    "verdict": "Safe",
    "scannedAt": "2026-08-18T16:02:00.000Z"
  }
]
```
Note: history list items do **not** include the `flags` array (kept lightweight for a list view). If you need flags for one specific past scan, that's:

### GET /api/history/:id
Response (200): same full shape as a single `POST /api/scan` success response above.

### DELETE /api/history/:id
Requires auth header. Deletes one scan record.
Response (200):
```json
{ "message": "Scan record deleted" }
```

---

## 4. Dashboard summary (optional, nice-to-have)

### GET /api/dashboard/stats
Requires auth header. Aggregate numbers for a summary view.

Response (200):
```json
{
  "totalScans": 42,
  "safeCount": 30,
  "suspiciousCount": 8,
  "phishingCount": 4
}
```

---

## General error shape

Any endpoint can fail with a 401 (not logged in / bad token):
```json
{ "error": "Unauthorized" }
```
Or a 500 (server error):
```json
{ "error": "Something went wrong. Please try again." }
```
The frontend should handle these generically (e.g., a toast/message), not just for one specific route.

---

## What the frontend should build, screen by screen

1. **Register / Login pages** — forms matching section 1 above; store the returned `token` (e.g. in Context + localStorage, same pattern as the StuMS project) and attach it to every subsequent request.
2. **Scan page** — a single input for a URL, a "Scan" button, and a results panel showing `riskScore` (e.g. as a gauge/progress bar), the `verdict` badge (color-coded), and the list of `flags` with their severity.
3. **History page** — a table/list of past scans (from `GET /api/history`), each row clickable to show full flag detail (`GET /api/history/:id`), with a delete option per row.
4. **Dashboard/summary page (optional)** — small stat cards using `GET /api/dashboard/stats`, similar in spirit to the metrics row style used in the StuMS Courses page.

Use placeholder/mock JSON matching the exact shapes above while building — do not invent extra fields or rename any existing ones, since the real backend will match this document exactly.
