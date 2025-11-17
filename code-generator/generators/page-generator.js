const fs = require('fs');
const path = require('path');

class PageGenerator {
  static async generate(module, project, projectRoot) {
    const pageDir = path.join(projectRoot, project.basePath, module.directory);
    
    // 确保目录存在
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    // 生成列表页面
    if (module.apis.includes('LIST')) {
      const listContent = this.generateListPage(module, project);
      const listFilePath = path.join(pageDir, `${module.name}List.tsx`);
      fs.writeFileSync(listFilePath, listContent);
      console.log(`   📄 生成列表页面: ${listFilePath}`);
    }

    // 生成表单页面
    if (module.apis.includes('POST') || module.apis.includes('PUT')) {
      const formContent = this.generateFormPage(module, project);
      const formFilePath = path.join(pageDir, `${module.name}Form.tsx`);
      fs.writeFileSync(formFilePath, formContent);
      console.log(`   📄 生成表单页面: ${formFilePath}`);
    }

    // 生成详情页面
    if (module.apis.includes('GET')) {
      const detailContent = this.generateDetailPage(module, project);
      const detailFilePath = path.join(pageDir, `${module.name}Detail.tsx`);
      fs.writeFileSync(detailFilePath, detailContent);
      console.log(`   📄 生成详情页面: ${detailFilePath}`);
    }
  }

  static generateListPage(module, project) {
    const moduleName = module.name;
    const camelCaseName = this.toCamelCase(moduleName);
    const pluralName = this.pluralize(camelCaseName);
    
    const hasStatusField = module.fields.some(field => field.name === 'status');
    const queryFields = module.fields.filter(field => field.query && field.query.enabled);

    let content = `import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Popconfirm, Tag, message, Input, Pagination, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined${hasStatusField ? ', CheckCircleOutlined, CloseCircleOutlined' : ''} } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { get${pluralName}, delete${moduleName}${hasStatusField ? `, enable${moduleName}, disable${moduleName}` : ''} } from '@/api/${camelCaseName}';
import { ${moduleName}, ${moduleName}QueryParams } from '@/types';

const { Title } = Typography;
const { Search } = Input;

const ${moduleName}List = () => {
  const navigate = useNavigate();
  const [${camelCaseName}s, set${pluralName}] = useState<${moduleName}[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetch${pluralName}();
  }, [current, pageSize]);

  const fetch${pluralName} = async () => {
    setLoading(true);
    try {
      const params: ${moduleName}QueryParams = {
        pageNum: current,
        pageSize,
        keyword: keyword || undefined,
      };
      const response = await get${pluralName}(params);
      const { records, total: totalCount } = response.data;
      set${pluralName}(records);
      setTotal(totalCount);
    } catch (error: any) {
      message.error(error.message || '获取${module.comment}列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1);
    fetch${pluralName}();
  };

  const handleDelete = async (id: number) => {
    try {
      await delete${moduleName}(id);
      message.success('删除成功');
      fetch${pluralName}();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };
`;

    if (hasStatusField) {
      content += `
  const handleEnable = async (id: number) => {
    try {
      await enable${moduleName}(id);
      message.success('启用成功');
      fetch${pluralName}();
    } catch (error: any) {
      message.error(error.message || '启用失败');
    }
  };

  const handleDisable = async (id: number) => {
    try {
      await disable${moduleName}(id);
      message.success('禁用成功');
      fetch${pluralName}();
    } catch (error: any) {
      message.error(error.message || '禁用失败');
    }
  };
`;
    }

    content += `
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
`;

    // 生成表格列
    module.fields.forEach(field => {
      if (field.name !== 'id') {
        content += `    {
      title: '${field.comment}',
      dataIndex: '${field.name}',
      key: '${field.name}',
`;
        
        if (field.name === 'status') {
          content += `      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
`;
        } else if (field.type === 'number' && field.name.includes('price')) {
          content += `      render: (price: number) => \`¥\${price?.toFixed(2)}\`,
`;
        }
        
        content += `    },
`;
      }
    });

    content += `    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: any, record: ${moduleName}) => (
        <Space>
`;

    if (module.apis.includes('PUT')) {
      content += `          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(\`/${camelCaseName}s/\${record.id}/edit\`)}
          >
            编辑
          </Button>
`;
    }

    if (hasStatusField) {
      content += `          {record.status === 1 ? (
            <Popconfirm
              title="确定要禁用这个${module.comment}吗？"
              onConfirm={() => handleDisable(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<CloseCircleOutlined />}>
                禁用
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确定要启用这个${module.comment}吗？"
              onConfirm={() => handleEnable(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" icon={<CheckCircleOutlined />}>
                启用
              </Button>
            </Popconfirm>
          )}
`;
    }

    if (module.apis.includes('DELETE')) {
      content += `          <Popconfirm
            title="确定要删除这个${module.comment}吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
`;
    }

    content += `        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>${module.comment}</Title>
        <Space>
          <Search
            placeholder="搜索${module.comment}"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
`;

    if (module.apis.includes('POST')) {
      content += `          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/${camelCaseName}s/new')}
          >
            新增${module.comment}
          </Button>
`;
    }

    content += `        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={${camelCaseName}s}
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
            showTotal={(total) => \`共 \${total} 条\`}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </div>
      </Card>
    </div>
  );
};

export default ${moduleName}List;
`;

    return content;
  }

  static generateFormPage(module, project) {
    const moduleName = module.name;
    const camelCaseName = this.toCamelCase(moduleName);
    
    let content = `import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, message, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { get${moduleName}ById, create${moduleName}, update${moduleName} } from '@/api/${camelCaseName}';

const { Title } = Typography;
const { TextArea } = Input;

const ${moduleName}Form = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit && id) {
      fetch${moduleName}();
    }
  }, [id, isEdit]);

  const fetch${moduleName} = async () => {
    try {
      const response = await get${moduleName}ById(Number(id));
      form.setFieldsValue(response.data);
    } catch (error: any) {
      message.error(error.message || '获取${module.comment}信息失败');
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await update${moduleName}(Number(id), values);
        message.success('更新成功');
        navigate('/${camelCaseName}s');
      } else {
        await create${moduleName}(values);
        message.success('创建成功');
        navigate('/${camelCaseName}s');
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/${camelCaseName}s')}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card>
        <Title level={3}>{isEdit ? '编辑${module.comment}' : '新增${module.comment}'}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
`;

    // 生成表单字段
    module.fields.forEach(field => {
      if (field.name !== 'id' && field.name !== 'createdTime' && field.name !== 'updatedTime') {
        content += `          <Form.Item
            name="${field.name}"
            label="${field.comment}"
`;
        
        if (field.required) {
          content += `            rules={[{ required: true, message: '请输入${field.comment}' }]}
`;
        }
        
        if (field.type === 'number') {
          content += `          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入${field.comment}"
              min={0}
            />
          </Form.Item>
`;
        } else if (field.name.includes('description') || field.comment.includes('描述')) {
          content += `          >
            <TextArea rows={4} placeholder="请输入${field.comment}" />
          </Form.Item>
`;
        } else {
          content += `          >
            <Input placeholder="请输入${field.comment}" />
          </Form.Item>
`;
        }
      }
    });

    content += `          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {isEdit ? '更新' : '创建'}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/${camelCaseName}s')}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ${moduleName}Form;
`;

    return content;
  }

  static generateDetailPage(module, project) {
    const moduleName = module.name;
    const camelCaseName = this.toCamelCase(moduleName);
    
    let content = `import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Typography, Spin } from 'antd';
import { get${moduleName}ById } from '@/api/${camelCaseName}';

const { Title } = Typography;

const ${moduleName}Detail = () => {
  const { id } = useParams<{ id: string }>();
  const [${camelCaseName}, set${moduleName}] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch${moduleName}();
    }
  }, [id]);

  const fetch${moduleName} = async () => {
    try {
      const response = await get${moduleName}ById(Number(id));
      set${moduleName}(response.data);
    } catch (error: any) {
      console.error('获取${module.comment}详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!${camelCaseName}) {
    return <div>${module.comment}不存在</div>;
  }

  return (
    <div>
      <Title level={3}>${module.comment}详情</Title>
      <Card>
        <Descriptions bordered column={2}>
`;

    // 生成详情字段
    module.fields.forEach(field => {
      if (field.name === 'status') {
        content += `          <Descriptions.Item label="${field.comment}">
            <Tag color={${camelCaseName}.${field.name} === 1 ? 'green' : 'red'}>
              {${camelCaseName}.${field.name} === 1 ? '启用' : '禁用'}
            </Tag>
          </Descriptions.Item>
`;
      } else if (field.type === 'number' && field.name.includes('price')) {
        content += `          <Descriptions.Item label="${field.comment}">
            ¥{${camelCaseName}.${field.name}?.toFixed(2)}
          </Descriptions.Item>
`;
      } else {
        content += `          <Descriptions.Item label="${field.comment}">
            {${camelCaseName}.${field.name}}
          </Descriptions.Item>
`;
      }
    });

    content += `        </Descriptions>
      </Card>
    </div>
  );
};

export default ${moduleName}Detail;
`;

    return content;
  }

  static toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  static pluralize(str) {
    if (str.endsWith('y')) {
      return str.slice(0, -1) + 'ies';
    } else if (str.endsWith('s') || str.endsWith('x') || str.endsWith('z') || 
               str.endsWith('ch') || str.endsWith('sh')) {
      return str + 'es';
    } else {
      return str + 's';
    }
  }
}

module.exports = PageGenerator;