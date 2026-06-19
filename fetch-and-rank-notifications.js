const axios = require('axios');

const API_URL = 'http://4.224.186.213/evaluation-service/notifications';

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
  return weight * recencyFactor;
}

async function fetchNotificationsFromAPI(studentId) {
  try {
    console.log(`📥 Fetching from: ${API_URL}?studentId=${studentId}`);
    
    const response = await axios.get(API_URL, {
      params: {
        studentId: studentId
      },
      timeout: 5000
    });
    
    console.log(`✓ Retrieved ${response.data.length || 0} notifications\n`);
    return response.data || [];
  } catch (error) {
    console.error(`❌ Error fetching notifications: ${error.message}`);
    return [];
  }
}

function getPriorityInbox(notifications, limit = 10) {
  const unreadNotifications = notifications.filter(n => !n.isRead);
  
  const scoredNotifications = unreadNotifications.map(notif => ({
    ...notif,
    score: calculateScore(notif),
    weight: TYPE_WEIGHTS[notif.type] || 0,
    ageHours: calculateAge(notif.createdAt)
  }));
  
  scoredNotifications.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  return scoredNotifications.slice(0, limit);
}

async function displayPriorityInbox(studentId, limit = 10) {
  console.log('\n' + '='.repeat(70));
  console.log('NOTIFICATION PRIORITY INBOX - Using External API');
  console.log('='.repeat(70) + '\n');
  
  const notifications = await fetchNotificationsFromAPI(studentId);
  
  if (notifications.length === 0) {
    console.log('No notifications found for this student.\n');
    return;
  }
  
  const topNotifications = getPriorityInbox(notifications, limit);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  console.log(`📊 Summary:`);
  console.log(`   Total Notifications: ${notifications.length}`);
  console.log(`   Unread: ${unreadCount}`);
  console.log(`   Top Displayed: ${topNotifications.length}\n`);
  
  console.log('Priority Weights: Placement=100, Result=50, Event=10');
  console.log('Formula: Score = Weight × (1 - Age_Hours/168)\n');
  console.log('-'.repeat(70) + '\n');
  
  const typeEmoji = {
    'Placement': '💼',
    'Result': '📊',
    'Event': '📢'
  };
  
  topNotifications.forEach((notif, index) => {
    const emoji = typeEmoji[notif.type] || '📌';
    
    console.log(`${index + 1}. ${emoji} [${notif.type}] ${notif.title}`);
    console.log(`   Weight: ${notif.weight} | Score: ${notif.score.toFixed(3)}`);
    console.log(`   Message: ${notif.message}`);
    console.log(`   Age: ${notif.ageHours.toFixed(1)} hours`);
    console.log(`   Created: ${notif.createdAt}`);
    console.log(`   Read: ${notif.isRead ? 'Yes' : 'No'}`);
    console.log();
  });
  
  console.log('='.repeat(70) + '\n');
}

async function main() {
  const studentIds = ['1042'];
  
  for (const studentId of studentIds) {
    try {
      await displayPriorityInbox(studentId, 10);
    } catch (error) {
      console.error(`Error processing student ${studentId}:`, error.message);
    }
  }
}

main();
