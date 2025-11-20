# 下单DEMO - 前端

这是一个基于 React + TypeScript + Vite 开发的下单DEMO前端应用。

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **UI组件库**: Ant Design 5
- **状态管理**: Zustand
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **日期处理**: Day.js

## 功能特性

### 用户认证模块
- ✅ 用户注册（带实时用户名/邮箱验证）
- ✅ 用户登录
- ✅ JWT Token 管理
- ✅ 路由守卫（权限控制）

### 商品展示模块
- ✅ 商品列表（分页、搜索、分类筛选）
- ✅ 商品详情
- ✅ 购物车功能（添加、删除、数量修改）

### 内容管理模块
- ✅ 文章管理（创建、编辑、删除文章）
- ✅ 评论管理（发布、回复、删除评论）
- ✅ 内容分类和标签管理

### 后台管理模块（管理员）
- ✅ 商品管理（CRUD操作）
- ✅ 商品上架/下架
- ✅ 系统配置管理
- ✅ 用户地址管理

## 项目结构

```
src/
├── api/              # API接口
│   ├── auth.ts      # 认证相关接口
│   ├── product.ts   # 商品相关接口
│   ├── article.ts   # 文章相关接口
│   └── comment.ts   # 评论相关接口
├── components/      # 通用组件
│   ├── Layout.tsx   # 布局组件
│   └── ProtectedRoute.tsx  # 路由守卫
├── pages/           # 页面组件
│   ├── Auth/        # 认证页面
│   ├── Product/     # 商品页面
│   ├── Admin/       # 管理后台页面
│   └── Blank.tsx    # 空白页面
├── store/           # 状态管理
│   ├── authStore.ts # 认证状态
│   └── cartStore.ts # 购物车状态
├── types/           # TypeScript类型定义
├── utils/           # 工具函数
│   ├── request.ts   # Axios配置
│   └── debounce.ts  # 防抖函数
└── router/          # 路由配置
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

前端开发服务器将运行在 `http://localhost:3000`

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 配置说明

### 后端API配置

后端服务默认运行在 `http://localhost:8080`，前端通过 Vite 代理转发请求。

代理配置在 `vite.config.ts` 中：

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

如果需要修改后端地址，请修改 `vite.config.ts` 中的 `target` 配置。

### 环境变量

可以创建 `.env` 文件来配置环境变量：

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 使用说明

### 默认账号

根据文档，系统提供以下测试账号：

- **管理员账号**: admin / admin123
- **普通用户**: user1 / user123

### 功能流程

1. **用户注册/登录**
   - 访问 `/register` 注册新账号
   - 访问 `/login` 登录系统

2. **浏览商品**
   - 访问 `/products` 查看商品列表
   - 可以搜索、筛选分类
   - 点击商品查看详情

3. **购物流程**
   - 在商品列表或详情页点击"加入购物车"
   - 访问 `/cart` 查看购物车
   - 点击"去结算"创建订单
   - 填写收货信息并提交订单

4. **内容管理**
   - 访问 `/admin/article` 管理文章
   - 访问 `/admin/comment` 管理评论
   - 可以创建、编辑、删除文章和评论

5. **后台管理（管理员）**
   - 访问 `/admin/products` 管理商品
   - 访问 `/admin/systemconfig` 管理系统配置
   - 访问 `/admin/useraddress` 管理用户地址
   - 可以创建、编辑、删除商品和配置

## 注意事项

1. **Token管理**: JWT token有效期为1小时，过期后需要重新登录
2. **权限控制**: 前端会根据用户角色显示不同的功能和页面
3. **用户ID**: 如果后端登录接口没有返回用户ID，创建订单时可能需要后端从token中解析userId
4. **管理员功能**: 需要后端提供相应的API接口来支持管理员功能

## 开发规范

1. 使用 TypeScript 确保类型安全
2. 组件化开发，提高复用性
3. 统一的错误处理机制
4. 响应式设计，支持移动端
5. 良好的用户体验（加载状态、错误提示）

## 常见问题

### 1. 跨域问题

如果遇到跨域问题，请确保：
- 后端已配置CORS
- Vite代理配置正确

### 2. Token过期

Token过期后会自动跳转到登录页，请重新登录。

### 3. 权限不足

如果访问管理员页面时提示权限不足，请使用管理员账号登录。

## License

MIT

