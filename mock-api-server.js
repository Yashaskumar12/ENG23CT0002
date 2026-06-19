const express = require('express');

const app = express();

// Mock data - simulating the response from the notification API
const mockNotifications = {
  '1042': [
    {
      id: 'notif_1',
      title: 'Placement Offer',
      message: 'Congratulations! You have received a placement offer from Google.',
      type: 'Placement',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: 'notif_2',
      title: 'Semester Results',
      message: 'Your semester results are now available. Check the academic portal.',
      type: 'Result',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: 'notif_3',
      title: 'Campus Event',
      message: 'Join us for the annual tech conference this Friday at 2 PM.',
      type: 'Event',
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      isRead: true
    },
    {
      id: 'notif_4',
      title: 'Interview Scheduled',
      message: 'Your interview with Microsoft has been scheduled for June 25, 2026.',
      type: 'Placement',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: 'notif_5',
      title: 'Project Submission',
      message: 'CSE301 Project submission deadline is tomorrow. Submit your work.',
      type: 'Event',
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: 'notif_6',
      title: 'Score Released',
      message: 'Your CSE301 exam score has been released. Score: 42/50',
      type: 'Result',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: 'notif_7',
      title: 'Internship Opportunity',
      message: 'New internship opportunity from Amazon. Apply now!',
      type: 'Placement',
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: 'notif_8',
      title: 'GPA Update',
      message: 'Your cumulative GPA has been updated to 8.5.',
      type: 'Result',
      createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      isRead: true
    },
    {
      id: 'notif_9',
      title: 'Workshop Announcement',
      message: 'Attend the AI/ML workshop organized by the CS club.',
      type: 'Event',
      createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: 'notif_10',
      title: 'Scholarship Award',
      message: 'Congratulations! You have been awarded the merit scholarship.',
      type: 'Result',
      createdAt: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
      isRead: false
    }
  ]
};

// Route 1: Check authorization
app.get('/evaluation-service/notifications', (req, res) => {
  const authHeader = req.get('authorization');
  
  if (!authHeader) {
    return res.status(401).json({
      message: 'An authorization header is required'
    });
  }
  
  const studentId = req.query.studentId;
  
  if (!studentId) {
    return res.status(400).json({
      message: 'studentId query parameter is required'
    });
  }
  
  const notifications = mockNotifications[studentId] || [];
  
  res.json(notifications);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock API server running' });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✓ Mock Notification API running on http://localhost:${PORT}`);
  console.log(`\nEndpoint: GET http://localhost:${PORT}/evaluation-service/notifications`);
  console.log(`  Required headers: Authorization: Bearer <token>`);
  console.log(`  Required query params: studentId=1042\n`);
});
