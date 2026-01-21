# Taro 小程序 API 配置说明

## 配置方式

### 方式一：使用配置文件（推荐）

配置文件：`src/config/api.config.js`

**开发环境配置：**
- 小程序开发：使用局域网 IP（如：`http://10.1.21.185:8300/`）
- H5 开发：可以使用 localhost（如：`http://localhost:8300/`）

**生产环境配置：**
- 统一使用生产服务器地址（如：`https://roundmatch.microripples.cn/`）

### 方式二：使用环境变量

在启动命令中设置环境变量：

```bash
# 设置服务器地址
TARO_APP_BASE_URL=http://10.1.21.185:8300/ npm run dev:weapp

# 设置 RustFS 地址
TARO_APP_RUSTFS_URL=http://10.1.21.185:9000/ npm run dev:weapp
```

### 方式三：修改配置文件

直接修改 `src/config/api.config.js` 中的配置：

```javascript
const DEV_CONFIG = {
  miniProgram: 'http://你的局域网IP:8300/', // 修改这里
  h5: 'http://localhost:8300/',
  default: 'http://localhost:8300/'
}

const PROD_CONFIG = {
  default: 'https://roundmatch.microripples.cn/' // 修改这里
}
```

## 判断逻辑

代码会自动根据以下条件判断使用哪个地址：

1. **环境变量优先级最高**
   - 如果设置了 `TARO_APP_BASE_URL`，直接使用

2. **判断运行环境**
   - `process.env.NODE_ENV`：`development` 或 `production`
   - `process.env.TARO_ENV`：`weapp`（微信小程序）、`h5`、`swan`、`alipay` 等

3. **自动选择**
   - 开发环境 + 小程序 → 使用局域网 IP
   - 开发环境 + H5 → 使用 localhost
   - 生产环境 → 使用生产服务器地址

## 获取局域网 IP

### macOS/Linux
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Windows
```bash
ipconfig
# 查找 IPv4 地址，通常是 192.168.x.x 或 10.x.x.x
```

## 配置示例

### 开发环境（小程序）

```javascript
// src/config/api.config.js
const DEV_CONFIG = {
  miniProgram: 'http://192.168.1.100:8300/', // 你的局域网 IP
  // ...
}
```

### 生产环境

```javascript
// src/config/api.config.js
const PROD_CONFIG = {
  default: 'https://api.yourdomain.com/', // 你的生产服务器地址
}
```

## 注意事项

1. **小程序无法访问 localhost**
   - 小程序开发时必须使用局域网 IP
   - 确保服务器监听 `0.0.0.0` 而不是 `127.0.0.1`

2. **域名白名单**
   - 在小程序后台配置域名白名单
   - 开发环境：添加局域网 IP（如：`http://192.168.1.100:8300`）
   - 生产环境：添加生产域名（必须 HTTPS）

3. **RustFS 配置**
   - RustFS 也需要配置为监听 `0.0.0.0`
   - 在小程序后台添加 RustFS 域名到 downloadFile 白名单

4. **环境变量**
   - 可以通过环境变量覆盖配置文件
   - 适合 CI/CD 或不同开发者使用不同配置

## 调试

开发环境下，代码会自动输出当前使用的配置：

```
[API] 当前服务器地址: http://10.1.21.185:8300/
[API] TARO_ENV: weapp
[API] NODE_ENV: development
[API] 是否为小程序环境: true
```

如果地址不正确，检查：
1. 配置文件中的 IP 是否正确
2. 环境变量是否设置
3. 服务器是否监听正确的地址
