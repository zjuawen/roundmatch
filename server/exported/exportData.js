// 'use strict'

// 需要安装axios, npm install axios
// const Axios = require('axios')
// const WechatAPI = require('co-wechat-api')
import Axios from 'axios'
import WechatAPI from 'co-wechat-api'
import download from 'download'
import Sleep from 'sleep'

const wxappApi = new WechatAPI('wxf3f6462195815590', '81323b14609ba2cdcc3c738628e122a3')

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

const exportData = async (clubid, accessToken) => {
  // clubid = '2f53b990-5a2e-42b0-bc70-3a3dfe6a73b0'
  console.log('exporting club games: ' + clubid)

  let check = await getDatabaseRecord(accessToken, {
    "env": env,
    "query": "db.collection(\"games_" + clubid + "\").count()",
  })
  // console.log('count()')
  // console.log(check)
  let total = 0
  if (check.errcode != 0) {
    console.log(check.errmsg)
    return
  } else {
    total = check.pager.Total
    console.log('total: ' + total)
  }

  let offset = 0
  let pageSize = 1000
  let pager = 0
  let ceil = Math.ceil(total / pageSize)
  for (let pager = 0; pager < ceil; pager++) {
    await exportPagedData(clubid, accessToken, offset, pageSize, pager)
    offset += pageSize
  }

}

const exportPagedData = async (clubid, accessToken, offset, pageSize, pager) => {
  let tableName = 'games_' + clubid

  let exportDatabaseItemParam = {
    "env": env,
    "file_path": 'games_export/' + tableName + '-' + pager + '.json',
    "file_type": "1",
    "query": "db.collection(\"" + tableName + "\").limit(" + pageSize + ").skip(" + offset + ").get()"
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

  while (migrateResult.status != 'success') {
    console.log('waiting')
    Sleep.sleep(1)
    migrateResult = await getDatabaseMigrateStatus(accessToken, databaseMigrateStatusParam)
    if (migrateResult.status == 'success') {
      console.log(migrateResult)
    }
    // console.log(migrateResult)
  }

  // const url = 'https://tcb-mongodb-data-1254135806.cos.ap-shanghai.myqcloud.com/games_export?q-sign-algorithm=sha1&q-ak=AKIDvf9NN5WhonVx94tOfgPqzqPhhQzIJ2Te&q-sign-time=1669124812;1669128412&q-key-time=1669124812;1669128412&q-header-list=&q-url-param-list=&q-signature=f4a1708cbd1522f47b3db41bf4caf0c88426f077'
  const url = migrateResult.file_url
  console.log('downloading: ' + url)
  await download(url, './db/games/');

}

const queryClubs = async (offset, pageSize, accessToken) => {
  let data = {
    "env": env,
    "query": "db.collection(\"clubs\").limit(" + pageSize + ").skip(" + offset + ").get()"
  }
  let result = await getDatabaseRecord(accessToken, data)
  console.log(result)
  return result
}

const main = async () => {

  let accessToken = await wxappApi.getAccessToken()
  console.log('getAccessToken: ')
  console.log(accessToken)
  accessToken = accessToken.accessToken

  // let accessToken = '65_AGCQaNrqyrZLWktDvIcBbAXwACZOzTOtZfRIYvd3gKzWg4o5tCn9074f2Smnh7wTsn90GjsOKmfn0XYRPrYSGw-DbQ916ulpgxRTdfJSLI4RoeOCR5ktU7-0pVEWKVdADAGUF'

  let offset = 0
  let page = 1
  let pageSize = 10
  let result = null
  do {
    console.log('page: ' + page++)
    result = await queryClubs(offset, pageSize, accessToken)
    // console.log(result.data)

    for (let club of result.data) {
      // console.log(club)
      club = JSON.parse(club)
      // console.log(club)
      let clubid = club._id
      // console.log(clubid)
      await exportData(clubid, accessToken)
    }
    offset += pageSize
  } while (result.data.length >= pageSize)

}

main()