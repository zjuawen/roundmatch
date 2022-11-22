// 'use strict'

// 需要安装axios, npm install axios
// const Axios = require('axios')
// const WechatAPI = require('co-wechat-api')
import Axios from 'axios'
import WechatAPI from 'co-wechat-api'
import  download from 'download'
import Sleep from 'sleep'

const wxappApi = new WechatAPI('wxf3f6462195815590', 'bb1434a237637a2feeea1a3cf56307af')

let env = 'roundmatch'

const exportDatabaseItem = async (accessToken, data) => {
  const resp = await Axios.post("https://api.weixin.qq.com/tcb/databasemigrateexport?access_token=" + accessToken, data)
  return resp.data
}


const getDatabaseRecord = async (accessToken, data) => {
  const resp = await Axios.post("https://api.weixin.qq.com/tcb/databasequery?access_token=" + accessToken, data)
  return resp.data
}

const getDatabaseMigrateStatus = async (accessToken, data) => {
  const resp = await Axios.post("https://api.weixin.qq.com/tcb/databasemigratequeryinfo?access_token=" + accessToken, data)
  return resp.data
}


const main = async () => {

  // let accessToken = await wxappApi.getAccessToken()
  // console.log('getAccessToken: ')
  // console.log(accessToken)
  // accessToken = accessToken.accessToken

  let accessToken = '63_nXFOtDL8DSu_QQHbIa6DGcrwnRjGX-0EaoXfq23eIv0FKm-xojOGlc38LFqYU1zfMf_czKzdQ69x6ZD7Df1dLMk53Ln1CjiCmiqyQwDqmRmjWL1-aDCA9nB1ExAALDaAAAWHZ'

  // let data = {
  //   "env": env,
  //   "query": "db.collection(\"clubs\").limit(100).skip(0).get()"
  // }
  // let result = await getDatabaseRecord(accessToken, data)
  // console.log(result)

  let tableName = 'games_' + '2f53b990-5a2e-42b0-bc70-3a3dfe6a73b0'
  let exportDatabaseItemParam = {
    "env": env,
    "file_path": 'games_export/' + tableName + '.json',
    "file_type": "1",
    "query": "db.collection(\"" + tableName + "\").limit(1000).skip(0).get()"
  }
  let dataResult = await exportDatabaseItem(accessToken, exportDatabaseItemParam)
  console.log(dataResult)

  let jobId = dataResult.job_id
  let databaseMigrateStatusParam = {
    "env": env,
    "job_id": jobId
  }
  let migrateResult = await getDatabaseMigrateStatus(accessToken, databaseMigrateStatusParam)
  console.log(migrateResult)

  while( migrateResult.status == 'waiting'){
    console.log('waiting')
    Sleep.sleep(3)
    migrateResult = await getDatabaseMigrateStatus(accessToken, databaseMigrateStatusParam)
    console.log(migrateResult)
  }
  
  // const url = 'https://tcb-mongodb-data-1254135806.cos.ap-shanghai.myqcloud.com/games_export?q-sign-algorithm=sha1&q-ak=AKIDvf9NN5WhonVx94tOfgPqzqPhhQzIJ2Te&q-sign-time=1669124812;1669128412&q-key-time=1669124812;1669128412&q-header-list=&q-url-param-list=&q-signature=f4a1708cbd1522f47b3db41bf4caf0c88426f077'
  const url = migrateResult.file_url
  console.log('downloading: ' + url)
  await download(url, './games/');

}

main()