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

const SERVER_URL_UPLOADS = process.env.SERVER_URL_UPLOADS

exports.userAvatarFix = (players) => {
  players.forEach(player => {
    let avatarUrl = player.avatarUrl
    if ((avatarUrl != null) && (avatarUrl.length > 0) &&
      !avatarUrl.startsWith('http') &&
      !avatarUrl.startsWith('cloud://')) {
      player.avatarUrl = SERVER_URL_UPLOADS + avatarUrl
    }
  })
  console.log( 'after userAvatarFix: ' + JSON.stringify(players))
  
  return players
}

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

