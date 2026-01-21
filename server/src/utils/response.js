/**
 * Unified response format utility
 * Project : roundmatch
 **/
const ErrorCode = require("../controllers/errorcode")

exports.successResponse = (result, object = {}) => {
    const code = ErrorCode.SUCCESS
    const message = "success"
    result.send({
        code: code,
        msg: message,
        ...object
    })
}

exports.errorResponse = (result, errorCode, errorMsg) => {
    const code = errorCode
    const message = errorMsg.toString()
    result.send({
        code: code,
        msg: message,
    })
}

