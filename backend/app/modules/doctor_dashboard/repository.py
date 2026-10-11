from sqlalchemy.orm import Session
from .models.patient_assignment import PatientAssignment, AssignmentStatusEnum
from .models.patient_handover import PatientHandover, HandoverReasonEnum

class DashboardRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_assignments(self, doctor_id: int):
        return self.db.query(PatientAssignment).filter(PatientAssignment.doctor_id == doctor_id).all()

    def get_assignment_by_id(self, assignment_id: int):
        return self.db.query(PatientAssignment).filter(PatientAssignment.assignment_id == assignment_id).first()

    def create_handover(self, assignment_id: int, from_doc: int, to_doc: int, reason: HandoverReasonEnum, notes: str):
        handover = PatientHandover(
            assignment_id=assignment_id,
            from_doctor_id=from_doc,
            to_doctor_id=to_doc,
            reason=reason,
            notes=notes
        )
        self.db.add(handover)
        self.db.commit()
        self.db.refresh(handover)
        return handover

    def get_handovers_for_doctor(self, doctor_id: int):
        return self.db.query(PatientHandover).filter(
            (PatientHandover.to_doctor_id == doctor_id) & 
            (PatientHandover.acknowledged_at == None)
        ).all()
