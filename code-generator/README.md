# 前端代码生成器

基于DSL配置自动生成React+TypeScript CRUD代码的代码生成器。

## 🚀 功能特性

### 基础版本
- ✅ 支持多种HTTP方法：GET/POST/PUT/DELETE/PATCH
- ✅ 模块级别的API配置（可选择生成哪些API）
- ✅ 一次生成多个模块
- ✅ 交互式界面收集参数
- ✅ 条件查询字段动态配置
- ✅ 自动生成到项目目录
- ✅ 支持分页查询和条件查询

### 增强版本（新增）
- ✅ **菜单层级管理** - 支持管理员、用户、公共三级菜单
- ✅ **多模块批量生成** - 一次生成多个模块的完整CRUD代码
- ✅ **动态条件查询** - 支持字段级别的查询条件配置
- ✅ **模块级API选择** - 每个模块可选择需要的HTTP方法
- ✅ **代码直接生成** - 生成的代码直接写入项目文件
- ✅ **交互式界面** - 友好的命令行交互界面

## 🛠️ 快速开始

### 1. 安装依赖

```bash
cd code-generator
npm install
```

### 2. 使用方式

#### 方式一：使用配置文件（推荐）

**基础版本：**
1. 编辑 `config-template.yml` 文件，配置你的模块信息
2. 运行生成器：

```bash
npm run generate:config
# 或
node index.js --config
```

**增强版本：**
1. 编辑 `config-template.yml` 文件，配置菜单层级和模块信息
2. 运行增强版生成器：

```bash
node new-generator.js --config config-template.yml
```

#### 方式二：交互式配置

**基础版本：**
```bash
npm run generate:interactive
# 或
node index.js --interactive
```

**增强版本：**
```bash
node new-generator.js --interactive
```

#### 方式三：显示使用说明

```bash
node new-generator.js --help
```

### 3. 配置文件示例

#### 基础版本配置
```yaml
project:
  name: "订单管理系统"
  basePath: "src"
  apis: ["GET", "LIST", "POST", "PUT", "DELETE"]

modules:
  - name: "Category"
    comment: "商品分类"
    directory: "Admin"
    apis: ["GET", "LIST", "DELETE"]
    fields:
      - name: "id"
        type: "number"
        comment: "主键ID"
        required: true
      - name: "name"
        type: "string"
        comment: "分类名称"
        required: true
        query:
          enabled: true
          queryTypes: ["LIKE"]
      - name: "status"
        type: "number"
        comment: "状态 0:停用,1:启用"
        query:
          enabled: true
          queryTypes: ["EQ"]
```

#### 增强版本配置（新增菜单层级管理）
```yaml
project:
  name: "Java国内多商户管理系统"
  basePath: "../src"
  supportedApis:
    - "GET"
    - "LIST" 
    - "POST"
    - "PUT"
    - "DELETE"
    - "PATCH"

menuLevels:
  - key: "admin"
    label: "管理员菜单"
    level: 1
    role: "admin"
    icon: "SettingOutlined"
  - key: "user"
    label: "用户菜单"
    level: 1
    role: "user" 
    icon: "UserOutlined"
  - key: "common"
    label: "公共菜单"
    level: 1
    role: "common"
    icon: "AppstoreOutlined"

modules:
  - name: "Category"
    comment: "商品分类"
    menuLevel: "admin"
    directory: "Admin"
    apis: ["LIST", "GET", "POST", "PUT", "DELETE"]
    fields:
      - name: "name"
        comment: "分类名称"
        type: "string"
        required: true
        query:
          enabled: true
          queryTypes: ["EQ", "LIKE"]
      - name: "status"
        comment: "状态"
        type: "number"
        query:
          enabled: true
          queryTypes: ["EQ"]
  - name: "UserAddress"
    comment: "用户地址"
    menuLevel: "user"
    directory: "User"
    apis: ["LIST", "GET", "POST", "PUT", "DELETE"]
    fields:
      - name: "receiverName"
        comment: "收货人姓名"
        type: "string"
        required: true
        query:
          enabled: true
          queryTypes: ["LIKE"]
      - name: "phone"
        comment: "联系电话"
        type: "string"
        query:
          enabled: true
          queryTypes: ["LIKE"]
```

## 📋 配置文件说明

### project 配置

- `name`: 项目名称
- `basePath`: 项目基础路径（相对于生成器）
- `apis`: 支持的API方法列表

### module 配置

- `name`: 模块名称（英文，首字母大写）
- `comment`: 模块描述
- `directory`: 页面所在目录（如：Admin, Product等）
- `apis`: 该模块需要生成的API方法
- `fields`: 字段定义

### field 配置

- `name`: 字段名
- `type`: 字段类型（string/number/boolean/Date）
- `comment`: 字段描述
- `required`: 是否必填
- `query`: 查询配置
  - `enabled`: 是否支持查询
  - `queryTypes`: 查询类型（LIKE/EQ/GT/LT/GE/LE）

### 增强版新增配置

#### menuLevels 配置（菜单层级）
- `key`: 菜单键（英文，小写）
- `label`: 菜单显示名称
- `level`: 菜单层级（1-3级）
- `role`: 角色权限
- `icon`: 图标名称（Ant Design图标）

#### module 配置新增
- `menuLevel`: 模块所属的菜单层级（对应menuLevels中的key）

#### project 配置增强
- `supportedApis`: 支持的API方法列表（增强版使用）

## 📁 生成的文件结构

### 基础版本生成的文件
```
src/
├── api/
│   └── {module-name}.ts          # API接口文件
├── types/
│   └── index.ts                   # TypeScript类型定义
└── pages/
    └── {directory}/
        ├── {ModuleName}List.tsx   # 列表页面
        ├── {ModuleName}Form.tsx   # 表单页面
        └── {ModuleName}Detail.tsx # 详情页面
```

### 增强版本生成的文件（新增菜单自动更新）
```
src/
├── api/                    # API接口文件
│   └── category.ts        # 商品分类API
├── types/                 # 类型定义文件
│   └── category.ts        # 商品分类类型定义
└── pages/                 # 页面组件
    └── Admin/             # 管理员页面目录
        ├── CategoryList.tsx    # 列表页面
        ├── CategoryDetail.tsx # 详情页面
        └── CategoryForm.tsx   # 表单页面
```

**增强版新增功能：**
- 自动更新 `src/components/Layout.tsx` 文件中的菜单配置
- 按菜单层级分组生成菜单项
- 支持多模块批量生成和菜单管理

## 支持的API方法

- **LIST**: 分页查询列表
- **GET**: 根据ID查询详情
- **POST**: 新增数据
- **PUT**: 修改数据
- **DELETE**: 删除数据
- **PATCH**: 部分修改数据

## 条件查询配置

在字段配置中设置 `query.enabled: true` 后，生成的分页查询接口会自动支持该字段的条件查询：

- **字符串字段**: 支持LIKE模糊查询
- **数字字段**: 支持EQ/GT/LT/GE/LE范围查询
- **日期字段**: 支持时间范围查询

## 命令行参数

- `--config`: 使用配置文件模式
- `--interactive`: 使用交互式模式
- `--help`: 显示帮助信息

## 注意事项

1. 生成前请备份重要文件
2. 如果类型定义已存在，生成器会跳过该模块的类型生成
3. 页面组件会覆盖同名文件，请谨慎操作
4. 确保项目目录结构符合预期

## 故障排除

### 依赖安装失败

```bash
# 清除缓存重新安装
npm cache clean --force
npm install
```

### 文件生成失败

- 检查项目路径是否正确
- 确保有足够的文件写入权限
- 检查配置文件格式是否正确

### 类型错误

- 检查字段类型定义是否正确
- 确保TypeScript类型映射正确

## 开发指南

### 添加新的生成器

1. 在 `generators/` 目录下创建新的生成器文件
2. 实现生成逻辑
3. 在主入口文件中注册生成器

### 扩展字段类型

在 `type-generator.js` 的 `mapFieldType` 方法中添加新的类型映射。

## 许可证

MIT License