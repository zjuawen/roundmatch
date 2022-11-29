/**
 * Created by aewn
 * Project : roundmatch
 * Filename : util.js
 * Date: 20/10/2021
 **/
const phantom = require('phantom')
const Op = require("sequelize").Op
const ErrorCode = require("../controllers/errorcode")
// utils
// const minioClient = require("./minioClient")
const fs = require('fs')
const crypto = require('crypto')
const algorithm = 'aes-192-cbc'
const password = 'Simple'
const key = crypto.scryptSync(password, 'salt', 24)
const iv = Buffer.alloc(16, 0)

exports.queryLike = (keyword, likeColumns) => {
    // console.log(likeColumns)
    let query = {}
    if (likeColumns) {
        likeColumns.forEach(val => {
            query[val] = {
                [Op.like]: `%${keyword}%`
            }
        })
    }
    query = {
        [Op.or]: query
    }
    // console.log(query)
    return query
}

exports.filterQuery = (query, likeColumns = null, excludes = null) => {
    delete query.columns
    delete query.page
    delete query.pageSize
    if (excludes) {
        excludes.forEach(val => {
            if (query[val]) {
                delete query[val]
            }
        })
    }
    // console.log(likeColumns)
    if (likeColumns) {
        likeColumns.forEach(val => {
            if (query[val]) {
                query[val] = {
                    [Op.like]: `%${query[val]}%`
                }
            }
        })
    }
    return query
}

exports.successResponse = (result, object = {}) => {
    let code = ErrorCode.SUCCESS
    let message = "success"
    result.send({
        code: code,
        msg: message,
        ...object
    })
}

exports.errorResponse = (result, errorCode, errorMsg) => {
    let code = errorCode
    let message = errorMsg.toString()
    result.send({
        code: code,
        msg: message,
    })
}

exports.sequelizeExecute = async (execFn, thenFn) => {
    // console.log(execFn)
    return await execFn.then((data) => {
        if (thenFn == null) {
            return data
        } else {
            thenFn(data)
        }
    }).catch(err => {
        console.log(err)
        return null
    })
}

exports.validateSession = (request, result) => {
    let session = request.session
    // console.log(session)
    if (!session.uid) {
        result.send({
            code: ErrorCode.ERROR_NEED_LOGIN,
            msg: "需要登录后操作"
        })
        return false
    }
    session.touch()
    return true
}
exports.paginate = (query, {
    page = 1,
    pageSize = 10
}) => {
    // console.log(page)
    const offset = ((page || 1) - 1) * (pageSize || 10)
    // console.log(pageSize)
    const limit = (pageSize || 10) * 1
    // console.log(pageSize)
    return {
        ...query,
        offset,
        limit
    }
}

exports.md5String = (plaintext) => {
    const hash = crypto.createHash('md5')
    hash.update(plaintext, 'utf8')
    const crypted = hash.digest('hex')
    return crypted
}

exports.encrypt = (plaintext) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    console.log(encrypted)
    return encrypted
}

exports.decrypt = (encrypted) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    console.log(decrypted)
    return decrypted
}

exports.saveBase64ToFile = (base64, filepath) => {
    // var body = base64
    let base64Data = base64; //body.replace(/^data:image\/png;base64,/,"")
    require('fs').writeFile(filepath, base64Data, "base64", function(err) {
        console.log(err); // writes out file without error, but it's not a valid image
    })
}

// exports.exportDocument = async (url, callback) => {
//     await phantom.create().then(async function(ph) {
//         await ph.createPage().then(async function(page) {
//             page.property('paperSize', {
//                 format: 'A4',
//                 orientation: 'portrait',
//                 // margin: '1.5cm'
//                 margin: {
//                     left: '25mm',
//                     top: '29mm',
//                     right: '21mm',
//                     bottom: '29mm'
//                 }
//             })
//             page.property('viewportSize', {
//                 width: 842,
//                 height: 595
//             })
//             let tempFileName = './temp/' + Math.round(Math.random() * 10000) + '.pdf'
//             await page.open(url).then(async function(status) {
//                 console.log('status: ' + status)
//                 // const content = await page.property('content')
//                 // console.log('content' + content)
//                 setTimeout(async () => {
//                     await page.render(tempFileName).then(async function() {
//                         console.log('Page rendered to ' + tempFileName)
//                         // callback && callback("test")
//                         await fs.readFile(tempFileName, async (err, data) => {
//                             await minioClient.putObject(data, 'output/', Math.round(Math.random() * 10000) + '.pdf', async (storage) => {
//                                 console.log('Page store to ' + storage)
//                                 fs.unlinkSync(tempFileName)
//                                 let url = await minioClient.getObjectUrl(storage, (storageUrl) => {
//                                     // console.log(storageUrl)
//                                     callback && callback(storageUrl)
//                                 })
//                             })
//                         })
//                         ph.exit()
//                     })
//                 }, 2000)
//             })
//         })
//     })
// };