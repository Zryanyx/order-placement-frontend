import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, InputNumber, Button, message, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { getUserAddressById, createUserAddress, updateUserAddress } from '@/api/user-addresses'
import { UserAddress } from '@/types'

const { Title } = Typography

const AdminUserAddressForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const isEdit = !!id

  useEffect(() => {
     if (isEdit && id) fetchData()
   }, [id, isEdit])

  const fetchData = async () => {
    try {
      const response = await getUserAddressById(Number(id))
      form.setFieldsValue(response.data)
    } catch (error) {
      message.error('获取信息失败')
    }
  }

  const handleSubmit = async (values: UserAddress) => {
    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateUserAddress(Number(id), values)
        message.success('更新成功')
      } else {
        await createUserAddress(values)
        message.success('创建成功')
      }
      navigate('/admin/user-addresses')
    } catch (error) {
      message.error('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/user-addresses')} style={{ marginBottom: 16 }}>返回</Button>
      <Card>
        <Title level={3}>{isEdit ? '编辑' : '新增'}</Title>
        <Form form={form} layout='vertical' onFinish={handleSubmit} autoComplete='off'>
          {[{ name: 'userId', label: '用户ID', component: 'number', required: true },
        { name: 'receiverName', label: '收货人姓名', component: 'input', required: true },
        { name: 'receiverPhone', label: '收货人电话', component: 'input', required: true },
        { name: 'province', label: '省份', component: 'input', required: false },
        { name: 'city', label: '城市', component: 'input', required: false },
        { name: 'district', label: '区县', component: 'input', required: false },
        { name: 'detailAddress', label: '详细地址', component: 'input', required: true },
        { name: 'isDefault', label: '是否默认', component: 'number', required: false },
        { name: 'createdTime', label: '创建时间', component: 'input', required: false },
        { name: 'updatedTime', label: '更新时间', component: 'input', required: false }].map(item => (
            <Form.Item key={item.name} name={item.name} label={item.label} rules={[item.required ? { required: true, message: '必填' } : {}] as any}>
              {item.component === 'number' ? <InputNumber style={{ width: '100%' }} /> : <Input />}
            </Form.Item>
          ))}
          <Form.Item>
            <Button type='primary' htmlType='submit' loading={submitting}>{isEdit ? '更新' : '创建'}</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/user-addresses')}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default AdminUserAddressForm
