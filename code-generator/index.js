#!/usr/bin/env node
import { Command } from 'commander'
import { runGeneration, parseYamlFile } from './core/generator.js'
import fs from 'fs-extra'
import path from 'node:path'

const program = new Command()

program
  .name('code-generator')
  .description('代码生成器工具')
  .version('1.0.0')

program
  .command('generate')
  .description('根据配置文件生成代码')
  .option('-c, --config <path>', '配置文件路径', 'codegen.yaml')
  .option('-f, --force', '强制覆盖已存在的文件')
  .option('-v, --verbose', '显示详细输出')
  .action(async (options) => {
    try {
      const configPath = path.resolve(options.config)
      if (!await fs.pathExists(configPath)) {
        console.error(`配置文件不存在: ${configPath}`)
        process.exit(1)
      }

      console.log(`正在读取配置文件: ${configPath}`)
      const config = await parseYamlFile(configPath)
      
      console.log('开始生成代码...')
      const result = await runGeneration(config, {
        force: options.force,
        verbose: options.verbose
      })
      
      if (result.ok) {
        console.log('✅ 代码生成完成')
      } else {
        console.error('❌ 代码生成失败')
        process.exit(1)
      }
    } catch (error) {
      console.error('生成代码时发生错误:', error.message)
      process.exit(1)
    }
  })

program
  .command('list')
  .description('列出可用的配置模板')
  .action(() => {
    console.log('可用配置模板:')
    console.log('  - codegen.yaml (默认)')
    console.log('  - user.yaml (用户管理)')
    console.log('  - order.yaml (订单管理)')
  })

program
  .command('status')
  .description('显示代码生成器状态')
  .action(() => {
    console.log('代码生成器状态:')
    console.log('  ✅ 运行正常')
    console.log('  📁 配置文件: codegen.yaml')
    console.log('  🚀 支持功能: API生成、页面生成、类型定义、菜单集成')
  })

program.parse()