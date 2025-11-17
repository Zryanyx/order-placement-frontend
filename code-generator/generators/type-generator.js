const fs = require('fs');
const path = require('path');

class TypeGenerator {
  static async generate(module, project, projectRoot) {
    const typesDir = path.join(projectRoot, project.basePath, 'types');
    const typesFilePath = path.join(typesDir, 'index.ts');
    
    // 确保目录存在
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    // 读取现有类型文件
    let existingContent = '';
    if (fs.existsSync(typesFilePath)) {
      existingContent = fs.readFileSync(typesFilePath, 'utf8');
    }

    // 检查是否已存在该类型定义
    const typeName = module.name;
    if (existingContent.includes(`interface ${typeName}`)) {
      console.log(`   ⚠️  类型 ${typeName} 已存在，跳过生成`);
      return;
    }

    // 生成新的类型定义
    const typeContent = this.generateTypeContent(module);
    const queryTypeContent = this.generateQueryTypeContent(module);
    
    // 追加到现有文件
    let newContent = existingContent;
    if (!newContent.endsWith('\n') && newContent.length > 0) {
      newContent += '\n';
    }
    
    newContent += `\n${typeContent}\n${queryTypeContent}`;
    
    fs.writeFileSync(typesFilePath, newContent);
    console.log(`   📄 更新类型定义: ${typesFilePath}`);
  }

  static generateTypeContent(module) {
    const typeName = module.name;
    
    let content = `// ${module.comment}模型
export interface ${typeName} {
`;

    module.fields.forEach(field => {
      let type = this.mapFieldType(field.type);
      
      // 处理可选字段
      if (!field.required && field.name !== 'id') {
        type += '?';
      }
      
      content += `  ${field.name}: ${type};${field.comment ? ` // ${field.comment}` : ''}\n`;
    });

    content += '}\n';

    return content;
  }

  static generateQueryTypeContent(module) {
    const typeName = module.name;
    const queryFields = module.fields.filter(field => field.query && field.query.enabled);
    
    if (queryFields.length === 0) {
      return '';
    }

    let content = `// ${module.comment}查询参数
export interface ${typeName}QueryParams {
  pageNum?: number;
  pageSize?: number;
`;

    // 添加关键字搜索
    const hasStringFields = module.fields.some(field => 
      field.type === 'string' && field.query && field.query.enabled
    );
    
    if (hasStringFields) {
      content += '  keyword?: string;\n';
    }

    // 添加特定字段查询
    queryFields.forEach(field => {
      let type = this.mapFieldType(field.type);
      
      // 对于字符串字段，支持多种查询类型
      if (field.type === 'string' && field.query.queryTypes.includes('LIKE')) {
        content += `  ${field.name}?: string;\n`;
      } else if (field.type === 'number') {
        // 数字字段支持范围查询
        if (field.query.queryTypes.includes('GT')) {
          content += `  ${field.name}Min?: number; // 最小值\n`;
        }
        if (field.query.queryTypes.includes('LT')) {
          content += `  ${field.name}Max?: number; // 最大值\n`;
        }
        if (field.query.queryTypes.includes('EQ')) {
          content += `  ${field.name}?: number;\n`;
        }
      } else if (field.type === 'Date') {
        // 日期字段支持范围查询
        if (field.query.queryTypes.includes('GT') || field.query.queryTypes.includes('GE')) {
          content += `  ${field.name}Start?: string; // 开始时间\n`;
        }
        if (field.query.queryTypes.includes('LT') || field.query.queryTypes.includes('LE')) {
          content += `  ${field.name}End?: string; // 结束时间\n`;
        }
        if (field.query.queryTypes.includes('EQ')) {
          content += `  ${field.name}?: string;\n`;
        }
      }
    });

    content += '}\n';

    return content;
  }

  static mapFieldType(type) {
    const typeMap = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'Date': 'string'
    };
    
    return typeMap[type] || 'any';
  }
}

module.exports = TypeGenerator;