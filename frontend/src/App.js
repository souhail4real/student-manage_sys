import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
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
  Layout,
  Switch,
  Tag,
  Row,
  Col,
  Avatar,
  Statistic,
  Badge,
  Select,
  Modal,
  Tooltip,
  Drawer,
  Divider,
  ColorPicker
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  BookOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css'; // Import Ant Design styles
import './App.css'; // Keep your custom CSS
import moment from 'moment'; // For date handling

const { Text } = Typography;
const { Content, Header } = Layout;
const { Item: FormItem } = Form;
const { Option } = Select;

// Base URL for the API
const API_URL = 'http://localhost:8000';

// Get current month and year for subscription tracking
const currentMonth = moment().format('MMMM YYYY');

// Current date and username (from the system)
const currentDateTime = '2025-04-03 22:56:31';
const username = 'souhail4real';

// Default class options
const defaultClassOptions = [
  { id: 1, name: 'Class A', color: '#1890ff' },
  { id: 2, name: 'Class B', color: '#52c41a' },
  { id: 3, name: 'Class C', color: '#722ed1' },
  { id: 4, name: 'Class D', color: '#faad14' },
  { id: 5, name: 'Class E', color: '#f5222d' }
];

function App() {
  // State management
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm(); // Ant Design form instance
  const [classForm] = Form.useForm(); // Form for class management
  const [subscriptionStatus, setSubscriptionStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [classes, setClasses] = useState(defaultClassOptions);
  const [isClassDrawerVisible, setIsClassDrawerVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  // Fetch all students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/students/`);
      
      // Initialize subscription status and class for new students
      const studentsData = response.data.map(student => {
        // If student doesn't have a class, assign a random one for demo purposes
        const studentWithClass = {
          ...student,
          class_id: student.class_id || Math.floor(Math.random() * classes.length) + 1
        };
        return studentWithClass;
      });
      
      const initialStatus = { ...subscriptionStatus };
      
      studentsData.forEach(student => {
        if (initialStatus[student.id] === undefined) {
          initialStatus[student.id] = false; // Default to not paid
        }
      });
      
      setSubscriptionStatus(initialStatus);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a new student
  const addStudent = async (values) => {
    try {
      // In a real app, you would send the class in the API call
      const response = await axios.post(`${API_URL}/students/`, values);
      
      // Initialize subscription status for the new student
      setSubscriptionStatus(prev => ({
        ...prev,
        [response.data.id]: false // Default to not paid
      }));
      
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
      
      // Remove subscription status for the deleted student
      const updatedStatus = { ...subscriptionStatus };
      delete updatedStatus[id];
      setSubscriptionStatus(updatedStatus);
      
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
      grade: student.grade,
      class_id: student.class_id
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

  // Handle subscription status change
  const handleSubscriptionChange = (studentId, paid) => {
    setSubscriptionStatus(prev => ({
      ...prev,
      [studentId]: paid
    }));
    
    // Show a notification with the updated status
    message.success({
      content: `Subscription status for student #${studentId} ${paid ? 'marked as paid' : 'marked as unpaid'}`,
      icon: paid ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#f5222d' }} />
    });
    
    // In a real application, you might want to send this to your backend:
    // axios.post(`${API_URL}/subscriptions/`, { 
    //   student_id: studentId, 
    //   month: currentMonth,
    //   paid: paid
    // });
  };

  // Filter students by class
  const getFilteredStudents = () => {
    if (activeTab === 'all') {
      return students;
    }
    const classId = parseInt(activeTab);
    return students.filter(student => student.class_id === classId);
  };

  // Get class by ID
  const getClass = (classId) => {
    return classes.find(c => c.id === classId) || { name: 'Unknown', color: '#bfbfbf' };
  };

  // Get class color
  const getClassColor = (classId) => {
    const classItem = getClass(classId);
    return classItem.color;
  };

  // Get class name
  const getClassName = (classId) => {
    const classItem = getClass(classId);
    return classItem.name;
  };

  // Count students by class
  const classStudentCounts = classes.reduce((acc, classOption) => {
    acc[classOption.id] = students.filter(student => student.class_id === classOption.id).length;
    return acc;
  }, {});

  // Open class management drawer
  const showClassDrawer = () => {
    setIsClassDrawerVisible(true);
  };

  // Close class management drawer
  const closeClassDrawer = () => {
    setIsClassDrawerVisible(false);
    setEditingClass(null);
    classForm.resetFields();
  };

  // Add a new class
  const addClass = (values) => {
    const newId = classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1;
    const newClass = {
      id: newId,
      name: values.name,
      color: values.color
    };
    
    setClasses([...classes, newClass]);
    classForm.resetFields();
    message.success(`Class "${values.name}" added successfully!`);
  };

  // Update an existing class
  const updateClass = (values) => {
    const updatedClasses = classes.map(cls => 
      cls.id === editingClass.id 
        ? { ...cls, name: values.name, color: values.color }
        : cls
    );
    
    setClasses(updatedClasses);
    setEditingClass(null);
    classForm.resetFields();
    message.success(`Class "${values.name}" updated successfully!`);
  };

  // Delete a class
  const deleteClass = (classId) => {
    // Check if class has students
    const hasStudents = students.some(student => student.class_id === classId);
    
    if (hasStudents) {
      Modal.confirm({
        title: 'This class has students assigned to it',
        content: 'If you delete this class, all students will be reassigned to the first available class. Do you want to continue?',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
          // Reassign students
          const defaultClassId = classes[0]?.id;
          const updatedStudents = students.map(student => 
            student.class_id === classId 
              ? { ...student, class_id: defaultClassId }
              : student
          );
          
          setStudents(updatedStudents);
          
          // Remove the class
          const updatedClasses = classes.filter(cls => cls.id !== classId);
          setClasses(updatedClasses);
          
          // If the deleted class was active, set to 'all'
          if (activeTab === classId.toString()) {
            setActiveTab('all');
          }
          
          message.success('Class deleted and students reassigned successfully!');
        }
      });
    } else {
      // No students, just delete the class
      const updatedClasses = classes.filter(cls => cls.id !== classId);
      setClasses(updatedClasses);
      
      // If the deleted class was active, set to 'all'
      if (activeTab === classId.toString()) {
        setActiveTab('all');
      }
      
      message.success('Class deleted successfully!');
    }
  };

  // Edit class
  const editClass = (cls) => {
    setEditingClass(cls);
    classForm.setFieldsValue({
      name: cls.name,
      color: cls.color
    });
  };

  // Class form submission handler
  const onClassFormFinish = (values) => {
    if (editingClass) {
      updateClass(values);
    } else {
      addClass(values);
    }
  };

  // Get subscription summary
  const filteredStudents = getFilteredStudents();
  const filteredIds = filteredStudents.map(student => student.id);
  const filteredSubscriptions = Object.entries(subscriptionStatus)
    .filter(([id]) => filteredIds.includes(Number(id)))
    .reduce((acc, [id, status]) => {
      acc[id] = status;
      return acc;
    }, {});

  const paidCount = Object.values(filteredSubscriptions).filter(Boolean).length;
  const totalStudents = filteredStudents.length;
  const unpaidCount = totalStudents - paidCount;
  const paidPercentage = totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0;

  // Create class options for select
  const classSelectOptions = classes.map(cls => ({
    value: cls.id,
    label: cls.name,
    color: cls.color
  }));

  // Table columns configuration
  const columns = [
    {
      title: 'Student',
      key: 'student',
      render: (record) => (
        <Space>
          <Avatar 
            style={{ 
              backgroundColor: getClassColor(record.class_id),
              verticalAlign: 'middle'
            }}
            icon={<UserOutlined />}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{`${record.first_name} ${record.last_name}`}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: <Space><CalendarOutlined /> Birth Date</Space>,
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      width: 80,
      render: (grade) => (
        <Tag color="blue" style={{ fontWeight: 'bold' }}>{grade}</Tag>
      )
    },
    {
      title: <Space><BookOutlined /> Class</Space>,
      key: 'class',
      width: 100,
      render: (_, record) => {
        const classObj = getClass(record.class_id);
        return (
          <Tag color={classObj.color} style={{ fontWeight: 'bold' }}>
            {classObj.name}
          </Tag>
        );
      }
    },
    {
      title: (
        <Space>
          <DollarOutlined />
          <span>Subscription ({currentMonth})</span>
        </Space>
      ),
      key: 'subscription',
      width: 200,
      render: (_, record) => {
        const isPaid = subscriptionStatus[record.id] || false;
        return (
          <Space>
            <Switch
              checked={isPaid}
              onChange={(checked) => handleSubscriptionChange(record.id, checked)}
              checkedChildren="Paid"
              unCheckedChildren="Unpaid"
              className={isPaid ? 'subscription-paid' : 'subscription-unpaid'}
            />
            <Badge 
              status={isPaid ? 'success' : 'error'} 
              text={isPaid ? 'Paid' : 'Unpaid'} 
            />
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            ghost
            icon={<EditOutlined />} 
            onClick={() => editStudent(record)}
            className="edit-button"
            size="middle"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this student?"
            description="This action cannot be undone."
            onConfirm={() => deleteStudent(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              size="middle"
              ghost
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="app-container">
      <Header className="app-header">
        <div className="logo">
          <TeamOutlined /> Student Management
        </div>
        <div className="user-info">
          <Space>
            <Text type="secondary">{currentDateTime}</Text>
            <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
            <Text strong>{username}</Text>
          </Space>
        </div>
      </Header>
      
      <Content className="app-content">
        <Row gutter={[24, 24]}>
          {/* Dashboard stats */}
          <Col span={24}>
            <Row gutter={[16, 16]} className="stats-row">
              <Col xs={24} sm={8}>
                <Card className="stat-card">
                  <Statistic 
                    title={
                      <Text>
                        Total Students {activeTab !== 'all' && 
                          <Tag color={getClassColor(parseInt(activeTab))}>
                            {getClassName(parseInt(activeTab))}
                          </Tag>
                        }
                      </Text>
                    } 
                    value={totalStudents} 
                    prefix={<TeamOutlined />} 
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="stat-card">
                  <Statistic 
                    title="Paid Subscriptions" 
                    value={paidCount} 
                    suffix={`/ ${totalStudents}`}
                    prefix={<CheckCircleOutlined />} 
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="stat-card">
                  <Statistic 
                    title="Payment Rate" 
                    value={paidPercentage} 
                    suffix="%" 
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: paidPercentage > 50 ? '#52c41a' : '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
          
          {/* Main content */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <Space>
                  {isEditing ? <EditOutlined /> : <UserOutlined />}
                  <span>{isEditing ? 'Edit Student' : 'Add New Student'}</span>
                </Space>
              }
              className="form-card"
              bordered={false}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                className="student-form"
                initialValues={{ class_id: classes[0]?.id }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <FormItem
                      name="first_name"
                      label="First Name"
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <Input placeholder="First name" />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      name="last_name"
                      label="Last Name"
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <Input placeholder="Last name" />
                    </FormItem>
                  </Col>
                </Row>

                <FormItem
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="student@example.com" />
                </FormItem>

                <Row gutter={16}>
                  <Col span={12}>
                    <FormItem
                      name="date_of_birth"
                      label="Date of Birth"
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      name="grade"
                      label="Grade"
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <Input placeholder="Enter grade" />
                    </FormItem>
                  </Col>
                </Row>

                <FormItem
                  name="class_id"
                  label={
                    <Space>
                      <span>Class</span>
                      <Tooltip title="Manage Classes">
                        <Button 
                          type="link" 
                          size="small" 
                          icon={<SettingOutlined />} 
                          onClick={(e) => {
                            e.preventDefault();
                            showClassDrawer();
                          }}
                        />
                      </Tooltip>
                    </Space>
                  }
                  rules={[{ required: true, message: 'Please select a class' }]}
                >
                  <Select placeholder="Select class">
                    {classSelectOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        <Tag color={option.color}>{option.label}</Tag>
                      </Option>
                    ))}
                  </Select>
                </FormItem>

                <FormItem>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    {isEditing && (
                      <Button 
                        htmlType="button" 
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="primary" 
                      htmlType="submit"
                    >
                      {isEditing ? 'Update Student' : 'Add Student'}
                    </Button>
                  </Space>
                </FormItem>
              </Form>
            </Card>
          </Col>
          
          <Col xs={24} lg={16}>
            <Card 
              title={
                <Space>
                  <TeamOutlined />
                  <span>Student List</span>
                  {unpaidCount > 0 && (
                    <Badge count={unpaidCount} style={{ backgroundColor: '#ff4d4f' }}>
                      <Tag color="red">Unpaid</Tag>
                    </Badge>
                  )}
                </Space>
              }
              bordered={false}
              className="list-card"
              extra={
                <Space>
                  <Tooltip title="Manage Classes">
                    <Button 
                      icon={<BookOutlined />} 
                      onClick={showClassDrawer}
                    >
                      Manage Classes
                    </Button>
                  </Tooltip>
                  <Button 
                    type="primary" 
                    icon={<ReloadOutlined />} 
                    onClick={fetchStudents}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                </Space>
              }
              tabList={[
                {
                  key: 'all',
                  tab: (
                    <Space>
                      <TeamOutlined />
                      <span>All Classes</span>
                      <Badge count={students.length} style={{ backgroundColor: '#1890ff' }} />
                    </Space>
                  ),
                },
                ...classes.map(option => ({
                  key: option.id.toString(),
                  tab: (
                    <Space>
                      <BookOutlined style={{ color: option.color }} />
                      <span>{option.name}</span>
                      <Badge count={classStudentCounts[option.id] || 0} style={{ backgroundColor: option.color }} />
                    </Space>
                  ),
                }))
              ]}
              activeTabKey={activeTab}
              onTabChange={setActiveTab}
            >
              <Table 
                dataSource={filteredStudents} 
                columns={columns} 
                rowKey="id"
                pagination={{ 
                  pageSize: 8,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} students`
                }}
                loading={loading}
                locale={{ 
                  emptyText: (
                    <div className="empty-table">
                      <TeamOutlined style={{ fontSize: '32px', color: '#bfbfbf' }} />
                      <Text type="secondary" style={{ marginTop: '8px' }}>No students found. Add some students!</Text>
                    </div>
                  ) 
                }}
                scroll={{ x: 1100 }}
                className="students-table"
              />
            </Card>
          </Col>
        </Row>
      </Content>

      {/* Class Management Drawer */}
      <Drawer
        title={
          <Space>
            <BookOutlined />
            <span>Manage Classes</span>
          </Space>
        }
        placement="right"
        width={400}
        onClose={closeClassDrawer}
        open={isClassDrawerVisible}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingClass(null);
              classForm.resetFields();
            }}
            disabled={!editingClass}
          >
            New Class
          </Button>
        }
      >
        <Form
          form={classForm}
          layout="vertical"
          onFinish={onClassFormFinish}
          initialValues={{ color: '#1890ff' }}
        >
          <FormItem
            name="name"
            label="Class Name"
            rules={[{ required: true, message: 'Please enter a class name' }]}
          >
            <Input placeholder="Enter class name" />
          </FormItem>

          <FormItem
            name="color"
            label="Class Color"
            rules={[{ required: true, message: 'Please select a color' }]}
          >
            <ColorPicker />
          </FormItem>

          <FormItem>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              {editingClass && (
                <Button 
                  htmlType="button" 
                  onClick={() => {
                    setEditingClass(null);
                    classForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="primary" 
                htmlType="submit"
              >
                {editingClass ? 'Update Class' : 'Add Class'}
              </Button>
            </Space>
          </FormItem>
        </Form>

        <Divider orientation="left">Available Classes</Divider>
        
        {classes.length === 0 ? (
          <div className="empty-classes">
            <BookOutlined style={{ fontSize: '24px', color: '#bfbfbf' }} />
            <Text type="secondary">No classes found. Add some classes!</Text>
          </div>
        ) : (
          <div className="class-list">
            {classes.map(cls => (
              <div key={cls.id} className="class-item">
                <div className="class-info">
                  <Tag color={cls.color} style={{ marginRight: '8px' }}>{cls.name}</Tag>
                  <Badge count={classStudentCounts[cls.id] || 0} style={{ backgroundColor: cls.color }} />
                </div>
                <Space>
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => editClass(cls)}
                    size="small"
                  />
                  <Popconfirm
                    title="Delete this class?"
                    description="Are you sure you want to delete this class?"
                    onConfirm={() => deleteClass(cls.id)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                    disabled={classes.length <= 1}
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      size="small"
                      disabled={classes.length <= 1}
                    />
                  </Popconfirm>
                </Space>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </Layout>
  );
}

export default App;