# 小程序端访问 RustFS 文件方案

## 问题分析

迁移到 RustFS 后，上传的文件 URL 格式变为：
```
http://localhost:9000/roundmatch-uploads/clubicons/icon-xxx.jpg
```

小程序端需要能够访问这些文件来显示图片。有以下几种方案：

## 方案一：配置存储桶公开访问（推荐，最简单）

### 优点
- ✅ 实现简单，无需修改代码
- ✅ 性能好，直接访问
- ✅ 小程序可以直接使用返回的 URL

### 缺点
- ⚠️ 文件完全公开，任何人都可以访问
- ⚠️ 需要配置域名白名单（小程序要求）

### 实施步骤

#### 1. 在 MinIO/RustFS 控制台配置存储桶策略

访问：http://localhost:9001

**方法一：通过控制台界面**
1. 进入存储桶 `roundmatch-uploads`
2. 点击 "Access Policy" 或 "访问策略"
3. 选择 "Public" 或 "公开"
4. 或者手动配置策略：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::roundmatch-uploads/*"]
    }
  ]
}
```

**方法二：使用 MinIO Client**
```bash
mc anonymous set download myminio/roundmatch-uploads
```

#### 2. 配置小程序域名白名单

在微信小程序后台配置：
- **开发** → **开发管理** → **开发设置** → **服务器域名**
- 添加 `downloadFile` 合法域名：
  - `http://localhost:9000`（开发环境）
  - `https://your-rustfs-domain.com`（生产环境）

#### 3. 小程序端无需修改代码

小程序端可以直接使用返回的 URL：
```javascript
// 上传后返回的 URL 可以直接使用
<image src="{{logo}}" mode="aspectFit"></image>
```

## 方案二：通过服务器代理访问（推荐，更安全）

### 优点
- ✅ 更安全，可以控制访问权限
- ✅ 可以添加访问日志、统计等功能
- ✅ 不需要配置小程序域名白名单

### 缺点
- ⚠️ 需要修改代码，增加服务器负载
- ⚠️ 需要额外的服务器资源

### 实施步骤

#### 1. 创建文件代理接口

在 `server/src/routes/index.js` 中添加：

```javascript
const express = require('express')
const router = express.Router()
const { GetObjectCommand } = require('@aws-sdk/client-s3')
const { getS3Client } = require('../utils/storage')

// 文件代理接口
router.get('/api/file-proxy', async (req, res) => {
  try {
    const { key } = req.query
    if (!key) {
      return res.status(400).json({ error: '缺少 key 参数' })
    }

    // 从 RustFS 获取文件
    const command = new GetObjectCommand({
      Bucket: process.env.RUSTFS_BUCKET || 'roundmatch-uploads',
      Key: key
    })

    const response = await getS3Client().send(command)
    
    // 设置响应头
    if (response.ContentType) {
      res.setHeader('Content-Type', response.ContentType)
    }
    if (response.ContentLength) {
      res.setHeader('Content-Length', response.ContentLength)
    }
    if (response.CacheControl) {
      res.setHeader('Cache-Control', response.CacheControl)
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000') // 1年缓存
    }

    // 流式传输文件内容
    const stream = response.Body
    stream.pipe(res)
  } catch (error) {
    console.error('文件代理错误:', error)
    res.status(500).json({ error: '文件获取失败' })
  }
})

module.exports = router
```

#### 2. 修改上传返回的 URL

修改 `server/src/utils/storage.js` 中的 `uploadFile` 函数：

```javascript
const uploadFile = async (localFilePath, objectKey, contentType = null) => {
  // ... 上传逻辑 ...
  
  // 返回代理 URL 而不是直接的对象存储 URL
  const proxyUrl = `${process.env.SERVER_URL || 'http://localhost:8300'}/api/file-proxy?key=${encodeURIComponent(objectKey)}`
  return proxyUrl
}
```

#### 3. 小程序端无需修改

小程序端仍然使用返回的 URL，但现在是通过服务器代理访问。

## 方案三：使用预签名 URL（适合私有文件）

### 优点
- ✅ 安全性高，URL 有时效性
- ✅ 适合私有文件访问

### 缺点
- ⚠️ URL 有过期时间，需要定期刷新
- ⚠️ 实现复杂，需要修改较多代码

### 实施步骤

#### 1. 创建获取预签名 URL 的接口

在 `server/src/routes/index.js` 中添加：

```javascript
const { getPresignedUrl, extractObjectKeyFromUrl } = require('../utils/storage')

// 获取预签名 URL
router.get('/api/file-presigned', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) {
      return res.status(400).json({ error: '缺少 url 参数' })
    }

    // 从完整 URL 中提取 objectKey
    const objectKey = extractObjectKeyFromUrl(url)
    if (!objectKey) {
      return res.status(400).json({ error: '无效的 URL' })
    }

    // 生成预签名 URL（1小时有效）
    const presignedUrl = await getPresignedUrl(objectKey, 3600)
    
    res.json({ url: presignedUrl })
  } catch (error) {
    console.error('获取预签名 URL 错误:', error)
    res.status(500).json({ error: '获取文件 URL 失败' })
  }
})
```

#### 2. 小程序端调用接口获取预签名 URL

```javascript
// 在显示图片前，先获取预签名 URL
async function getImageUrl(originalUrl) {
  if (originalUrl.startsWith('http://localhost:9000')) {
    // 如果是 RustFS URL，获取预签名 URL
    const res = await wx.request({
      url: `${ServerUrl}api/file-presigned?url=${encodeURIComponent(originalUrl)}`,
      method: 'GET'
    })
    return res.data.url
  }
  return originalUrl
}
```

## 方案四：配置 CDN（生产环境推荐）

### 优点
- ✅ 性能最佳，全球加速
- ✅ 减轻服务器负载
- ✅ 支持 HTTPS

### 缺点
- ⚠️ 需要额外成本
- ⚠️ 配置复杂

### 实施步骤

1. 将 RustFS 作为 CDN 的源站
2. 配置 CDN 域名
3. 修改上传返回的 URL 为 CDN 域名
4. 在小程序后台配置 CDN 域名为合法域名

## 推荐方案

### 开发环境
使用 **方案一（公开访问）**，简单快速。

### 生产环境
- 如果文件都是公开的：使用 **方案四（CDN）**
- 如果需要权限控制：使用 **方案二（服务器代理）**

## 当前代码兼容性

查看当前代码，小程序端直接使用返回的 URL：

```javascript
// miniprogram/pages/clubs/create.js
logo: res.url  // 直接使用返回的 URL

// miniprogram/pages/clubs/detail.js
logoList = [{ url: res.logo }]  // 直接使用 URL
```

**建议**：
1. 如果使用方案一（公开访问），代码无需修改
2. 如果使用方案二（代理），只需修改服务器端返回的 URL 格式
3. 如果使用方案三（预签名），需要在小程序端添加获取预签名 URL 的逻辑

## 快速实施（方案一）

1. **配置存储桶公开访问**
   ```bash
   # 使用 MinIO Client
   mc anonymous set download myminio/roundmatch-uploads
   ```

2. **配置小程序域名白名单**
   - 开发环境：`http://localhost:9000`
   - 生产环境：你的 RustFS 域名

3. **验证**
   - 上传一个文件
   - 在小程序中查看是否能正常显示

## 注意事项

1. **小程序域名白名单限制**
   - 小程序只能访问配置在白名单中的域名
   - 必须使用 HTTPS（生产环境）
   - 本地开发可以使用 HTTP

2. **HTTPS 要求**
   - 生产环境必须使用 HTTPS
   - 需要为 RustFS 配置 SSL 证书
   - 或者使用 CDN 提供 HTTPS

3. **性能考虑**
   - 直接访问（方案一、四）性能最好
   - 服务器代理（方案二）会增加服务器负载
   - 预签名 URL（方案三）需要额外的 API 调用
