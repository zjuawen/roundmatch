# Taro 小程序图片显示配置说明

## 已完成的修改

### 1. 创建图片工具函数
- 文件：`src/utils/imageUtils.js`
- 功能：处理图片 URL，确保格式正确

### 2. 添加图片错误处理
- `src/pages/clubs/list.jsx` - 俱乐部列表页的 logo 和用户头像错误处理
- `src/pages/login/index.jsx` - 登录页的头像错误处理

## 小程序域名白名单配置（重要！）

小程序必须配置域名白名单才能访问 RustFS 的图片。

### 配置步骤

1. **登录微信小程序后台**
   - 访问：https://mp.weixin.qq.com
   - 使用小程序管理员账号登录

2. **配置服务器域名**
   - 进入：**开发** → **开发管理** → **开发设置** → **服务器域名**
   - 在 **downloadFile 合法域名** 中添加：
     - 开发环境：`http://localhost:9000` 或你的局域网 IP（如：`http://10.1.21.185:9000`）
     - 生产环境：你的 RustFS 域名（如：`https://rustfs.yourdomain.com`）

3. **注意事项**
   - ⚠️ 生产环境必须使用 HTTPS
   - ⚠️ 域名必须备案（如果是国内服务器）
   - ⚠️ 配置后需要重新编译小程序才能生效
   - ⚠️ Taro 开发时，小程序无法访问 localhost，需要使用局域网 IP

### Taro 开发环境特殊说明

Taro 开发时，小程序运行在真机或模拟器上，无法访问 `localhost`。

**解决方案：**
1. 使用局域网 IP 地址（如：`http://10.1.21.185:9000`）
2. 在 `src/services/api.js` 中已配置开发环境使用局域网 IP
3. RustFS 也需要配置为监听 `0.0.0.0` 而不是 `localhost`

**获取本机 IP：**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

## 代码修改说明

### 图片 URL 格式

RustFS 返回的 URL 格式：
```
http://localhost:9000/roundmatch-uploads/clubicons/icon-xxx.jpg
```

Taro 小程序端直接使用这个 URL：
```jsx
<Image 
  src={club.logo || '/assets/images/default-club-logo.svg'}
  mode='aspectFit'
/>
```

### 错误处理

已添加图片加载错误处理：
- 使用 `onError` 事件处理图片加载失败
- 自动替换为默认图片
- 在控制台输出错误信息，便于调试

### 兼容性处理

代码已处理以下情况：
1. ✅ 空 URL：使用默认图片
2. ✅ 旧的 cloud:// URL：使用默认图片
3. ✅ 图片加载失败：自动替换为默认图片
4. ✅ 完整的 HTTP/HTTPS URL：直接使用

## 当前代码状态

### 已修改的文件

1. **`src/pages/clubs/list.jsx`**
   - ✅ 添加了俱乐部 logo 的错误处理
   - ✅ 添加了用户头像的错误处理

2. **`src/pages/login/index.jsx`**
   - ✅ 添加了头像的错误处理

3. **`src/utils/imageUtils.js`**（新建）
   - ✅ 图片 URL 处理工具函数

### 需要检查的文件

以下文件可能需要添加图片显示功能或错误处理：

1. **`src/pages/clubs/create.jsx`**
   - 如果支持上传俱乐部 logo，需要添加图片上传和显示功能

2. **`src/pages/clubs/detail.jsx`**
   - 如果显示俱乐部 logo，需要添加 Image 组件和错误处理

3. **`src/pages/matches/detail.jsx`**
   - 如果显示玩家头像，需要添加 Image 组件和错误处理

4. **`src/pages/players/list.jsx`**
   - 如果显示玩家头像，需要添加 Image 组件和错误处理

## 测试步骤

1. **配置域名白名单**
   - 在小程序后台添加 RustFS 域名（使用局域网 IP）

2. **配置 RustFS 监听地址**
   - 确保 RustFS 监听 `0.0.0.0:9000` 而不是 `127.0.0.1:9000`
   - 这样局域网内的设备才能访问

3. **上传测试图片**
   - 在小程序中上传一张图片
   - 检查返回的 URL 格式是否正确

4. **验证图片显示**
   - 查看图片是否能正常显示
   - 检查控制台是否有错误信息

5. **测试错误处理**
   - 手动设置一个无效的 URL
   - 验证是否自动使用默认图片

## 常见问题

### Q: 图片不显示，显示空白？
A: 检查：
1. 域名白名单是否配置（使用局域网 IP，不是 localhost）
2. RustFS 存储桶是否设置为公开访问
3. RustFS 是否监听 `0.0.0.0` 而不是 `127.0.0.1`
4. URL 格式是否正确
5. 网络连接是否正常

### Q: 开发环境可以显示，真机不行？
A: 
1. 真机需要使用局域网 IP，不能使用 localhost
2. 检查域名白名单配置
3. 检查 RustFS 监听地址
4. 检查网络权限设置

### Q: 如何查看图片加载错误？
A: 
1. 打开微信开发者工具的控制台
2. 查看 Network 面板
3. 查看 Console 中的错误信息
4. 检查 `onError` 事件是否触发

### Q: Taro 开发时如何配置 RustFS？
A: 
1. RustFS 需要监听 `0.0.0.0:9000`
2. 在小程序后台配置局域网 IP 为合法域名
3. 在 `src/services/api.js` 中配置正确的服务器地址

## 下一步

1. ✅ 代码修改已完成
2. ⏳ 配置小程序域名白名单（需要在微信后台操作）
3. ⏳ 配置 RustFS 监听地址为 `0.0.0.0`
4. ⏳ 测试图片上传和显示功能
5. ⏳ 配置生产环境的 HTTPS（如需要）

## RustFS 配置示例

如果需要让局域网内的设备访问，RustFS/MinIO 需要配置为监听所有接口：

```bash
# Docker 方式
docker run -d \
  --name rustfs \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001" --address ":9000"

# 或者使用环境变量
export MINIO_BROWSER_REDIRECT_URL=http://你的IP:9001
export MINIO_SERVER_URL=http://你的IP:9000
```
