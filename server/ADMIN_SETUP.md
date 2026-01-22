# 管理员系统设置说明

## 1. 安装依赖

在 `server` 目录下运行：

```bash
npm install jsonwebtoken bcryptjs
# 或
yarn add jsonwebtoken bcryptjs
```

## 2. 环境变量配置

在 `.env` 文件中添加（可选，有默认值）：

```
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

## 3. 创建第一个超级管理员

### 方法1：通过数据库直接创建

```sql
INSERT INTO roundmatch.admins (_id, username, password, role, status, createdate)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$YourHashedPasswordHere',  -- 需要使用 bcrypt 加密的密码
  'super_admin',
  1,
  NOW()
);
```

### 方法2：通过 Node.js 脚本创建

创建 `server/scripts/create-super-admin.js`:

```javascript
const bcrypt = require('bcryptjs')
const db = require('../src/models')

async function createSuperAdmin() {
  const username = 'admin'
  const password = 'admin123'  // 请修改为安全密码
  const hashedPassword = await bcrypt.hash(password, 10)
  
  try {
    const admin = await db.admins.create({
      username: username,
      password: hashedPassword,
      role: 'super_admin',
      status: 1,
      createDate: new Date()
    })
    console.log('超级管理员创建成功:', admin.username)
  } catch (error) {
    console.error('创建失败:', error)
  }
  process.exit(0)
}

createSuperAdmin()
```

运行：
```bash
node server/scripts/create-super-admin.js
```

## 4. 功能说明

### 管理员角色

- **超级管理员 (super_admin)**: 可以管理所有内容，包括创建和管理其他管理员
- **俱乐部管理员 (club_admin)**: 只能管理自己关联的俱乐部相关数据

### 登录方式

1. **账号密码登录**: 使用用户名和密码登录
2. **微信扫码登录**: 需要先绑定微信 openid（待实现完整集成）

### 权限控制

- 超级管理员可以看到"管理员管理"菜单
- 俱乐部管理员只能看到自己权限范围内的功能
- API 层面通过中间件验证权限

## 5. API 端点

### 认证相关
- `POST /api/admin/auth/login` - 账号密码登录
- `POST /api/admin/auth/login/wechat` - 微信登录
- `GET /api/admin/auth/me` - 获取当前管理员信息

### 管理员管理（需要超级管理员权限）
- `GET /api/admin/admins` - 获取管理员列表
- `POST /api/admin/admins` - 创建管理员
- `PUT /api/admin/admins/:id` - 更新管理员
- `DELETE /api/admin/admins/:id` - 删除管理员
