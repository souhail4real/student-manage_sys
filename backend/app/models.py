from sqlalchemy import Column, Integer, String, Date
from app.database import Base

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    # Add specific lengths for all String columns
    first_name = Column(String(100), index=True)
    last_name = Column(String(100), index=True)
    email = Column(String(100), unique=True, index=True)
    date_of_birth = Column(Date)
    grade = Column(String(20))