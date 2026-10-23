import os
import base64
from email.message import EmailMessage
from email.utils import formataddr
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.core.config import settings

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

class NotificationService:
    def __init__(self):
        self.creds = None
        token_path = 'token.json'
        
        # 1. Prefer token.json if present
        if os.path.exists(token_path):
            try:
                self.creds = Credentials.from_authorized_user_file(token_path, SCOPES)
            except Exception as e:
                print(f"Error loading {token_path}: {e}")

        # 2. Otherwise load from settings / .env
        if not self.creds and settings.GMAIL_REFRESH_TOKEN and settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
            try:
                self.creds = Credentials(
                    None,
                    refresh_token=settings.GMAIL_REFRESH_TOKEN,
                    token_uri="https://oauth2.googleapis.com/token",
                    client_id=settings.GOOGLE_CLIENT_ID,
                    client_secret=settings.GOOGLE_CLIENT_SECRET,
                    scopes=SCOPES
                )
            except Exception as e:
                print(f"Error initializing Gmail credentials from .env: {e}")

        # Refresh if needed
        if self.creds:
            try:
                if not self.creds.valid or self.creds.expired:
                    self.creds.refresh(Request())
            except Exception as e:
                print(f"[GMAIL OAUTH NOTICE] Gmail token refresh error: {e}")
                self.creds = None

    def send_email(self, to_email: str, subject: str, body: str):
        import smtplib
        sender_name = f"{settings.PROJECT_NAME} Health Portal"
        sender_email = settings.EMAIL_FROM or "mosesjohnson706@gmail.com"
        from_header = formataddr((sender_name, sender_email))

        # 1. Try SMTP if SMTP_PASSWORD or GMAIL_APP_PASSWORD is set in .env
        smtp_password = os.getenv("SMTP_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD")
        if smtp_password:
            try:
                smtp_user = os.getenv("SMTP_USER") or settings.EMAIL_FROM
                smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
                smtp_port = int(os.getenv("SMTP_PORT", 587))
                
                msg = EmailMessage()
                msg.set_content(body)
                msg['To'] = to_email
                msg['From'] = from_header
                msg['Subject'] = subject
                
                with smtplib.SMTP(smtp_host, smtp_port) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_password)
                    server.send_message(msg)
                print(f"[SMTP EMAIL SENT] Successfully sent email to {to_email}")
                return True
            except Exception as e:
                print(f"[SMTP ERROR] Failed to send via SMTP: {e}")

        # 2. Try Gmail API if valid OAuth creds
        if self.creds and self.creds.valid:
            try:
                service = build('gmail', 'v1', credentials=self.creds)
                message = EmailMessage()
                message.set_content(body)
                message['To'] = to_email
                message['From'] = from_header
                message['Subject'] = subject

                encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
                create_message = {'raw': encoded_message}

                send_message = (service.users().messages().send(userId="me", body=create_message).execute())
                print(f'[GMAIL API SENT] Message Id: {send_message["id"]} to {to_email}')
                return True
            except HttpError as error:
                print(f'An error occurred: {error}')
                return False

        print(f"[EMAIL SIMULATION] To: {to_email} | Subject: {subject} | Notice: Live Gmail token expired or missing. Please re-authenticate Google OAuth or supply an App Password.")
        return False
            
    def notify_welcome(self, email: str, name: str = "Student"):
        subject = "Welcome to HEMC Health Portal"
        body = (
            f"Hello {name},\n\n"
            f"Welcome to the Health Education & Management Chatbot (HEMC) Portal at the University of Nigeria, Nsukka.\n\n"
            f"Your student health account is active. You can:\n"
            f"- Assess symptom urgency with our AI Clinical Triage assistant.\n"
            f"- Access verified WHO and NCDC guidelines for Malaria and Typhoid Fever.\n"
            f"- Schedule clinical consultations with on-duty doctors at the UNN Medical Centre.\n\n"
            f"Stay healthy,\n"
            f"The HEMC Team\n"
            f"UNN Medical Centre, Nsukka Campus"
        )
        return self.send_email(email, subject, body)

    def notify_appointment_booking(self, email: str, name: str = "Student", date: str = "Upcoming Date", doctor_name: str = "Medical Centre Attending Doctor"):
        subject = "HEMC: Appointment Booking Confirmed"
        body = (
            f"Dear {name},\n\n"
            f"Your medical consultation at the UNN Medical Centre has been successfully booked.\n\n"
            f"Date & Time: {date}\n"
            f"Attending Doctor: {doctor_name}\n"
            f"Location: UNN Medical Centre, Nsukka Campus\n\n"
            f"Please arrive 10 minutes prior to your appointment time with your student ID card.\n\n"
            f"Warm regards,\n"
            f"HEMC Appointments Desk"
        )
        return self.send_email(email, subject, body)

    def notify_appointment_status(self, email: str, name: str = "Student", date: str = "Scheduled Date", status: str = "Confirmed", doctor_name: str = "Dr. Medical Centre"):
        status_clean = status.lower()
        if status_clean == "confirmed":
            subject = f"HEMC: Clinic Appointment Confirmed - {doctor_name}"
            body = (
                f"Dear {name},\n\n"
                f"Your medical consultation slot at the UNN Medical Centre has been APPROVED and CONFIRMED.\n\n"
                f"CONSULTATION DETAILS:\n"
                f"- Scheduled Date & Time: {date}\n"
                f"- Attending Physician: {doctor_name}\n"
                f"- Clinic Location: UNN Medical Centre Consult Room, Nsukka Campus\n\n"
                f"CLINIC PREPARATION INSTRUCTIONS:\n"
                f"1. Please arrive at the Medical Centre 10 minutes prior to your time.\n"
                f"2. Bring your UNN Student ID card for verification.\n"
                f"3. Check in at the front desk and report to the consultation queue.\n\n"
                f"You can view your confirmed booking on your student portal: https://hemc.vercel.app/dashboard\n\n"
                f"Warm regards,\n"
                f"HEMC Appointments Desk\n"
                f"University of Nigeria, Nsukka"
            )
        elif status_clean in ("cancelled", "rejected"):
            subject = "HEMC: Appointment Request Update - Rescheduling Needed"
            body = (
                f"Dear {name},\n\n"
                f"We are writing to inform you that your appointment request for {date} could not be confirmed at this time.\n\n"
                f"REASON:\n"
                f"- {doctor_name} is currently unavailable for this slot (the physician may be off-duty, in emergency ward rotation, or the schedule is fully booked).\n\n"
                f"WHAT TO DO NEXT:\n"
                f"1. Log in to your HEMC student portal to choose another on-duty doctor or alternative date: https://hemc.vercel.app/dashboard#booking-section\n"
                f"2. If you are experiencing symptoms, launch the 24/7 AI Health Assistant for immediate guidance.\n"
                f"3. For acute or severe medical distress, proceed immediately to the UNN Medical Centre Emergency Unit (Open 24/7).\n\n"
                f"Best regards,\n"
                f"HEMC Clinical Services\n"
                f"UNN Medical Centre"
            )
        elif status_clean == "completed":
            subject = "HEMC: Consultation Summary & Clinic Slip Available"
            body = (
                f"Dear {name},\n\n"
                f"Your consultation with {doctor_name} on {date} has been certified and completed.\n\n"
                f"Your official UNN Medical Centre Clinic Slip and electronic prescription are now available for review and download.\n\n"
                f"Access your clinic slip here: https://hemc.vercel.app/history?tab=appointments\n\n"
                f"Wishing you a quick and steady recovery,\n"
                f"HEMC Clinical Team"
            )
        else:
            subject = f"HEMC: Appointment {status.upper()}"
            body = (
                f"Dear {name},\n\n"
                f"This is an update regarding your scheduled appointment at the UNN Medical Centre.\n\n"
                f"- Scheduled Time: {date}\n"
                f"- Updated Status: {status.upper()}\n"
                f"- Attending Physician: {doctor_name}\n\n"
                f"You can view your appointment details anytime on your dashboard.\n\n"
                f"Best regards,\n"
                f"HEMC Clinical Services"
            )
        return self.send_email(email, subject, body)

    def notify_urgent_triage(self, email: str, name: str = "Student", symptoms_summary: str = "High fever > 3 days with persistent vomiting"):
        subject = "URGENT: HEMC Medical Centre Clinical Advisory"
        body = (
            f"URGENT CLINICAL ADVISORY\n\n"
            f"Dear {name},\n\n"
            f"Our AI Triage system evaluated your reported symptoms: \"{symptoms_summary}\" and identified critical red-flag emergency indicators.\n\n"
            f"RECOMMENDED IMMEDIATE ACTION:\n"
            f"1. Proceed immediately to the UNN Medical Centre Emergency Unit (Nsukka Campus).\n"
            f"2. Request rapid diagnostic testing (Malaria RDT / Blood Culture) and physical examination.\n"
            f"3. Avoid self-medicating with unprescribed antibiotics.\n\n"
            f"Emergency Contact: UNN Medical Centre Emergency Desk\n\n"
            f"HEMC Emergency Triage Support"
        )
        return self.send_email(email, subject, body)

    def notify_security_alert(self, email: str, name: str = "Student", action: str = "Password Changed"):
        subject = "HEMC Security Alert: Account Activity"
        body = (
            f"Dear {name},\n\n"
            f"This is a security confirmation that your HEMC portal password was recently updated.\n\n"
            f"- Activity: {action}\n"
            f"- Account: {email}\n"
            f"- Platform: HEMC Health Portal (UNN)\n\n"
            f"If you initiated this change, no further action is required.\n"
            f"If you did NOT make this change, please report immediately to UNN Medical Centre ICT Support.\n\n"
            f"HEMC Security Operations"
        )
        return self.send_email(email, subject, body)

    def notify_doctor_handover(self, email: str, doctor_name: str = "Physician", patient_name: str = "Student Patient", reason: str = "Specialist review"):
        subject = "HEMC Doctor Notice: Patient Referral Handover"
        body = (
            f"Dear Dr. {doctor_name},\n\n"
            f"A patient clinical case has been referred to your duty queue.\n\n"
            f"- Patient: {patient_name}\n"
            f"- Referral Reason: {reason}\n"
            f"- Action Required: Please review the patient's triage history and consultation details on your Doctor Panel.\n\n"
            f"HEMC Clinical Coordination Unit"
        )
        return self.send_email(email, subject, body)
