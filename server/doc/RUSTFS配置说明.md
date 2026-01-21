# RustFS 对象存储配置说明

## 一、环境变量配置

在 `.env` 文件中添加以下 RustFS 配置：

```env
# RustFS 对象存储配置
# RustFS 服务端点（必填）
RUSTFS_ENDPOINT=http://localhost:9000

# 访问密钥（必填）
RUSTFS_ACCESS_KEY=minioadmin

# 秘密密钥（必填）
RUSTFS_SECRET_KEY=minioadmin

# 存储桶名称（必填）
RUSTFS_BUCKET=roundmatch-uploads

# 区域（可选，默认 us-east-1）
RUSTFS_REGION=us-east-1

# 是否使用 SSL（可选，默认 false）
RUSTFS_USE_SSL=false

# 原有的本地存储配置（已废弃，但保留用于兼容）
# UPLOAD_LOCAL_DIRECTORY=../uploads/
# SERVER_URL_UPLOADS=http://roundmatch.microripples.cn/uploads/
```

## 二、安装依赖

运行以下命令安装必要的依赖：

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

或者使用 yarn：

```bash
yarn add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 三、RustFS 服务部署

### 3.1 使用 Docker 部署（推荐）

```bash
docker run -d \
  --name rustfs \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v /path/to/data:/data \
  minio/minio server /data --console-address ":9001"
```

### 3.2 创建存储桶

1. 访问 RustFS 控制台：`http://localhost:9001`
2. 使用配置的访问密钥登录
3. 创建名为 `roundmatch-uploads` 的存储桶（或使用配置中的名称）
4. 设置存储桶策略为公开读取（如果需要公开访问）

### 3.3 存储桶策略示例（公开读取）

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

## 四、文件路径说明

文件上传后，会根据类型存储到以下路径：

- **俱乐部图标**: `clubicons/icon-{timestamp}.{ext}`
- **用户头像**: `heads/icon-{timestamp}.{ext}`
- **其他图片**: `images/icon-{timestamp}.{ext}`

文件 URL 格式：
```
{RUSTFS_ENDPOINT}/{RUSTFS_BUCKET}/{objectKey}
```

例如：
```
http://localhost:9000/roundmatch-uploads/clubicons/icon-1234567890.png
```

## 五、测试

1. 启动 RustFS 服务
2. 配置环境变量
3. 启动应用服务器
4. 测试文件上传接口：`POST /api/mediaService?action=upload&type=icon`

## 六、注意事项

1. **生产环境配置**：
   - 使用强密码替换默认密钥
   - 启用 SSL/TLS（设置 `RUSTFS_USE_SSL=true`）
   - 配置适当的存储桶策略和访问控制

2. **性能优化**：
   - 考虑使用 CDN 加速文件访问
   - 配置 RustFS 的分布式部署以提高可用性

3. **备份策略**：
   - 定期备份 RustFS 数据
   - 配置数据冗余

4. **监控**：
   - 监控存储使用量
   - 监控上传/下载成功率
   - 设置告警机制

## 七、故障排查

### 7.1 连接失败

- 检查 RustFS 服务是否运行
- 检查 `RUSTFS_ENDPOINT` 配置是否正确
- 检查网络连接和防火墙设置

### 7.2 认证失败

- 检查 `RUSTFS_ACCESS_KEY` 和 `RUSTFS_SECRET_KEY` 是否正确
- 确认 RustFS 服务中的用户凭据

### 7.3 存储桶不存在

- 确认存储桶已创建
- 检查 `RUSTFS_BUCKET` 配置是否正确
- 确认存储桶名称拼写正确

### 7.4 文件上传失败

- 检查文件大小限制
- 检查存储桶权限
- 查看服务器日志获取详细错误信息
