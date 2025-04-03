import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { message, notification } from 'antd';
import { 
  Table, 
  Form, 
  Input, 
  Button, 
  DatePicker, 
  Card, 
  Typography, 
  Space, 
  Popconfirm, 
  Divider,
  Layout
} from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Import Ant Design styles
import './App.css'; // Keep your custom CSS
import moment from 'moment'; // For date handling

const { Title } = Typography;
const { Content } = Layout;
const { Item: FormItem } = Form;

// Base URL for the API
const API_URL = 'http://localhost:8000';

function App() {
  // State management
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm(); // Ant Design form instance

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Failed to fetch students.');
    }
  };

  // Add a new student
  const addStudent = async (values) => {
    try {
      await axios.post(`${API_URL}/students/`, values);
      resetForm();
      fetchStudents();
      message.success('Student added successfully!');
    } catch (error) {
      console.error('Error adding student:', error);
      message.error('Failed to add student.');
    }
  };

  // Update an existing student
  const updateStudent = async (values) => {
    try {
      await axios.put(`${API_URL}/students/${selectedStudent.id}`, values);
      resetForm();
      setIsEditing(false);
      fetchStudents();
      message.success('Student updated successfully!');
    } catch (error) {
      console.error('Error updating student:', error);
      message.error('Failed to update student.');
    }
  };

  // Delete a student
  const deleteStudent = async (id) => {
    try {
      await axios.delete(`${API_URL}/students/${id}`);
      fetchStudents();
      message.success('Student deleted successfully!');
    } catch (error) {
      console.error('Error deleting student:', error);
      message.error('Failed to delete student.');
    }
  };

  // Edit a student (prep for update)
  const editStudent = (student) => {
    setSelectedStudent(student);
    setIsEditing(true);
    form.setFieldsValue({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      date_of_birth: student.date_of_birth ? moment(student.date_of_birth) : null,
      grade: student.grade
    });
  };

  // Reset form and editing state
  const resetForm = () => {
    form.resetFields();
    setSelectedStudent(null);
    setIsEditing(false);
  };

  // Form submission handler
  const onFinish = (values) => {
    // Convert the date format
    if (values.date_of_birth) {
      values.date_of_birth = values.date_of_birth.format('YYYY-MM-DD');
    }
    
    if (isEditing) {
      updateStudent(values);
    } else {
      addStudent(values);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      key: 'name',
      render: (record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Birth Date',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => editStudent(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this student?"
            onConfirm={() => deleteStudent(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="app-container">
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
          Student Management System
        </Title>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {/* Student Form Card */}
          <Card 
            title={isEditing ? 'Edit Student' : 'Add New Student'}
            style={{ width: 350, flexShrink: 0 }}
            headStyle={{ backgroundColor: '#1890ff', color: 'white' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <FormItem
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: 'First name is required' }]}
              >
                <Input placeholder="Enter first name" />
              </FormItem>

              <FormItem
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: 'Last name is required' }]}
              >
                <Input placeholder="Enter last name" />
              </FormItem>

              <FormItem
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email" />
              </FormItem>

              <FormItem
                name="date_of_birth"
                label="Date of Birth"
                rules={[{ required: true, message: 'Date of birth is required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </FormItem>

              <FormItem
                name="grade"
                label="Grade"
                rules={[{ required: true, message: 'Grade is required' }]}
              >
                <Input placeholder="Enter grade" />
              </FormItem>

              <FormItem>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  style={{ width: '100%', marginBottom: '8px' }}
                >
                  {isEditing ? 'Update Student' : 'Add Student'}
                </Button>
                
                {isEditing && (
                  <Button 
                    htmlType="button" 
                    style={{ width: '100%' }} 
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                )}
              </FormItem>
            </Form>
          </Card>

          {/* Student List Card */}
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Student List</span>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={fetchStudents}
                >
                  Refresh
                </Button>
              </div>
            }
            style={{ flex: 1 }}
            headStyle={{ backgroundColor: '#1890ff', color: 'white' }}
          >
            <Table 
              dataSource={students} 
              columns={columns} 
              rowKey="id"
              pagination={{ pageSize: 5 }}
              locale={{ 
                emptyText: (
                  <div style={{ padding: '16px 0' }}>
                    No students found. Add some students!
                  </div>
                ) 
              }}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

export default App;