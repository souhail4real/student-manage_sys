from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

# Schema for creating a student
class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    date_of_birth: date
    grade: str

# Schema for updating a student
class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    date_of_birth: Optional[date] = None
    grade: Optional[str] = None

# Schema for returning student data
class Student(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    date_of_birth: date
    grade: str
    
    class Config:
        orm_mode = True