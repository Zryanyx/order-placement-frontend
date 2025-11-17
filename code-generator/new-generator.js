#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const inquirer = require('inquirer');

class NewCodeGenerator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.config = null;
  }

  // 显示使用说明
  showWelcome() {
    console.log('🚀 欢迎使用前端代码生成器 - 增强版');
    console.log('================================');
    console.log('特性:');
    console.log('✅ 支持菜单层级管理');
    console.log('✅ 支持多模块批量生成');
    console.log('✅ 支持动态条件查询字段配置');
    console.log('✅ 支持模块级别的API方法选择');
    console.log('✅ 代码直接生成到项目中');
    console.log('');
  }

  // 主运行方法
  async run() {
    this.showWelcome();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      this.showHelp();
      return;
    }
    
    if (args.includes('--config')) {
      await this.runWithConfig(args[1] || './config-template.yml');
    } else if (args.includes('--interactive')) {
      await this.runInteractive();
    } else {
      await this.showUsage();
    }
  }

  // 显示帮助信息
  showHelp() {
    console.log('📖 使用说明:');
    console.log('  node new-generator.js --config [配置文件路径]   使用配置文件模式');
    console.log('  node new-generator.js --interactive             使用交互式模式');
    console.log('  node new-generator.js --help                    显示帮助信息');
    console.log('');
    console.log('📁 配置文件模板: ./config-template.yml');
    console.log('');
  }

  // 显示使用选择
  async showUsage() {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: '请选择运行模式:',
        choices: [
          { name: '使用配置文件模式', value: 'config' },
          { name: '使用交互式模式', value: 'interactive' },
          { name: '显示帮助信息', value: 'help' },
          { name: '退出', value: 'exit' }
        ]
      }
    ]);

    switch (choice) {
      case 'config':
        await this.runWithConfig();
        break;
      case 'interactive':
        await this.runInteractive();
        break;
      case 'help':
        this.showHelp();
        break;
      default:
        console.log('👋 再见！');
        return;
    }
  }

  // 使用配置文件运行
  async runWithConfig(configPath = './config-template.yml') {
    console.log(`📁 加载配置文件: ${configPath}`);
    
    if (!fs.existsSync(configPath)) {
      console.error('❌ 配置文件不存在:', configPath);
      console.log('💡 请先创建配置文件或使用交互式模式');
      return;
    }

    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      this.config = yaml.load(configContent);
      console.log('✅ 配置文件加载成功');
      
      await this.generateAllCode();
    } catch (error) {
      console.error('❌ 配置文件加载失败:', error.message);
    }
  }

  // 交互式运行
  async runInteractive() {
    console.log('📝 开始交互式配置...\n');
    
    // 收集项目配置
    const projectConfig = await this.collectProjectConfig();
    
    // 收集菜单层级配置
    const menuLevels = await this.collectMenuLevels();
    
    // 收集模块配置
    const modules = await this.collectModules();
    
    this.config = {
      project: projectConfig,
      menuLevels: menuLevels,
      modules: modules
    };

    // 保存配置文件
    const savePath = './generated-config.yml';
    fs.writeFileSync(savePath, yaml.dump(this.config));
    console.log(`📁 配置文件已保存: ${savePath}`);
    
    await this.generateAllCode();
  }

  // 收集项目配置
  async collectProjectConfig() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '项目名称:',
        default: 'Java国内多商户管理系统'
      },
      {
        type: 'input',
        name: 'basePath',
        message: '项目基础路径:',
        default: '../src'
      },
      {
        type: 'checkbox',
        name: 'supportedApis',
        message: '支持的API方法:',
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

    return answers;
  }

  // 收集菜单层级配置
  async collectMenuLevels() {
    console.log('\n📋 配置菜单层级...');
    
    const menuLevels = [
      {
        key: 'admin',
        label: '管理员菜单',
        level: 1,
        role: 'admin',
        icon: 'SettingOutlined'
      },
      {
        key: 'user',
        label: '用户菜单',
        level: 1,
        role: 'user',
        icon: 'UserOutlined'
      },
      {
        key: 'common',
        label: '公共菜单',
        level: 1,
        role: 'common',
        icon: 'AppstoreOutlined'
      }
    ];

    console.log('✅ 使用默认菜单层级配置');
    return menuLevels;
  }

  // 收集模块配置
  async collectModules() {
    console.log('\n📦 配置模块信息...');
    
    const modules = [];
    let addMore = true;

    while (addMore) {
      const moduleConfig = await this.collectSingleModule();
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

    return modules;
  }

  // 收集单个模块配置
  async collectSingleModule() {
    console.log('\n📝 配置新模块...');
    
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
        type: 'list',
        name: 'menuLevel',
        message: '选择菜单层级:',
        choices: [
          { name: '管理员菜单 (admin)', value: 'admin' },
          { name: '用户菜单 (user)', value: 'user' },
          { name: '公共菜单 (common)', value: 'common' }
        ],
        default: 'admin'
      },
      {
        type: 'input',
        name: 'directory',
        message: '页面目录（相对于src/pages）:',
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

    // 收集字段配置
    const fields = await this.collectFields();

    return {
      ...moduleBase,
      fields: fields
    };
  }

  // 收集字段配置
  async collectFields() {
    console.log('\n📊 配置字段信息...');
    
    const fields = [];
    let addMore = true;

    while (addMore) {
      const fieldConfig = await this.collectSingleField();
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

  // 收集单个字段配置
  async collectSingleField() {
    const fieldBase = await inquirer.prompt([
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
        choices: ['string', 'number', 'boolean', 'Date'],
        default: 'string'
      },
      {
        type: 'confirm',
        name: 'required',
        message: '是否必填?',
        default: false
      }
    ]);

    // 查询配置
    const { enableQuery } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enableQuery',
        message: '是否支持条件查询?',
        default: false
      }
    ]);

    if (enableQuery) {
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

      fieldBase.query = {
        enabled: true,
        queryTypes: queryConfig.queryTypes
      };
    }

    return fieldBase;
  }

  // 生成所有代码
  async generateAllCode() {
    console.log('\n🚀 开始生成代码...');
    
    const { project, modules } = this.config;
    
    console.log(`📦 项目: ${project.name}`);
    console.log(`📁 基础路径: ${path.join(this.projectRoot, project.basePath)}`);
    console.log(`📊 模块数量: ${modules.length}\n`);
    
    // 导入生成器
    const ApiGenerator = require('./new-generators/api-generator');
    const TypeGenerator = require('./new-generators/type-generator');
    const PageGenerator = require('./new-generators/page-generator');
    const MenuUpdater = require('./new-generators/menu-updater');
    
    // 生成类型定义
    console.log('📋 生成类型定义...');
    for (const module of modules) {
      await TypeGenerator.generate(module, project, this.projectRoot);
    }
    
    // 生成API文件
    console.log('🔗 生成API文件...');
    for (const module of modules) {
      await ApiGenerator.generate(module, project, this.projectRoot);
    }
    
    // 生成页面组件
    console.log('📄 生成页面组件...');
    for (const module of modules) {
      await PageGenerator.generate(module, project, this.projectRoot);
    }
    
    // 更新菜单配置
    console.log('📊 更新菜单配置...');
    await MenuUpdater.update(modules, project, this.projectRoot);
    
    console.log('\n🎉 所有代码生成完成！');
    console.log('💡 请检查生成的文件，并根据需要调整路由配置。');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const generator = new NewCodeGenerator();
  generator.run().catch(console.error);
}

module.exports = NewCodeGenerator;