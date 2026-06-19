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
