import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Button, Space, Tag, message, Popconfirm, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getOrderById, getOrderItems, payOrder, cancelOrder, completeOrder, shipOrder } from '@/api/order';
import { useAuthStore } from '@/store/authStore';
import { Order, OrderItem } from '@/types';
import dayjs from 'dayjs';

const { Title } = Typography;

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
      fetchOrderItems();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await getOrderById(Number(id));
      setOrder(response.data);
    } catch (error: any) {
      message.error(error.message || '获取订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async () => {
    try {
      const response = await getOrderItems(Number(id));
      setItems(response.data);
    } catch (error: any) {
      message.error(error.message || '获取订单项失败');
    }
  };

  const handlePay = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await payOrder(Number(id));
      message.success('支付成功');
      fetchOrderDetail();
    } catch (error: any) {
      message.error(error.message || '支付失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await cancelOrder(Number(id));
      message.success('订单已取消');
      fetchOrderDetail();
    } catch (error: any) {
      message.error(error.message || '取消订单失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await completeOrder(Number(id));
      message.success('订单已完成');
      fetchOrderDetail();
    } catch (error: any) {
      message.error(error.message || '完成订单失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShip = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await shipOrder(Number(id));
      message.success('发货成功');
      fetchOrderDetail();
    } catch (error: any) {
      message.error(error.message || '发货失败');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      PENDING_PAYMENT: { color: 'orange', text: '待支付' },
      PAID: { color: 'blue', text: '已支付' },
      SHIPPED: { color: 'purple', text: '已发货' },
      COMPLETED: { color: 'green', text: '已完成' },
      CANCELLED: { color: 'red', text: '已取消' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <p>订单不存在</p>
          <Button onClick={() => navigate('/orders')}>返回订单列表</Button>
        </div>
      </Card>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const canPay = order.status === 'PENDING_PAYMENT' && !isAdmin;
  const canCancel = (order.status === 'PENDING_PAYMENT' || order.status === 'PAID') && !isAdmin;
  const canComplete = order.status === 'SHIPPED' && !isAdmin;
  const canShip = order.status === 'PAID' && isAdmin;

  const itemColumns = [
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '单价',
      dataIndex: 'productPrice',
      key: 'productPrice',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (subtotal: number) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{subtotal.toFixed(2)}</span>
      ),
    },
  ];

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/orders')}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4}>订单详情</Title>
          {getStatusTag(order.status)}
        </div>

        <Descriptions column={2} bordered>
          <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="订单金额">
            <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{order.totalAmount.toFixed(2)}</span>
          </Descriptions.Item>
          <Descriptions.Item label="收货人">{order.receiverName}</Descriptions.Item>
          <Descriptions.Item label="收货电话">{order.receiverPhone}</Descriptions.Item>
          <Descriptions.Item label="收货地址" span={2}>{order.shippingAddress}</Descriptions.Item>
          {order.remark && (
            <Descriptions.Item label="备注" span={2}>{order.remark}</Descriptions.Item>
          )}
          <Descriptions.Item label="创建时间">
            {dayjs(order.createdTime).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          {order.paymentTime && (
            <Descriptions.Item label="支付时间">
              {dayjs(order.paymentTime).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          )}
          {order.shippingTime && (
            <Descriptions.Item label="发货时间">
              {dayjs(order.shippingTime).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          )}
          {order.completedTime && (
            <Descriptions.Item label="完成时间">
              {dayjs(order.completedTime).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          )}
        </Descriptions>

        {(canPay || canCancel || canComplete || canShip) && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Space>
              {canPay && (
                <Popconfirm
                  title="确定要支付这个订单吗？"
                  onConfirm={handlePay}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="primary" loading={actionLoading}>
                    支付订单
                  </Button>
                </Popconfirm>
              )}
              {canCancel && (
                <Popconfirm
                  title="确定要取消这个订单吗？"
                  onConfirm={handleCancel}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button danger loading={actionLoading}>
                    取消订单
                  </Button>
                </Popconfirm>
              )}
              {canComplete && (
                <Popconfirm
                  title="确定要确认收货吗？"
                  onConfirm={handleComplete}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="primary" loading={actionLoading}>
                    确认收货
                  </Button>
                </Popconfirm>
              )}
              {canShip && (
                <Popconfirm
                  title="确定要发货吗？"
                  onConfirm={handleShip}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="primary" loading={actionLoading}>
                    发货
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </div>
        )}
      </Card>

      <Card>
        <Title level={4}>订单商品</Title>
        <Table
          columns={itemColumns}
          dataSource={items}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default OrderDetail;

