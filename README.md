# RoundMatch 项目重构

## 项目概述

RoundMatch（八人转）是一个比赛管理微信小程序项目，已完成全面重构：

- **服务端**：Express + Sequelize + PostgreSQL（已从 MySQL 迁移）
- **管理台**：Vue 3 + Element Plus
- **小程序**：Taro 3.x + React（支持多端）

## 项目结构

```
roundmatch/
├── server/              # 服务端代码
│   ├── src/            # 重构后的源代码
│   │   ├── config/     # 配置文件
│   │   ├── controllers/# 控制器
│   │   ├── models/     # 数据模型（PostgreSQL）
│   │   ├── routes/     # 路由
│   │   ├── services/   # 业务逻辑层
│   │   ├── middleware/ # 中间件
│   │   ├── utils/      # 工具函数
│   │   └── migrations/ # 数据库迁移脚本
│   └── index.js        # 旧入口（兼容）
├── admin/               # 管理台（Vue 3）
│   ├── src/
│   │   ├── api/        # API 接口
│   │   ├── views/       # 页面组件
│   │   ├── router/      # 路由配置
│   │   └── stores/      # Pinia 状态管理
│   └── package.json
├── miniprogram/         # 原微信小程序（保留）
└── miniprogram-taro/    # Taro 小程序
    ├── src/
    │   ├── pages/       # 页面
    │   ├── services/    # API 服务
    │   └── utils/       # 工具函数
    └── config/          # Taro 配置
```

## 快速开始

### 服务端

```bash
cd server
npm install
# 配置 .env 文件（参考 .env.example）
npm start
```

### 管理台

```bash
cd admin
npm install
npm run dev
```

### Taro 小程序

```bash
cd miniprogram-taro
npm install
npm run dev:weapp  # 微信小程序
```

## 数据库迁移

从 MySQL 迁移到 PostgreSQL：

1. 配置 PostgreSQL 数据库
2. 更新 `server/src/config/db.config.js`
3. 运行迁移脚本：`node server/src/migrations/migrate-mysql-to-pg.js`

## 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=roundmatch
DB_PASSWORD=roundmatch
DB_NAME=roundmatch
PORT=8300
NODE_ENV=development
```

## 开发说明

- 服务端 API 保持向后兼容
- 管理台需要实现完整的 API 对接
- Taro 小程序已迁移基础页面，需要完善功能

## 许可证

ISC
