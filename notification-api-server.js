const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const EXTERNAL_SERVICE_URL = 'http://4.224.186.213/evaluation-service/notifications';

const PRIORITY_WEIGHTS = {
  'Placement': 100,
  'Result': 50,
  'Event': 10
};

function computeHoursElapsed(timestamp) {
  const current = new Date();
  const original = new Date(timestamp);
  const elapsed = current.getTime() - original.getTime();
  return elapsed / (1000 * 60 * 60);
}

function computeImportanceScore(notification) {
  const weight = PRIORITY_WEIGHTS[notification.type] || 0;
  const hours = computeHoursElapsed(notification.createdAt);
  const decay = Math.max(0, 1 - (hours / 168));
  const result = weight * decay;
  
  return { score: result, weight };
}

function extractTopPriority(notifications, limit = 10) {
  const unreadOnly = notifications.filter(n => !n.isRead);
  
  const withScores = unreadOnly.map(notif => {
    const { score, weight } = computeImportanceScore(notif);
    return {
      ...notif,
      score,
      weight,
      hoursElapsed: computeHoursElapsed(notif.createdAt)
    };
  });
  
  withScores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  return withScores.slice(0, limit);
}

app.get('/api/v1/notifications/priority-inbox', async (req, res) => {
  try {
    const uid = req.query.studentId || '1042';
    const maxResults = Math.min(parseInt(req.query.limit) || 10, 50);
    
    console.log(`📥 Fetching notifications for student: ${uid}`);
    
    const response = await axios.get(EXTERNAL_SERVICE_URL, {
      params: {
        studentId: uid
      },
      timeout: 5000
    });
    
    const notifData = response.data || [];
    
    if (!Array.isArray(notifData)) {
      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'Notifications retrieved successfully',
        data: {
          totalCount: 0,
          notifications: [],
          rawData: notifData
        }
      });
    }
    
    const priorityList = extractTopPriority(notifData, maxResults);
    
    console.log(`✓ Retrieved ${notifData.length} total notifications`);
    console.log(`✓ Top ${priorityList.length} by priority calculated`);
    
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Priority inbox retrieved successfully',
      data: {
        studentId: uid,
        totalUnread: notifData.filter(n => !n.isRead).length,
        topCount: priorityList.length,
        notifications: priorityList.map(notif => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          priority: notif.weight,
          score: parseFloat(notif.score.toFixed(3)),
          hoursElapsed: parseFloat(notif.hoursElapsed.toFixed(1)),
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
        apiUrl: EXTERNAL_SERVICE_URL,
        studentId: req.query.studentId || '1042',
        hint: 'Check if the external API is accessible and returning data'
      }
    });
  }
});

app.get('/api/v1/notifications', async (req, res) => {
  try {
    const uid = req.query.studentId || '1042';
    const pageSize = parseInt(req.query.limit) || 20;
    const pageOffset = parseInt(req.query.offset) || 0;
    
    console.log(`📥 Fetching notifications for student: ${uid} (limit: ${pageSize}, offset: ${pageOffset})`);
    
    const response = await axios.get(EXTERNAL_SERVICE_URL, {
      params: {
        studentId: uid
      },
      timeout: 5000
    });
    
    const notifData = response.data || [];
    const slicedData = Array.isArray(notifData) 
      ? notifData.slice(pageOffset, pageOffset + pageSize)
      : [];
    
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        studentId: uid,
        notifications: slicedData,
        pagination: {
          total: Array.isArray(notifData) ? notifData.length : 0,
          limit: pageSize,
          offset: pageOffset,
          hasMore: Array.isArray(notifData) ? pageOffset + pageSize < notifData.length : false
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
    const uid = req.query.studentId || '1042';
    
    console.log(`📥 Fetching unread count for student: ${uid}`);
    
    const response = await axios.get(EXTERNAL_SERVICE_URL, {
      params: {
        studentId: uid
      },
      timeout: 5000
    });
    
    const notifData = response.data || [];
    const unreadNum = Array.isArray(notifData) 
      ? notifData.filter(n => !n.isRead).length
      : 0;
    
    res.status(200).json({
      statusCode: 200,
      success: true,
      data: {
        studentId: uid,
        unreadCount: unreadNum,
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
    externalAPI: EXTERNAL_SERVICE_URL,
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
  console.log(`\n🔗 External API: ${EXTERNAL_SERVICE_URL}\n`);
  console.log('📝 Test in Postman:');
  console.log(`   - Start this server: node notification-api-server.js`);
  console.log(`   - Import URLs above in Postman`);
  console.log(`   - Send GET requests to test\n`);
  console.log(`${'='.repeat(60)}\n`);
});

module.exports = app;
