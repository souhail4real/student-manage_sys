from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pymysql

# MySQL database URL with explicit connection details
# Using your username (souhail4real) and make sure the correct password is provided
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/student_management"

# Create engine with echo=True to see SQL commands 
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, echo=True
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()