import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Popconfirm, Tag, message, Input, Pagination, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, publishProduct, unpublishProduct } from '@/api/product';
import { Product, ProductQueryParams } from '@/types';

const { Title } = Typography;
const { Search } = Input;

const AdminProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [current, pageSize]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: ProductQueryParams = {
        pageNum: current,
        pageSize,
        keyword: keyword || undefined,
      };
      const response = await getProducts(params);
      const { records, total: totalCount } = response.data;
      setProducts(records);
      setTotal(totalCount);
    } catch (error: any) {
      message.error(error.message || '获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1);
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      message.success('删除成功');
      fetchProducts();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishProduct(id);
      message.success('上架成功');
      fetchProducts();
    } catch (error: any) {
      message.error(error.message || '上架失败');
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await unpublishProduct(id);
      message.success('下架成功');
      fetchProducts();
    } catch (error: any) {
      message.error(error.message || '下架失败');
    }
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrent(page);
    if (size) {
      setPageSize(size);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/products/${record.id}/edit`)}
          >
            编辑
          </Button>
          {record.status === 1 ? (
            <Popconfirm
              title="确定要下架这个商品吗？"
              onConfirm={() => handleUnpublish(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<CloseCircleOutlined />}>
                下架
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确定要上架这个商品吗？"
              onConfirm={() => handlePublish(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" icon={<CheckCircleOutlined />}>
                上架
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>商品管理</Title>
        <Space>
          <Search
            placeholder="搜索商品"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/products/new')}
          >
            新增商品
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={products}
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

export default AdminProductList;

