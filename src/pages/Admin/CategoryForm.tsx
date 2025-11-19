import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, InputNumber, Button, message, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { getCategoryById, createCategory, updateCategory } from '@/api/category'
import { Category } from '@/types'

const { Title } = Typography

const AdminCategoryForm = () => {
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
      const response = await getCategoryById(Number(id))
      form.setFieldsValue(response.data)
    } catch (error) {
      message.error('获取信息失败')
    }
  }

  const handleSubmit = async (values: Category) => {
    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateCategory(Number(id), values)
        message.success('更新成功')
      } else {
        await createCategory(values)
        message.success('创建成功')
      }
      navigate('/admin/category')
    } catch (error) {
      message.error('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/category')} style={{ marginBottom: 16 }}>返回</Button>
      <Card>
        <Title level={3}>{isEdit ? '编辑' : '新增'}</Title>
        <Form form={form} layout='vertical' onFinish={handleSubmit} autoComplete='off'>
          {[{ name: 'name', label: '分类名称', component: 'input', required: true },
        { name: 'price', label: '商品价格', component: 'number', required: true },
        { name: 'stock', label: '库存数量', component: 'number', required: false },
        { name: 'description', label: '分类描述', component: 'input', required: false },
        { name: 'status', label: '分类状态', component: 'number', required: false },
        { name: 'category', label: '分类名称', component: 'input', required: false },
        { name: 'imageUrl', label: '分类图片', component: 'input', required: false },
        { name: 'createdTime', label: '创建时间', component: 'input', required: false },
        { name: 'updatedTime', label: '更新时间', component: 'input', required: false }].map(item => (
            <Form.Item key={item.name} name={item.name} label={item.label} rules={[item.required ? { required: true, message: '必填' } : {}] as any}>
              {item.component === 'number' ? <InputNumber style={{ width: '100%' }} /> : <Input />}
            </Form.Item>
          ))}
          <Form.Item>
            <Button type='primary' htmlType='submit' loading={submitting}>{isEdit ? '更新' : '创建'}</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/category')}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default AdminCategoryForm
