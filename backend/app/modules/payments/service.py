from sqlalchemy.orm import Session


class PaymentService:
    def __init__(self, db: Session) -> None:
        self.db = db
