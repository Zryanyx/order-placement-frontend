import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Popconfirm, message, Pagination, Typography, Form, Input, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getCategoryList, deleteCategory } from '@/api/category'
import { Category, CategoryQueryParams } from '@/types'

const { Title } = Typography

const AdminCategoryList = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form] = Form.useForm()

  useEffect(() => {
     fetchData()
   }, [current, pageSize])

  const fetchData = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params: CategoryQueryParams = { pageNum: current, pageSize, ...values }
      const response = await getCategoryList(params)
      const { records, total: totalCount } = response.data
      setItems(records)
      setTotal(totalCount)
    } catch (error) {
      message.error('获取列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handlePageChange = (page: number, size?: number) => {
    setCurrent(page)
    if (size) setPageSize(size)
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '分类名称', dataIndex: 'name', key: 'name' },
    { title: '商品价格', dataIndex: 'price', key: 'price' },
    { title: '库存数量', dataIndex: 'stock', key: 'stock' },
    { title: '分类描述', dataIndex: 'description', key: 'description' },
    { title: '分类状态', dataIndex: 'status', key: 'status' },
    { title: '分类名称', dataIndex: 'category', key: 'category' },
    { title: '分类图片', dataIndex: 'imageUrl', key: 'imageUrl' },
    { title: '创建时间', dataIndex: 'createdTime', key: 'createdTime' },
    { title: '更新时间', dataIndex: 'updatedTime', key: 'updatedTime' },
    { title: '操作', key: 'action', width: 200, render: (_: any, record: Category) => (
      <Space>
        <Button type='link' icon={<EditOutlined />} onClick={() => navigate('/admin/category/' + record.id + '/edit')}>编辑</Button>
        <Popconfirm title='确定要删除吗？' onConfirm={() => handleDelete(record.id)} okText='确定' cancelText='取消'>
          <Button type='link' danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    ) }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>商品分类管理</Title>
        <Space>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => navigate('/admin/category/new')}>新增</Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout='inline' onFinish={fetchData}>
          {[{ name: 'name', label: '分类名称', component: 'input' },
        { name: 'price', label: '商品价格', component: 'number' },
        { name: 'stock', label: '库存数量', component: 'number' },
        { name: 'description', label: '分类描述', component: 'input' },
        { name: 'status', label: '分类状态', component: 'number' },
        { name: 'category', label: '分类名称', component: 'input' }].map(item => (
            <Form.Item key={item.name} name={item.name} label={item.label}>
              {item.component === 'number' ? <InputNumber style={{ width: 160 }} /> : <Input style={{ width: 200 }} allowClear />}
            </Form.Item>
          ))}
          <Form.Item>
            <Space>
              <Button type='primary' htmlType='submit'>查询</Button>
              <Button onClick={() => { form.resetFields(); setCurrent(1); fetchData() }}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table columns={columns as any} dataSource={items} rowKey='id' loading={loading} pagination={false} />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination current={current} pageSize={pageSize} total={total} showSizeChanger showQuickJumper showTotal={(t) => '共 ' + t + ' 条'} onChange={handlePageChange} onShowSizeChange={handlePageChange} />
        </div>
      </Card>
    </div>
  )
}

export default AdminCategoryList
