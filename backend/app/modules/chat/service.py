from sqlalchemy.orm import Session
from .repository import ChatRepository
from .dto import ChatMessageRequest
from app.modules.knowledge_base.model import KnowledgeBase, DiseaseEnum, CategoryEnum
from app.modules.triage_rules.model import TriageRule, RuleOutcomeEnum
from app.core.config import settings
import re
from app.nlp.classifier import get_intent
from openai import OpenAI

import functools

try:
    openai_client = OpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL,
        timeout=2.5
    )
except Exception:
    openai_client = None

@functools.lru_cache(maxsize=128)
def reword_with_llm(raw_fact: str) -> str:
    if not openai_client or not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == "your_openai_api_key_here":
        return raw_fact
        
    try:
        response = openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL_NAME,
            messages=[
                {
                    "role": "user",
                    "content": f"Reword this verified health advisory warmly and conversationally for a university student in 1-2 clear sentences. Do not include any thinking steps, drafts, or internal monologue. Output ONLY the final response text:\n\n{raw_fact}"
                }
            ],
            temperature=0.3,
            max_tokens=150
        )
        content = response.choices[0].message.content.strip() if response.choices else ""
        if not content:
            return raw_fact

        # If model outputs thinking/reasoning steps, extract the clean final paragraph or fallback
        if "thinking process" in content.lower():
            paragraphs = [p.strip() for p in content.split("\n\n") if p.strip() and not p.lower().startswith("here's a thinking") and not p.startswith(("1.", "2.", "3.", "4.", "5.", "-"))]
            if paragraphs:
                return paragraphs[-1]
            return raw_fact
            
        return content
    except Exception as e:
        print(f"LLM Rewording notice (using instant verified clinical guidelines): {e}")
        return raw_fact

class ChatService:
    def __init__(self, db: Session):
        self.repo = ChatRepository(db)
        self.db = db

    def process_message(self, user_id: int, req: ChatMessageRequest):
        session = self.repo.get_or_create_active_session(user_id)
        self.repo.add_message(session.session_id, user_id, "user", req.content)

        text = req.content.strip().lower()
        intent, confidence = get_intent(text)

        # ── 1. Greeting ────────────────────────────────────────────────────────
        if intent == "greeting" or (re.search(r'\b(hi|hello|hey|good day|good morning|good afternoon|good evening|greet|start)\b', text) and len(text.split()) <= 4):
            response_text = (
                "Hello! I am the **UNN Health Education & Management Chatbot (HEMC)**.\n\n"
                "I provide verified guidance on **Malaria** and **Typhoid Fever** based strictly on WHO and NCDC clinical guidelines, symptom triage urgency evaluation, and UNN Medical Centre appointment bookings.\n\n"
                "How can I assist you with your health today?"
            )

        # ── 2. Symptom Triage & Red-Flag Assessment ─────────────────────────────
        elif intent == "symptom_check_start":
            # Check red flags
            has_persistent_vomiting = any(w in text for w in ["persistent vomit", "continuous vomit", "can't keep food down", "vomiting a lot"])
            has_dehydration = any(w in text for w in ["severe dehydration", "extremely thirsty", "sunken eyes", "dry mouth"])
            has_confusion = any(w in text for w in ["confus", "deliri", "hallucinat", "disorient"])
            has_breathing_diff = any(w in text for w in ["difficulty breath", "shortness of breath", "hard to breathe"])
            has_seizure = any(w in text for w in ["seizure", "convulsion", "fit"])
            
            # Duration detection
            has_prolonged_fever = bool(re.search(r'(3|4|5|6|7|week|several)\s*(days?|weeks?)', text)) or "more than 3 days" in text or "over 3 days" in text

            if has_persistent_vomiting or has_dehydration or has_confusion or has_breathing_diff or has_seizure or has_prolonged_fever:
                # Trigger Urgent AI Triage Notification
                try:
                    from app.modules.notifications.repository import NotificationRepository
                    notif_repo = NotificationRepository(self.db)
                    notif_repo.create_notification(
                        user_id=user_id,
                        title="Urgent Triage Alert: Severe Symptoms Detected",
                        message="AI triage flagged severe symptoms. Please proceed immediately to the UNN Medical Centre Emergency Unit.",
                        link="/chat"
                    )
                except Exception as notif_err:
                    print(f"Failed to create triage notification: {notif_err}")

                response_text = (
                    "**URGENT CLINICAL ALERT — PROCEED TO MEDICAL CENTRE**\n\n"
                    "Based on your reported symptoms (e.g. prolonged fever or red-flag emergency signs), this is evaluated as **URGENT**.\n\n"
                    "**Recommended Immediate Steps:**\n"
                    "1. Proceed immediately to the **UNN Medical Centre Emergency Unit** (Nsukka Campus).\n"
                    "2. Request a physical examination and diagnostic laboratory testing (Malaria Rapid Diagnostic Test / Blood Culture).\n"
                    "3. Stay hydrated with Oral Rehydration Salts (ORS) or clean water on your way.\n\n"
                    "*Disclaimer: HEMC is a health education and triage urgency support tool. It does not provide definitive medical diagnoses.*"
                )
            else:
                response_text = (
                    "**SYMPTOM EVALUATION — CONSULTATION RECOMMENDED**\n\n"
                    "You have reported symptoms that are common in malaria or early typhoid infections (such as fever or body aches under 3 days without emergency red flags).\n\n"
                    "**Recommended Action:**\n"
                    "• Visit the UNN Medical Centre soon for a rapid malaria diagnostic test (RDT) or consultation.\n"
                    "• Avoid self-medicating with unprescribed antibiotics or heavy analgesics.\n"
                    "• Rest and drink plenty of fluids.\n\n"
                    "Would you like to book an appointment with our on-duty Medical Centre doctor right now on your Dashboard?\n\n"
                    "*Disclaimer: This evaluation assesses urgency level only and is not a clinical diagnosis.*"
                )

        # ── 3. Health Education: Malaria (WHO / NCDC) ───────────────────────────
        elif intent.startswith("education_malaria_") or ("malaria" in text or ("mosquito" in text and "typhoid" not in text)):
            cat = CategoryEnum.general
            if "symptom" in intent or any(w in text for w in ["symptom", "sign", "feel", "notice"]):
                cat = CategoryEnum.symptom
            elif "cause" in intent or any(w in text for w in ["cause", "why", "transmit", "spread", "parasite"]):
                cat = CategoryEnum.cause
            elif "prevent" in intent or any(w in text for w in ["prevent", "avoid", "protect", "net", "stop"]):
                cat = CategoryEnum.prevention

            kb_entry = self.db.query(KnowledgeBase).filter(
                KnowledgeBase.disease == DiseaseEnum.malaria,
                KnowledgeBase.category == cat
            ).first()

            if kb_entry:
                response_text = (
                    f"**Health Education: Malaria ({cat.value.capitalize()})**\n\n"
                    f"{kb_entry.content}\n\n"
                    f"*Verified Source: {kb_entry.source.value} Clinical Guidelines*"
                )
            else:
                response_text = (
                    "**Malaria Overview:**\n\n"
                    "Malaria is caused by Plasmodium parasites transmitted through bites of infected female Anopheles mosquitoes. "
                    "Key symptoms include fever, chills, headache, and fatigue. It is fully preventable by sleeping under insecticide-treated bed nets (LLINs) "
                    "and removing stagnant water around hostels.\n\n"
                    "*Source: World Health Organization*"
                )

        # ── 4. Health Education: Typhoid (WHO / NCDC) ───────────────────────────
        elif intent.startswith("education_typhoid_") or ("typhoid" in text or ("salmonella" in text and "malaria" not in text)):
            cat = CategoryEnum.general
            if "symptom" in intent or any(w in text for w in ["symptom", "sign", "feel", "notice"]):
                cat = CategoryEnum.symptom
            elif "cause" in intent or any(w in text for w in ["cause", "why", "transmit", "spread", "water"]):
                cat = CategoryEnum.cause
            elif "prevent" in intent or any(w in text for w in ["prevent", "avoid", "protect", "clean", "hygiene"]):
                cat = CategoryEnum.prevention

            kb_entry = self.db.query(KnowledgeBase).filter(
                KnowledgeBase.disease == DiseaseEnum.typhoid,
                KnowledgeBase.category == cat
            ).first()

            if kb_entry:
                response_text = (
                    f"**Health Education: Typhoid Fever ({cat.value.capitalize()})**\n\n"
                    f"{kb_entry.content}\n\n"
                    f"*Verified Source: {kb_entry.source.value} Clinical Guidelines*"
                )
            else:
                response_text = (
                    "**Typhoid Fever Overview:**\n\n"
                    "Typhoid fever is caused by the bacterium *Salmonella enterica* serotype Typhi, spread through contaminated water or food. "
                    "Symptoms include high prolonged fever, headache, abdominal pain, and fatigue. Prevention focuses on drinking clean water, "
                    "diligent handwashing, and food hygiene.\n\n"
                    "*Source: World Health Organization*"
                )

        # ── 5. Appointment Booking ─────────────────────────────────────────────
        elif intent == "book_appointment" or any(w in text for w in ["book", "appointment", "schedule", "see a doctor"]):
            from app.modules.doctors.models.doctor import Doctor
            from app.modules.users.model import User
            
            doctors = self.db.query(Doctor, User).join(User, Doctor.user_id == User.id).filter(Doctor.is_available == True).all()
            
            doc_list = []
            for doc, user_data in doctors:
                doc_list.append(f"• **{user_data.name}** — {doc.specialization}")
                
            doc_str = "\n".join(doc_list) if doc_list else "• No doctors currently available."
            
            response_text = (
                "📅 **UNN Medical Centre Appointment Booking**\n\n"
                "You can schedule an appointment directly from your **Dashboard** or the Appointments tab.\n\n"
                "**Currently On-Duty Doctors at UNN:**\n"
                f"{doc_str}\n\n"
                "Head to your Dashboard to select a doctor and confirm your preferred consultation date."
            )

        # ── 6. Fallback / AI Model Response ────────────────────────────────────
        else:
            ai_reply = None
            if openai_client and settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here":
                try:
                    resp = openai_client.chat.completions.create(
                        model=settings.OPENAI_MODEL_NAME,
                        messages=[
                            {
                                "role": "system",
                                "content": "You are HEMC, the friendly UNN Health Education & Management assistant. Answer in 2-3 warm, accurate sentences based on WHO/NCDC guidelines."
                            },
                            {"role": "user", "content": req.content}
                        ],
                        temperature=0.3,
                        max_tokens=200
                    )
                    if resp.choices:
                        ai_reply = resp.choices[0].message.content.strip()
                except Exception as e:
                    print(f"AI response fallback: {e}")

            if ai_reply:
                response_text = ai_reply
            else:
                response_text = (
                    "I am the UNN Health Education & Management Chatbot, specialized in WHO & NCDC guidelines for **Malaria** and **Typhoid Fever**, symptom triage, and Medical Centre appointments.\n\n"
                    "**Try asking me:**\n"
                    "• *'What are the symptoms of malaria?'*\n"
                    "• *'What causes typhoid fever?'*\n"
                    "• *'How can I prevent mosquito bites in the hostel?'*\n"
                    "• *'I have had a high fever for 3 days and vomiting'*\n"
                    "• *'Book an appointment with a doctor'*"
                )

        # Save system message
        self.repo.add_message(session.session_id, user_id, "bot", response_text)

        return self.repo.get_session_with_messages(session.session_id)

    def end_current_session(self, user_id: int):
        session = self.repo.get_or_create_active_session(user_id)
        self.repo.end_session(session.session_id)
        return {"ok": True}
