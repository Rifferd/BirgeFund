from sqlalchemy.orm import Session


class ProjectService:
    def __init__(self, db: Session) -> None:
        self.db = db
