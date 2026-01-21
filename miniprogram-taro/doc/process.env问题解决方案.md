# process.env 问题解决方案

## 问题

小程序运行时报错：`ReferenceError: process is not defined`

## 原因

小程序运行时环境中没有 `process` 对象。Taro 会在编译时通过 webpack DefinePlugin 将 `process.env.XXX` 替换为字符串常量，但如果代码中有访问 `process` 对象本身的地方，就会报错。

## 解决方案

### 方案一：确保正确使用 process.env（当前实现）

**正确写法：**
```javascript
// ✅ 正确：直接使用 process.env.XXX
const taroEnv = process.env.TARO_ENV || 'weapp'
const nodeEnv = process.env.NODE_ENV || 'production'
```

**错误写法：**
```javascript
// ❌ 错误：访问 process 对象本身
if (typeof process !== 'undefined') { ... }
if (process.env) { ... }
```

### 方案二：使用 Taro 的 defineConstants（如果方案一不工作）

在 `config/index.js` 中配置：

```javascript
export default defineConfig({
  defineConstants: {
    // 手动定义常量
    TARO_ENV: JSON.stringify('weapp'),  // 根据构建类型设置
    NODE_ENV: JSON.stringify('development'),  // 根据构建命令设置
  },
  // ...
})
```

然后在代码中使用：
```javascript
// 使用定义的常量
const taroEnv = TARO_ENV
const nodeEnv = NODE_ENV
```

### 方案三：使用环境变量文件（推荐用于不同开发者）

创建 `.env.development` 和 `.env.production`：

```bash
# .env.development
TARO_APP_BASE_URL=http://localhost:8300/
TARO_APP_RUSTFS_URL=http://localhost:9000/

# .env.production
TARO_APP_BASE_URL=https://xw.sdiread.com/
TARO_APP_RUSTFS_URL=https://rustfs.yourdomain.com/
```

然后在代码中直接使用：
```javascript
const SERVER_URL = TARO_APP_BASE_URL || 'https://xw.sdiread.com/'
```

### 方案四：最简单的方式（如果以上都不工作）

直接在 `api.config.js` 中根据构建命令手动设置：

```javascript
// 开发环境：npm run dev:weapp
// 生产环境：npm run build:weapp

// 手动设置（根据你运行的命令）
const IS_DEVELOPMENT = true  // 开发时设为 true，生产时设为 false
const TARO_ENV = 'weapp'     // 根据构建类型设置

export function getApiBaseUrl() {
  if (IS_DEVELOPMENT) {
    if (TARO_ENV === 'weapp') {
      return 'http://localhost:8300/'  // 或你的局域网 IP
    }
    return 'http://localhost:8300/'
  } else {
    return 'https://xw.sdiread.com/'
  }
}
```

## 当前代码状态

当前代码已经简化为直接使用 `process.env.XXX`，应该可以正常工作。

如果还是报错，请尝试：

1. **清理构建缓存**
   ```bash
   cd miniprogram-taro
   rm -rf dist
   npm run dev:weapp
   ```

2. **检查 Taro 版本**
   ```bash
   npm list @tarojs/cli
   ```

3. **使用方案四**（最简单，但需要手动切换）

## 验证编译时替换

编译后，检查 `dist` 目录中的代码，`process.env.TARO_ENV` 应该被替换为字符串 `'weapp'`。

如果编译后的代码中还是 `process.env.TARO_ENV`，说明 webpack DefinePlugin 没有正确配置。
