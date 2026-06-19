# Stage 6 - Priority Inbox Implementation

## Using the Provided Notification API

**API Endpoint (Provided):**
```
GET http://4.224.186.213/evaluation-service/notifications
```

You are given this API endpoint to fetch notifications. Your task is to:
1. ✅ Fetch notifications from the API
2. ✅ Filter unread notifications
3. ✅ Calculate priority scores
4. ✅ Display top 10 notifications

**You do NOT need to:**
- ❌ Store notifications in a database
- ❌ Create or modify notifications
- ❌ Hard-code notification data

---

## Quick Start

### Option 1: Node.js (JavaScript)

```bash
# Run the script
node fetch-and-rank-notifications.js
```

**Output:**
```
📥 Fetching from: http://4.224.186.213/evaluation-service/notifications?studentId=1042
✓ Retrieved 15 notifications

======================================================================
NOTIFICATION PRIORITY INBOX - Using External API
======================================================================

📊 Summary:
   Total Notifications: 15
   Unread: 12
   Top Displayed: 10

Priority Weights: Placement=100, Result=50, Event=10
Formula: Score = Weight × (1 - Age_Hours/168)

----------------------------------------------------------------------

1. 💼 [Placement] Placement Offer
   Weight: 100 | Score: 99.405
   Message: Congratulations! You have received a placement offer.
   Age: 1.0 hours
   Created: 2026-06-19T12:00:00Z
   Read: No

2. 📊 [Result] Semester Results
   Weight: 50 | Score: 48.512
   Message: Your semester results are now available.
   Age: 5.0 hours
   Created: 2026-06-19T07:00:00Z
   Read: No

...
```

### Option 2: Python 3

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
  timeout: 5000
});
const notifications = response.data;
```

```python
# fetch-and-rank-notifications.py
response = requests.get(API_URL, params={'studentId': '1042'}, timeout=5)
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

### Direct API Test

1. **Create GET request**
   ```
   GET http://4.224.186.213/evaluation-service/notifications
   ```

2. **Add query parameter**
   ```
   Key: studentId
   Value: 1042
   ```

3. **Send request**

4. **Check response**
   - Should return array of notifications
   - Each notification has: id, title, message, type, createdAt, isRead, etc.

### Your Application Should:

1. **Fetch** the data from the API
2. **Filter** for unread notifications
3. **Score** each notification by type weight and recency
4. **Sort** by score (highest first)
5. **Display** top 10

---

## File Structure

```
Campus-Evaluation-BE/
├── fetch-and-rank-notifications.js    ← Use this (Node.js)
├── fetch-and-rank-notifications.py    ← Or this (Python)
├── notification-api-server.js         ← Express wrapper (optional)
├── notification-system-design.md      ← Design documentation
└── POSTMAN_QUICK_START.md            ← Postman guide
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

✅ **Use the API endpoint provided** - Don't create mock data

✅ **Fetch real notifications** - Your script will fetch from the API

✅ **Calculate scores dynamically** - As time passes, scores change

✅ **Display top 10** - Show only the 10 most important

✅ **No database storage needed** - Just fetch and display

---

## Troubleshooting

### ❌ Error: "Cannot find module 'axios'"

**Solution:** Install dependencies
```bash
npm install axios
# or for Python
pip install requests
```

### ❌ Error: "Network error"

**Possible causes:**
- API endpoint is unreachable
- Invalid student ID
- Network connectivity issue

**Solution:** Verify with direct curl/Postman test
```bash
curl "http://4.224.186.213/evaluation-service/notifications?studentId=1042"
```

### ❌ Empty array returned

**Causes:**
- Student ID doesn't exist in the system
- No notifications for this student

**Solution:** Try different student IDs

---

## Testing Different Student IDs

```bash
# Test with default student
node fetch-and-rank-notifications.js

# Test with custom student (if you modify the code)
# Change line: const studentIds = ['1001', '1042', '2050'];
```

---

## Next Steps

1. ✅ Run `node fetch-and-rank-notifications.js`
2. ✅ Verify you get notification output
3. ✅ Check that notifications are ranked by priority
4. ✅ Test in Postman with the API directly
5. ✅ Integrate into your web application

---

## Expected Files in GitHub

All Stage 6 implementation files are in:
https://github.com/Yashaskumar12/ENG23CT0002

```
├── notification-system-design.md          ← Full design doc
├── fetch-and-rank-notifications.js        ← Main implementation
├── fetch-and-rank-notifications.py        ← Python version
├── notification-api-server.js             ← Express wrapper
├── POSTMAN_QUICK_START.md                 ← Postman guide
└── Notification_API_Postman_Collection.json
```

---

**Ready to test? Run:**
```bash
node fetch-and-rank-notifications.js
```

**Good luck! 🚀**
