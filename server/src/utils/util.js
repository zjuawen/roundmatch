/**
 * Utility functions
 * Project : roundmatch
 * Filename : util.js
 **/
const Op = require("sequelize").Op
const ErrorCode = require("../controllers/errorcode")
const fs = require('fs')
const crypto = require('crypto')
const algorithm = 'aes-192-cbc'
const password = 'Simple'
const key = crypto.scryptSync(password, 'salt', 24)
const iv = Buffer.alloc(16, 0)

// RustFS 文件基础 URL（替代原来的 SERVER_URL_UPLOADS）
const { getFileBaseUrl } = require("../config/storage.config")
const SERVER_URL_UPLOADS = getFileBaseUrl()

exports.userAvatarFix = (players) => {
  players.forEach(player => {
    let avatarUrl = player.avatarUrl
    if ((avatarUrl != null) && (avatarUrl.length > 0) &&
      !avatarUrl.startsWith('http') &&
      !avatarUrl.startsWith('cloud://')) {
      player.avatarUrl = SERVER_URL_UPLOADS + avatarUrl
    }
  })
  console.log('after userAvatarFix: ' + JSON.stringify(players))
  
  return players
}

exports.queryLike = (keyword, likeColumns) => {
    let query = {}
    if (likeColumns) {
        likeColumns.forEach(val => {
            query[val] = {
                [Op.iLike]: `%${keyword}%`  // PostgreSQL case-insensitive LIKE
            }
        })
    }
    query = {
        [Op.or]: query
    }
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
    if (likeColumns) {
        likeColumns.forEach(val => {
            if (query[val]) {
                query[val] = {
                    [Op.iLike]: `%${query[val]}%`  // PostgreSQL case-insensitive LIKE
                }
            }
        })
    }
    return query
}

exports.sequelizeExecute = async (execFn, thenFn) => {
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
    const offset = ((page || 1) - 1) * (pageSize || 10)
    const limit = (pageSize || 10) * 1
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
    let base64Data = base64
    require('fs').writeFile(filepath, base64Data, "base64", function(err) {
        console.log(err)
    })
}

exports.getCurrentDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

