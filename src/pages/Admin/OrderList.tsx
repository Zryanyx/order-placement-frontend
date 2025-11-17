import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Select, Pagination, message, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllOrders } from '@/api/order';
import { Order, OrderQueryParams } from '@/types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const AdminOrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, [current, pageSize, status]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: OrderQueryParams = {
        pageNum: current,
        pageSize,
        status: status || undefined,
      };
      const response = await getAllOrders(params);
      const { records, total: totalCount } = response.data;
      setOrders(records);
      setTotal(totalCount);
    } catch (error: any) {
      message.error(error.message || '获取订单列表失败');
    } finally {
      setLoading(false);
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

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrent(1);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrent(page);
    if (size) {
      setPageSize(size);
    }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{amount.toFixed(2)}</span>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '收货人',
      dataIndex: 'receiverName',
      key: 'receiverName',
    },
    {
      title: '收货电话',
      dataIndex: 'receiverPhone',
      key: 'receiverPhone',
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/orders/${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>订单管理</Title>
        <Select
          placeholder="筛选订单状态"
          allowClear
          style={{ width: 200 }}
          value={status || undefined}
          onChange={handleStatusChange}
        >
          <Option value="PENDING_PAYMENT">待支付</Option>
          <Option value="PAID">已支付</Option>
          <Option value="SHIPPED">已发货</Option>
          <Option value="COMPLETED">已完成</Option>
          <Option value="CANCELLED">已取消</Option>
        </Select>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination
            current={current}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminOrderList;

