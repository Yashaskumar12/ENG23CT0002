import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const API_BASE_URL = 'http://4.224.186.213/evaluation-service/notifications';

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
  weight: number;
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

function calculateScore(notification: Notification): { score: number; weight: number } {
  const weight = TYPE_WEIGHTS[notification.type] || 0;
  const ageHours = calculateAge(notification.createdAt);
  const recencyFactor = Math.max(0, 1 - (ageHours / 168));
  const score = weight * recencyFactor;
  
  return { score, weight };
}

function getTopNotifications(
  notifications: Notification[],
  limit: number = 10
): ScoredNotification[] {
  const unreadNotifications = notifications.filter(n => !n.isRead);
  
  const scoredNotifications: ScoredNotification[] = unreadNotifications.map(notif => {
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

app.get('/api/v1/notifications/priority-inbox', async (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId as string || '1042';
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    
    const response = await axios.get(API_BASE_URL, {
      params: {
        studentId: studentId
      },
      timeout: 5000
    });
    
    const notifications: Notification[] = response.data || [];
    
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
    
  } catch (error: any) {
    console.error('Error fetching notifications:', error.message);
    
    res.status(error.response?.status || 500).json({
      statusCode: error.response?.status || 500,
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
      details: {
        apiUrl: API_BASE_URL,
        studentId: req.query.studentId || '1042'
      }
    });
  }
});

app.get('/api/v1/notifications', async (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId as string || '1042';
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const response = await axios.get(API_BASE_URL, {
      params: {
        studentId: studentId
      },
      timeout: 5000
    });
    
    const notifications: Notification[] = response.data || [];
    
    const paginatedNotifications = notifications.slice(offset, offset + limit);
    
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        studentId: studentId,
        notifications: paginatedNotifications,
        pagination: {
          total: notifications.length,
          limit: limit,
          offset: offset,
          hasMore: offset + limit < notifications.length
        }
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching notifications:', error.message);
    
    res.status(error.response?.status || 500).json({
      statusCode: error.response?.status || 500,
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

app.get('/api/v1/notifications/count/unread', async (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId as string || '1042';
    
    const response = await axios.get(API_BASE_URL, {
      params: {
        studentId: studentId
      },
      timeout: 5000
    });
    
    const notifications: Notification[] = response.data || [];
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    res.status(200).json({
      statusCode: 200,
      success: true,
      data: {
        studentId: studentId,
        unreadCount: unreadCount,
        lastFetchedAt: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching unread count:', error.message);
    
    res.status(error.response?.status || 500).json({
      statusCode: error.response?.status || 500,
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Notification API server is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/v1/notifications/priority-inbox?studentId=1042&limit=10',
      'GET /api/v1/notifications?studentId=1042&limit=20&offset=0',
      'GET /api/v1/notifications/count/unread?studentId=1042'
    ]
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n✓ Notification API Server started on port ${PORT}`);
  console.log(`\n📌 Available Endpoints:`);
  console.log(`   1. GET http://localhost:${PORT}/health`);
  console.log(`   2. GET http://localhost:${PORT}/api/v1/notifications/priority-inbox?studentId=1042`);
  console.log(`   3. GET http://localhost:${PORT}/api/v1/notifications?studentId=1042&limit=20`);
  console.log(`   4. GET http://localhost:${PORT}/api/v1/notifications/count/unread?studentId=1042`);
  console.log(`\n🔗 External API: ${API_BASE_URL}\n`);
});

export default app;
