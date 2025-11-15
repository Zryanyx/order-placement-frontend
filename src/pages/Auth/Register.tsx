import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { register, checkUsername, checkEmail } from '@/api/auth';
import { debounce } from '@/utils/debounce';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 检查用户名是否已存在
  const validateUsername = debounce(async (_, value: string) => {
    if (!value || value.length < 3) {
      return Promise.resolve();
    }
    try {
      const exists = await checkUsername(value);
      if (exists) {
        return Promise.reject(new Error('用户名已存在'));
      }
    } catch (error) {
      return Promise.reject(new Error('检查用户名失败'));
    }
  }, 500);

  // 检查邮箱是否已存在
  const validateEmail = debounce(async (_, value: string) => {
    if (!value) {
      return Promise.resolve();
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Promise.reject(new Error('请输入有效的邮箱地址'));
    }
    try {
      const exists = await checkEmail(value);
      if (exists) {
        return Promise.reject(new Error('邮箱已存在'));
      }
    } catch (error) {
      return Promise.reject(new Error('检查邮箱失败'));
    }
  }, 500);

  const onFinish = async (values: { username: string; password: string; email: string; confirmPassword?: string }) => {
    console.log('表单提交，准备发送注册请求');
    setLoading(true);
    try {
      // 只传递必要的字段给register函数，不包含confirmPassword
      const { confirmPassword, ...registerData } = values;
      console.log('发送注册请求的数据:', registerData);
      const response = await register(registerData);
      console.log('注册请求响应:', response);
      if (response.data.code === 200) {
        message.success('注册成功，请登录');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      message.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <Card title="用户注册" style={{ width: 400 }}>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度为3-20个字符' },
              { validator: validateUsername },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
              { validator: validateEmail },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度为6-20个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            已有账号？<Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;

