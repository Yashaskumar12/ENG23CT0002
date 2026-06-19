import requests
from datetime import datetime
import json

API_URL = 'http://4.224.186.213/evaluation-service/notifications'

TYPE_WEIGHTS = {
    'Placement': 100,
    'Result': 50,
    'Event': 10
}

def calculate_age(created_at):
    now = datetime.now()
    created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    diff = now - created
    return diff.total_seconds() / 3600

def calculate_score(notification):
    weight = TYPE_WEIGHTS.get(notification.get('type'), 0)
    age_hours = calculate_age(notification.get('createdAt', ''))
    recency_factor = max(0, 1 - (age_hours / 168))
    return weight * recency_factor

def fetch_notifications_from_api(student_id):
    try:
        print(f'📥 Fetching from: {API_URL}?studentId={student_id}')
        
        response = requests.get(API_URL, params={'studentId': student_id}, timeout=5)
        response.raise_for_status()
        
        notifications = response.json()
        if isinstance(notifications, list):
            print(f'✓ Retrieved {len(notifications)} notifications\n')
            return notifications
        else:
            print(f'✓ Retrieved notifications\n')
            return []
    except requests.exceptions.RequestException as error:
        print(f'❌ Error fetching notifications: {error}\n')
        return []

def get_priority_inbox(notifications, limit=10):
    unread_notifications = [n for n in notifications if not n.get('isRead', False)]
    
    scored_notifications = [
        {
            **notif,
            'score': calculate_score(notif),
            'weight': TYPE_WEIGHTS.get(notif.get('type'), 0),
            'ageHours': calculate_age(notif.get('createdAt', ''))
        }
        for notif in unread_notifications
    ]
    
    scored_notifications.sort(key=lambda x: (
        -x['score'],
        -datetime.fromisoformat(x.get('createdAt', '').replace('Z', '+00:00')).timestamp()
    ))
    
    return scored_notifications[:limit]

def display_priority_inbox(student_id, limit=10):
    print('\n' + '='*70)
    print('NOTIFICATION PRIORITY INBOX - Using External API')
    print('='*70 + '\n')
    
    notifications = fetch_notifications_from_api(student_id)
    
    if not notifications:
        print('No notifications found for this student.\n')
        return
    
    top_notifications = get_priority_inbox(notifications, limit)
    
    unread_count = sum(1 for n in notifications if not n.get('isRead', False))
    
    print(f'📊 Summary:')
    print(f'   Total Notifications: {len(notifications)}')
    print(f'   Unread: {unread_count}')
    print(f'   Top Displayed: {len(top_notifications)}\n')
    
    print('Priority Weights: Placement=100, Result=50, Event=10')
    print('Formula: Score = Weight × (1 - Age_Hours/168)\n')
    print('-'*70 + '\n')
    
    type_emoji = {
        'Placement': '💼',
        'Result': '📊',
        'Event': '📢'
    }
    
    for index, notif in enumerate(top_notifications, 1):
        emoji = type_emoji.get(notif.get('type'), '📌')
        notif_type = notif.get('type', 'Unknown')
        
        print(f'{index}. {emoji} [{notif_type}] {notif.get("title", "No Title")}')
        print(f'   Weight: {notif.get("weight", 0)} | Score: {notif.get("score", 0):.3f}')
        print(f'   Message: {notif.get("message", "No message")}')
        print(f'   Age: {notif.get("ageHours", 0):.1f} hours')
        print(f'   Created: {notif.get("createdAt", "Unknown")}')
        print(f'   Read: {"Yes" if notif.get("isRead") else "No"}')
        print()
    
    print('='*70 + '\n')

def main():
    student_ids = ['1042']
    
    for student_id in student_ids:
        try:
            display_priority_inbox(student_id, 10)
        except Exception as error:
            print(f'Error processing student {student_id}: {error}')

if __name__ == '__main__':
    main()
