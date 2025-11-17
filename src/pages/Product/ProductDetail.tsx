import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, InputNumber, Tag, Descriptions, Spin, message, Space } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getProductById } from '@/api/product';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await getProductById(Number(id));
      setProduct(response.data);
    } catch (error: any) {
      message.error(error.message || '获取商品详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    
    if (product.status === 0) {
      message.warning('商品已下架');
      return;
    }
    
    if (quantity > product.stock) {
      message.warning('库存不足');
      return;
    }
    
    addItem(product, quantity);
    message.success('已添加到购物车');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <p>商品不存在</p>
          <Button onClick={() => navigate('/products')}>返回商品列表</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/products')}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>
      
      <Card>
        <div style={{ display: 'flex', gap: 24 }}>
          <div
            style={{
              width: 400,
              height: 400,
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 80,
              color: '#999',
              flexShrink: 0,
            }}
          >
            {product.name.charAt(0)}
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, marginBottom: 16 }}>
              {product.name}
              <Tag color={product.status === 1 ? 'green' : 'red'} style={{ marginLeft: 16 }}>
                {product.status === 1 ? '在售' : '下架'}
              </Tag>
            </h1>
            
            <Descriptions column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="价格">
                <span style={{ fontSize: 28, color: '#ff4d4f', fontWeight: 'bold' }}>
                  ¥{product.price.toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="分类">{product.category}</Descriptions.Item>
              <Descriptions.Item label="库存">{product.stock}</Descriptions.Item>
              <Descriptions.Item label="商品描述">{product.description}</Descriptions.Item>
              <Descriptions.Item label="上架时间">{product.createdTime}</Descriptions.Item>
            </Descriptions>
            
            {product.status === 1 && product.stock > 0 && (
              <Space size="large" style={{ marginTop: 24 }}>
                <div>
                  <span style={{ marginRight: 8 }}>数量：</span>
                  <InputNumber
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(value) => setQuantity(value || 1)}
                  />
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                >
                  加入购物车
                </Button>
              </Space>
            )}
            
            {product.stock <= 0 && (
              <Tag color="red" style={{ marginTop: 24, padding: '8px 16px', fontSize: 14 }}>
                库存不足
              </Tag>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductDetail;

