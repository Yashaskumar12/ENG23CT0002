# Stage 6 - Priority Inbox Implementation

## Using the Provided Notification API

**API Endpoint (Provided):**
```
GET http://4.224.186.213/evaluation-service/notifications
```

**⚠️ Important:** The API requires an **Authorization** header!
```
Authorization: Bearer <YOUR_API_TOKEN>
```

You are given this API endpoint to fetch notifications. Your task is to:
1. ✅ Fetch notifications from the API with proper authorization
2. ✅ Filter unread notifications
3. ✅ Calculate priority scores
4. ✅ Display top 10 notifications

**You do NOT need to:**
- ❌ Store notifications in a database
- ❌ Create or modify notifications
- ❌ Hard-code notification data

---

## Quick Start (2 Options)

### Option A: Using Mock API (For Testing/Demo)

No authorization needed! Perfect for testing the algorithm before integrating with the real API.

**Step 1:** Start the mock API server
```bash
node mock-api-server.js
```

**Expected output:**
```
✓ Mock Notification API running on http://localhost:4000

Endpoint: GET http://localhost:4000/evaluation-service/notifications
  Required headers: Authorization: Bearer <token>
  Required query params: studentId=1042
```

**Step 2:** Run the notification ranking script (in a new terminal)
```bash
node fetch-and-rank-notifications.js
```

**Expected output:**
```
📥 Fetching from: http://localhost:4000/evaluation-service/notifications?studentId=1042
✓ Retrieved 10 notifications

📊 Summary:
   Total Notifications: 10
   Unread: 8
   Top Displayed: 8

Priority Weights: Placement=100, Result=50, Event=10
Formula: Score = Weight × (1 - Age_Hours/168)

1. 💼 [Placement] Placement Offer
   Weight: 100 | Score: 99.404
   Message: Congratulations! You have received a placement offer from Google.
   Age: 1.0 hours
   ...
```

### Option B: Using Real API (With Authorization)

**Step 1:** Set your API token as environment variable
```bash
# On Windows PowerShell
$env:API_TOKEN = "Bearer YOUR_ACTUAL_TOKEN_HERE"

# On Linux/Mac
export API_TOKEN="Bearer YOUR_ACTUAL_TOKEN_HERE"
```

**Step 2:** Edit fetch-and-rank-notifications.js
```javascript
// Change this line:
const USE_MOCK_API = true;

// To this:
const USE_MOCK_API = false;

// Or use the real API directly in code:
const API_URL = 'http://4.224.186.213/evaluation-service/notifications';
```

**Step 3:** Run the script
```bash
node fetch-and-rank-notifications.js
```

---

## Option C: Node.js (JavaScript)

### With Mock API (Default - No Setup Needed)

```bash
# Run the script
node fetch-and-rank-notifications.js
```

**Output:**
```
📥 Fetching from: http://localhost:4000/evaluation-service/notifications?studentId=1042
✓ Retrieved 10 notifications

======================================================================
NOTIFICATION PRIORITY INBOX - Using External API
======================================================================

📊 Summary:
   Total Notifications: 10
   Unread: 8
   Top Displayed: 8

Priority Weights: Placement=100, Result=50, Event=10
Formula: Score = Weight × (1 - Age_Hours/168)

----------------------------------------------------------------------

1. 💼 [Placement] Placement Offer
   Weight: 100 | Score: 99.404
   Message: Congratulations! You have received a placement offer from Google.
   Age: 1.0 hours
   Created: 2026-06-19T05:57:04.359Z
   Read: No

2. 💼 [Placement] Interview Scheduled
   Weight: 100 | Score: 85.713
   Message: Your interview with Microsoft has been scheduled for June 25, 2026.
   Age: 24.0 hours
   ...
```

### Option D: Python 3

```bash
# Run the script
python fetch-and-rank-notifications.py
```

**Same output as above**

---

## How It Works

### Step 1: Fetch from API

```javascript
// fetch-and-rank-notifications.js
const response = await axios.get(API_URL, {
  params: { studentId: '1042' },
  headers: {
    'Authorization': AUTHORIZATION_TOKEN
  },
  timeout: 5000
});
const notifications = response.data;
```

```python
# fetch-and-rank-notifications.py
response = requests.get(API_URL, 
  params={'studentId': '1042'},
  headers={'Authorization': AUTHORIZATION_TOKEN},
  timeout=5
)
notifications = response.json()
```

### Step 2: Calculate Priority Score

```
Score = Type Weight × (1 - Age_Hours / 168)

Where:
- Placement weight: 100
- Result weight: 50
- Event weight: 10
- Age: Hours since notification created
- 168: Hours in a week (recency factor resets after 7 days)

Example:
- Placement notification, 1 hour old
- Weight: 100
- Recency: 1 - (1/168) = 0.994
- Score: 100 × 0.994 = 99.4
```

### Step 3: Sort and Display Top 10

```javascript
scoredNotifications
  .sort((a, b) => b.score - a.score)
  .slice(0, 10)
```

---

## Testing in Postman

### Direct API Test (Real API with Authorization)

1. **Create GET request**
   ```
   GET http://4.224.186.213/evaluation-service/notifications
   ```

2. **Add Headers**
   ```
   Key: Authorization
   Value: Bearer YOUR_API_TOKEN_HERE
   ```

3. **Add query parameter**
   ```
   Key: studentId
   Value: 1042
   ```

4. **Send request**

5. **Check response**
   - Should return array of notifications
   - Each notification has: id, title, message, type, createdAt, isRead, etc.

### Your Application Should:

1. **Fetch** the data from the API (with Authorization header)
2. **Filter** for unread notifications
3. **Score** each notification by type weight and recency
4. **Sort** by score (highest first)
5. **Display** top 10

---

## File Structure

```
Campus-Evaluation-BE/
├── fetch-and-rank-notifications.js    ← Main implementation (Node.js)
├── fetch-and-rank-notifications.py    ← Python version
├── mock-api-server.js                 ← Mock API for testing (no auth needed)
├── notification-api-server.js         ← Express wrapper (optional)
├── notification-system-design.md      ← Design documentation
├── POSTMAN_QUICK_START.md            ← Postman guide
└── Notification_API_Postman_Collection.json
```

---

## Priority Ranking Example

**Notifications Received:**

| # | Type | Title | Age | Weight | Score |
|---|------|-------|-----|--------|-------|
| 1 | Placement | Job Offer | 1 hr | 100 | 99.4 |
| 2 | Result | Exam Score | 5 hrs | 50 | 48.5 |
| 3 | Event | Meeting | 10 hrs | 10 | 9.4 |
| 4 | Placement | Interview | 24 hrs | 100 | 85.7 |

**Top 10 Priority Order:**
1. ✅ Job Offer (Score: 99.4) ← Most recent & highest weight
2. ✅ Interview (Score: 85.7) ← Older but still important
3. ✅ Exam Score (Score: 48.5) ← Medium weight
4. ✅ Meeting (Score: 9.4) ← Low weight

---

## Key Points

✅ **Use the API endpoint provided** - Fetch real notifications

✅ **Add Authorization header** - API requires Bearer token: `Authorization: Bearer <TOKEN>`

✅ **Calculate scores dynamically** - As time passes, scores change

✅ **Display top 10** - Show only the 10 most important

✅ **No database storage needed** - Just fetch and display

✅ **Test with mock API first** - Then integrate with real API

---

## Troubleshooting

### ❌ Error: "Cannot find module 'axios'"

**Solution:** Install dependencies
```bash
npm install axios
# or for Python
pip install requests
```

### ❌ Error: "An authorization header is required"

**Cause:** Using real API without providing Authorization header

**Solution 1 - Use Mock API:**
```bash
# Start mock server (requires no auth)
node mock-api-server.js

# Then run the script (already configured for mock API by default)
node fetch-and-rank-notifications.js
```

**Solution 2 - Use Real API with Token:**
```bash
# Set your API token
$env:API_TOKEN = "Bearer YOUR_TOKEN_HERE"

# Change USE_MOCK_API = false in fetch-and-rank-notifications.js

# Run the script
node fetch-and-rank-notifications.js
```

### ❌ Error: "Cannot reach http://localhost:4000"

**Cause:** Mock server not running

**Solution:** Start the mock server first
```bash
node mock-api-server.js
```

Then in a new terminal:
```bash
node fetch-and-rank-notifications.js
```

### ❌ Empty array returned

**Causes:**
- Student ID doesn't exist in the system
- No notifications for this student
- Wrong authorization token

**Solution:** 
- Try different student IDs
- Verify authorization token is correct
- Check API endpoint is accessible

---

## Testing Different Student IDs

```bash
# Edit the script to add more student IDs
const studentIds = ['1042', '1001', '2050'];

# Then run it
node fetch-and-rank-notifications.js
```

---

## Next Steps

1. ✅ Run with mock API: `node fetch-and-rank-notifications.js`
2. ✅ Verify you get notification output
3. ✅ Check that notifications are ranked by priority
4. ✅ Test in Postman with the real API + Authorization header
5. ✅ Integrate into your web application

---

## Expected Files in GitHub

All Stage 6 implementation files are in:
https://github.com/Yashaskumar12/ENG23CT0002

```
├── notification-system-design.md          ← Full design doc
├── fetch-and-rank-notifications.js        ← Main implementation
├── fetch-and-rank-notifications.py        ← Python version
├── mock-api-server.js                     ← Mock API for testing
├── notification-api-server.js             ← Express wrapper
├── POSTMAN_QUICK_START.md                 ← Postman guide
├── STAGE6_IMPLEMENTATION_GUIDE.md         ← This file
└── Notification_API_Postman_Collection.json
```

---

**Ready to test?**

**For demo (no setup):**
```bash
# Terminal 1
node mock-api-server.js

# Terminal 2 (new terminal)
node fetch-and-rank-notifications.js
```

**For production (with real API):**
```bash
$env:API_TOKEN = "Bearer YOUR_TOKEN"
node fetch-and-rank-notifications.js
```

**Good luck! 🚀**
