import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, InputNumber, Button, message, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { getProductById } from '@/api/product'
import { Product } from '@/types'

const { Title } = Typography

const AdminProductForm = () => {
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
      const response = await getProductById(Number(id))
      form.setFieldsValue(response.data)
    } catch (error) {
      message.error('获取信息失败')
    }
  }

  const handleSubmit = async (values: Product) => {
    setSubmitting(true)
    try {
      if (isEdit && id) {
        message.error("更新功能未启用")
      } else {
        message.error("创建功能未启用")
      }
      navigate('/admin/product')
    } catch (error) {
      message.error('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/product')} style={{ marginBottom: 16 }}>返回</Button>
      <Card>
        <Title level={3}>{isEdit ? '编辑' : '新增'}</Title>
        <Form form={form} layout='vertical' onFinish={handleSubmit} autoComplete='off'>
          {[{ name: 'name', label: '商品名称', component: 'input', required: true },
        { name: 'price', label: '商品价格', component: 'number', required: true },
        { name: 'categoryId', label: '分类ID', component: 'number', required: true },
        { name: 'description', label: '商品描述', component: 'input', required: false },
        { name: 'status', label: '商品状态', component: 'number', required: false },
        { name: 'createdTime', label: '创建时间', component: 'input', required: false },
        { name: 'updatedTime', label: '更新时间', component: 'input', required: false }].map(item => (
            <Form.Item key={item.name} name={item.name} label={item.label} rules={[item.required ? { required: true, message: '必填' } : {}] as any}>
              {item.component === 'number' ? <InputNumber style={{ width: '100%' }} /> : <Input />}
            </Form.Item>
          ))}
          <Form.Item>
            <Button type='primary' htmlType='submit' loading={submitting}>{isEdit ? '更新' : '创建'}</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/product')}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default AdminProductForm
