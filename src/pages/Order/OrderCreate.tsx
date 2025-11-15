import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Table, Space, message, Typography, Divider } from 'antd';
import { createOrder } from '@/api/order';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { CartItem } from '@/types';

const { Title } = Typography;
const { TextArea } = Input;

const OrderCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (items.length === 0) {
      message.warning('购物车为空，请先添加商品');
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleSubmit = async (values: any) => {
    if (!user) {
      message.error('用户信息不存在');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const response = await createOrder({
        // 根据API设计，用户ID应该从JWT token中解析，而不是前端传递
        // 保留userId字段但设置为一个无效值，后端会忽略并从token中获取真实ID
        userId: -1,
        orderItems,
        shippingAddress: values.shippingAddress,
        receiverName: values.receiverName,
        receiverPhone: values.receiverPhone,
        remark: values.remark,
      });

      if (response.data.code === 200) {
        message.success('订单创建成功');
        clearCart();
        navigate(`/orders/${response.data.data.id}`);
      }
    } catch (error: any) {
      message.error(error.message || '创建订单失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '商品',
      key: 'product',
      render: (_: any, record: CartItem) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.product.name}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{record.product.description}</div>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: ['product', 'price'],
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_: any, record: CartItem) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          ¥{(record.product.price * record.quantity).toFixed(2)}
        </span>
      ),
    },
  ];

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <Title level={3}>创建订单</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>订单商品</Title>
        <Table
          columns={columns}
          dataSource={items}
          rowKey={(record) => record.product.id}
          pagination={false}
        />
        <Divider />
        <div style={{ textAlign: 'right', fontSize: 18 }}>
          <Space size="large">
            <span>总计：</span>
            <span style={{ fontSize: 24, color: '#ff4d4f', fontWeight: 'bold' }}>
              ¥{getTotalPrice().toFixed(2)}
            </span>
          </Space>
        </div>
      </Card>

      <Card>
        <Title level={4}>收货信息</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="receiverName"
            label="收货人姓名"
            rules={[{ required: true, message: '请输入收货人姓名' }]}
          >
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>

          <Form.Item
            name="receiverPhone"
            label="收货人电话"
            rules={[
              { required: true, message: '请输入收货人电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
            ]}
          >
            <Input placeholder="请输入收货人电话" />
          </Form.Item>

          <Form.Item
            name="shippingAddress"
            label="收货地址"
            rules={[{ required: true, message: '请输入收货地址' }]}
          >
            <TextArea rows={3} placeholder="请输入详细的收货地址" />
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea rows={3} placeholder="选填，如有特殊要求请在此说明" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => navigate('/cart')}>返回购物车</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交订单
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default OrderCreate;

