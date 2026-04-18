from backend.models.base import engine, Base
from backend.models import contact, meeting, commitment, prep_brief
import os
from dotenv import load_dotenv

load_dotenv()

def init_db():
    print("Initializing database...")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Successfully created database tables.")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    init_db()
