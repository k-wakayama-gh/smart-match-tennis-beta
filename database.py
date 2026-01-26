# database.py

# Libraries
from sqlmodel import SQLModel, create_engine, Session

# SQLite database
DATABASE_URL = "sqlite:///database.sqlite"
engine = create_engine(DATABASE_URL)

def create_database():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session


if __name__ == "__main__":
    create_database()

