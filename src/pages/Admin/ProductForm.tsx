import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, message, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getProductById, createProduct, updateProduct } from '@/api/product';

const { Title } = Typography;
const { TextArea } = Input;

const AdminProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit && id) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchProduct = async () => {
    try {
      const response = await getProductById(Number(id));
      if (response.data.code === 200) {
        form.setFieldsValue(response.data.data);
      }
    } catch (error: any) {
      message.error(error.message || '获取商品信息失败');
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        const response = await updateProduct(Number(id), values);
        if (response.data.code === 200) {
          message.success('更新成功');
          navigate('/admin/products');
        }
      } else {
        const response = await createProduct(values);
        if (response.data.code === 200) {
          message.success('创建成功');
          navigate('/admin/products');
        }
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/admin/products')}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card>
        <Title level={3}>{isEdit ? '编辑商品' : '新增商品'}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="商品描述"
            rules={[{ required: true, message: '请输入商品描述' }]}
          >
            <TextArea rows={4} placeholder="请输入商品描述" />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格"
            rules={[
              { required: true, message: '请输入价格' },
              { type: 'number', min: 0.01, message: '价格必须大于0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入价格"
              min={0.01}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="库存"
            rules={[
              { required: true, message: '请输入库存' },
              { type: 'number', min: 0, message: '库存不能小于0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入库存"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请输入分类' }]}
          >
            <Input placeholder="请输入分类" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {isEdit ? '更新' : '创建'}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/products')}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminProductForm;

