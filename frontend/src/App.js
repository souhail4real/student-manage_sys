import React, { useState, useEffect } from 'react'; // Importing React and hooks
import axios from 'axios'; // Importing axios for API calls
import { toast } from 'react-toastify'; // Importing toast for notifications
import 'react-toastify/dist/ReactToastify.css'; // Importing toast CSS
import 'bootstrap/dist/css/bootstrap.min.css'; // Importing Bootstrap CSS
import './app.css'; // Importing custom CSS

// Base URL for the API
const API_URL = 'http://localhost:8000';

function App() {
  // State management
  const [students, setStudents] = useState([]); // Array to hold student data
  const [selectedStudent, setSelectedStudent] = useState(null); // Selected student for editing
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    grade: ''
  }); // Form data for adding or editing a student
  const [isEditing, setIsEditing] = useState(false); // Flag to check if editing mode is on
  const [formErrors, setFormErrors] = useState({}); // Form validation errors

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to fetch students.');
    }
  };

  // Add a new student
  const addStudent = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
    if (!formData.grade) errors.grade = 'Grade is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await axios.post(`${API_URL}/students/`, formData);
      resetForm();
      fetchStudents();
      toast.success('Student added successfully!');
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student.');
    }
  };

  // Update an existing student
  const updateStudent = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
    if (!formData.grade) errors.grade = 'Grade is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await axios.put(`${API_URL}/students/${selectedStudent.id}`, formData);
      resetForm();
      setIsEditing(false);
      fetchStudents();
      alert('Student updated successfully!');
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student.');
    }
  };

  // Delete a student
  const deleteStudent = async (id) => {
    // Show the custom confirmation with inline CSS styles
    toast(
      ({ closeToast }) => (
        <div className="toast-custom">
          <p>Are you sure you want to delete this student?</p>
          <button 
            onClick={async () => { 
              try {
                // Proceed with deletion if confirmed
                await axios.delete(`${API_URL}/students/${id}`);
                fetchStudents();
                toast.success('Student deleted successfully!');
                closeToast(); // Close the toast after success
              } catch (error) {
                console.error('Error deleting student:', error);
                toast.error('Failed to delete student.');
                closeToast(); // Close the toast after failure
              }
            }} 
            className="btn btn-success"
          >
            Yes
          </button>
          <button 
            onClick={closeToast} 
            className="btn btn-danger"
          >
            No
          </button>
        </div>
      ),
      { position: 'top-center', autoClose: false }
    );
  };

  // Edit a student (prep for update)
  const editStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      date_of_birth: student.date_of_birth,
      grade: student.grade
    });
    setIsEditing(true);
  };

  // Reset form and editing state
  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      date_of_birth: '',
      grade: ''
    });
    setFormErrors({});
    setSelectedStudent(null);
    setIsEditing(false);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Student Management System</h1>
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              {isEditing ? 'Edit Student' : 'Add New Student'}
            </div>
            <div className="card-body">
              <form onSubmit={isEditing ? updateStudent : addStudent}>
                <div className="mb-3">
                  <label htmlFor="first_name" className="form-label">First Name</label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.first_name ? 'is-invalid' : ''}`}
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                  {formErrors.first_name && (
                    <div className="invalid-feedback">{formErrors.first_name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="last_name" className="form-label">Last Name</label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.last_name ? 'is-invalid' : ''}`}
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                  {formErrors.last_name && (
                    <div className="invalid-feedback">{formErrors.last_name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && (
                    <div className="invalid-feedback">{formErrors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className={`form-control ${formErrors.date_of_birth ? 'is-invalid' : ''}`}
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                  />
                  {formErrors.date_of_birth && (
                    <div className="invalid-feedback">{formErrors.date_of_birth}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="grade" className="form-label">Grade</label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.grade ? 'is-invalid' : ''}`}
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                  />
                  {formErrors.grade && (
                    <div className="invalid-feedback">{formErrors.grade}</div>
                  )}
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className={`btn ${isEditing ? 'btn-success' : 'btn-primary'}`}>
                    {isEditing ? 'Update Student' : 'Add Student'}
                  </button>
                  {isEditing && (
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <span>Student List</span>
              <button className="btn btn-sm btn-light" onClick={fetchStudents}>
                Refresh
              </button>
            </div>
            <div className="card-body">
              {students.length === 0 ? (
                <div className="alert alert-info">No students found. Add some students!</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Birth Date</th>
                        <th>Grade</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td>{student.id}</td>
                          <td>{student.first_name} {student.last_name}</td>
                          <td>{student.email}</td>
                          <td>{student.date_of_birth}</td>
                          <td>{student.grade}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-warning me-1"
                              onClick={() => editStudent(student)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteStudent(student.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;