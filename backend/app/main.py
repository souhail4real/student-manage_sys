from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import app.models as models
import app.schemas as schemas
from .database import engine, get_db
from typing import List

# Create tables in the database
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="Student Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GET route to retrieve all students
@app.get("/students/", response_model=List[schemas.Student])
def get_students(db: Session = Depends(get_db)):
    students = db.query(models.Student).all()
    return students

# GET route to retrieve a specific student by ID
@app.get("/students/{student_id}", response_model=schemas.Student)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

# POST route to create a new student
@app.post("/students/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    db_student = db.query(models.Student).filter(models.Student.email == student.email).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create student object
    db_student = models.Student(
        first_name=student.first_name,
        last_name=student.last_name,
        email=student.email,
        date_of_birth=student.date_of_birth,
        grade=student.grade
    )
    
    # Add to database
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

# PUT route to update a student
@app.put("/students/{student_id}", response_model=schemas.Student)
def update_student(student_id: int, student: schemas.StudentUpdate, db: Session = Depends(get_db)):
    # Get student from database
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Update student data if provided
    student_data = student.dict(exclude_unset=True)
    for key, value in student_data.items():
        setattr(db_student, key, value)
    
    # Commit changes
    db.commit()
    db.refresh(db_student)
    return db_student

# DELETE route to delete a student
@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    # Get student from database
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Delete student
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}