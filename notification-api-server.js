const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const API_BASE_URL = 'http://4.224.186.213/evaluation-service/notifications';

const TYPE_WEIGHTS = {
  'Placement': 100,
  'Result': 50,
  'Event': 10
};

function calculateAge(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  return diffMs / (1000 * 60 * 60);
}

function calculateScore(notification) {
  const weight = TYPE_WEIGHTS[notification.type] || 0;
  const ageHours = calculateAge(notification.createdAt);
  const recencyFactor = Math.max(0, 1 - (ageHours / 168));
  const score = weight * recencyFactor;
  
  return { score, weight };
}

function getTopNotifications(notifications, limit = 10) {
  const unreadNotifications = notifications.filter(n => !n.isRead);
  
  const scoredNotifications = unreadNotifications.map(notif => {
    const { score, weight } = calculateScore(notif);
    return {
      ...notif,
      score,
      weight,
      ageHours: calculateAge(notif.createdAt)
    };
  });
  
  scoredNotifications.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  return scoredNotifications.slice(0, limit);
}

app.get('/api/v1/notifications/priority-inbox', async (req, res) => {
  try {
    const studentId = req.query.studentId || '1042';
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    
    console.log(`📥 Fetching notifications for student: ${studentId}`);
    
    const response = await axios.get(API_BASE_URL, {
      params: {
        studentId: studentId
      },
      timeout: 5000
    });
    
    const notifications = response.data || [];
    
    if (!Array.isArray(notifications)) {
      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'Notifications retrieved successfully',
        data: {
          totalCount: 0,
          notifications: [],
          rawData: notifications
        }
      });
    }
    
    const topNotifications = getTopNotifications(notifications, limit);
    
    console.log(`✓ Retrieved ${notifications.length} total notifications`);
    console.log(`✓ Top ${topNotifications.length} by priority calculated`);
    
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Priority inbox retrieved successfully',
      data: {
        studentId: studentId,
        totalUnread: notifications.filter(n => !n.isRead).length,
        topCount: topNotifications.length,
        notifications: topNotifications.map(notif => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          priority: notif.weight,
          score: parseFloat(notif.score.toFixed(3)),
          ageHours: parseFloat(notif.ageHours.toFixed(1)),
          createdAt: notif.createdAt,
          isRead: notif.isRead
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching notifications:', error.message);
    
    res.status(error.response?.status || 500).json({
      statusCode: error.response?.status || 500,
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
      details: {
        apiUrl: API_BASE_URL,
        studentId: req.query.studentId || '1042',
        hint: 'Check if the external API is accessible and returning data'
      }
    });
  }
});

app.get('/api/v1/notifications', async (req, res) => {
  try {
    const studentId = req.query.studentId || '1042';
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log(`📥 Fetching notifications for student: ${studentId} (limit: ${limit}, offset: ${offset})`);
    
    const response = await axios.get(API_BASE_URL, {
      params: {
        studentId: studentId
      },
      timeout: 5000
    });
    
    const notifications = response.data || [];
    const paginatedNotifications = Array.isArray(notifications) 
      ? notifications.slice(offset, offset + limit)
      : [];
    
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        studentId: studentId,
        notifications: paginatedNotifications,
        pagination: {
          total: Array.isArray(notifications) ? notifications.length : 0,
          limit: limit,
          offset: offset,
          hasMore: Array.isArray(notifications) ? offset + limit < notifications.length : false
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching notifications:', error.message);
    
    res.status(error.response?.status || 500).json({
      statusCode: error.response?.status || 500,
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

app.get('/api/v1/notifications/count/unread', async (req, res) => {
  try {
    const studentId = req.query.studentId || '1042';
    
    console.log(`📥 Fetching unread count for student: ${studentId}`);
    
    const response = await axios.get(API_BASE_URL, {
      params: {
        studentId: studentId
      },
      timeout: 5000
    });
    
    const notifications = response.data || [];
    const unreadCount = Array.isArray(notifications) 
      ? notifications.filter(n => !n.isRead).length
      : 0;
    
    res.status(200).json({
      statusCode: 200,
      success: true,
      data: {
        studentId: studentId,
        unreadCount: unreadCount,
        lastFetchedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching unread count:', error.message);
    
    res.status(error.response?.status || 500).json({
      statusCode: error.response?.status || 500,
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Notification API server is running',
    timestamp: new Date().toISOString(),
    externalAPI: API_BASE_URL,
    endpoints: [
      'GET /api/v1/notifications/priority-inbox?studentId=1042&limit=10',
      'GET /api/v1/notifications?studentId=1042&limit=20&offset=0',
      'GET /api/v1/notifications/count/unread?studentId=1042'
    ]
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✓ Notification API Server started on port ${PORT}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log('📌 Available Endpoints:\n');
  console.log(`   1. GET http://localhost:${PORT}/health`);
  console.log(`   2. GET http://localhost:${PORT}/api/v1/notifications/priority-inbox?studentId=1042`);
  console.log(`   3. GET http://localhost:${PORT}/api/v1/notifications?studentId=1042&limit=20`);
  console.log(`   4. GET http://localhost:${PORT}/api/v1/notifications/count/unread?studentId=1042`);
  console.log(`\n🔗 External API: ${API_BASE_URL}\n`);
  console.log('📝 Test in Postman:');
  console.log(`   - Start this server: node notification-api-server.js`);
  console.log(`   - Import URLs above in Postman`);
  console.log(`   - Send GET requests to test\n`);
  console.log(`${'='.repeat(60)}\n`);
});

module.exports = app;
