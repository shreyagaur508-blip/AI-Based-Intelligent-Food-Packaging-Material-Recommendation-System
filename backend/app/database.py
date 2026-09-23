from sqlmodel import SQLModel, create_engine, Session
import os

DB_FILE = "skillbridge.db"
DB_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DB_FILE}")

# connect_args={"check_same_thread": False} is required for SQLite in multithreaded FastAPI apps
engine = create_engine(DB_URL, connect_args={"check_same_thread": False}, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
