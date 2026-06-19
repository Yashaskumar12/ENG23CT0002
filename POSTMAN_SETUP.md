# Notification API Server - Setup & Testing Guide

## Quick Start

### 1. Installation

```bash
npm install express axios
```

### 2. Running the Server

```bash
node notification-api-server.js
```

You should see:
```
============================================================
✓ Notification API Server started on port 3000
============================================================

📌 Available Endpoints:

   1. GET http://localhost:3000/health
   2. GET http://localhost:3000/api/v1/notifications/priority-inbox?studentId=1042
   3. GET http://localhost:3000/api/v1/notifications?studentId=1042&limit=20
   4. GET http://localhost:3000/api/v1/notifications/count/unread?studentId=1042

🔗 External API: http://4.224.186.213/evaluation-service/notifications

📝 Test in Postman:
   - Start this server: node notification-api-server.js
   - Import URLs above in Postman
   - Send GET requests to test

============================================================
```

## API Endpoints

### 1. Health Check
```
GET http://localhost:3000/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "message": "Notification API server is running",
  "timestamp": "2026-06-19T12:00:00.000Z",
  "externalAPI": "http://4.224.186.213/evaluation-service/notifications",
  "endpoints": [...]
}
```

---

### 2. Get Priority Inbox (Top 10 Notifications)
```
GET http://localhost:3000/api/v1/notifications/priority-inbox?studentId=1042&limit=10
```

**Query Parameters:**
- `studentId` (optional): Student ID (default: 1042)
- `limit` (optional): Number of notifications to fetch (default: 10, max: 50)

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Priority inbox retrieved successfully",
  "data": {
    "studentId": "1042",
    "totalUnread": 15,
    "topCount": 10,
    "notifications": [
      {
        "id": "notif_1",
        "title": "Placement Offer",
        "message": "Congratulations! You have received a placement offer.",
        "type": "Placement",
        "priority": 100,
        "score": 99.405,
        "ageHours": 1.0,
        "createdAt": "2026-06-19T12:00:00Z",
        "isRead": false
      },
      {
        "id": "notif_2",
        "title": "Semester Results",
        "message": "Your semester results are now available.",
        "type": "Result",
        "priority": 50,
        "score": 48.512,
        "ageHours": 5.0,
        "createdAt": "2026-06-19T07:00:00Z",
        "isRead": false
      }
    ]
  }
}
```

---

### 3. Get All Notifications (with Pagination)
```
GET http://localhost:3000/api/v1/notifications?studentId=1042&limit=20&offset=0
```

**Query Parameters:**
- `studentId` (optional): Student ID (default: 1042)
- `limit` (optional): Number of notifications per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "studentId": "1042",
    "notifications": [...],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### 4. Get Unread Notification Count
```
GET http://localhost:3000/api/v1/notifications/count/unread?studentId=1042
```

**Query Parameters:**
- `studentId` (optional): Student ID (default: 1042)

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "studentId": "1042",
    "unreadCount": 12,
    "lastFetchedAt": "2026-06-19T12:05:30.000Z"
  }
}
```

---

## Testing in Postman

### Step 1: Create New Request
1. Open Postman
2. Click "New" → "Request"
3. Choose GET method

### Step 2: Test Each Endpoint

#### Request 1: Health Check
```
GET http://localhost:3000/health
```

#### Request 2: Priority Inbox
```
GET http://localhost:3000/api/v1/notifications/priority-inbox?studentId=1042&limit=10
```

#### Request 3: All Notifications
```
GET http://localhost:3000/api/v1/notifications?studentId=1042&limit=20&offset=0
```

#### Request 4: Unread Count
```
GET http://localhost:3000/api/v1/notifications/count/unread?studentId=1042
```

### Step 3: View Response
- Click "Send"
- Response should appear in the lower panel
- Check "Pretty" tab to format JSON

---

## Priority Scoring Algorithm

```
Score = Type Weight × (1 - Age_Hours / 168)

Type Weights:
- Placement: 100
- Result: 50
- Event: 10

Example:
- Notification Type: Placement (weight = 100)
- Age: 1 hour
- Recency Factor: 1 - (1/168) = 0.994
- Score: 100 × 0.994 = 99.4
```

---

## Troubleshooting

### Issue: "Cannot GET /health"
**Solution:** Make sure the server is running. Check console for "Server started on port 3000"

### Issue: No output in Postman
**Possible Causes:**
1. Server not running
   - Run: `node notification-api-server.js`
2. Wrong URL
   - Verify: `http://localhost:3000/...` (not `localhost:PORT`)
3. External API unreachable
   - Check network connectivity to `http://4.224.186.213`
4. Invalid studentId parameter
   - Try default: `?studentId=1042`

### Issue: "Error: Failed to fetch notifications"
**Solution:** 
- Check if `http://4.224.186.213/evaluation-service/notifications` is accessible
- Verify network connection and firewall
- Check server logs for detailed error message

---

## Example cURL Commands

```bash
# Health check
curl -X GET "http://localhost:3000/health"

# Priority inbox
curl -X GET "http://localhost:3000/api/v1/notifications/priority-inbox?studentId=1042&limit=10"

# All notifications
curl -X GET "http://localhost:3000/api/v1/notifications?studentId=1042&limit=20&offset=0"

# Unread count
curl -X GET "http://localhost:3000/api/v1/notifications/count/unread?studentId=1042"
```

---

## Performance Metrics

| Operation | Time | Notes |
|-----------|------|-------|
| Priority calculation (10 notifs) | ~5ms | O(n log n) sorting |
| API call + response | ~50-200ms | Depends on network |
| Total request latency | ~100-300ms | Expected Postman response |

---

## Architecture

```
Postman Client
    ↓ (HTTP GET)
Local Server (port 3000)
    ↓ (axios request)
External API (4.224.186.213)
    ↓ (JSON response)
Priority Calculation
    ↓ (score, sort, limit)
Formatted Response
    ↓ (JSON)
Postman Display
```

---

## Next Steps

1. ✅ Start the server
2. ✅ Test each endpoint in Postman
3. ✅ Verify response formats
4. ✅ Check priority ranking
5. ✅ Monitor console logs for errors

Good luck! 🚀
