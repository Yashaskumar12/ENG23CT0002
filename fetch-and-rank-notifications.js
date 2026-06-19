const axios = require('axios');

const ENABLE_LOCAL_MOCK = true;
const LOCAL_ENDPOINT = 'http://localhost:4000/evaluation-service/notifications';
const PROD_ENDPOINT = 'http://4.224.186.213/evaluation-service/notifications';
const AUTH_BEARER = process.env.API_TOKEN || 'Bearer YOUR_TOKEN_HERE';

const SELECTED_URL = ENABLE_LOCAL_MOCK ? LOCAL_ENDPOINT : PROD_ENDPOINT;

const IMPORTANCE_WEIGHTS = {
  'Placement': 100,
  'Result': 50,
  'Event': 10
};

function computeElapsedHours(timestamp) {
  const current = new Date();
  const original = new Date(timestamp);
  const msElapsed = current.getTime() - original.getTime();
  return msElapsed / (1000 * 60 * 60);
}

function computeImportanceScore(notification) {
  const importance = IMPORTANCE_WEIGHTS[notification.type] || 0;
  const hoursOld = computeElapsedHours(notification.createdAt);
  const decayFactor = Math.max(0, 1 - (hoursOld / 168));
  return importance * decayFactor;
}

async function retrieveNotificationsFromService(userId) {
  try {
    console.log(`📥 Fetching from: ${SELECTED_URL}?studentId=${userId}`);
    
    const requestConfig = {
      params: {
        studentId: userId
      },
      timeout: 5000
    };
    
    if (!ENABLE_LOCAL_MOCK) {
      requestConfig.headers = {
        'Authorization': AUTH_BEARER
      };
      console.log(`   Using Authorization Header: ${AUTH_BEARER.substring(0, 20)}...`);
    } else {
      requestConfig.headers = {
        'Authorization': 'Bearer mock-token-for-demo'
      };
    }
    
    const response = await axios.get(SELECTED_URL, requestConfig);
    
    console.log(`✓ Retrieved ${response.data.length || 0} notifications\n`);
    return response.data || [];
  } catch (error) {
    if (error.response?.status === 401) {
      console.error(`❌ Authorization Error: ${error.response.data.message}`);
      console.error(`\n💡 HINT: The API requires an Authorization header!`);
      console.error(`   Set your token: export API_TOKEN="Bearer YOUR_TOKEN_HERE"`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`❌ Connection Error: Cannot reach ${SELECTED_URL}`);
      console.error(`\n💡 HINT: To use mock data for testing:`);
      console.error(`   1. Start mock server: node mock-api-server.js`);
      console.error(`   2. Run this script: node fetch-and-rank-notifications.js`);
    } else {
      console.error(`❌ Error fetching notifications: ${error.message}`);
    }
    return [];
  }
}

function extractTopByImportance(notifications, maxCount = 10) {
  const unreadOnly = notifications.filter(n => !n.isRead);
  
  const withScores = unreadOnly.map(notif => ({
    ...notif,
    importanceScore: computeImportanceScore(notif),
    importance: IMPORTANCE_WEIGHTS[notif.type] || 0,
    hoursOld: computeElapsedHours(notif.createdAt)
  }));
  
  withScores.sort((a, b) => {
    if (b.importanceScore !== a.importanceScore) {
      return b.importanceScore - a.importanceScore;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  return withScores.slice(0, maxCount);
}

async function renderPriorityInbox(userId, maxCount = 10) {
  console.log('\n' + '='.repeat(70));
  console.log('NOTIFICATION PRIORITY INBOX - Using External API');
  console.log('='.repeat(70) + '\n');
  
  const allNotifications = await retrieveNotificationsFromService(userId);
  
  if (allNotifications.length === 0) {
    console.log('No notifications found for this student.\n');
    return;
  }
  
  const priorityList = extractTopByImportance(allNotifications, maxCount);
  
  const unreadTotal = allNotifications.filter(n => !n.isRead).length;
  
  console.log(`📊 Summary:`);
  console.log(`   Total Notifications: ${allNotifications.length}`);
  console.log(`   Unread: ${unreadTotal}`);
  console.log(`   Top Displayed: ${priorityList.length}\n`);
  
  console.log('Priority Weights: Placement=100, Result=50, Event=10');
  console.log('Formula: Score = Weight × (1 - Age_Hours/168)\n');
  console.log('-'.repeat(70) + '\n');
  
  const iconMap = {
    'Placement': '💼',
    'Result': '📊',
    'Event': '📢'
  };
  
  priorityList.forEach((notif, idx) => {
    const icon = iconMap[notif.type] || '📌';
    
    console.log(`${idx + 1}. ${icon} [${notif.type}] ${notif.title}`);
    console.log(`   Weight: ${notif.importance} | Score: ${notif.importanceScore.toFixed(3)}`);
    console.log(`   Message: ${notif.message}`);
    console.log(`   Age: ${notif.hoursOld.toFixed(1)} hours`);
    console.log(`   Created: ${notif.createdAt}`);
    console.log(`   Read: ${notif.isRead ? 'Yes' : 'No'}`);
    console.log();
  });
  
  console.log('='.repeat(70) + '\n');
}

async function main() {
  const userIds = ['1042'];
  
  for (const userId of userIds) {
    try {
      await renderPriorityInbox(userId, 10);
    } catch (error) {
      console.error(`Error processing user ${userId}:`, error.message);
    }
  }
}

main();
