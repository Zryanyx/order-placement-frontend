const fs = require('fs');
const path = require('path');

class PageGenerator {
  static async generate(module, project, projectRoot) {
    const pageDir = path.join(projectRoot, project.basePath, 'pages', module.directory);
    
    // 确保目录存在
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    // 生成列表页面
    const listPageContent = this.generateListPage(module, project);
    const listPagePath = path.join(pageDir, `${module.name}List.tsx`);
    
    fs.writeFileSync(listPagePath, listPageContent);
    console.log(`   📄 生成列表页面: ${listPagePath}`);

    // 如果支持详情，生成详情页面
    if (module.apis.includes('GET')) {
      const detailPageContent = this.generateDetailPage(module, project);
      const detailPagePath = path.join(pageDir, `${module.name}Detail.tsx`);
      
      fs.writeFileSync(detailPagePath, detailPageContent);
      console.log(`   📄 生成详情页面: ${detailPagePath}`);
    }

    // 如果支持创建/编辑，生成表单页面
    if (module.apis.includes('POST') || module.apis.includes('PUT')) {
      const formPageContent = this.generateFormPage(module, project);
      const formPagePath = path.join(pageDir, `${module.name}Form.tsx`);
      
      fs.writeFileSync(formPagePath, formPageContent);
      console.log(`   📄 生成表单页面: ${formPagePath}`);
    }
  }

  // 生成列表页面
  static generateListPage(module, project) {
    const moduleName = module.name;
    const camelCaseName = this.toCamelCase(moduleName);
    const pluralName = this.pluralize(camelCaseName);
    
    const hasQueryFields = module.fields.some(field => field.query?.enabled);
    const hasStatusField = module.fields.some(field => field.name === 'status');

    let content = `import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, message, Modal, Form, Input, Select, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { get${pluralName}, delete${moduleName}, ${hasStatusField ? `enable${moduleName}, disable${moduleName},` : ''} } from '@/api/${camelCaseName}';
import { ${moduleName}, ${moduleName}QueryParams } from '@/types';

const { confirm } = Modal;
const { Option } = Select;

const ${moduleName}List: React.FC = () => {
  const [data, setData] = useState<${moduleName}[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchForm] = Form.useForm();

  // 加载数据
  const loadData = async (params: ${moduleName}QueryParams = {}) => {
    setLoading(true);
    try {
      const response = await get${pluralName}({
        ...params,
        page: params.page || pagination.current,
        size: params.size || pagination.pageSize,
      });
      setData(response.data.records || []);
      setPagination({
        ...pagination,
        total: response.data.total || 0,
      });
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
    loadData({
      page: pagination.current,
      size: pagination.pageSize,
    });
  };

  // 搜索
  const handleSearch = (values: any) => {
    loadData({
      ...values,
      page: 1,
      size: pagination.pageSize,
    });
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    loadData({
      page: 1,
      size: pagination.pageSize,
    });
  };

  // 删除
  const handleDelete = (record: ${moduleName}) => {
    confirm({
      title: '确认删除',
      content: \`确定要删除\${record.name || record.id}吗？\`,
      onOk: async () => {
        try {
          await delete${moduleName}(record.id);
          message.success('删除成功');
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 状态切换
  ${hasStatusField ? `const handleStatusToggle = async (record: ${moduleName}) => {
    try {
      if (record.status === 1) {
        await disable${moduleName}(record.id);
        message.success('已禁用');
      } else {
        await enable${moduleName}(record.id);
        message.success('已启用');
      }
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };` : ''}

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
`;

    // 添加字段列
    module.fields.slice(0, 4).forEach(field => {
      if (field.name !== 'id') {
        content += `    {
      title: '${field.comment}',
      dataIndex: '${field.name}',
      key: '${field.name}',
    },
`;
      }
    });

    // 添加状态列
    if (hasStatusField) {
      content += `    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <span style={{ color: status === 1 ? '#52c41a' : '#ff4d4f' }}>
          {status === 1 ? '启用' : '禁用'}
        </span>
      ),
    },
`;
    }

    content += `    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (record: ${moduleName}) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => {/* 查看详情 */}}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => {/* 编辑 */}}>
            编辑
          </Button>
          ${hasStatusField ? `<Button 
            type="link" 
            onClick={() => handleStatusToggle(record)}
            style={{ color: record.status === 1 ? '#ff4d4f' : '#52c41a' }}
          >
            {record.status === 1 ? '禁用' : '启用'}
          </Button>` : ''}
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="${module.comment}管理">
      {/* 搜索表单 */}
      ${hasQueryFields ? `<Form form={searchForm} layout="inline" onFinish={handleSearch}>
        <Row gutter={16} style={{ width: '100%' }}>
` : ''}

    ${hasQueryFields ? module.fields.filter(field => field.query?.enabled).slice(0, 3).map(field => {
      const fieldName = field.name;
      const fieldComment = field.comment;
      
      if (field.type === 'number') {
        return `          <Col span={6}>
            <Form.Item label="${fieldComment}" name="${fieldName}">
              <Input placeholder="请输入${fieldComment}" />
            </Form.Item>
          </Col>`;
      } else if (field.type === 'boolean') {
        return `          <Col span={6}>
            <Form.Item label="${fieldComment}" name="${fieldName}">
              <Select placeholder="请选择${fieldComment}" allowClear>
                <Option value={true}>是</Option>
                <Option value={false}>否</Option>
              </Select>
            </Form.Item>
          </Col>`;
      } else {
        return `          <Col span={6}>
            <Form.Item label="${fieldComment}" name="${fieldName}">
              <Input placeholder="请输入${fieldComment}" />
            </Form.Item>
          </Col>`;
      }
    }).join('\n') : ''}

    ${hasQueryFields ? `          <Col span={6}>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  搜索
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>` : ''}

      {/* 操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />}>
          新增${module.comment}
        </Button>
      </div>

      {/* 数据表格 */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default ${moduleName}List;`;

    return content;
  }

  // 生成详情页面
  static generateDetailPage(module, project) {
    const moduleName = module.name;
    
    let content = `import React from 'react';
import { Card, Descriptions, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ${moduleName} } from '@/types';

interface ${moduleName}DetailProps {
  data: ${moduleName};
  onBack: () => void;
}

const ${moduleName}Detail: React.FC<${moduleName}DetailProps> = ({ data, onBack }) => {
  return (
    <Card 
      title="${module.comment}详情" 
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回
        </Button>
      }
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
`;

    module.fields.forEach(field => {
      if (field.name !== 'id') {
        content += `        <Descriptions.Item label="${field.comment}">{data.${field.name}}</Descriptions.Item>\n`;
      }
    });

    content += `      </Descriptions>
    </Card>
  );
};

export default ${moduleName}Detail;`;

    return content;
  }

  // 生成表单页面
  static generateFormPage(module, project) {
    const moduleName = module.name;
    
    let content = `import React from 'react';
import { Form, Input, Button, Card, Select, InputNumber, message } from 'antd';
import { ${moduleName} } from '@/types';

interface ${moduleName}FormProps {
  initialData?: ${moduleName};
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ${moduleName}Form: React.FC<${moduleName}FormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      message.success(initialData ? '修改成功' : '创建成功');
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <Card title={initialData ? '编辑${module.comment}' : '新增${module.comment}'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData}
      >
`;

    module.fields.forEach(field => {
      if (field.name !== 'id') {
        const rules = field.required ? [{ required: true, message: \`请输入\${field.comment}\` }] : [];
        
        if (field.type === 'number') {
          content += `        <Form.Item
          label="${field.comment}"
          name="${field.name}"
          rules={${JSON.stringify(rules)}}
        >
          <InputNumber style={{ width: '100%' }} placeholder="请输入${field.comment}" />
        </Form.Item>\n`;
        } else if (field.type === 'boolean') {
          content += `        <Form.Item
          label="${field.comment}"
          name="${field.name}"
          rules={${JSON.stringify(rules)}}
        >
          <Select placeholder="请选择${field.comment}">
            <Select.Option value={true}>是</Select.Option>
            <Select.Option value={false}>否</Select.Option>
          </Select>
        </Form.Item>\n`;
        } else {
          content += `        <Form.Item
          label="${field.comment}"
          name="${field.name}"
          rules={${JSON.stringify(rules)}}
        >
          <Input placeholder="请输入${field.comment}" />
        </Form.Item>\n`;
        }
      }
    });

    content += `        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
            {initialData ? '保存' : '创建'}
          </Button>
          <Button onClick={onCancel}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ${moduleName}Form;`;

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