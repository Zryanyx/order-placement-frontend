#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const inquirer = require('inquirer');

// 导入生成器
const ApiGenerator = require('./generators/api-generator');
const PageGenerator = require('./generators/page-generator');
const TypeGenerator = require('./generators/type-generator');

class CodeGenerator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.config = null;
  }

  // 加载配置文件
  loadConfig(configPath) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      this.config = yaml.load(configContent);
      console.log('✅ 配置文件加载成功');
      return true;
    } catch (error) {
      console.error('❌ 配置文件加载失败:', error.message);
      return false;
    }
  }

  // 交互式配置收集
  async collectConfig() {
    console.log('🚀 欢迎使用前端代码生成器！\n');

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'configPath',
        message: '请输入配置文件路径（或直接回车使用交互模式）:',
        default: './config.yml'
      }
    ]);

    if (answers.configPath && fs.existsSync(answers.configPath)) {
      return this.loadConfig(answers.configPath);
    }

    // 交互式配置
    console.log('📝 开始交互式配置...\n');
    
    const interactiveConfig = await this.collectInteractiveConfig();
    this.config = interactiveConfig;
    
    // 保存配置文件
    const savePath = './generated-config.yml';
    fs.writeFileSync(savePath, yaml.dump(this.config));
    console.log(`📁 配置文件已保存: ${savePath}`);
    
    return true;
  }

  // 收集交互式配置
  async collectInteractiveConfig() {
    const projectConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '项目名称:',
        default: '订单管理系统'
      },
      {
        type: 'input',
        name: 'basePath',
        message: '项目基础路径:',
        default: '../src'
      }
    ]);

    const modules = [];
    let addMore = true;

    while (addMore) {
      const moduleConfig = await this.collectModuleConfig();
      modules.push(moduleConfig);

      const { continueAdding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAdding',
          message: '是否继续添加模块?',
          default: true
        }
      ]);

      addMore = continueAdding;
    }

    return {
      project: projectConfig,
      modules: modules
    };
  }

  // 收集模块配置
  async collectModuleConfig() {
    const moduleBase = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '模块名称（英文，首字母大写）:',
        validate: input => input && input.length > 0
      },
      {
        type: 'input',
        name: 'comment',
        message: '模块描述:',
        validate: input => input && input.length > 0
      },
      {
        type: 'input',
        name: 'directory',
        message: '页面目录（相对于src）:',
        default: 'pages/Admin'
      },
      {
        type: 'checkbox',
        name: 'apis',
        message: '选择需要生成的API方法:',
        choices: [
          { name: 'GET（获取详情）', value: 'GET' },
          { name: 'LIST（获取列表）', value: 'LIST' },
          { name: 'POST（新增）', value: 'POST' },
          { name: 'PUT（修改）', value: 'PUT' },
          { name: 'DELETE（删除）', value: 'DELETE' },
          { name: 'PATCH（部分修改）', value: 'PATCH' }
        ],
        default: ['GET', 'LIST', 'POST', 'PUT', 'DELETE']
      }
    ]);

    const fields = await this.collectFieldsConfig();

    return {
      ...moduleBase,
      apiPath: 'api',
      fields: fields
    };
  }

  // 收集字段配置
  async collectFieldsConfig() {
    const fields = [];
    let addMore = true;

    while (addMore) {
      const fieldConfig = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '字段名称（英文）:',
          validate: input => input && input.length > 0
        },
        {
          type: 'input',
          name: 'comment',
          message: '字段描述:',
          validate: input => input && input.length > 0
        },
        {
          type: 'list',
          name: 'type',
          message: '字段类型:',
          choices: ['string', 'number', 'boolean', 'Date']
        },
        {
          type: 'confirm',
          name: 'required',
          message: '是否必填?',
          default: false
        },
        {
          type: 'confirm',
          name: 'queryEnabled',
          message: '是否支持查询?',
          default: false
        }
      ]);

      if (fieldConfig.queryEnabled) {
        const queryConfig = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'queryTypes',
            message: '选择查询类型:',
            choices: [
              { name: '等于（EQ）', value: 'EQ' },
              { name: '模糊查询（LIKE）', value: 'LIKE' },
              { name: '大于（GT）', value: 'GT' },
              { name: '小于（LT）', value: 'LT' },
              { name: '大于等于（GE）', value: 'GE' },
              { name: '小于等于（LE）', value: 'LE' }
            ],
            default: ['EQ']
          }
        ]);

        fieldConfig.query = {
          enabled: true,
          queryTypes: queryConfig.queryTypes
        };
      }

      fields.push(fieldConfig);

      const { continueAdding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAdding',
          message: '是否继续添加字段?',
          default: true
        }
      ]);

      addMore = continueAdding;
    }

    return fields;
  }

  // 生成代码
  async generateCode() {
    const { project, modules } = this.config;
    
    console.log(`📦 开始生成项目: ${project.name}`);
    console.log(`📁 项目路径: ${path.join(this.projectRoot, project.basePath)}\n`);
    
    for (const module of modules) {
      console.log(`🔧 生成模块: ${module.name} (${module.comment})`);
      
      // 生成类型定义
      await TypeGenerator.generate(module, project, this.projectRoot);
      
      // 生成API文件
      await ApiGenerator.generate(module, project, this.projectRoot);
      
      // 生成页面组件
      await PageGenerator.generate(module, project, this.projectRoot);
      
      console.log(`✅ 模块 ${module.name} 生成完成\n`);
    }

    console.log('🎉 所有代码生成完成！');
    console.log('📖 请查看生成的文件，并根据需要调整路由配置。');
  }

  // 从文件加载配置
  async loadConfigFromFile() {
    const configPath = path.join(__dirname, 'config-template.yml');
    if (!fs.existsSync(configPath)) {
      console.error('❌ 配置文件不存在:', configPath);
      return false;
    }
    
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      this.config = yaml.load(configContent);
      console.log('✅ 配置文件加载成功');
      return true;
    } catch (error) {
      console.error('❌ 配置文件加载失败:', error.message);
      return false;
    }
  }

  // 交互式配置收集
  async collectConfigInteractive() {
    console.log('📝 开始交互式配置...\n');
    
    const projectConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '项目名称:',
        default: '订单管理系统'
      },
      {
        type: 'input',
        name: 'basePath',
        message: '项目基础路径:',
        default: 'src'
      }
    ]);

    const modules = [];
    let addMore = true;

    while (addMore) {
      const moduleConfig = await this.collectModuleConfig();
      modules.push(moduleConfig);

      const { continueAdding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAdding',
          message: '是否继续添加模块?',
          default: true
        }
      ]);

      addMore = continueAdding;
    }

    this.config = {
      project: projectConfig,
      modules: modules
    };

    console.log('✅ 配置收集完成');
    return true;
  }

  // 收集模块配置
  async collectModuleConfig() {
    const moduleBase = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '模块名称（英文，首字母大写）:',
        validate: input => input && input.length > 0
      },
      {
        type: 'input',
        name: 'comment',
        message: '模块描述:',
        validate: input => input && input.length > 0
      },
      {
        type: 'input',
        name: 'directory',
        message: '页面目录（如 Admin, Product 等）:',
        default: 'Admin'
      },
      {
        type: 'checkbox',
        name: 'apis',
        message: '选择需要生成的API方法:',
        choices: [
          { name: 'LIST（获取列表）', value: 'LIST' },
          { name: 'GET（获取详情）', value: 'GET' },
          { name: 'POST（新增）', value: 'POST' },
          { name: 'PUT（修改）', value: 'PUT' },
          { name: 'DELETE（删除）', value: 'DELETE' },
          { name: 'PATCH（部分修改）', value: 'PATCH' }
        ],
        default: ['LIST', 'GET', 'POST', 'PUT', 'DELETE']
      }
    ]);

    const fields = await this.collectFieldsConfig();

    return {
      ...moduleBase,
      fields: fields
    };
  }

  // 收集字段配置
  async collectFieldsConfig() {
    const fields = [];
    let addMore = true;

    while (addMore) {
      const fieldConfig = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '字段名称（英文）:',
          validate: input => input && input.length > 0
        },
        {
          type: 'input',
          name: 'comment',
          message: '字段描述:',
          validate: input => input && input.length > 0
        },
        {
          type: 'list',
          name: 'type',
          message: '字段类型:',
          choices: ['string', 'number', 'boolean', 'Date']
        },
        {
          type: 'confirm',
          name: 'required',
          message: '是否必填?',
          default: false
        },
        {
          type: 'confirm',
          name: 'queryEnabled',
          message: '是否支持查询?',
          default: false
        }
      ]);

      if (fieldConfig.queryEnabled) {
        const queryConfig = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'queryTypes',
            message: '选择查询类型:',
            choices: [
              { name: '等于（EQ）', value: 'EQ' },
              { name: '模糊查询（LIKE）', value: 'LIKE' },
              { name: '大于（GT）', value: 'GT' },
              { name: '小于（LT）', value: 'LT' },
              { name: '大于等于（GE）', value: 'GE' },
              { name: '小于等于（LE）', value: 'LE' }
            ],
            default: ['EQ']
          }
        ]);

        fieldConfig.query = {
          enabled: true,
          queryTypes: queryConfig.queryTypes
        };
      }

      fields.push(fieldConfig);

      const { continueAdding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAdding',
          message: '是否继续添加字段?',
          default: true
        }
      ]);

      addMore = continueAdding;
    }

    return fields;
  }

  // 显示使用说明
  async showUsage() {
    console.log('📖 前端代码生成器使用说明');
    console.log('========================');
    console.log('使用方法:');
    console.log('  node index.js --config    使用配置文件模式');
    console.log('  node index.js --interactive 使用交互式模式');
    console.log('');
    console.log('配置文件路径: ./config-template.yml');
    console.log('');
    
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: '请选择运行模式:',
        choices: [
          { name: '使用配置文件模式', value: 'config' },
          { name: '使用交互式模式', value: 'interactive' },
          { name: '退出', value: 'exit' }
        ]
      }
    ]);

    if (choice === 'config') {
      const success = await this.loadConfigFromFile();
      if (!success) return;
      await this.generateCode();
    } else if (choice === 'interactive') {
      const success = await this.collectConfigInteractive();
      if (!success) return;
      await this.generateCode();
    } else {
      console.log('👋 再见！');
      return;
    }
  }

  // 运行生成器
  async run() {
    console.log('🚀 前端代码生成器启动...\n');
    
    // 检查命令行参数
    const args = process.argv.slice(2);
    if (args.includes('--config')) {
      const success = await this.loadConfigFromFile();
      if (!success) return;
      await this.generateCode();
    } else if (args.includes('--interactive')) {
      const success = await this.collectConfigInteractive();
      if (!success) return;
      await this.generateCode();
    } else {
      await this.showUsage();
      return;
    }
    
    console.log('\n✅ 代码生成完成！');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const generator = new CodeGenerator();
  generator.run();
}

module.exports = CodeGenerator;