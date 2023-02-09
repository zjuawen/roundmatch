// 'use strict'

import CloudBase from  '@cloudbase/manager-node'
// import WechatAPI from 'co-wechat-api'
import path from 'path'

const { storage } = new CloudBase({
  secretId: "AKIDQiwAB48ze7MbNlU9e09QZUBnKh7kSDvZ",
  secretKey: "GWcT7h8LhvxnUxISRFrK9lDjleMwGXpz",
  envId: "roundmatch" // 云开发环境ID，可在腾讯云云开发控制台获取
});


async function downloadDirectories() {
  // await storage.downloadDirectory({
  //   cloudPath: "images",
  //   localPath: path.resolve("./files/images")
  // });
  await storage.downloadDirectory({
    cloudPath: "clubicons",
    localPath: path.resolve("./files/clubicons")
  });
}

downloadDirectories();
