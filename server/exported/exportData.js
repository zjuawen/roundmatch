// 'use strict'

// 需要安装axios, npm install axios
// const Axios = require('axios')
// const WechatAPI = require('co-wechat-api')
import Axios from 'axios'
import WechatAPI from 'co-wechat-api'
import download from 'download'
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

const exportData = async (clubid, accessToken) => {
  console.log('exporting club games: ' + clubid)
  let tableName = 'games_' + clubid

  let check = await getDatabaseRecord(accessToken, {
    "env": env,
    "query": "db.collection(\"games_" + clubid + "\").get()"
  })
  if( check.errcode != 0){
    console.log( check.errmsg)
    return
  }

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

  while (migrateResult.status != 'success') {
    console.log('waiting')
    Sleep.sleep(1)
    migrateResult = await getDatabaseMigrateStatus(accessToken, databaseMigrateStatusParam)
    if( migrateResult.status == 'success'){
      console.log(migrateResult)
    }
    // console.log(migrateResult)
  }

  // const url = 'https://tcb-mongodb-data-1254135806.cos.ap-shanghai.myqcloud.com/games_export?q-sign-algorithm=sha1&q-ak=AKIDvf9NN5WhonVx94tOfgPqzqPhhQzIJ2Te&q-sign-time=1669124812;1669128412&q-key-time=1669124812;1669128412&q-header-list=&q-url-param-list=&q-signature=f4a1708cbd1522f47b3db41bf4caf0c88426f077'
  const url = migrateResult.file_url
  console.log('downloading: ' + url)
  await download(url, './games/');

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

  // let accessToken = await wxappApi.getAccessToken()
  // console.log('getAccessToken: ')
  // console.log(accessToken)
  // accessToken = accessToken.accessToken

  let accessToken = '63_YZhhchTc_-9N2H9vzjmNKcEPr4bIEWk-YqUGX9UNurFZYZM6AtJDTebAJfdNlqRWRuQzWCD1tCLamr8rXLTdUxjrqZOnKmxLIsbhOLhh9UkUPwSBIzAQ2QzFTjsTMHcAHAFYT'

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