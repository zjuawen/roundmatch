# 数据迁移脚本

## migrate-to-rustfs.js

将本地 `uploads` 目录中的文件迁移到 RustFS 对象存储。

### 功能特性

- ✅ 自动扫描 `uploads` 目录下的所有文件
- ✅ 保持目录结构（clubicons/, heads/, images/）
- ✅ 跳过已存在的文件（避免重复上传）
- ✅ 显示上传进度和统计信息
- ✅ 记录失败的文件和错误信息
- ✅ 自动排除临时文件和系统文件（tmp/, .DS_Store）

### 使用方法

```bash
# 方式一：使用 npm script
npm run migrate:rustfs

# 方式二：直接运行
node scripts/migrate-to-rustfs.js
```

### 前置条件

1. **确保 RustFS 服务已启动**
   ```bash
   # 检查 RustFS 是否运行
   curl http://localhost:9000/minio/health/live
   ```

2. **确保存储桶已创建**
   - 登录 RustFS 控制台（http://localhost:9001）
   - 创建名为 `roundmatch-uploads` 的存储桶（或使用配置中的名称）

3. **确保环境变量已配置**
   在 `.env` 文件中配置：
   ```env
   RUSTFS_ENDPOINT=http://localhost:9000
   RUSTFS_ACCESS_KEY=minioadmin
   RUSTFS_SECRET_KEY=minioadmin
   RUSTFS_BUCKET=roundmatch-uploads
   ```

### 输出示例

```
🚀 开始迁移文件到 RustFS...

📁 源目录: /path/to/uploads
🪣 目标存储桶: roundmatch-uploads
🌐 RustFS 端点: http://localhost:9000

📋 扫描文件...
找到 237 个文件

开始上传...

[1/237] ✅ 成功: clubicons/icon-20210710-161638.jpg
[2/237] ✅ 成功: clubicons/icon-20200915-235320.png
[3/237] ⏭️  跳过（已存在）: heads/icon-1676549834021.jpeg
...

==================================================
📊 迁移统计:
   总计: 237
   ✅ 成功: 235
   ⏭️  跳过: 2
   ❌ 失败: 0
==================================================
```

### 注意事项

1. **文件路径映射**
   - 本地路径: `uploads/clubicons/icon-xxx.jpg`
   - 对象存储 key: `clubicons/icon-xxx.jpg`
   - 最终 URL: `http://localhost:9000/roundmatch-uploads/clubicons/icon-xxx.jpg`

2. **跳过已存在的文件**
   - 脚本会自动检查文件是否已存在于 RustFS
   - 如果已存在，会跳过上传（避免重复）

3. **错误处理**
   - 如果某个文件上传失败，会记录错误但继续处理其他文件
   - 脚本结束后会显示所有失败的文件和错误信息

4. **大文件处理**
   - 脚本会逐个上传文件
   - 对于大量文件，可能需要较长时间
   - 建议在低峰期运行

### 故障排查

**问题：连接 RustFS 失败**
- 检查 RustFS 服务是否运行
- 检查 `RUSTFS_ENDPOINT` 配置是否正确
- 检查网络连接

**问题：认证失败**
- 检查 `RUSTFS_ACCESS_KEY` 和 `RUSTFS_SECRET_KEY` 是否正确

**问题：存储桶不存在**
- 在 RustFS 控制台创建存储桶
- 检查 `RUSTFS_BUCKET` 配置是否正确

**问题：文件上传失败**
- 查看错误信息了解具体原因
- 检查文件权限
- 检查存储桶策略
