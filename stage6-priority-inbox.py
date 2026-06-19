from datetime import datetime, timedelta, timezone
from typing import List, Dict, Tuple
import json

class Notification:
    def __init__(self, id: str, title: str, message: str, notif_type: str, created_at: str, is_read: bool):
        self.id = id
        self.title = title
        self.message = message
        self.type = notif_type
        self.created_at = created_at
        self.is_read = is_read

class ScoredNotification(Notification):
    def __init__(self, notification: Notification, score: float, weight: int, age_hours: float):
        super().__init__(notification.id, notification.title, notification.message, 
                        notification.type, notification.created_at, notification.is_read)
        self.score = score
        self.weight = weight
        self.age_hours = age_hours

TYPE_WEIGHTS = {
    'Placement': 100,
    'Result': 50,
    'Event': 10
}

def calculate_age_hours(created_at: str) -> float:
    now = datetime.now(timezone.utc)
    created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    diff = now - created
    return diff.total_seconds() / 3600

def calculate_score(notification: Notification) -> Tuple[float, int]:
    weight = TYPE_WEIGHTS.get(notification.type, 0)
    age_hours = calculate_age_hours(notification.created_at)
    
    recency_factor = max(0, 1 - (age_hours / 168))
    score = weight * recency_factor
    
    return score, weight

def get_top_notifications(notifications: List[Notification], limit: int = 10) -> List[ScoredNotification]:
    unread = [n for n in notifications if not n.is_read]
    
    scored = []
    for notif in unread:
        score, weight = calculate_score(notif)
        age_hours = calculate_age_hours(notif.created_at)
        scored.append(ScoredNotification(notif, score, weight, age_hours))
    
    scored.sort(key=lambda x: (-x.score, datetime.fromisoformat(x.created_at.replace('Z', '+00:00'))))
    
    return scored[:limit]

def display_priority_inbox(notifications: List[Notification], student_id: str):
    print('\n' + '='*60)
    print('            PRIORITY INBOX - TOP 10 NOTIFICATIONS')
    print('='*60 + '\n')
    
    top_notifs = get_top_notifications(notifications, 10)
    
    if not top_notifs:
        print('No unread notifications found.')
        return
    
    unread_count = sum(1 for n in notifications if not n.is_read)
    
    print(f'Student ID: {student_id}')
    print(f'Total Unread: {unread_count}')
    print(f'Top Displaying: {len(top_notifs)}\n')
    print('-' * 60 + '\n')
    
    type_emoji = {
        'Placement': '💼',
        'Result': '📊',
        'Event': '📢'
    }
    
    for index, notif in enumerate(top_notifs, 1):
        emoji = type_emoji.get(notif.type, '📌')
        print(f'{index}. {emoji} [{notif.type}] {notif.title}')
        print(f'   Type Weight: {notif.weight} | Score: {notif.score:.3f}')
        print(f'   Message: {notif.message}')
        print(f'   Age: {notif.age_hours:.1f} hours')
        print(f'   Created: {notif.created_at}')
        print()
    
    print('='*60)

def demonstrate_priority_logic():
    print('\n' + '='*60)
    print('        PRIORITY SCORING ALGORITHM DEMONSTRATION')
    print('='*60 + '\n')
    
    now = datetime.now(timezone.utc)
    demo_notifications = [
        Notification('1', 'Placement Offer', 
                    'Congratulations! You have received a placement offer.',
                    'Placement',
                    (now - timedelta(hours=1)).isoformat().replace('+00:00', 'Z'), False),
        Notification('2', 'Semester Results',
                    'Your semester results are now available.',
                    'Result',
                    (now - timedelta(hours=5)).isoformat().replace('+00:00', 'Z'), False),
        Notification('3', 'Campus Event',
                    'Upcoming tech symposium on June 25, 2026.',
                    'Event',
                    (now - timedelta(hours=10)).isoformat().replace('+00:00', 'Z'), False),
        Notification('4', 'Interview Scheduled',
                    'Your interview is scheduled for June 22, 2026.',
                    'Placement',
                    (now - timedelta(hours=24)).isoformat().replace('+00:00', 'Z'), False),
        Notification('5', 'Quiz Results Posted',
                    'Your quiz results have been posted.',
                    'Result',
                    (now - timedelta(hours=48)).isoformat().replace('+00:00', 'Z'), False),
    ]
    
    print('Type Weights: Placement=100, Result=50, Event=10')
    print('Formula: Score = Weight × (1 - Age_Hours / 168)\n')
    print('-' * 60 + '\n')
    
    scored = []
    for notif in demo_notifications:
        score, weight = calculate_score(notif)
        age_hours = calculate_age_hours(notif.created_at)
        scored.append(ScoredNotification(notif, score, weight, age_hours))
    
    scored.sort(key=lambda x: (-x.score, datetime.fromisoformat(x.created_at.replace('Z', '+00:00'))))
    
    for index, notif in enumerate(scored, 1):
        recency_factor = 1 - (notif.age_hours / 168) if notif.age_hours < 168 else 0
        print(f'{index}. {notif.type}')
        print(f'   Title: {notif.title}')
        print(f'   Weight: {notif.weight}')
        print(f'   Age: {notif.age_hours:.1f} hours')
        print(f'   Recency Factor: {recency_factor:.3f}')
        print(f'   FINAL SCORE: {notif.score:.3f}')
        print()

class PriorityInboxManager:
    def __init__(self, max_cache_size: int = 10, cache_ttl_seconds: int = 3600):
        self.priority_cache = {}
        self.cache_expiry = {}
        self.max_cache_size = max_cache_size
        self.cache_ttl = cache_ttl_seconds
    
    def add_notification(self, student_id: str, notification: Notification):
        score, weight = calculate_score(notification)
        age_hours = calculate_age_hours(notification.created_at)
        scored_notif = ScoredNotification(notification, score, weight, age_hours)
        
        cache_key = f'student_{student_id}'
        top_notifs = self.priority_cache.get(cache_key, [])
        
        top_notifs.append(scored_notif)
        top_notifs.sort(key=lambda x: -x.score)
        top_notifs = top_notifs[:self.max_cache_size]
        
        self.priority_cache[cache_key] = top_notifs
        self.cache_expiry[cache_key] = datetime.now().timestamp() + self.cache_ttl
    
    def get_top_notifications(self, student_id: str, limit: int = 10) -> List[ScoredNotification]:
        cache_key = f'student_{student_id}'
        expiry = self.cache_expiry.get(cache_key, 0)
        
        if datetime.now().timestamp() > expiry:
            self.priority_cache.pop(cache_key, None)
            return []
        
        return self.priority_cache.get(cache_key, [])[:limit]
    
    def invalidate_cache(self, student_id: str):
        cache_key = f'student_{student_id}'
        self.priority_cache.pop(cache_key, None)
        self.cache_expiry.pop(cache_key, None)

def main():
    demonstrate_priority_logic()
    
    now = datetime.now(timezone.utc)
    demo_notifications = [
        Notification('1', 'Placement Offer', 
                    'Congratulations! You have received a placement offer.',
                    'Placement',
                    (now - timedelta(hours=1)).isoformat().replace('+00:00', 'Z'), False),
        Notification('2', 'Semester Results',
                    'Your semester results are now available.',
                    'Result',
                    (now - timedelta(hours=5)).isoformat().replace('+00:00', 'Z'), False),
        Notification('3', 'Campus Event',
                    'Upcoming tech symposium on June 25, 2026.',
                    'Event',
                    (now - timedelta(hours=10)).isoformat().replace('+00:00', 'Z'), False),
        Notification('4', 'Interview Scheduled',
                    'Your interview is scheduled for June 22, 2026.',
                    'Placement',
                    (now - timedelta(hours=24)).isoformat().replace('+00:00', 'Z'), False),
        Notification('5', 'Quiz Results Posted',
                    'Your quiz results have been posted.',
                    'Result',
                    (now - timedelta(hours=48)).isoformat().replace('+00:00', 'Z'), False),
    ]
    
    student_id = '1042'
    display_priority_inbox(demo_notifications, student_id)
    
    print('\n✓ Priority Inbox implementation complete')
    print('✓ Features: Scoring, Sorting, Caching, Efficiency\n')

if __name__ == '__main__':
    main()
