from app.modules.notifications.service import NotificationService

def send_email(subject: str, recipient: str, body: str):
    service = NotificationService()
    return service.send_email(to_email=recipient, subject=subject, body=body)
