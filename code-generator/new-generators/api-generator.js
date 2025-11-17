const fs = require('fs');
const path = require('path');

class ApiGenerator {
  static async generate(module, project, projectRoot) {
    const apiDir = path.join(projectRoot, project.basePath, 'api');
    
    // 确保目录存在
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    const apiContent = this.generateApiContent(module, project);
    const apiFilePath = path.join(apiDir, `${this.toCamelCase(module.name)}.ts`);
    
    fs.writeFileSync(apiFilePath, apiContent);
    console.log(`   📄 生成API文件: ${apiFilePath}`);
  }

  static generateApiContent(module, project) {
    const moduleName = module.name;
    const camelCaseName = this.toCamelCase(moduleName);
    const pluralName = this.pluralize(camelCaseName);
    
    // 生成查询参数接口
    const queryParamsInterface = this.generateQueryParamsInterface(module);
    
    let content = `import request from '@/utils/request';
import { ${moduleName}, PageResponse } from '@/types';

${queryParamsInterface}
`;

    // 生成LIST API - 支持条件查询
    if (module.apis.includes('LIST')) {
      content += `// 获取${module.comment}列表
`;
      
      // 检查是否有查询字段
      const hasQueryFields = module.fields.some(field => field.query?.enabled);
      
      if (hasQueryFields) {
        content += `export const get${pluralName} = (params?: ${moduleName}QueryParams) => {
  return request.get<PageResponse<${moduleName}>>('/${camelCaseName}s', { params });
};

`;
      } else {
        content += `export const get${pluralName} = (params?: { page?: number; size?: number }) => {
  return request.get<PageResponse<${moduleName}>>('/${camelCaseName}s', { params });
};

`;
      }
    }

    // 生成GET API
    if (module.apis.includes('GET')) {
      content += `// 获取${module.comment}详情
export const get${moduleName}ById = (id: number) => {
  return request.get<${moduleName}>(\\`/${camelCaseName}s/\${id}\\`);
};

`;
    }

    // 生成POST API
    if (module.apis.includes('POST')) {
      content += `// 创建${module.comment}
export const create${moduleName} = (data: Omit<${moduleName}, 'id' | 'createdTime' | 'updatedTime'>) => {
  return request.post<${moduleName}>('/${camelCaseName}s', data);
};

`;
    }

    // 生成PUT API
    if (module.apis.includes('PUT')) {
      content += `// 更新${module.comment}
export const update${moduleName} = (id: number, data: Partial<${moduleName}>) => {
  return request.put<${moduleName}>(\\`/${camelCaseName}s/\${id}\\`, data);
};

`;
    }

    // 生成DELETE API
    if (module.apis.includes('DELETE')) {
      content += `// 删除${module.comment}
export const delete${moduleName} = (id: number) => {
  return request.delete<void>(\\`/${camelCaseName}s/\${id}\\`);
};

`;
    }

    // 生成PATCH API
    if (module.apis.includes('PATCH')) {
      content += `// 部分更新${module.comment}
export const patch${moduleName} = (id: number, data: Partial<${moduleName}>) => {
  return request.patch<${moduleName}>(\\`/${camelCaseName}s/\${id}\\`, data);
};

`;
    }

    // 生成状态变更API（如果有status字段）
    const hasStatusField = module.fields.some(field => field.name === 'status');
    if (hasStatusField && (module.apis.includes('PUT') || module.apis.includes('PATCH'))) {
      content += `// 启用${module.comment}
export const enable${moduleName} = (id: number) => {
  return request.put<void>(\\`/${camelCaseName}s/\${id}\\`, { status: 1 });
};

// 禁用${module.comment}
export const disable${moduleName} = (id: number) => {
  return request.put<void>(\\`/${camelCaseName}s/\${id}\\`, { status: 0 });
};

`;
    }

    return content;
  }

  // 生成查询参数接口
  static generateQueryParamsInterface(module) {
    const queryFields = module.fields.filter(field => field.query?.enabled);
    
    if (queryFields.length === 0) {
      return `export interface ${module.name}QueryParams {
  page?: number;
  size?: number;
}`;
    }

    let interfaceContent = `export interface ${module.name}QueryParams {
  page?: number;
  size?: number;
`;

    queryFields.forEach(field => {
      const fieldName = field.name;
      const fieldType = this.getTypeScriptType(field.type);
      
      interfaceContent += `  ${fieldName}?: ${fieldType};
`;
      
      // 为范围查询添加额外的参数
      if (field.query.queryTypes.includes('GE') || field.query.queryTypes.includes('LE')) {
        interfaceContent += `  ${fieldName}Min?: ${fieldType};
  ${fieldName}Max?: ${fieldType};
`;
      }
    });

    interfaceContent += '}';
    return interfaceContent;
  }

  // 获取TypeScript类型
  static getTypeScriptType(type) {
    switch (type) {
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'Date': return 'string';
      default: return 'string';
    }
  }

  static toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  static pluralize(str) {
    // 简单的复数化规则
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

module.exports = ApiGenerator;