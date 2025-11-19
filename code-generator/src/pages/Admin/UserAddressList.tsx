import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Popconfirm, message, Pagination, Typography, Form, Input, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getUserAddresses, deleteUserAddress } from '@/api/user-address'
import { UserAddress, UserAddressQueryParams } from '@/types'

const { Title } = Typography

const AdminUserAddressList = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<UserAddress[]>([])
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
      const params: UserAddressQueryParams = { pageNum: current, pageSize, ...values }
      const response = await getUserAddresses(params)
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
      await deleteUserAddress(id)
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
    { title: '用户ID', dataIndex: 'userId', key: 'userId' },
    { title: '收货人姓名', dataIndex: 'receiverName', key: 'receiverName' },
    { title: '收货人电话', dataIndex: 'receiverPhone', key: 'receiverPhone' },
    { title: '省份', dataIndex: 'province', key: 'province' },
    { title: '城市', dataIndex: 'city', key: 'city' },
    { title: '区县', dataIndex: 'district', key: 'district' },
    { title: '详细地址', dataIndex: 'detailAddress', key: 'detailAddress' },
    { title: '是否默认', dataIndex: 'isDefault', key: 'isDefault' },
    { title: '创建时间', dataIndex: 'createdTime', key: 'createdTime' },
    { title: '更新时间', dataIndex: 'updatedTime', key: 'updatedTime' },
    { title: '操作', key: 'action', width: 200, render: (_: any, record: UserAddress) => (
      <Space>
        <Button type='link' icon={<EditOutlined />} onClick={() => navigate('/admin/user-addresses/' + record.id + '/edit')}>编辑</Button>
        <Popconfirm title='确定要删除吗？' onConfirm={() => handleDelete(record.id)} okText='确定' cancelText='取消'>
          <Button type='link' danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    ) }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>用户地址管理</Title>
        <Space>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => navigate('/admin/user-addresses/new')}>新增</Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout='inline' onFinish={fetchData}>
          {[{ name: 'userId', label: '用户ID', component: 'number' },
        { name: 'receiverName', label: '收货人姓名', component: 'input' },
        { name: 'receiverPhone', label: '收货人电话', component: 'input' },
        { name: 'province', label: '省份', component: 'input' },
        { name: 'city', label: '城市', component: 'input' },
        { name: 'district', label: '区县', component: 'input' },
        { name: 'detailAddress', label: '详细地址', component: 'input' },
        { name: 'isDefault', label: '是否默认', component: 'number' }].map(item => (
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

export default AdminUserAddressList
