const fs = require('fs');
const path = require('path');

class TypeGenerator {
  static async generate(module, project, projectRoot) {
    const typesDir = path.join(projectRoot, project.basePath, 'types');
    
    // 确保目录存在
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    const typeContent = this.generateTypeContent(module);
    const typeFilePath = path.join(typesDir, `${this.toCamelCase(module.name)}.ts`);
    
    // 检查文件是否存在，如果存在则追加内容
    if (fs.existsSync(typeFilePath)) {
      const existingContent = fs.readFileSync(typeFilePath, 'utf8');
      if (!existingContent.includes(`interface ${module.name}`)) {
        fs.appendFileSync(typeFilePath, '\n\n' + typeContent);
        console.log(`   📄 追加类型定义: ${typeFilePath}`);
      } else {
        console.log(`   ⚠️  类型定义已存在: ${typeFilePath}`);
      }
    } else {
      fs.writeFileSync(typeFilePath, typeContent);
      console.log(`   📄 生成类型定义: ${typeFilePath}`);
    }
  }

  static generateTypeContent(module) {
    const moduleName = module.name;
    
    let content = `// ${module.comment}相关类型定义
`;

    // 生成主接口
    content += `export interface ${moduleName} {
  id: number;
`;

    // 添加字段
    module.fields.forEach(field => {
      const fieldType = this.getTypeScriptType(field.type);
      const required = field.required ? '' : '?';
      
      content += `  ${field.name}${required}: ${fieldType}; // ${field.comment}\n`;
    });

    // 添加时间字段
    content += `  createdTime?: string;
  updatedTime?: string;
`;

    content += '}\n\n';

    // 生成创建接口
    content += `export interface Create${moduleName}Request {
`;
    
    module.fields.forEach(field => {
      if (field.name !== 'id') {
        const fieldType = this.getTypeScriptType(field.type);
        const required = field.required ? '' : '?';
        
        content += `  ${field.name}${required}: ${fieldType}; // ${field.comment}\n`;
      }
    });

    content += '}\n\n';

    // 生成更新接口
    content += `export interface Update${moduleName}Request {
`;
    
    module.fields.forEach(field => {
      if (field.name !== 'id') {
        const fieldType = this.getTypeScriptType(field.type);
        
        content += `  ${field.name}?: ${fieldType}; // ${field.comment}\n`;
      }
    });

    content += '}\n\n';

    // 生成查询参数接口
    const queryFields = module.fields.filter(field => field.query?.enabled);
    
    if (queryFields.length > 0) {
      content += `export interface ${moduleName}QueryParams {
  page?: number;
  size?: number;
`;

      queryFields.forEach(field => {
        const fieldType = this.getTypeScriptType(field.type);
        
        content += `  ${field.name}?: ${fieldType}; // ${field.comment}\n`;
        
        // 为范围查询添加额外的参数
        if (field.query.queryTypes.includes('GE') || field.query.queryTypes.includes('LE')) {
          content += `  ${field.name}Min?: ${fieldType}; // ${field.comment}最小值\n`;
          content += `  ${field.name}Max?: ${fieldType}; // ${field.comment}最大值\n`;
        }
      });

      content += '}\n\n';
    }

    return content;
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
}

module.exports = TypeGenerator;