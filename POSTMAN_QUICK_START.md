# Notification API - Postman Testing Guide

## ✓ Issue Resolved: "Not getting any output in Postman"

The issue was that there was no local API server wrapping the external API endpoint. Now you have a complete working solution.

---

## Quick Setup (3 Steps)

### Step 1: Install Dependencies
```powershell
cd c:\Users\E.Gagan\Downloads\TrMmYMNgrBSbtanu\__MACOSX\ENG23CT0002\Campus-Evaluation-BE
npm install
```

### Step 2: Start the Server
```powershell
node notification-api-server.js
```

**Expected Output:**
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
```

### Step 3: Test in Postman

**Method 1: Import Collection** (Easiest)
1. Open Postman
2. Click "Import"
3. Select "Notification_API_Postman_Collection.json"
4. All endpoints pre-configured!

**Method 2: Manual Requests**
Copy-paste these URLs into Postman:

1. **Health Check**
   ```
   GET http://localhost:3000/health
   ```

2. **Priority Inbox (Top 10)**
   ```
   GET http://localhost:3000/api/v1/notifications/priority-inbox?studentId=1042&limit=10
   ```

3. **All Notifications**
   ```
   GET http://localhost:3000/api/v1/notifications?studentId=1042&limit=20&offset=0
   ```

4. **Unread Count**
   ```
   GET http://localhost:3000/api/v1/notifications/count/unread?studentId=1042
   ```

---

## Architecture

```
┌─────────────┐
│   Postman   │  (Your Test Client)
└──────┬──────┘
       │ HTTP GET
       ▼
┌─────────────────────────────┐
│ Local Express Server        │  ← notification-api-server.js
│ Port 3000                   │
├─────────────────────────────┤
│ • Receives Postman requests │
│ • Calls external API        │
│ • Processes priorities      │
│ • Formats response          │
└──────┬──────────────────────┘
       │ axios HTTP GET
       ▼
┌────────────────────────────────┐
│ External API                   │
│ 4.224.186.213:80/evaluation-   │
│ service/notifications          │
└────────────────────────────────┘
```

---

## Expected Postman Output Examples

### Priority Inbox Response
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

### Unread Count Response
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

## Key Features of This Implementation

✅ **Connects to External API**: Wraps the external endpoint `http://4.224.186.213/evaluation-service/notifications`

✅ **Priority Ranking**: Scores notifications by type weight and recency

✅ **Multiple Endpoints**:
- Priority Inbox (top N notifications)
- All notifications (paginated)
- Unread count

✅ **Error Handling**: Gracefully handles connection errors and missing data

✅ **Formatted Responses**: Clean, consistent JSON structure

✅ **Query Parameters**: Customizable student ID, limit, and offset

---

## Priority Scoring Algorithm

```
Score = Type Weight × (1 - Age_Hours / 168)

Type Weights:
├─ Placement: 100  (Most important)
├─ Result:    50   (Medium priority)
└─ Event:     10   (Low priority)

Recency Factor:
├─ 0 hours old: 1.0 × weight = max score
├─ 168 hours (7 days) old: 0.0 × weight = min score
└─ Example: Placement 1 hour old = 100 × 0.994 = 99.4
```

---

## Troubleshooting

### ❌ "Cannot connect to localhost:3000"
**Solution:** Make sure the server is running
```powershell
node notification-api-server.js
```

### ❌ "No response from external API"
**Solution:** Check if the external API is accessible
```powershell
Invoke-WebRequest -Uri "http://4.224.186.213/evaluation-service/notifications?studentId=1042"
```

### ❌ Empty notifications array
**Possible Causes:**
- Student ID doesn't exist in the external API
- Try different studentId: 1001, 1042, 2050, etc.
- Check server logs for error messages

### ❌ "Module not found: express"
**Solution:** Install dependencies
```powershell
npm install
```

---

## Testing Checklist

- [ ] Start server with `node notification-api-server.js`
- [ ] See "Server started on port 3000" message
- [ ] Open Postman
- [ ] Test `/health` endpoint
- [ ] Test `/api/v1/notifications/priority-inbox` with studentId=1042
- [ ] Verify response contains notifications array
- [ ] Check that notifications are sorted by priority score
- [ ] Test with different studentId values
- [ ] Test pagination with different offset values

---

## Files Included

```
Campus-Evaluation-BE/
├── notification-api-server.js          ← Main server (Node.js)
├── notification-api-server.ts          ← TypeScript version
├── package.json                         ← Dependencies config
├── test-api.js                          ← Automated API tests
├── POSTMAN_SETUP.md                     ← Detailed Postman guide
├── Notification_API_Postman_Collection.json ← Import this in Postman
├── stage6-priority-inbox.py             ← Python implementation
├── stage6-priority-inbox.ts             ← TypeScript implementation
└── notification-system-design.md        ← Full system design doc
```

---

## Next Steps

1. ✅ Run the server
2. ✅ Import Postman collection
3. ✅ Test each endpoint
4. ✅ Verify priority ranking works
5. ✅ Monitor console for errors
6. ✅ Try with different student IDs

---

**You now have a fully working Notification API that can be tested in Postman! 🎉**

