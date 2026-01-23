// 'use strict'

import CloudBase from  '@cloudbase/manager-node'
// import WechatAPI from 'co-wechat-api'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// 加载环境变量
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载 .env 文件
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// 从环境变量读取腾讯云配置
const TENCENT_SECRET_ID = process.env.TENCENT_SECRET_ID || 'dummy_secret_id'
const TENCENT_SECRET_KEY = process.env.TENCENT_SECRET_KEY || 'dummy_secret_key'
const TENCENT_ENV_ID = process.env.TENCENT_ENV_ID || 'roundmatch'

if (!process.env.TENCENT_SECRET_ID || process.env.TENCENT_SECRET_ID === 'dummy_secret_id') {
  console.warn('警告: TENCENT_SECRET_ID 未设置或使用默认值，请在 .env 文件中配置 TENCENT_SECRET_ID')
}

if (!process.env.TENCENT_SECRET_KEY || process.env.TENCENT_SECRET_KEY === 'dummy_secret_key') {
  console.warn('警告: TENCENT_SECRET_KEY 未设置或使用默认值，请在 .env 文件中配置 TENCENT_SECRET_KEY')
}

const { storage } = new CloudBase({
  secretId: TENCENT_SECRET_ID,
  secretKey: TENCENT_SECRET_KEY,
  envId: TENCENT_ENV_ID // 云开发环境ID，可在腾讯云云开发控制台获取
});


async function downloadDirectories() {
  // await storage.downloadDirectory({
  //   cloudPath: "images",
  //   localPath: path.resolve("./uploads/images")
  // });
  await storage.downloadDirectory({
    cloudPath: "clubicons",
    localPath: path.resolve("./uploads/clubicons")
  });
}

downloadDirectories();
