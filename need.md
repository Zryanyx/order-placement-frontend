# 订单相关API接口详细文档

## 1. 概述

本文档详细描述了订单管理系统中前端需要调用的所有订单相关API接口。这些接口涵盖了订单的创建、查询、支付、状态更新等核心功能。

## 2. API基础配置

- **基础URL**：在开发环境中为`http://localhost:8080/api`，生产环境中为`/api`
- **请求方式**：支持GET、POST、PUT等HTTP方法
- **响应格式**：统一使用`ApiResponse<T>`格式，包含code（状态码）、message（消息）和data（数据）字段

## 2.1 认证相关接口

### 2.1.1 用户登录

**前端函数名**：`login`

**HTTP方法**：`POST`

**接口路径**：`/token`

### 2.1.2 用户注册

**前端函数名**：`register`

**HTTP方法**：`POST`

**接口路径**：`/user`

## 3. 订单相关API接口详情

### 3.1 创建订单

**前端函数名**：`createOrder`

**HTTP方法**：`POST`

**接口路径**：`/orders`

**功能描述**：创建一个新的订单，包含订单基本信息和购买的商品列表。

**请求参数**：
```typescript
interface CreateOrderRequest {
  userId: number;               // 用户ID
  orderItems: {                 // 订单项数组
    productId: number;          // 商品ID
    quantity: number;           // 购买数量
  }[];
  shippingAddress: string;      // 收货地址
  receiverName: string;         // 收货人姓名
  receiverPhone: string;        // 收货人电话
  remark?: string;              // 订单备注（可选）
}
```

**请求示例**：
```typescript
const orderData = {
  userId: 1,
  orderItems: [
    { productId: 1, quantity: 2 },
    { productId: 2, quantity: 1 }
  ],
  shippingAddress: "北京市朝阳区某某街道100号",
  receiverName: "张三",
  receiverPhone: "13800138000",
  remark: "请尽快发货"
};

const response = await createOrder(orderData);
```

**响应格式**：
```typescript
ApiResponse<Order> {
  code: number;      // 状态码，200表示成功
  message: string;   // 响应消息
  data: Order;       // 订单对象
}
```

**错误处理**：
- 400 Bad Request：请求参数无效
- 404 Not Found：商品不存在或库存不足
- 500 Internal Server Error：服务器内部错误

### 3.2 获取用户订单列表

**前端函数名**：`getUserOrders`

**HTTP方法**：`GET`

**接口路径**：`/orders`

**功能描述**：获取当前登录用户的订单列表，支持分页和状态筛选。后端通过权限控制自动识别用户。

**请求参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页条数，默认10 |
| status | string | 否 | 订单状态筛选 |

**请求示例**：
```typescript
// 获取第1页，每页10条的待支付订单
const params = {
  pageNum: 1,
  pageSize: 10,
  status: 'PENDING_PAYMENT'
};

const response = await getUserOrders(params);
```

**响应格式**：
```typescript
ApiResponse<PageResponse<Order>> {
  code: number;
  message: string;
  data: {
    records: Order[];    // 订单列表
    total: number;       // 总记录数
    size: number;        // 每页大小
    current: number;     // 当前页码
    pages: number;       // 总页数
  }
}
```

### 3.3 获取所有订单（管理员）

**前端函数名**：`getAllOrders`

**HTTP方法**：`GET`

**接口路径**：`/admin/orders`

**功能描述**：管理员获取系统中所有订单，支持分页和状态筛选。

**权限要求**：管理员权限

**请求参数**：与`getUserOrders`相同

**请求示例**：
```typescript
// 获取第1页，每页20条的所有已发货订单
const params = {
  pageNum: 1,
  pageSize: 20,
  status: 'SHIPPED'
};

const response = await getAllOrders(params);
```

**响应格式**：与`getUserOrders`相同

### 3.4 获取订单详情

**前端函数名**：`getOrderById`

**HTTP方法**：`GET`

**接口路径**：`/orders/{id}`

**功能描述**：根据订单ID获取订单的详细信息。

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 订单ID |

**请求示例**：
```typescript
const orderId = 123;
const response = await getOrderById(orderId);
```

**响应格式**：
```typescript
ApiResponse<Order> {
  code: number;
  message: string;
  data: Order;  // 订单详细信息
}
```

### 3.5 获取订单项列表

**前端函数名**：`getOrderItems`

**HTTP方法**：`GET`

**接口路径**：`/orders/{id}/items`

**功能描述**：获取指定订单ID下的所有订单项信息，包括商品详情和购买数量。

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 订单ID |

**请求示例**：
```typescript
const orderId = 123;
const response = await getOrderItems(orderId);
```

**响应格式**：
```typescript
ApiResponse<OrderItem[]> {
  code: number;
  message: string;
  data: OrderItem[];  // 订单项数组
}
```

### 3.6 支付订单

**前端函数名**：`payOrder`

**HTTP方法**：`PUT`

**接口路径**：`/orders/{id}/pay`

**功能描述**：支付指定的订单。

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 订单ID |

**请求示例**：
```typescript
const orderId = 123;
const response = await payOrder(orderId);
```

**响应格式**：
```typescript
ApiResponse<null> {
  code: number;
  message: string;
  data: null;
}
```

**业务逻辑**：
- 只有状态为`PENDING_PAYMENT`（待支付）的订单可以进行支付操作
- 支付成功后，订单状态变为`PAID`（已支付）
- 支付时间会被记录在`paymentTime`字段

### 3.7 发货订单（管理员）

**前端函数名**：`shipOrder`

**HTTP方法**：`PUT`

**接口路径**：`/orders/{id}/ship`

**功能描述**：管理员对已支付的订单进行发货操作。

**权限要求**：管理员权限

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 订单ID |

**请求示例**：
```typescript
const orderId = 123;
const response = await shipOrder(orderId);
```

**响应格式**：
```typescript
ApiResponse<null> {
  code: number;
  message: string;
  data: null;
}
```

**业务逻辑**：
- 只有状态为`PAID`（已支付）的订单可以进行发货操作
- 发货成功后，订单状态变为`SHIPPED`（已发货）
- 发货时间会被记录在`shippingTime`字段

### 3.8 完成订单

**前端函数名**：`completeOrder`

**HTTP方法**：`PUT`

**接口路径**：`/orders/{id}/complete`

**功能描述**：将已发货的订单标记为完成状态。

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 订单ID |

**请求示例**：
```typescript
const orderId = 123;
const response = await completeOrder(orderId);
```

**响应格式**：
```typescript
ApiResponse<null> {
  code: number;
  message: string;
  data: null;
}
```

**业务逻辑**：
- 只有状态为`SHIPPED`（已发货）的订单可以进行完成操作
- 完成后，订单状态变为`COMPLETED`（已完成）
- 完成时间会被记录在`completedTime`字段

### 3.9 取消订单

**前端函数名**：`cancelOrder`

**HTTP方法**：`PUT`

**接口路径**：`/orders/{id}/cancel`

**功能描述**：取消指定的订单。

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 订单ID |

**请求示例**：
```typescript
const orderId = 123;
const response = await cancelOrder(orderId);
```

**响应格式**：
```typescript
ApiResponse<null> {
  code: number;
  message: string;
  data: null;
}
```

**业务逻辑**：
- 通常只能取消状态为`PENDING_PAYMENT`（待支付）或`PAID`（已支付但未发货）的订单
- 取消成功后，订单状态变为`CANCELLED`（已取消）

## 4. 数据模型详解

### 4.1 Order（订单）模型

```typescript
interface Order {
  id: number;                                     // 订单ID
  orderNo: string;                                // 订单号
  userId: number;                                 // 用户ID
  totalAmount: number;                            // 订单总金额
  status: 'PENDING_PAYMENT' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'; // 订单状态
  paymentTime?: string;                           // 支付时间
  shippingTime?: string;                          // 发货时间
  completedTime?: string;                         // 完成时间
  shippingAddress: string;                        // 收货地址
  receiverName: string;                           // 收货人姓名
  receiverPhone: string;                          // 收货人电话
  remark?: string;                                // 备注
  createdTime: string;                            // 创建时间
  updatedTime?: string;                           // 更新时间
}
```

**订单状态说明**：
- `PENDING_PAYMENT`：待支付 - 订单已创建但用户尚未支付
- `PAID`：已支付 - 用户已完成支付，等待商家发货
- `SHIPPED`：已发货 - 商家已发货，商品在运输中
- `COMPLETED`：已完成 - 商品已送达，订单完成
- `CANCELLED`：已取消 - 订单已被取消

### 4.2 OrderItem（订单项）模型

```typescript
interface OrderItem {
  id: number;           // 订单项ID
  orderId: number;      // 所属订单ID
  productId: number;    // 商品ID
  productName: string;  // 商品名称
  productPrice: number; // 商品单价
  quantity: number;     // 购买数量
  subtotal: number;     // 小计金额
  createdTime: string;  // 创建时间
  updatedTime?: string; // 更新时间
}
```

## 5. API调用流程示例

### 5.1 用户下单流程

1. **获取购物车商品**（通常在前端完成）
2. **创建订单**：调用`createOrder`接口
3. **获取订单详情**：调用`getOrderById`接口
4. **支付订单**：调用`payOrder`接口
5. **查看订单状态**：调用`getUserOrders`或`getOrderById`接口

### 5.2 管理员处理订单流程

1. **获取所有订单**：调用`getAllOrders`接口
2. **查看订单详情**：调用`getOrderById`接口
3. **查看订单项**：调用`getOrderItems`接口
4. **发货订单**：调用`shipOrder`接口
5. **完成订单**（可选）：调用`completeOrder`接口

## 6. 错误处理建议

在前端调用订单相关API时，建议按以下方式处理可能的错误：

1. **网络错误**：提示用户网络连接问题
2. **业务错误**：根据API返回的`code`和`message`字段显示具体错误信息
3. **权限错误**：提示用户无权限执行操作，或引导用户登录
4. **超时处理**：设置合理的超时时间，避免用户长时间等待

## 7. 安全考虑

1. **认证授权**：所有订单相关API都需要用户登录后才能访问，管理员API还需要管理员权限
2. **数据验证**：前端应在调用API前进行数据验证，确保数据格式正确
3. **防重复提交**：对于创建订单、支付等操作，建议在前端实现防重复提交机制

## 8. 性能优化

1. **分页加载**：获取订单列表时使用分页，避免一次性加载过多数据
2. **缓存策略**：对于不经常变化的订单详情，可考虑在前端进行短期缓存
3. **批量操作**：如果需要对多个订单进行操作，考虑实现批量操作API，减少请求次数