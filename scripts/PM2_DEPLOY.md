# PM2 部署指南

## 概述

本项目使用 PM2 来管理服务端和管理台的生产环境进程。服务端和管理台使用独立的 PM2 配置文件，可以分别管理。

## 文件说明

### 服务端配置
- `server/ecosystem.config.js` - 服务端 PM2 配置

### 管理台配置
- `admin/ecosystem.config.cjs` - 管理台开发环境配置（使用 Vite Dev Server）
- `admin/ecosystem.prod.config.cjs` - 管理台生产环境配置（使用 Vite Preview）
  
**注意**：使用 `.cjs` 扩展名是因为 `admin/package.json` 中设置了 `"type": "module"`，PM2 配置文件需要使用 CommonJS 格式。

### 启动脚本
- `scripts/pm2-start-server.sh` - 启动服务端
- `scripts/pm2-start-admin.sh` - 启动管理台（支持 dev/prod 模式）
- `scripts/pm2-stop-server.sh` - 停止服务端
- `scripts/pm2-stop-admin.sh` - 停止管理台
- `scripts/pm2-restart-server.sh` - 重启服务端
- `scripts/pm2-restart-admin.sh` - 重启管理台

## 安装 PM2

```bash
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 --version
```

## 使用方法

### 1. 启动服务端

```bash
# 方式一：使用启动脚本（推荐）
chmod +x scripts/pm2-start-server.sh
./scripts/pm2-start-server.sh

# 方式二：直接使用 PM2
cd server
pm2 start ecosystem.config.cjs
```

### 2. 启动管理台

#### 开发模式

```bash
# 方式一：使用启动脚本（推荐）
chmod +x scripts/pm2-start-admin.sh
./scripts/pm2-start-admin.sh

# 或指定开发模式
./scripts/pm2-start-admin.sh dev

# 方式二：直接使用 PM2
cd admin
pm2 start ecosystem.config.cjs
```

#### 生产模式

```bash
# 方式一：使用启动脚本（自动构建）
chmod +x scripts/pm2-start-admin.sh
./scripts/pm2-start-admin.sh prod

# 方式二：手动构建后启动
cd admin
npm run build
pm2 start ecosystem.prod.config.cjs
```

### 3. 停止应用

```bash
# 停止服务端
./scripts/pm2-stop-server.sh
# 或
pm2 stop roundmatch-server

# 停止管理台
./scripts/pm2-stop-admin.sh
# 或
pm2 stop roundmatch-admin

# 停止所有应用
pm2 stop all
```

### 4. 重启应用

```bash
# 重启服务端
./scripts/pm2-restart-server.sh
# 或
pm2 restart roundmatch-server

# 重启管理台
./scripts/pm2-restart-admin.sh
# 或
pm2 restart roundmatch-admin

# 重启所有应用
pm2 restart all
```

### 5. 查看状态和日志

```bash
# 查看所有应用状态
pm2 status

# 查看日志
pm2 logs                    # 所有应用日志
pm2 logs roundmatch-server  # 服务端日志
pm2 logs roundmatch-admin   # 管理台日志

# 实时监控
pm2 monit

# 查看详细信息
pm2 show roundmatch-server
pm2 show roundmatch-admin

# 查看特定应用状态
pm2 status roundmatch-server
pm2 status roundmatch-admin
```

## 应用说明

### roundmatch-server（服务端）

- **配置文件**: `server/ecosystem.config.js`
- **入口文件**: `server/src/index.js`
- **端口**: 8300（可通过环境变量 PORT 修改）
- **Node 参数**: `--max-http-header-size=64000`
- **日志文件**: 
  - `logs/server-error.log` - 错误日志
  - `logs/server-out.log` - 标准输出
  - `logs/server-combined.log` - 合并日志
- **启动方式**: 
  ```bash
  cd server
  pm2 start ecosystem.config.cjs
  ```

### roundmatch-admin（管理台）

#### 开发模式（admin/ecosystem.config.cjs）

- **配置文件**: `admin/ecosystem.config.cjs`
- **启动命令**: `npm run dev`
- **端口**: 8080（可通过环境变量 PORT 修改）
- **特点**: 支持热更新（HMR）
- **日志文件**: 
  - `logs/admin-error.log` - 错误日志
  - `logs/admin-out.log` - 标准输出
  - `logs/admin-combined.log` - 合并日志
- **启动方式**: 
  ```bash
  cd admin
  pm2 start ecosystem.config.cjs
  ```

#### 生产模式（admin/ecosystem.prod.config.cjs）

- **配置文件**: `admin/ecosystem.prod.config.cjs`
- **启动命令**: `npm run preview`
- **端口**: 8080
- **前提**: 需要先运行 `npm run build` 构建静态文件
- **特点**: 性能更好，但需要手动构建
- **启动方式**: 
  ```bash
  cd admin
  npm run build
  pm2 start ecosystem.prod.config.cjs
  ```

## 常用 PM2 命令

### 进程管理

```bash
# 启动服务端
cd server
pm2 start ecosystem.config.cjs

# 启动管理台（开发模式）
cd admin
pm2 start ecosystem.config.cjs

# 启动管理台（生产模式）
cd admin
npm run build
pm2 start ecosystem.prod.config.cjs

# 停止
pm2 stop roundmatch-server
pm2 stop roundmatch-admin
pm2 stop all

# 重启
pm2 restart roundmatch-server
pm2 restart roundmatch-admin
pm2 restart all

# 删除
pm2 delete roundmatch-server
pm2 delete roundmatch-admin
pm2 delete all

# 重载（零停机重启，仅适用于 cluster 模式）
pm2 reload roundmatch-server
pm2 reload all
```

### 日志管理

```bash
# 查看日志
pm2 logs                    # 所有应用日志
pm2 logs roundmatch-server  # 服务端日志
pm2 logs roundmatch-admin   # 管理台日志

# 清空日志
pm2 flush

# 日志文件位置
# 在 ecosystem.config.js 中配置的 error_file 和 out_file
```

### 监控和性能

```bash
# 监控面板
pm2 monit

# 查看详细信息
pm2 show roundmatch-server
pm2 show roundmatch-admin

# 查看进程信息
pm2 list
pm2 status
```

### 启动管理

```bash
# 保存当前进程列表
pm2 save

# 设置开机自启
pm2 startup
pm2 save

# 取消开机自启
pm2 unstartup
```

## 环境变量

### 服务端环境变量

在 `server/.env` 文件中配置：

```env
NODE_ENV=production
PORT=8300
DB_HOST=localhost
DB_PORT=5432
DB_USER=roundmatch
DB_PASSWORD=your_password
DB_NAME=postgres
DB_SCHEMA=roundmatch
JWT_SECRET=your_jwt_secret
# ... 其他配置
```

### 管理台环境变量

管理台的环境变量在 `vite.config.js` 中配置，或通过 `.env` 文件：

```env
VITE_API_BASE_URL=https://rmapi.sdiread.com
```

## 部署流程

### 首次部署

1. **安装依赖**
   ```bash
   # 安装服务端依赖
   cd server
   npm install
   cd ..
   
   # 安装管理台依赖
   cd admin
   npm install
   cd ..
   ```

2. **配置环境变量**
   ```bash
   # 复制并编辑环境变量文件
   cp server/.env.example server/.env
   # 编辑 server/.env，填入实际配置
   ```

3. **启动服务端**
   ```bash
   # 方式一：使用脚本
   ./scripts/pm2-start-server.sh
   
   # 方式二：直接使用 PM2
   cd server
   pm2 start ecosystem.config.cjs
   ```

4. **启动管理台**
   ```bash
   # 开发模式
   ./scripts/pm2-start-admin.sh
   # 或
   cd admin
   pm2 start ecosystem.config.cjs
   
   # 生产模式（需要先构建）
   ./scripts/pm2-start-admin.sh prod
   # 或
   cd admin
   npm run build
   pm2 start ecosystem.prod.config.cjs
   ```

5. **设置开机自启**
   ```bash
   pm2 startup
   pm2 save
   ```

### 更新部署

1. **拉取最新代码**
   ```bash
   git pull
   ```

2. **更新依赖（如有变化）**
   ```bash
   cd server && npm install && cd ..
   cd admin && npm install && cd ..
   ```

3. **重启服务端**
   ```bash
   ./scripts/pm2-restart-server.sh
   # 或
   pm2 restart roundmatch-server
   ```

4. **重启管理台**
   ```bash
   # 开发模式
   ./scripts/pm2-restart-admin.sh
   
   # 生产模式（需要重新构建）
   cd admin
   npm run build
   pm2 restart roundmatch-admin
   ```

## 故障排查

### 应用无法启动

1. **检查日志**
   ```bash
   pm2 logs roundmatch-server --lines 100
   pm2 logs roundmatch-admin --lines 100
   ```

2. **检查端口占用**
   ```bash
   # 检查 8300 端口
   lsof -i :8300
   netstat -tulpn | grep 8300
   
   # 检查 8080 端口
   lsof -i :8080
   netstat -tulpn | grep 8080
   ```

3. **检查环境变量**
   ```bash
   pm2 show roundmatch-server | grep env
   ```

4. **检查文件权限**
   ```bash
   ls -la server/src/index.js
   ls -la admin/package.json
   ```

### 应用频繁重启

1. **查看重启原因**
   ```bash
   pm2 logs roundmatch-server --err
   ```

2. **检查内存使用**
   ```bash
   pm2 monit
   ```

3. **调整内存限制**
   编辑 `ecosystem.config.js`，修改 `max_memory_restart`

### 日志文件过大

1. **清空日志**
   ```bash
   pm2 flush
   ```

2. **配置日志轮转**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

## 性能优化

### 1. 多实例运行（服务端）

编辑 `ecosystem.config.js`：

```javascript
{
  name: 'roundmatch-server',
  instances: 'max', // 使用所有 CPU 核心
  exec_mode: 'cluster' // 集群模式
}
```

### 2. 日志轮转

安装 pm2-logrotate：

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 3. 监控和告警

安装 pm2-plus（需要注册账号）：

```bash
pm2 link <secret_key> <public_key>
```

## 安全建议

1. **不要在生产环境使用 watch 模式**
   - `ecosystem.config.js` 中 `watch: false`

2. **限制日志文件大小**
   - 使用 pm2-logrotate

3. **使用环境变量管理敏感信息**
   - 不要将密码等敏感信息硬编码

4. **定期更新依赖**
   ```bash
   npm audit
   npm audit fix
   ```

## 参考文档

- [PM2 官方文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 生态系统文件](https://pm2.keymetrics.io/docs/usage/application-declaration/)
