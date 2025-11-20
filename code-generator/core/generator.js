import path from 'node:path'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import { ensureDir, writeText, readText, projectRoot, srcRoot, toCamel, toPascal, toKebab, toPlural } from './utils.js'

// 解析新的功能配置格式
const parseApiFunctions = (apis) => {
  const functions = {
    get: false,
    list: false,
    create: false,
    update: false,
    delete: false,
    search2: false,
    searchFields: [],
    tableFields: [],
    tableAllFields: false
  }
  
  if (!apis || !Array.isArray(apis)) return functions
  
  for (const api of apis) {
    const apiStr = String(api).toLowerCase()
    if (apiStr === 'get') functions.get = true
    if (apiStr === 'list') functions.list = true
    if (apiStr === 'create') functions.create = true
    if (apiStr === 'update') functions.update = true
    if (apiStr === 'delete') functions.delete = true
    if (apiStr === 'search2') functions.search2 = true
    
    // 解析search(字段1 字段2 字段3)格式
    if (apiStr.startsWith('search(') && apiStr.endsWith(')')) {
      const fieldsStr = apiStr.slice(7, -1).trim()
      // 保持原始大小写，不转换为小写
      functions.searchFields = fieldsStr.split(/\s+/).filter(f => f.length > 0)
    }
    
    // 解析table(字段1 字段2 字段3)格式
    if (apiStr.startsWith('table(') && apiStr.endsWith(')')) {
      const fieldsStr = apiStr.slice(6, -1).trim()
      // 保持原始大小写，不转换为小写
      functions.tableFields = fieldsStr.split(/\s+/).filter(f => f.length > 0)
    }
    
    // 解析table格式（显示所有字段）
    if (apiStr === 'table') {
      functions.tableAllFields = true
    }
  }
  
  // GET和LIST是必须有的
  functions.get = true
  functions.list = true
  
  return functions
}

const renderApi = (module, projectApis = []) => {
  const namePascal = toPascal(module.name)
  const nameCamel = toCamel(module.name)
  // 根据配置决定是否使用复数形式
  const usePlural = module.usePlural === true
  const kebab = toKebab(module.name, usePlural)
  // 使用模块名的小写形式作为API URL基础路径，而不是复数形式
  const routeBase = module.routeBase ? module.routeBase : kebab
  // 修复：由于request.ts中baseURL已包含'/api'前缀，这里不需要重复添加
  const urlBase = `/${routeBase}`
  
  // 解析新的功能配置
  const apis = module.apis && module.apis.length ? module.apis : projectApis
  const functions = parseApiFunctions(apis)
  
  const lines = []
  lines.push("import request from '@/utils/request'")
  lines.push(`import { ${namePascal}, ${namePascal}QueryParams, PageResponse } from '@/types'`)
  
  // LIST功能（必须）
  lines.push(`export const get${namePascal}List = (params: ${namePascal}QueryParams) => {`)
  lines.push(`  return request.get<PageResponse<${namePascal}>>('${urlBase}', { params })`)
  lines.push('}')
  
  // GET功能（必须）
  lines.push(`export const get${namePascal}ById = (id: number) => {`)
  lines.push(`  return request.get<${namePascal}>(\`${urlBase}/\${id}\`)`)
  lines.push('}')
  
  // CREATE功能
  if (functions.create) {
    lines.push(`export const create${namePascal} = (data: ${namePascal}) => {`)
    lines.push(`  return request.post<${namePascal}>('${urlBase}', data)`)
    lines.push('}')
  }
  
  // UPDATE功能
  if (functions.update) {
    lines.push(`export const update${namePascal} = (id: number, data: ${namePascal}) => {`)
    lines.push(`  return request.put<${namePascal}>(\`${urlBase}/\${id}\`, data)`)
    lines.push('}')
  }
  
  // DELETE功能
  if (functions.delete) {
    lines.push(`export const delete${namePascal} = (id: number) => {`)
    lines.push(`  return request.delete<void>(\`${urlBase}/\${id}\`)`)
    lines.push('}')
  }
  
  return lines.join('\n')
}

const tsType = (f) => {
  return f.type ? (f.type === 'BigDecimal' ? 'number' : f.type.toLowerCase() === 'string' ? 'string' : ['Integer', 'Long', 'Double', 'Float', 'BigDecimal'].includes(f.type) ? 'number' : ['LocalDateTime', 'Date', 'Timestamp'].includes(f.type) ? 'string' : f.type) : 'any'
}

const renderTypes = (module, projectApis = []) => {
  const namePascal = toPascal(module.name)
  const fields = module.fields || []
  const modelLines = []
  modelLines.push(`export interface ${namePascal} {`)
  for (const f of fields) {
    const t = tsType(f)
    const optional = f.nullable === true || f.defaultValue !== undefined ? '?' : ''
    modelLines.push(`  ${toCamel(f.name)}${optional}: ${t};`)
  }
  modelLines.push('}')
  
  // 解析新的功能配置
  const apis = module.apis && module.apis.length ? module.apis : projectApis
  const functions = parseApiFunctions(apis)
  
  // 确定查询字段
  let queryFields = []
  if (functions.search2) {
    // search2: 使用所有字段作为查询条件
    queryFields = fields.filter(f => !f.primaryKey && !f.logicDelete)
  } else if (functions.searchFields.length > 0) {
    // search(字段1 字段2 字段3): 使用指定字段作为查询条件
    queryFields = fields.filter(f => functions.searchFields.includes(f.name))
  } else {
    // 原有的query配置方式
    queryFields = fields.filter((f) => f.query && f.query.enabled)
  }
  
  const queryLines = []
  queryLines.push(`export interface ${namePascal}QueryParams {`)
  queryLines.push('  pageNum?: number;')
  queryLines.push('  pageSize?: number;')
  for (const f of queryFields) {
    const t = tsType(f)
    queryLines.push(`  ${toCamel(f.name)}?: ${t};`)
  }
  queryLines.push('}')
  return modelLines.join('\n') + '\n\n' + queryLines.join('\n')
}

const renderAdminListPage = (module, projectApis = []) => {
  const namePascal = toPascal(module.name)
  const nameCamel = toCamel(module.name)
  // 根据配置决定是否使用复数形式
  const usePlural = module.usePlural === true
  const kebab = toKebab(module.name, usePlural)
  // 使用模块名的小写形式作为路由路径，而不是复数形式
  const routeBase = module.routeBase ? module.routeBase : kebab
  const fields = module.fields || []
  
  // 解析新的功能配置
  const apis = module.apis && module.apis.length ? module.apis : projectApis
  const functions = parseApiFunctions(apis)
  
  console.log('Module:', module.name)
  console.log('APIs:', apis)
  console.log('Functions:', functions)
  
  // 确定查询字段
  let queryFields = []
  if (functions.search2) {
    // search2: 使用所有字段作为查询条件
    queryFields = fields.filter(f => !f.primaryKey && !f.logicDelete)
  } else if (functions.searchFields.length > 0) {
    // search(字段1 字段2 字段3): 使用指定字段作为查询条件
    queryFields = fields.filter(f => functions.searchFields.includes(f.name))
  } else {
    // 原有的query配置方式
    queryFields = fields.filter((f) => f.query && f.query.enabled)
  }
  
  // 确定表格显示字段
  let tableFields = []
  if (functions.tableAllFields) {
    // table: 显示所有字段
    tableFields = fields.filter(f => !f.logicDelete)
  } else if (functions.tableFields.length > 0) {
    // table(字段1 字段2 字段3): 显示指定字段
    tableFields = fields.filter(f => functions.tableFields.includes(f.name.toLowerCase()) && !f.logicDelete)
  } else {
    // 默认显示所有字段
    tableFields = fields.filter(f => !f.logicDelete)
  }
  
  console.log('Table fields:', tableFields.map(f => f.name))
  
  const formItems = queryFields
    .map((f) => {
      const c = toCamel(f.name)
      const t = tsType(f)
      if (t === 'number') return `{ name: '${c}', label: '${f.comment || f.name}', component: 'number' }`
      return `{ name: '${c}', label: '${f.comment || f.name}', component: 'input' }`
    })
    .join(',\n        ')
  const tableCols = tableFields
    .map((f) => {
      const c = toCamel(f.name)
      const comment = f.comment || f.name
      
      // 根据字段类型和名称设置合适的宽度
      let width = 120
      if (c === 'id') width = 80
      else if (['name', 'title', 'username'].includes(c)) width = 120
      else if (['phone', 'mobile', 'tel'].includes(c)) width = 120
      else if (['email'].includes(c)) width = 160
      else if (['description', 'content', 'remark'].includes(c)) width = 200
      else if (['amount', 'price', 'total', 'money'].includes(c)) width = 100
      else if (['status', 'type', 'category'].includes(c)) width = 100
      else if (['createdTime', 'updatedTime', 'createTime', 'updateTime'].includes(c)) width = 160
      
      // 特殊字段的渲染处理
      if (['amount', 'price', 'total', 'money'].includes(c)) {
        return `{ title: '${comment}', dataIndex: '${c}', key: '${c}', width: ${width}, render: (value: number) => (
          <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{value?.toFixed(2)}</span>
        ) }`
      } else if (['status', 'state'].includes(c)) {
        return `{ title: '${comment}', dataIndex: '${c}', key: '${c}', width: ${width}, render: (status: string) => {
          const statusMap = {
            'PENDING_PAYMENT': { color: 'orange', text: '待支付' },
            'PAID': { color: 'blue', text: '已支付' },
            'SHIPPED': { color: 'purple', text: '已发货' },
            'COMPLETED': { color: 'green', text: '已完成' },
            'CANCELLED': { color: 'red', text: '已取消' },
            'ACTIVE': { color: 'green', text: '启用' },
            'INACTIVE': { color: 'red', text: '禁用' }
          }
          const statusInfo = statusMap[status] || { color: 'default', text: status }
          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        } }`
      } else if (['createdTime', 'updatedTime', 'createTime', 'updateTime'].includes(c)) {
        return `{ title: '${comment}', dataIndex: '${c}', key: '${c}', width: ${width}, render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss') }`
      } else {
        return `{ title: '${comment}', dataIndex: '${c}', key: '${c}', width: ${width} }`
      }
    })
    .join(',\n    ')

  // 根据功能配置决定导入哪些API
  const apiImports = [`get${namePascal}List`]
  if (functions.delete) apiImports.push(`delete${namePascal}`)
  
  return `import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Popconfirm, message, Pagination, Typography, Form, Input, InputNumber, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ${apiImports.join(', ')} } from '@/api/${routeBase}'
import { ${namePascal}, ${namePascal}QueryParams } from '@/types'
import dayjs from 'dayjs'

const { Title } = Typography

const Admin${namePascal}List = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<${namePascal}[]>([])
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
      const params: ${namePascal}QueryParams = { pageNum: current, pageSize, ...values }
      const response = await get${namePascal}List(params)
      const { records, total: totalCount } = response.data
      // 将下划线字段名转换为驼峰命名法
      const formattedRecords = records.map(record => {
        const formatted = {}
        Object.keys(record).forEach(key => {
          const camelKey = key.replace(/_(\\w)/g, (_, letter) => letter.toUpperCase())
          formatted[camelKey] = record[key]
        })
        return formatted
      })
      setItems(formattedRecords)
      setTotal(totalCount)
    } catch (error) {
      message.error('获取列表失败')
    } finally {
      setLoading(false)
    }
  }

  ${functions.delete ? `const handleDelete = async (id: number) => {
    try {
      await delete${namePascal}(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      message.error('删除失败')
    }
  }` : ''}

  const handlePageChange = (page: number, size?: number) => {
    setCurrent(page)
    if (size) setPageSize(size)
  }

  const columns = [
    ${tableCols}${tableCols ? ',' : ''}
    { title: '操作', key: 'action', width: 200, render: (_: any, record: ${namePascal}) => (
      <Space>
        <Button type='link' icon={<EditOutlined />} onClick={() => navigate('/admin/${routeBase}/' + record.id + '/edit')}>编辑</Button>
        ${functions.delete ? `<Popconfirm title='确定要删除吗？' onConfirm={() => handleDelete(record.id)} okText='确定' cancelText='取消'>
          <Button type='link' danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>` : ''}
      </Space>
    ) }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>${module.menu?.itemLabel || module.comment || namePascal}管理</Title>
        <Space>
          ${functions.create ? `<Button type='primary' icon={<PlusOutlined />} onClick={() => navigate('/admin/${routeBase}/new')}>新增</Button>` : ''}
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout='inline' onFinish={fetchData}>
          {[${formItems}].map(item => (
            <Form.Item key={item.name} name={item.name} label={item.label} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
              {item.component === 'number' ? <InputNumber style={{ width: 200, height: 32 }} /> : <Input style={{ width: 200, height: 32 }} allowClear />}
            </Form.Item>
          ))}
          <Form.Item style={{ marginBottom: 0, display: 'flex', alignItems: 'center' }}>
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

export default Admin${namePascal}List
`
}

const renderAdminFormPage = (module, projectApis = []) => {
  const namePascal = toPascal(module.name)
  // 根据配置决定是否使用复数形式
  const usePlural = module.usePlural === true
  const kebab = toKebab(module.name, usePlural)
  // 使用模块名的小写形式作为路由路径，而不是复数形式
  const routeBase = module.routeBase ? module.routeBase : kebab
  
  // 解析新的功能配置
  const apis = module.apis && module.apis.length ? module.apis : projectApis
  const functions = parseApiFunctions(apis)
  
  // 确定查询字段
  let queryFields = []
  if (functions.search2) {
    // search2: 使用所有字段作为查询条件
    queryFields = (module.fields || []).filter(f => !f.primaryKey && !f.logicDelete)
  } else if (functions.searchFields.length > 0) {
    // search(字段1 字段2 字段3): 使用指定字段作为查询条件
    queryFields = (module.fields || []).filter(f => functions.searchFields.includes(f.name))
  } else {
    // 原有的query配置方式
    queryFields = (module.fields || []).filter((f) => f.query && f.query.enabled)
  }
  
  // 确定表单字段：优先使用table配置的字段，否则使用全部字段
  let formFields = []
  if (functions.tableAllFields) {
    // table: 显示全部字段
    formFields = (module.fields || []).filter(f => !f.primaryKey && !f.logicDelete)
  } else if (functions.tableFields.length > 0) {
    // table(字段1 字段2): 使用指定字段
    formFields = (module.fields || []).filter(f => functions.tableFields.includes(f.name) && !f.primaryKey && !f.logicDelete)
  } else {
    // 默认使用全部字段
    formFields = (module.fields || []).filter(f => !f.primaryKey && !f.logicDelete)
  }
  
  const formItems = formFields
    .map((f) => {
      const c = toCamel(f.name)
      const t = tsType(f)
      if (t === 'number') return `{ name: '${c}', label: '${f.comment || f.name}', component: 'number', required: ${f.nullable === false} }`
      return `{ name: '${c}', label: '${f.comment || f.name}', component: 'input', required: ${f.nullable === false} }`
    })
    .join(',\n        ')
  
  // 根据功能配置决定导入哪些API
  const apiImports = []
  if (functions.get) apiImports.push(`get${namePascal}ById`)
  if (functions.create) apiImports.push(`create${namePascal}`)
  if (functions.update) apiImports.push(`update${namePascal}`)
  
  return `import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, InputNumber, Button, message, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { ${apiImports.join(', ')} } from '@/api/${routeBase}'
import { ${namePascal} } from '@/types'

const { Title } = Typography

const Admin${namePascal}Form = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const isEdit = !!id

  useEffect(() => {
     if (isEdit && id) {
       fetchData()
     } else {
       // 新增模式下，不自动设置创建时间和更新时间
       form.setFieldsValue({})
     }
   }, [id, isEdit])

  const fetchData = async () => {
    try {
      ${functions.get ? `const response = await get${namePascal}ById(Number(id))
      const data = response.data
      // 修改模式下，不自动设置更新时间
      form.setFieldsValue(data)` : 'form.setFieldsValue({})'}
    } catch (error) {
      message.error('获取信息失败')
    }
  }

  const handleSubmit = async (values: ${namePascal}) => {
    setSubmitting(true)
    try {
      if (isEdit && id) {
        ${functions.update ? `await update${namePascal}(Number(id), values)
        message.success('更新成功')` : 'message.error("更新功能未启用")'}
      } else {
        ${functions.create ? `await create${namePascal}(values)
        message.success('创建成功')` : 'message.error("创建功能未启用")'}
      }
      navigate('/admin/${routeBase}')
    } catch (error) {
      message.error('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/${routeBase}')} style={{ marginBottom: 16 }}>返回</Button>
      <Card>
        <Title level={3}>{isEdit ? '编辑' : '新增'}</Title>
        <Form form={form} layout='vertical' onFinish={handleSubmit} autoComplete='off'>
          {[${formItems}].map(item => (
            <Form.Item key={item.name} name={item.name} label={item.label} rules={[item.required ? { required: true, message: '必填' } : {}] as any}>
              {item.component === 'number' ? <InputNumber style={{ width: '100%' }} /> : <Input />}
            </Form.Item>
          ))}
          <Form.Item>
            <Button type='primary' htmlType='submit' loading={submitting}>{isEdit ? '更新' : '创建'}</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/${routeBase}')}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Admin${namePascal}Form
`
}

const mergeUniqueByKey = (arr1, arr2) => {
  const map = new Map()
  ;[...arr1, ...arr2].forEach((item) => {
    if (!map.has(item.key)) map.set(item.key, item)
  })
  return Array.from(map.values())
}

const renderMenuIntegration = (config) => {
  const modules = config.modules || []
  const topMap = new Map()
  for (const m of modules) {
    const key = m.menu?.topKey || 'admin'
    const label = m.menu?.topLabel || key
    const groupLabel = m.menu?.groupLabel || `${m.comment || toPascal(m.name)}管理`
    const itemLabel = m.menu?.itemLabel || `${m.comment || toPascal(m.name)}列表`
    const role = m.menu?.role || 'ADMIN' // 获取配置的角色权限
    // 根据配置决定是否使用复数形式
    const usePlural = m.usePlural === true
    const kebab = toKebab(m.name, usePlural)
    // 使用模块名的小写形式作为菜单路径，而不是复数形式
    const routeBase = m.routeBase ? m.routeBase : kebab
    if (!topMap.has(key)) {
      topMap.set(key, { label, groups: new Map(), role })
    }
    const entry = topMap.get(key)
    if (!entry.groups.has(groupLabel)) {
      entry.groups.set(groupLabel, { role, children: [] })
    }
    const group = entry.groups.get(groupLabel)
    const itemKey = `/admin/${routeBase}`
    if (!group.children.find((c) => c.key === itemKey)) {
      group.children.push({ 
        key: itemKey, 
        label: itemLabel, 
        role
        // 不设置onClick，由ThreeLevelLayout组件自动处理导航
      })
    }
  }

  const topItems = Array.from(topMap.entries())
    .map(([key, v]) => `  { key: '${key}', label: '${v.label}', icon: <UnorderedListOutlined />, role: '${v.role}' }`)
    .join(',\n')

  const sections = Array.from(topMap.entries())
    .map(([key, v]) => {
      const groups = Array.from(v.groups.entries())
        .map(([gLabel, group]) => {
          const childLines = group.children
            .map((c) => `        { key: '${c.key}', label: '${c.label}', role: '${c.role}' }`)
            .join(',\n')
          return `    {\n      key: '${gLabel}',\n      label: '${gLabel}',\n      role: '${group.role}',\n      children: [\n${childLines}\n      ]\n    }`
        })
        .join(',\n')
      return `  ${key}: [\n${groups}\n  ]`
    })
    .join(',\n\n')

  const content = `import { ReactNode } from 'react'\nimport { UnorderedListOutlined } from '@ant-design/icons'\n\ninterface MenuItem {\n  key: string\n  label: string\n  icon?: ReactNode\n  children?: MenuItem[]\n  onClick?: () => void\n  role?: string\n}\n\nexport const generatedTopMenuItems = [\n${topItems}\n]\n\nexport const generatedMenuData: Record<string, MenuItem[]> = {\n${sections}\n}\n`
  return content
}

export const runGeneration = async (config, opts = {}) => {
  const modules = config.modules || []
  
  try {
    for (const module of modules) {
      // 根据配置决定是否使用复数形式
      const usePlural = module.usePlural === true
      const kebab = toKebab(module.name, usePlural)
      // 使用模块名的小写形式作为路由路径，而不是复数形式
      const routeBase = module.routeBase ? module.routeBase : kebab
      const apiPath = path.join(srcRoot, 'api', `${routeBase}.ts`)
      const listPagePath = path.join(srcRoot, 'pages', 'Admin', `${toPascal(module.name)}List.tsx`)
      const formPagePath = path.join(srcRoot, 'pages', 'Admin', `${toPascal(module.name)}Form.tsx`)

      await ensureDir(path.dirname(apiPath))
      await ensureDir(path.dirname(listPagePath))
      await ensureDir(path.dirname(formPagePath))

      const apiContent = renderApi(module, config.project?.apis || [])
      await writeText(apiPath, apiContent)

      const listContent = renderAdminListPage(module, config.project?.apis || [])
      await writeText(listPagePath, listContent)

      const formContent = renderAdminFormPage(module, config.project?.apis || [])
      await writeText(formPagePath, formContent)

      const typesPath = path.join(srcRoot, 'types', 'index.ts')
      let typesText = await readText(typesPath)
      const namePascal = toPascal(module.name)
      if (!new RegExp(`export\\s+interface\\s+${namePascal}`).test(typesText)) {
        const typeBlock = renderTypes(module, config.project?.apis || [])
        typesText = typesText + '\n' + typeBlock + '\n'
        await writeText(typesPath, typesText)
      }

      const routerPath = path.join(srcRoot, 'router', 'index.tsx')
      let routerText = await readText(routerPath)
      const importList = `import Admin${namePascal}List from '@/pages/Admin/${toPascal(module.name)}List'\nimport Admin${namePascal}Form from '@/pages/Admin/${toPascal(module.name)}Form'`
      if (!routerText.includes(`import Admin${namePascal}List`)) {
        routerText = importList + '\n' + routerText
      }
      
      // 根据模块的角色权限决定路由保护级别
      const moduleRole = module.menu?.role || 'ADMIN'
      const requireAdmin = moduleRole === 'ADMIN'
      const protectedRouteElement = requireAdmin 
        ? `<ProtectedRoute requireAdmin>\n            <Admin${namePascal}List />\n          </ProtectedRoute>`
        : `<ProtectedRoute>\n            <Admin${namePascal}List />\n          </ProtectedRoute>`
      const protectedFormElement = requireAdmin
        ? `<ProtectedRoute requireAdmin>\n            <Admin${namePascal}Form />\n          </ProtectedRoute>`
        : `<ProtectedRoute>\n            <Admin${namePascal}Form />\n          </ProtectedRoute>`
      
      const routeBlock = `{
        path: 'admin/${routeBase}',
        element: (
          ${protectedRouteElement}
        ),
      },
      {
        path: 'admin/${routeBase}/new',
        element: (
          ${protectedFormElement}
        ),
      },
      {
        path: 'admin/${routeBase}/:id/edit',
        element: (
          ${protectedFormElement}
        ),
      },`
      if (!routerText.includes(`path: 'admin/${routeBase}'`)) {
        const endRegex = /(\n\s*\],\s*\n\s*\},\s*\n\s*\]\);\s*)$/
        routerText = routerText.replace(endRegex, (m) => `\n${routeBlock}${m}`)
      }
      await writeText(routerPath, routerText)

      const appPath = path.join(srcRoot, 'App.tsx')
      let appText = await readText(appPath)
      const basePath = `/admin/${routeBase}`
      // 检查是否已经包含/admin路径，如果没有则添加
      if (!appText.includes(basePath)) {
        appText = appText.replace('(path => location.pathname.startsWith(path))', (s) => s)
        appText = appText.replace(/\[([^\]]*)\]/, (match) => {
          if (match.includes(basePath)) return match
          const insertIdx = match.lastIndexOf(']')
          return match.slice(0, insertIdx) + `, '${basePath}'` + match.slice(insertIdx)
        })
        await writeText(appPath, appText)
      }

      const menuGenPath = path.join(srcRoot, 'menu-integration.tsx')
      const menuContent = renderMenuIntegration(config)
      await writeText(menuGenPath, menuContent)
    }

    const threePath = path.join(srcRoot, 'components', 'ThreeLevelLayout.tsx')
    let threeText = await readText(threePath)
    if (!threeText.includes("import { generatedMenuData")) {
      // only apply once; keep original logic unchanged otherwise
      threeText = `import { generatedMenuData, generatedTopMenuItems } from '@/menu-integration'\n` + threeText
      threeText = threeText.replace(/const\s+menuData:\s*Record<[^>]+>\s*=\s*\{([\s\S]*?)\}\s*;/, (m, c) => {
        return `const baseMenuData: Record<string, any[]> = {${c}}\nconst menuData: Record<string, any[]> = Object.keys({ ...generatedMenuData, ...baseMenuData }).reduce((acc, key) => {\n  const a = generatedMenuData[key] || []\n  const b = baseMenuData[key] || []\n  acc[key] = [...a, ...b]\n  return acc\n}, {})`
      })
      threeText = threeText.replace(/const\s+topMenuItems\s*=\s*\[([\s\S]*?)\]\s*;/, (m, c) => {
        return `const baseTopMenuItems = [${c}]\nconst topMenuItems = [ ...baseTopMenuItems, ...generatedTopMenuItems ].filter((v, i, arr) => arr.findIndex(x => x.key === v.key) === i)`
      })
      await writeText(threePath, threeText)
    }

    return { 
      ok: true
    }
  } catch (e) {
    throw e
  }
}

export const parseYamlFile = async (yamlPath) => {
  const text = await fs.readFile(yamlPath, 'utf-8')
  const cfg = yaml.load(text)
  return cfg
}
