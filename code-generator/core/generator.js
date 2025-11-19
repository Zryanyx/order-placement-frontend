import path from 'node:path'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import { ensureDir, writeText, readText, projectRoot, srcRoot, toCamel, toPascal, toKebab, toPlural, createBackup, recordCreated } from './utils.js'

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
  const has = (m) => (module.apis && module.apis.length ? module.apis : projectApis).map((x) => String(x).toUpperCase()).includes(m)
  const lines = []
  lines.push("import request from '@/utils/request'")
  lines.push(`import { ${namePascal}, ${namePascal}QueryParams, PageResponse } from '@/types'`)
  if (has('GET') || has('LIST')) {
    lines.push(`export const get${namePascal}List = (params: ${namePascal}QueryParams) => {`)
    lines.push(`  return request.get<PageResponse<${namePascal}>>('${urlBase}', { params })`)
    lines.push('}')
  }
  if (has('GET')) {
    lines.push(`export const get${namePascal}ById = (id: number) => {`)
    lines.push(`  return request.get<${namePascal}>(
      \`${urlBase}/\${id}\`
    )`)
    lines.push('}')
  }
  if (has('POST')) {
    lines.push(`export const create${namePascal} = (data: ${namePascal}) => {`)
    lines.push(`  return request.post<${namePascal}>('${urlBase}', data)`)
    lines.push('}')
  }
  if (has('PUT')) {
    lines.push(`export const update${namePascal} = (id: number, data: ${namePascal}) => {`)
    lines.push(`  return request.put<${namePascal}>(\`${urlBase}/\${id}\`, data)`)
    lines.push('}')
  }
  if (has('PATCH')) {
    lines.push(`export const patch${namePascal} = (id: number, data: Partial<${namePascal}>) => {`)
    lines.push(`  return request.patch<${namePascal}>(\`${urlBase}/\${id}\`, data)`)
    lines.push('}')
  }
  if (has('DELETE')) {
    lines.push(`export const delete${namePascal} = (id: number) => {`)
    lines.push(`  return request.delete<void>(\`${urlBase}/\${id}\`)`)
    lines.push('}')
  }
  return lines.join('\n')
}

const tsType = (f) => {
  return f.type ? (f.type === 'BigDecimal' ? 'number' : f.type.toLowerCase() === 'string' ? 'string' : ['Integer', 'Long', 'Double', 'Float', 'BigDecimal'].includes(f.type) ? 'number' : ['LocalDateTime', 'Date', 'Timestamp'].includes(f.type) ? 'string' : f.type) : 'any'
}

const renderTypes = (module) => {
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
  const queryEnabled = fields.filter((f) => f.query && f.query.enabled)
  const queryLines = []
  queryLines.push(`export interface ${namePascal}QueryParams {`)
  queryLines.push('  pageNum?: number;')
  queryLines.push('  pageSize?: number;')
  for (const f of queryEnabled) {
    const t = tsType(f)
    queryLines.push(`  ${toCamel(f.name)}?: ${t};`)
  }
  queryLines.push('}')
  return modelLines.join('\n') + '\n\n' + queryLines.join('\n')
}

const renderAdminListPage = (module) => {
  const namePascal = toPascal(module.name)
  const nameCamel = toCamel(module.name)
  // 根据配置决定是否使用复数形式
  const usePlural = module.usePlural === true
  const kebab = toKebab(module.name, usePlural)
  // 使用模块名的小写形式作为路由路径，而不是复数形式
  const routeBase = module.routeBase ? module.routeBase : kebab
  const fields = module.fields || []
  const queryFields = fields.filter((f) => f.query && f.query.enabled)
  const columns = fields.filter((f) => !f.logicDelete)
  const formItems = queryFields
    .map((f) => {
      const c = toCamel(f.name)
      const t = tsType(f)
      if (t === 'number') return `{ name: '${c}', label: '${f.comment || f.name}', component: 'number' }`
      return `{ name: '${c}', label: '${f.comment || f.name}', component: 'input' }`
    })
    .join(',\n        ')
  const tableCols = columns
    .map((f) => {
      const c = toCamel(f.name)
      if (c === 'id') return "{ title: 'ID', dataIndex: 'id', key: 'id', width: 80 }"
      return `{ title: '${f.comment || f.name}', dataIndex: '${c}', key: '${c}' }`
    })
    .join(',\n    ')

  return `import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Popconfirm, message, Pagination, Typography, Form, Input, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { get${namePascal}List, delete${namePascal} } from '@/api/${routeBase}'
import { ${namePascal}, ${namePascal}QueryParams } from '@/types'

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
      await delete${namePascal}(id)
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
    ${tableCols},
    { title: '操作', key: 'action', width: 200, render: (_: any, record: ${namePascal}) => (
      <Space>
        <Button type='link' icon={<EditOutlined />} onClick={() => navigate('/admin/${routeBase}/' + record.id + '/edit')}>编辑</Button>
        <Popconfirm title='确定要删除吗？' onConfirm={() => handleDelete(record.id)} okText='确定' cancelText='取消'>
          <Button type='link' danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    ) }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>${module.comment || namePascal}管理</Title>
        <Space>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => navigate('/admin/${routeBase}/new')}>新增</Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout='inline' onFinish={fetchData}>
          {[${formItems}].map(item => (
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

export default Admin${namePascal}List
`
}

const renderAdminFormPage = (module) => {
  const namePascal = toPascal(module.name)
  // 根据配置决定是否使用复数形式
  const usePlural = module.usePlural === true
  const kebab = toKebab(module.name, usePlural)
  // 使用模块名的小写形式作为路由路径，而不是复数形式
  const routeBase = module.routeBase ? module.routeBase : kebab
  const fields = (module.fields || []).filter((f) => !f.primaryKey && !f.logicDelete)
  const formItems = fields
    .map((f) => {
      const c = toCamel(f.name)
      const t = tsType(f)
      if (t === 'number') return `{ name: '${c}', label: '${f.comment || f.name}', component: 'number', required: ${f.nullable === false} }`
      return `{ name: '${c}', label: '${f.comment || f.name}', component: 'input', required: ${f.nullable === false} }`
    })
    .join(',\n        ')
  return `import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, InputNumber, Button, message, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { get${namePascal}ById, create${namePascal}, update${namePascal} } from '@/api/${routeBase}'
import { ${namePascal} } from '@/types'

const { Title } = Typography

const Admin${namePascal}Form = () => {
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
      const response = await get${namePascal}ById(Number(id))
      form.setFieldsValue(response.data)
    } catch (error) {
      message.error('获取信息失败')
    }
  }

  const handleSubmit = async (values: ${namePascal}) => {
    setSubmitting(true)
    try {
      if (isEdit && id) {
        await update${namePascal}(Number(id), values)
        message.success('更新成功')
      } else {
        await create${namePascal}(values)
        message.success('创建成功')
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
  const filesToBackup = ['src/router/index.tsx', 'src/components/ThreeLevelLayout.tsx', 'src/App.tsx', 'src/menu-integration.tsx', 'src/types/index.ts']
  const { stamp } = await createBackup(filesToBackup)
  const createdPaths = []

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
      createdPaths.push(apiPath)

      const listContent = renderAdminListPage(module)
      await writeText(listPagePath, listContent)
      createdPaths.push(listPagePath)

      const formContent = renderAdminFormPage(module)
      await writeText(formPagePath, formContent)
      createdPaths.push(formPagePath)

      const typesPath = path.join(srcRoot, 'types', 'index.ts')
      let typesText = await readText(typesPath)
      const namePascal = toPascal(module.name)
      if (!new RegExp(`export\\s+interface\\s+${namePascal}`).test(typesText)) {
        const typeBlock = renderTypes(module)
        typesText = typesText + '\n' + typeBlock + '\n'
        await writeText(typesPath, typesText)
      }

      const routerPath = path.join(srcRoot, 'router', 'index.tsx')
      let routerText = await readText(routerPath)
      const importList = `import Admin${namePascal}List from '@/pages/Admin/${toPascal(module.name)}List'\nimport Admin${namePascal}Form from '@/pages/Admin/${toPascal(module.name)}Form'`
      if (!routerText.includes(`import Admin${namePascal}List`)) {
        routerText = importList + '\n' + routerText
      }
      const routeBlock = `{
        path: 'admin/${routeBase}',
        element: (
          <ProtectedRoute requireAdmin>
            <Admin${namePascal}List />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/${routeBase}/new',
        element: (
          <ProtectedRoute requireAdmin>
            <Admin${namePascal}Form />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/${routeBase}/:id/edit',
        element: (
          <ProtectedRoute requireAdmin>
            <Admin${namePascal}Form />
          </ProtectedRoute>
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

    await recordCreated(stamp, createdPaths)
    return { ok: true, stamp }
  } catch (e) {
    await recordCreated(stamp, createdPaths)
    throw e
  }
}

export const parseYamlFile = async (yamlPath) => {
  const text = await fs.readFile(yamlPath, 'utf-8')
  const cfg = yaml.load(text)
  return cfg
}