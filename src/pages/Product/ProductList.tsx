import { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Row, Col, Pagination, Spin, Empty, Tag, message } from 'antd';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProductList } from '@/api/product';
import { Product, ProductQueryParams } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const { Search } = Input;
const { Option } = Select;

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const fetchProducts = async (params: ProductQueryParams = {}) => {
    setLoading(true);
    try {
      const response = await getProductList({
        pageNum: current,
        pageSize,
        keyword: keyword || undefined,
        category: category || undefined,
        ...params,
      });
      const { records, total: totalCount } = response.data;
      setProducts(records);
      setTotal(totalCount);
      
      // 提取所有分类
      const allCategories = Array.from(new Set(records.map(p => p.category).filter(Boolean)));
      setCategories(prev => {
        const combined = Array.from(new Set([...prev, ...allCategories]));
        return combined;
      });
    } catch (error: any) {
      message.error(error.message || '获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [current, pageSize, category]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1);
    fetchProducts({ keyword: value, pageNum: 1 });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrent(1);
  };

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    if (product.status === 0) {
      message.warning('商品已下架');
      return;
    }
    if (product.stock <= 0) {
      message.warning('商品库存不足');
      return;
    }
    addItem(product, 1);
    message.success('已添加到购物车');
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrent(page);
    if (size) {
      setPageSize(size);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Search
          placeholder="搜索商品"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ flex: 1, maxWidth: 400 }}
          onSearch={handleSearch}
        />
        <Select
          placeholder="选择分类"
          allowClear
          style={{ width: 200 }}
          size="large"
          value={category || undefined}
          onChange={handleCategoryChange}
        >
          {categories.map(cat => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>
      </div>

      <Spin spinning={loading}>
        {products.length === 0 ? (
          <Empty description="暂无商品" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {products.map(product => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <Card
                    hoverable
                    cover={
                      <div
                        style={{
                          height: 200,
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 48,
                          color: '#999',
                        }}
                      >
                        {product.name.charAt(0)}
                      </div>
                    }
                    actions={[
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => handleAddToCart(product)}
                        disabled={product.status === 0 || product.stock <= 0}
                        block
                      >
                        加入购物车
                      </Button>,
                    ]}
                    onClick={() => navigate(`/products/${product.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{product.name}</span>
                          <Tag color={product.status === 1 ? 'green' : 'red'}>
                            {product.status === 1 ? '在售' : '下架'}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 8, color: '#666', fontSize: 12 }}>
                            {product.description}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 18, color: '#ff4d4f', fontWeight: 'bold' }}>
                              ¥{product.price.toFixed(2)}
                            </span>
                            <span style={{ fontSize: 12, color: '#999' }}>
                              库存: {product.stock}
                            </span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Pagination
                current={current}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `共 ${total} 条`}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                pageSizeOptions={['12', '24', '48', '96']}
              />
            </div>
          </>
        )}
      </Spin>
    </div>
  );
};

export default ProductList;

