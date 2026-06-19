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
  weight: number;
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

async function fetchNotificationsFromAPI(studentId: string): Promise<Notification[]> {
  try {
    const apiUrl = 'http://4.224.186.213/evaluation-service/notifications';
    
    const response = await axios.get(apiUrl, {
      params: {
        studentId: studentId
      },
      timeout: 5000
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
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

function formatNotificationForDisplay(notification: ScoredNotification, index: number): string {
  const typeEmoji: Record<string, string> = {
    'Placement': '💼',
    'Result': '📊',
    'Event': '📢'
  };
  
  const emoji = typeEmoji[notification.type] || '📌';
  
  return `${index + 1}. ${emoji} [${notification.type}] ${notification.title}`;
}

async function displayPriorityInbox(studentId: string) {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('            PRIORITY INBOX - TOP 10 NOTIFICATIONS');
  console.log('════════════════════════════════════════════════════════════\n');
  
  const notifications = await fetchNotificationsFromAPI(studentId);
  const topNotifications = getTopNotifications(notifications, 10);
  
  if (topNotifications.length === 0) {
    console.log('No unread notifications found.');
    return;
  }
  
  console.log(`Student ID: ${studentId}`);
  console.log(`Total Unread: ${notifications.filter(n => !n.isRead).length}`);
  console.log(`Top Displaying: ${topNotifications.length}\n`);
  console.log('────────────────────────────────────────────────────────────\n');
  
  topNotifications.forEach((notif, index) => {
    console.log(formatNotificationForDisplay(notif, index));
    console.log(`   Type Weight: ${notif.weight} | Score: ${notif.score.toFixed(3)}`);
    console.log(`   Message: ${notif.message}`);
    console.log(`   Age: ${notif.ageHours.toFixed(1)} hours`);
    console.log(`   Created: ${notif.createdAt}`);
    console.log();
  });
  
  console.log('════════════════════════════════════════════════════════════');
}

class PriorityInboxManager {
  private priorityCache: Map<string, ScoredNotification[]> = new Map();
  private maxCacheSize: number = 10;
  private cacheExpiry: Map<string, number> = new Map();
  private cacheTTL: number = 3600000;
  
  async addNotification(studentId: string, notification: Notification): Promise<void> {
    const { score, weight } = calculateScore(notification);
    const scoredNotif: ScoredNotification = {
      ...notification,
      score,
      weight,
      ageHours: calculateAge(notification.createdAt)
    };
    
    const cacheKey = `student_${studentId}`;
    let topNotifications = this.priorityCache.get(cacheKey) || [];
    
    topNotifications.push(scoredNotif);
    topNotifications.sort((a, b) => b.score - a.score);
    topNotifications = topNotifications.slice(0, this.maxCacheSize);
    
    this.priorityCache.set(cacheKey, topNotifications);
    this.cacheExpiry.set(cacheKey, Date.now() + this.cacheTTL);
  }
  
  getTopNotifications(studentId: string, limit: number = 10): ScoredNotification[] {
    const cacheKey = `student_${studentId}`;
    const expiry = this.cacheExpiry.get(cacheKey) || 0;
    
    if (Date.now() > expiry) {
      this.priorityCache.delete(cacheKey);
      return [];
    }
    
    return (this.priorityCache.get(cacheKey) || []).slice(0, limit);
  }
  
  invalidateCache(studentId: string): void {
    const cacheKey = `student_${studentId}`;
    this.priorityCache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
  }
}

async function demonstratePriorityLogic() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('        PRIORITY SCORING ALGORITHM DEMONSTRATION');
  console.log('════════════════════════════════════════════════════════════\n');
  
  const demoNotifications: Notification[] = [
    {
      id: '1',
      title: 'Placement Offer',
      message: 'Congratulations! You have received a placement offer.',
      type: 'Placement',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: '2',
      title: 'Semester Results',
      message: 'Your semester results are now available.',
      type: 'Result',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: '3',
      title: 'Campus Event',
      message: 'Upcoming tech symposium on June 25, 2026.',
      type: 'Event',
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: '4',
      title: 'Interview Scheduled',
      message: 'Your interview is scheduled for June 22, 2026.',
      type: 'Placement',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: '5',
      title: 'Quiz Results Posted',
      message: 'Your quiz results have been posted.',
      type: 'Result',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      isRead: false
    }
  ];
  
  const scored = demoNotifications.map(notif => {
    const { score, weight } = calculateScore(notif);
    return {
      ...notif,
      score,
      weight,
      ageHours: calculateAge(notif.createdAt)
    };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  console.log('Type Weights: Placement=100, Result=50, Event=10');
  console.log('Formula: Score = Weight × (1 - Age_Hours / 168)\n');
  console.log('────────────────────────────────────────────────────────────\n');
  
  scored.forEach((notif, index) => {
    console.log(`${index + 1}. ${notif.type}`);
    console.log(`   Title: ${notif.title}`);
    console.log(`   Weight: ${notif.weight}`);
    console.log(`   Age: ${notif.ageHours.toFixed(1)} hours`);
    console.log(`   Recency Factor: ${(1 - notif.ageHours / 168).toFixed(3)}`);
    console.log(`   FINAL SCORE: ${notif.score.toFixed(3)}`);
    console.log();
  });
}

async function main() {
  try {
    await demonstratePriorityLogic();
    
    const studentId = '1042';
    await displayPriorityInbox(studentId);
    
    console.log('\n✓ Priority Inbox implementation complete');
    console.log('✓ Features: Scoring, Sorting, Caching, Efficiency\n');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
