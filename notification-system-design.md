# Notification System Design

## Stage 1

### Core Actions for Notification Platform

The notification platform should support the following core actions:
1. **Create Notification** - Send new notifications to users
2. **Retrieve Notifications** - Fetch notifications for a user
3. **Mark as Read** - Update notification read status
4. **Delete Notification** - Remove notifications
5. **Get Notification Count** - Fetch unread notification count
6. **Real-time Subscription** - Subscribe to real-time notification updates

### REST API Endpoints

#### 1. Create Notification
**Endpoint:** `POST /api/v1/notifications`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "userId": "user_123",
  "title": "Evaluation Reminder",
  "message": "Your course evaluation is pending",
  "type": "evaluation",
  "priority": "high",
  "actionUrl": "/evaluations/123",
  "metadata": {
    "courseId": "CS101",
    "deadline": "2026-06-25T23:59:59Z"
  }
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "success": true,
  "data": {
    "id": "notif_456",
    "userId": "user_123",
    "title": "Evaluation Reminder",
    "message": "Your course evaluation is pending",
    "type": "evaluation",
    "priority": "high",
    "actionUrl": "/evaluations/123",
    "isRead": false,
    "createdAt": "2026-06-19T10:30:00Z",
    "metadata": {
      "courseId": "CS101",
      "deadline": "2026-06-25T23:59:59Z"
    }
  }
}
```

#### 2. Get User Notifications
**Endpoint:** `GET /api/v1/notifications?userId={userId}&limit=20&offset=0&filter=all`

**Request Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Query Parameters:**
- `userId` (required): User ID
- `limit` (optional): Number of notifications to fetch (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `filter` (optional): "all", "unread", "read" (default: "all")

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_456",
        "userId": "user_123",
        "title": "Evaluation Reminder",
        "message": "Your course evaluation is pending",
        "type": "evaluation",
        "priority": "high",
        "isRead": false,
        "createdAt": "2026-06-19T10:30:00Z",
        "actionUrl": "/evaluations/123"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

#### 3. Mark Notification as Read
**Endpoint:** `PATCH /api/v1/notifications/{notificationId}/read`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "isRead": true
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "id": "notif_456",
    "isRead": true,
    "updatedAt": "2026-06-19T10:35:00Z"
  }
}
```

#### 4. Bulk Mark Notifications as Read
**Endpoint:** `PATCH /api/v1/notifications/read/bulk`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "notificationIds": ["notif_456", "notif_457", "notif_458"],
  "isRead": true
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "updated": 3,
    "failed": 0
  }
}
```

#### 5. Delete Notification
**Endpoint:** `DELETE /api/v1/notifications/{notificationId}`

**Request Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "id": "notif_456",
    "deletedAt": "2026-06-19T10:40:00Z"
  }
}
```

#### 6. Get Unread Notification Count
**Endpoint:** `GET /api/v1/notifications/count/unread`

**Request Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Query Parameters:**
- `userId` (required): User ID

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "userId": "user_123",
    "unreadCount": 12,
    "lastFetchedAt": "2026-06-19T10:45:00Z"
  }
}
```

#### 7. Delete Multiple Notifications
**Endpoint:** `DELETE /api/v1/notifications/bulk`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body:**
```json
{
  "notificationIds": ["notif_456", "notif_457"],
  "userId": "user_123"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "deleted": 2,
    "failed": 0
  }
}
```

### Real-Time Notifications

**WebSocket Endpoint:** `wss://api.example.com/notifications/stream`

**Connection Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Subscribe Message:**
```json
{
  "action": "subscribe",
  "userId": "user_123",
  "channels": ["notifications"]
}
```

**Notification Push (Server to Client):**
```json
{
  "type": "notification.new",
  "data": {
    "id": "notif_789",
    "userId": "user_123",
    "title": "New Message",
    "message": "You have a new course update",
    "priority": "medium",
    "createdAt": "2026-06-19T11:00:00Z"
  },
  "timestamp": "2026-06-19T11:00:00Z"
}
```

### JSON Schema Definitions

**Notification Object:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique notification identifier"
    },
    "userId": {
      "type": "string",
      "description": "User ID who receives the notification"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Notification title"
    },
    "message": {
      "type": "string",
      "minLength": 1,
      "maxLength": 1000,
      "description": "Notification message content"
    },
    "type": {
      "type": "string",
      "enum": ["evaluation", "alert", "reminder", "message", "system"],
      "description": "Type of notification"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high", "critical"],
      "description": "Priority level of notification"
    },
    "isRead": {
      "type": "boolean",
      "description": "Whether notification has been read"
    },
    "actionUrl": {
      "type": "string",
      "format": "uri",
      "description": "URL for action associated with notification"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp when notification was created"
    },
    "readAt": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp when notification was marked as read"
    },
    "metadata": {
      "type": "object",
      "description": "Additional notification metadata"
    }
  },
  "required": ["id", "userId", "title", "message", "type", "priority", "isRead", "createdAt"]
}
```

---

## Stage 2

### Database Selection

**Recommended: PostgreSQL (Relational Database)**

**Rationale:**
- ACID compliance ensures data consistency for notification state
- Strong relational structure with foreign keys for user-notification relationships
- Excellent for transactional operations and complex queries
- Efficient indexing on userId and timestamps for fast retrieval
- Cost-effective and open-source
- Built-in JSON support for metadata storage
- Full-text search capabilities for notification content search

### Database Schema

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_is_read (is_read),
  INDEX idx_user_created (user_id, created_at DESC)
);

CREATE TABLE notification_preferences (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  notify_evaluation BOOLEAN DEFAULT TRUE,
  notify_alert BOOLEAN DEFAULT TRUE,
  notify_reminder BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notification_read_tracking (
  id VARCHAR(255) PRIMARY KEY,
  notification_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  read_at TIMESTAMP NOT NULL,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notification_id (notification_id),
  INDEX idx_user_id (user_id)
);

CREATE TABLE audit_log (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  notification_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC)
);
```

### Data Growth Problems and Solutions

**Problem 1: Table Size Growth**
- As notifications accumulate, the main table grows significantly
- Solution: Archive old notifications to a separate table or storage after 90 days
- Create partitions based on creation date for faster queries

**Problem 2: Query Performance Degradation**
- Multiple users querying notifications simultaneously
- Solution: Implement proper indexing on (user_id, created_at)
- Use connection pooling (PgBouncer)
- Implement caching layer (Redis) for unread counts

**Problem 3: Storage Space**
- JSONB metadata field grows large over time
- Solution: Compress old notification data or move to cold storage
- Set up automatic cleanup policies

**Problem 4: Concurrent Read/Write Operations**
- High load during peak hours
- Solution: Read replicas for scaling read operations
- Write operations go to primary node

### Queries

**1. Create Notification**
```sql
INSERT INTO notifications (
  id, user_id, title, message, type, priority, is_read, action_url, metadata, created_at
) VALUES (
  $1, $2, $3, $4, $5, $6, FALSE, $7, $8, CURRENT_TIMESTAMP
) RETURNING id, user_id, title, message, type, priority, is_read, created_at, action_url, metadata;
```

**2. Get User Notifications**
```sql
SELECT id, user_id, title, message, type, priority, is_read, action_url, created_at 
FROM notifications 
WHERE user_id = $1 AND deleted_at IS NULL 
ORDER BY created_at DESC 
LIMIT $2 OFFSET $3;
```

**3. Get Unread Notifications Count**
```sql
SELECT COUNT(*) as unread_count 
FROM notifications 
WHERE user_id = $1 AND is_read = FALSE AND deleted_at IS NULL;
```

**4. Mark Single Notification as Read**
```sql
UPDATE notifications 
SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
WHERE id = $1 AND user_id = $2 
RETURNING id, is_read, read_at;
```

**5. Mark Multiple Notifications as Read**
```sql
UPDATE notifications 
SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
WHERE id = ANY($1::text[]) AND user_id = $2 AND deleted_at IS NULL 
RETURNING id;
```

**6. Delete Notification (Soft Delete)**
```sql
UPDATE notifications 
SET deleted_at = CURRENT_TIMESTAMP 
WHERE id = $1 AND user_id = $2 
RETURNING id, deleted_at;
```

**7. Bulk Delete Notifications**
```sql
UPDATE notifications 
SET deleted_at = CURRENT_TIMESTAMP 
WHERE id = ANY($1::text[]) AND user_id = $2 AND deleted_at IS NULL 
RETURNING id;
```

**8. Filter Notifications by Type and Priority**
```sql
SELECT id, user_id, title, message, type, priority, is_read, created_at 
FROM notifications 
WHERE user_id = $1 
  AND type = $2 
  AND priority = $3 
  AND deleted_at IS NULL 
ORDER BY created_at DESC 
LIMIT $4;
```

**9. Get User Notification Preferences**
```sql
SELECT user_id, email_enabled, push_enabled, sms_enabled, 
       notify_evaluation, notify_alert, notify_reminder, 
       quiet_hours_start, quiet_hours_end 
FROM notification_preferences 
WHERE user_id = $1;
```

**10. Update Notification Preferences**
```sql
UPDATE notification_preferences 
SET email_enabled = $1, 
    push_enabled = $2, 
    sms_enabled = $3, 
    notify_evaluation = $4, 
    notify_alert = $5, 
    notify_reminder = $6, 
    updated_at = CURRENT_TIMESTAMP 
WHERE user_id = $7 
RETURNING user_id, email_enabled, push_enabled, sms_enabled;
```

**11. Archive Old Notifications (Data Cleanup)**
```sql
INSERT INTO notifications_archive 
SELECT * FROM notifications 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';

DELETE FROM notifications 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
```

**12. Get Notifications by Date Range**
```sql
SELECT id, user_id, title, message, type, priority, is_read, created_at 
FROM notifications 
WHERE user_id = $1 
  AND created_at BETWEEN $2 AND $3 
  AND deleted_at IS NULL 
ORDER BY created_at DESC;
```

**13. Search Notifications by Content**
```sql
SELECT id, user_id, title, message, type, priority, created_at 
FROM notifications 
WHERE user_id = $1 
  AND (title ILIKE '%' || $2 || '%' OR message ILIKE '%' || $2 || '%')
  AND deleted_at IS NULL 
ORDER BY created_at DESC 
LIMIT $3;
```

**14. Get Notification Statistics**
```sql
SELECT 
  type,
  priority,
  COUNT(*) as total_count,
  SUM(CASE WHEN is_read = TRUE THEN 1 ELSE 0 END) as read_count,
  SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread_count
FROM notifications 
WHERE user_id = $1 AND deleted_at IS NULL 
GROUP BY type, priority;
```

**15. Get Most Recent Unread Notifications**
```sql
SELECT id, user_id, title, message, type, priority, created_at 
FROM notifications 
WHERE user_id = $1 
  AND is_read = FALSE 
  AND deleted_at IS NULL 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Stage 3

### Query Analysis and Optimization

**Original Query:**
```sql
SELECT * FROM notifications 
WHERE student_id = 1042 AND is_read = false 
ORDER BY created_at DESC;
```

**Context:** Database with 50,000 students and 5,000,000 notifications.

### Is This Query Accurate?

**Yes**, the query is functionally accurate. It correctly retrieves all unread notifications for student 1042 ordered by most recent first. However, accuracy alone doesn't address performance issues.

### Why Is This Query Slow?

**Primary Issues:**

1. **Missing Indexes:** Without indexes on `student_id` and `is_read`, the database performs a full table scan across 5,000,000 rows for every query.

2. **SELECT * (Anti-pattern):** Fetching all columns including large text fields (metadata, message) when only essential fields are needed increases I/O.

3. **No Composite Index:** The query filters on two columns (`student_id` AND `is_read`). A composite index would be more efficient than individual indexes.

4. **Database Scans:** With 5M rows, even with indexes, performance degrades due to the sheer volume of unread notifications per student.

**Estimated Performance:**
- Full table scan: ~500ms - 2 seconds
- With proper indexes: ~10-50ms

### Optimized Query

```sql
SELECT id, student_id, title, message, type, priority, created_at, action_url 
FROM notifications 
WHERE student_id = $1 AND is_read = FALSE AND deleted_at IS NULL 
ORDER BY created_at DESC 
LIMIT 20;
```

### Changes and Computation Cost

**Changes Made:**

| Change | Impact | Computation Cost |
|--------|--------|------------------|
| Add composite index on (student_id, is_read, created_at) | Enables index-based filtering and sorting | O(log n) lookup instead of O(n) full scan |
| Use SELECT specific columns instead of SELECT * | Reduces data transfer overhead | 70-80% reduction in data fetched |
| Add LIMIT clause | Prevents loading entire result set | Dramatically reduces memory usage |
| Add deleted_at IS NULL filter | Enables soft delete consistency | Negligible with proper indexing |

**Computation Costs (Estimated):**
- Full table scan (original): O(n) = ~2 seconds for 5M rows
- With composite index (optimized): O(log n) = ~10-50ms

### Index Strategy Evaluation

**Suggestion: "Add indexes on every column"**

**Is this effective? NO**

**Why?**
- Creates excessive index overhead (5-7x storage increase)
- Slows down INSERT/UPDATE operations (index maintenance cost)
- Query planner becomes confused with too many index choices
- Most columns are rarely used in WHERE clauses

**Effective Index Strategy:**

1. **Composite Index (Primary):**
   ```sql
   CREATE INDEX idx_student_unread_created 
   ON notifications(student_id, is_read DESC, created_at DESC)
   WHERE deleted_at IS NULL;
   ```

2. **Type + Priority Index (Secondary):**
   ```sql
   CREATE INDEX idx_student_type_priority 
   ON notifications(student_id, notification_type, priority, created_at DESC)
   WHERE deleted_at IS NULL AND is_read = FALSE;
   ```

3. **Avoid:**
   - Individual indexes on low-cardinality columns (is_read has only 2 values)
   - Indexes on columns never used in WHERE/ORDER BY/JOIN clauses

### Query to Find Students with Placement Notifications (Last 7 Days)

**Requirement:** Find all students who got a placement notification in the last 7 days.

**Notification Types:** "Event", "Result", "Placement"

```sql
SELECT DISTINCT n.student_id, u.name, u.email
FROM notifications n
INNER JOIN users u ON n.student_id = u.id
WHERE n.notification_type = 'Placement'
  AND n.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
  AND n.deleted_at IS NULL
ORDER BY n.created_at DESC;
```

**Alternative: With Notification Details**

```sql
SELECT DISTINCT 
  n.student_id, 
  u.name, 
  u.email,
  n.id as notification_id,
  n.title,
  n.message,
  n.created_at
FROM notifications n
INNER JOIN users u ON n.student_id = u.id
WHERE n.notification_type = 'Placement'
  AND n.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
  AND n.deleted_at IS NULL
ORDER BY n.student_id, n.created_at DESC;
```

**Alternative: Count Placement Notifications per Student**

```sql
SELECT 
  n.student_id,
  u.name,
  u.email,
  COUNT(n.id) as placement_notification_count,
  MAX(n.created_at) as latest_notification
FROM notifications n
INNER JOIN users u ON n.student_id = u.id
WHERE n.notification_type = 'Placement'
  AND n.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
  AND n.deleted_at IS NULL
GROUP BY n.student_id, u.name, u.email
ORDER BY COUNT(n.id) DESC;
```

---

## Stage 4

### Performance Optimization Strategies

**Problem:** Notifications are fetched on every page load for every student. The database is overwhelmed, causing degraded user experience.

### Solution 1: Redis Caching Layer

**Implementation:**

Cache unread notification metadata in Redis with TTL.

```sql
CACHE_KEY = "user:{student_id}:unread_notifications"
CACHE_TTL = 300 seconds (5 minutes)

On request:
1. Check Redis cache
2. If hit, return cached data
3. If miss, query database and cache result
4. On notification creation/update, invalidate cache
```

**Tradeoffs:**
- **Pros:** Eliminates repeated database queries, reduces load by 80-90%
- **Cons:** Slight data staleness (5-min delay), additional infrastructure needed, cache invalidation complexity

**Computation Cost:** O(1) lookup vs O(log n) database query

---

### Solution 2: Database Connection Pooling & Read Replicas

**Implementation:**

Use PgBouncer for connection pooling and configure read replicas for read operations.

```
Primary Database (Writes)
  ↓ (Replication)
Read Replica 1, Replica 2, Replica 3
  ↑
PgBouncer (Connection Pool)
  ↑
Application Servers
```

**Tradeoffs:**
- **Pros:** Scales read operations horizontally, reduces connection overhead, improves concurrent user handling
- **Cons:** Replication lag (eventual consistency), increased infrastructure cost, adds operational complexity

**Computation Cost:** Reduces concurrent query bottleneck from 1 to N servers

---

### Solution 3: Notification Pagination with Lazy Loading

**Implementation:**

Fetch notifications in batches instead of all at once. Load more on user scroll.

```javascript
Initial Load: Fetch 10 recent notifications
Scroll Event: Fetch next 10
API: GET /api/v1/notifications?student_id=1042&limit=10&offset=0
```

**Tradeoffs:**
- **Pros:** Reduces initial load time, improves perceived performance, lower memory usage
- **Cons:** Multiple API calls required, requires frontend logic changes, slightly delayed access to older notifications

**Computation Cost:** O(log n) per batch instead of O(n) for all

---

### Solution 4: Message Queue (Kafka/RabbitMQ) with Asynchronous Notification Processing

**Implementation:**

Decouple notification fetching from page load using async processing.

```
User Action → Enqueue Fetch Job → Return Immediately (200 OK)
Worker Pool → Process Fetch Job → Store in Cache
WebSocket/Poll → Client Receives Notifications
```

**Tradeoffs:**
- **Pros:** Page load no longer blocked by notification query, better scalability, resilient to database slowdowns
- **Cons:** Increased architectural complexity, data not immediately available, requires message broker, eventual consistency model

**Computation Cost:** Distributes load across worker pool

---

### Solution 5: Database Partitioning (Time-Based)

**Implementation:**

Partition notifications table by creation date. Queries scan only relevant partitions.

```sql
CREATE TABLE notifications_2026_q2 PARTITION OF notifications
  FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

CREATE TABLE notifications_2026_q1 PARTITION OF notifications
  FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
```

**Tradeoffs:**
- **Pros:** Faster queries on recent data (where most queries occur), easier archiving/deletion of old data, better index performance
- **Cons:** Complex maintenance, increased operational overhead, limited to time-based access patterns

**Computation Cost:** O(log n) on partition subset instead of full table

---

### Solution 6: Pre-computed Notification Count Cache

**Implementation:**

Maintain a separate table with precomputed unread counts per student, updated asynchronously.

```sql
CREATE TABLE notification_count_cache (
  student_id VARCHAR(255) PRIMARY KEY,
  unread_count INT,
  last_updated TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id)
);

UPDATE notification_count_cache
SET unread_count = (
  SELECT COUNT(*) FROM notifications 
  WHERE student_id = $1 AND is_read = FALSE
),
last_updated = CURRENT_TIMESTAMP
WHERE student_id = $1;
```

**Tradeoffs:**
- **Pros:** O(1) count queries, eliminates expensive COUNT operations, very fast for count-only requests
- **Cons:** Additional table maintenance overhead, stale counts possible, extra storage needed

**Computation Cost:** O(1) vs O(n) COUNT operation

---

### Recommended Architecture (Hybrid Approach)

For the Campus Evaluation system with 50,000 students:

1. **Immediate (High Priority):**
   - Implement Redis caching for unread notification counts (5-min TTL)
   - Add composite index: (student_id, is_read, created_at)
   - Implement pagination with limit=10, load more on scroll

2. **Short-term (1-2 weeks):**
   - Set up read replicas for database
   - Implement PgBouncer connection pooling
   - Add application-level request batching

3. **Medium-term (1-2 months):**
   - Implement database partitioning by date
   - Add pre-computed count cache table
   - Set up monitoring/alerting for slow queries

4. **Long-term (Infrastructure):**
   - Evaluate message queue for true async processing
   - Consider ElasticSearch for full-text notification search
   - Implement CDN for static notification templates

**Expected Performance Improvements:**
- Initial page load: 2-3s → 200-300ms (10x improvement)
- Database CPU: 85% → 15% (5.6x reduction)
- Concurrent users supported: 100 → 1000+

---

## Stage 5

### Bulk Notification Distribution - Reliability & Architecture

**Scenario:** Placement season - HR clicks "Notify All" to send email and in-app notifications to 50,000 students simultaneously.

**Problem with Naive Implementation:**

```
function notify_all(student_ids, message):
  for student_id in student_ids:
    send_email(student_id, message)
    save_to_db(student_id, message)
    push_to_app(student_id, message)
```

**Shortcomings:**

1. **No Fault Tolerance:** If `send_email` fails at student #200, the process stops. Students #201-50,000 don't get notified.

2. **No Retry Logic:** Failed operations (temporary network errors) are lost permanently. No automatic recovery.

3. **Synchronous Blocking:** All 50,000 students must wait sequentially. With ~500ms per student, total time = ~6-7 hours.

4. **Partial Failure Risk:** Email service crashes midway, leaving inconsistent state (DB has records, but emails never sent).

5. **Single Point of Failure:** If the entire process crashes, no way to resume from checkpoint. Must restart manually.

6. **No Transaction Support:** DB and email are separate operations. Email succeeds but DB insert fails (or vice versa), creating data inconsistency.

7. **No Monitoring/Alerting:** No visibility into which students succeeded/failed. No metrics to track success rate.

### Redesigned Architecture - Reliable & Fast

**Solution: Asynchronous Processing with Message Queue**

```
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Notify All"                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│ Create Notification Job              │
│ - Save to database with PENDING      │
│ - Return 202 Accepted (async)        │
└──────────────────┬───────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  Message Queue  │
         │   (RabbitMQ)    │
         └────────┬────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
  Worker 1   Worker 2   Worker 3
  (100 tasks) (100 tasks) (50 tasks)
  ┌─────────┬──────────┬───────────┐
  │ Send    │ Save to  │ Push to   │
  │ Email   │ DB       │ App       │
  │ + Retry │ + Atomic │ + Retry   │
  └────┬────┴──────────┴─────┬─────┘
       │                     │
       └─────────┬───────────┘
                 │
         ┌───────▼────────┐
         │ Update Status  │
         │ (Success/Fail) │
         └────────────────┘
```

**Key Design Principles:**

1. **Idempotent Operations:** Each notification send includes a unique ID. If a retry happens, the system detects it's duplicate and skips.

2. **Atomic Database Operations:** Email and DB save happen together in a transaction, or both rollback. No partial states.

3. **Automatic Retry with Exponential Backoff:**
   - Retry 1: Wait 5 seconds
   - Retry 2: Wait 25 seconds
   - Retry 3: Wait 125 seconds
   - Max 3 retries, then mark as failed

4. **Distributed Processing:** Multiple workers process notifications in parallel (10-50x speedup).

5. **Persistent State:** Every step is logged. If system crashes, resume from last checkpoint.

6. **Dead Letter Queue:** Failed tasks (after retries) go to DLQ for manual review.

### Implementation Pseudocode

```javascript
function initiateBulkNotification(studentIds, message) {
  const jobId = generateUniqueId();
  
  saveJobToDB({
    id: jobId,
    status: "INITIATED",
    totalCount: studentIds.length,
    processedCount: 0,
    failedCount: 0,
    createdAt: now()
  });
  
  enqueueJob({
    jobId: jobId,
    studentIds: studentIds,
    message: message
  });
  
  return {
    jobId: jobId,
    status: "ACCEPTED",
    message: "Notifications will be sent shortly"
  };
}

function processNotificationJob(jobId, studentIds, message) {
  for (const studentId of studentIds) {
    const notificationId = generateUniqueId();
    enqueueTask({
      jobId: jobId,
      notificationId: notificationId,
      studentId: studentId,
      message: message,
      retryCount: 0,
      maxRetries: 3,
      lastError: null
    });
  }
  
  updateJobStatus(jobId, "QUEUED");
}

function sendNotificationToStudent(task) {
  try {
    const transaction = beginTransaction();
    
    try {
      saveNotificationToDB({
        id: task.notificationId,
        studentId: task.studentId,
        message: task.message,
        sentViaEmail: false,
        sentViaApp: false,
        createdAt: now()
      }, transaction);
      
      sendEmail(task.studentId, task.message);
      
      updateNotificationDB({
        id: task.notificationId,
        sentViaEmail: true
      }, transaction);
      
      pushToApp(task.studentId, task.message);
      
      updateNotificationDB({
        id: task.notificationId,
        sentViaApp: true
      }, transaction);
      
      transaction.commit();
      
      updateJobProgress(task.jobId, "SUCCESS");
      
    } catch (error) {
      transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    if (task.retryCount < task.maxRetries) {
      task.retryCount++;
      task.lastError = error.message;
      
      const delay = calculateBackoff(task.retryCount);
      requeueTask(task, delay);
      
    } else {
      updateJobProgress(task.jobId, "FAILED");
      sendToDeadLetterQueue({
        task: task,
        finalError: error.message,
        attempts: task.retryCount
      });
      
      alertAdministrator({
        jobId: task.jobId,
        studentId: task.studentId,
        reason: "Max retries exceeded"
      });
    }
  }
}

function calculateBackoff(retryCount) {
  const baseDelay = 5000;
  return baseDelay * Math.pow(5, retryCount - 1);
}
```

### Key Improvements

| Aspect | Naive | Improved |
|--------|-------|----------|
| **Time to send 50k** | 6-7 hours (sequential) | 10-15 minutes (parallel) |
| **Fault tolerance** | Single failure = restart | Auto-retry with backoff |
| **Consistency** | Partial states possible | Atomic (all or nothing) |
| **Visibility** | None | Full audit trail & metrics |
| **Scalability** | Limited to 1 server | Distributes across workers |
| **Data integrity** | Lost if crash | Recoverable from DB |

### Database Changes

```sql
CREATE TABLE notification_jobs (
  id VARCHAR(255) PRIMARY KEY,
  status VARCHAR(50) NOT NULL,
  total_count INT NOT NULL,
  processed_count INT DEFAULT 0,
  successful_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_tasks (
  id VARCHAR(255) PRIMARY KEY,
  job_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  retry_count INT DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES notification_jobs(id)
);

CREATE TABLE notification_dead_letter_queue (
  id VARCHAR(255) PRIMARY KEY,
  task_id VARCHAR(255) NOT NULL,
  job_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(255) NOT NULL,
  final_error TEXT,
  total_attempts INT,
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Stage 6

### Priority Inbox Implementation

**Requirement:** Display top 10 most important unread notifications based on weight and recency.

**Priority Formula:**
- **Placement:** Weight = 100
- **Result:** Weight = 50
- **Event:** Weight = 10

**Recency Score:** Score decreases over time (recent notifications score higher)

**Overall Score = Type Weight × (1 - (Age in Hours / 168))**

The notification API endpoint: `http://4.224.186.213/evaluation-service/notifications`

### Implementation (TypeScript)

```typescript
import axios from 'axios';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'Placement' | 'Result' | 'Event';
  createdAt: string;
  isRead: boolean;
}

interface ScoredNotification extends Notification {
  score: number;
  ageHours: number;
}

const TYPE_WEIGHTS: Record<string, number> = {
  'Placement': 100,
  'Result': 50,
  'Event': 10
};

function calculateAge(createdAt: string): number {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  return diffMs / (1000 * 60 * 60);
}

function calculateScore(notification: Notification): number {
  const weight = TYPE_WEIGHTS[notification.type] || 0;
  const ageHours = calculateAge(notification.createdAt);
  
  const recencyFactor = Math.max(0, 1 - (ageHours / 168));
  
  return weight * recencyFactor;
}

async function getTopNotifications(
  studentId: string,
  limit: number = 10
): Promise<ScoredNotification[]> {
  const apiUrl = 'http://4.224.186.213/evaluation-service/notifications';
  
  const response = await axios.get(apiUrl, {
    params: {
      studentId: studentId
    }
  });
  
  const notifications: Notification[] = response.data;
  
  const unreadNotifications = notifications.filter(n => !n.isRead);
  
  const scoredNotifications: ScoredNotification[] = unreadNotifications.map(notif => ({
    ...notif,
    score: calculateScore(notif),
    ageHours: calculateAge(notif.createdAt)
  }));
  
  scoredNotifications.sort((a, b) => b.score - a.score);
  
  return scoredNotifications.slice(0, limit);
}

function formatNotificationForDisplay(notification: ScoredNotification): string {
  return `[${notification.type}] ${notification.title} (Score: ${notification.score.toFixed(2)})`;
}

async function main() {
  const studentId = '1042';
  
  const topNotifications = await getTopNotifications(studentId, 10);
  
  console.log('=== Priority Inbox ===\n');
  topNotifications.forEach((notif, index) => {
    console.log(`${index + 1}. ${formatNotificationForDisplay(notif)}`);
    console.log(`   Message: ${notif.message}`);
    console.log(`   Age: ${notif.ageHours.toFixed(1)} hours`);
    console.log();
  });
}

main().catch(console.error);
```

### Efficient Maintenance Strategy

**Problem:** New notifications arrive constantly. Maintaining top 10 efficiently is critical.

**Solution 1: Redis Sorted Set (Recommended)**

```typescript
import redis from 'redis';

const client = redis.createClient();

async function updatePriorityInbox(notification: Notification) {
  const score = calculateScore(notification);
  
  const cacheKey = `priority_inbox:${notification.studentId}`;
  
  await client.zAdd(cacheKey, {
    score: score,
    value: notification.id
  });
  
  const count = await client.zCard(cacheKey);
  if (count > 10) {
    await client.zRemRangeByRank(cacheKey, 0, count - 11);
  }
  
  await client.expire(cacheKey, 3600);
}

async function getTopNotificationsFromCache(studentId: string): Promise<string[]> {
  const cacheKey = `priority_inbox:${studentId}`;
  
  const notificationIds = await client.zRange(cacheKey, 0, 9, {
    byScore: false,
    rev: true
  });
  
  return notificationIds;
}
```

**Time Complexity:**
- Add notification: O(log 10) = O(1)
- Get top 10: O(log n + 10) = O(1)
- Trim to 10: O(1)

**Solution 2: Heap Data Structure (Alternative)**

```typescript
import PriorityQueue from 'js-priority-queue';

class PriorityInbox {
  private heap: PriorityQueue<ScoredNotification>;
  private maxSize: number = 10;
  
  constructor() {
    this.heap = new PriorityQueue({
      comparator: (a, b) => b.score - a.score
    });
  }
  
  addNotification(notification: ScoredNotification) {
    this.heap.queue(notification);
    
    if (this.heap.length > this.maxSize) {
      this.heap.dequeue();
    }
  }
  
  getTop10(): ScoredNotification[] {
    return [...this.heap.toArray()];
  }
}
```

**Time Complexity:**
- Add: O(log 10) = O(1)
- Get top: O(10) = O(1)

### Score Recalculation

**Problem:** As time passes, scores change. A notification from 1 week ago gets lower score.

**Solution: Lazy Recalculation**

```typescript
async function getTopNotificationsWithRefresh(
  studentId: string,
  limit: number = 10
): Promise<ScoredNotification[]> {
  const cacheKey = `priority_inbox:${studentId}`;
  
  const cachedIds = await client.zRange(cacheKey, 0, -1, { rev: true });
  
  const notificationsData = await Promise.all(
    cachedIds.map(id => getNotificationFromDB(id))
  );
  
  const rescored = notificationsData.map(notif => ({
    ...notif,
    score: calculateScore(notif),
    ageHours: calculateAge(notif.createdAt)
  }));
  
  rescored.sort((a, b) => b.score - a.score);
  
  return rescored.slice(0, limit);
}
```

**Frequency:** Recalculate every 1 hour or on user request (whichever is less frequent)

### API Endpoint

```typescript
import express from 'express';

const app = express();

app.get('/api/v1/notifications/priority-inbox/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    
    const topNotifications = await getTopNotificationsWithRefresh(studentId, limit);
    
    res.json({
      statusCode: 200,
      success: true,
      data: {
        totalCount: topNotifications.length,
        notifications: topNotifications.map(notif => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          score: parseFloat(notif.score.toFixed(2)),
          ageHours: parseFloat(notif.ageHours.toFixed(1)),
          createdAt: notif.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: (error as Error).message
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Using the Provided Notification API

**External API Endpoint:**
```
GET http://4.224.186.213/evaluation-service/notifications
```

**Note:** You are provided with this API endpoint to fetch notifications. Do NOT store them in a database or create notifications yourself. Simply fetch from this API, calculate priorities, and display them.

#### Step 1: Fetch Notifications from API

```typescript
import axios from 'axios';

const API_URL = 'http://4.224.186.213/evaluation-service/notifications';

async function fetchNotificationsFromAPI(studentId: string): Promise<Notification[]> {
  try {
    const response = await axios.get(API_URL, {
      params: {
        studentId: studentId
      },
      timeout: 5000
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications from API:', error);
    return [];
  }
}
```

#### Step 2: Calculate Priority Scores

```typescript
function scoredNotifications(notifications: Notification[]): ScoredNotification[] {
  return notifications
    .filter(n => !n.isRead)
    .map(n => ({
      ...n,
      score: calculateScore(n),
      ageHours: calculateAge(n.createdAt)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
```

#### Step 3: Return Prioritized Results

```typescript
async function getPriorityInbox(studentId: string): Promise<ScoredNotification[]> {
  const notifications = await fetchNotificationsFromAPI(studentId);
  return scoredNotifications(notifications);
}
```

#### Full Integration Example

```typescript
async function displayPriorityInbox(studentId: string) {
  console.log('Fetching notifications from: ' + API_URL);
  
  const notifications = await fetchNotificationsFromAPI(studentId);
  console.log(`Retrieved ${notifications.length} notifications`);
  
  const topPriority = notifications
    .filter(n => !n.isRead)
    .map(n => ({
      ...n,
      score: calculateScore(n),
      ageHours: calculateAge(n.createdAt),
      weight: TYPE_WEIGHTS[n.type] || 0
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  console.log('\n=== Priority Inbox (Top 10) ===\n');
  
  topPriority.forEach((notif, i) => {
    console.log(`${i + 1}. [${notif.type}] ${notif.title}`);
    console.log(`   Weight: ${notif.weight} | Score: ${notif.score.toFixed(3)}`);
    console.log(`   Message: ${notif.message}`);
    console.log(`   Age: ${notif.ageHours.toFixed(1)} hours\n`);
  });
  
  return topPriority;
}
```

#### API Testing in Postman

```
1. Create GET request
2. URL: http://4.224.186.213/evaluation-service/notifications
3. Query Parameter: studentId=1042
4. Send request
5. Response contains array of notifications
6. Your application processes and ranks them
```

### Performance Summary

| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| Add notification | O(log 10) | O(10) |
| Get top 10 | O(1) | O(1) |
| Recalculate scores | O(10 log 10) | O(10) |
| API response | ~50-100ms | ~2KB |

**Expected Load:**
- 50,000 students × 1 request/hour = 14 requests/second
- With caching: ~5% cache miss rate = 0.7 DB queries/second
- With Redis: <1ms per request
