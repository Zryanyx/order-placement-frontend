import { Card, Table, Button, InputNumber, Space, Popconfirm, message, Empty, Typography } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/types';

const { Title } = Typography;

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalCount } = useCartStore();

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      const item = items.find(i => i.product.id === productId);
      if (item && quantity > item.product.stock) {
        message.warning(`库存不足，最多只能购买 ${item.product.stock} 件`);
        return;
      }
      updateQuantity(productId, quantity);
    }
  };

  const handleRemove = (productId: number) => {
    removeItem(productId);
    message.success('已从购物车移除');
  };

  const handleClearCart = () => {
    clearCart();
    message.success('购物车已清空');
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      message.warning('购物车为空');
      return;
    }
    navigate('/orders/create');
  };

  const columns = [
    {
      title: '商品',
      key: 'product',
      render: (_: any, record: CartItem) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: '#999',
            }}
          >
            {record.product.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{record.product.name}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{record.product.description}</div>
          </div>
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
      key: 'quantity',
      render: (_: any, record: CartItem) => (
        <InputNumber
          min={1}
          max={record.product.stock}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.product.id, value || 1)}
        />
      ),
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
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CartItem) => (
        <Popconfirm
          title="确定要移除这个商品吗？"
          onConfirm={() => handleRemove(record.product.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (items.length === 0) {
    return (
      <Card>
        <Empty description="购物车为空" />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" onClick={() => navigate('/products')}>
            去购物
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4}>购物车 ({getTotalCount()} 件商品)</Title>
          <Button danger onClick={handleClearCart}>
            清空购物车
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={items}
          rowKey={(record) => record.product.id}
          pagination={false}
        />
        
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Card>
            <Space size="large" style={{ fontSize: 18 }}>
              <span>总计：</span>
              <span style={{ fontSize: 24, color: '#ff4d4f', fontWeight: 'bold' }}>
                ¥{getTotalPrice().toFixed(2)}
              </span>
            </Space>
            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={handleCheckout}
                block
              >
                去结算
              </Button>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default Cart;

