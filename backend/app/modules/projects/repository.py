from sqlalchemy.orm import Session


class ProjectRepository:
    def __init__(self, db: Session) -> None:
        self.db = db
