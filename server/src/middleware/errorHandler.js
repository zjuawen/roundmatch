/**
 * Global error handler middleware
 * Project : roundmatch
 **/
const { errorResponse } = require("../utils/response")
const ErrorCode = require("../controllers/errorcode")

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err)

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        return errorResponse(res, ErrorCode.VALIDATION_ERROR, err.errors[0].message)
    }

    // Sequelize database errors
    if (err.name === 'SequelizeDatabaseError') {
        return errorResponse(res, ErrorCode.DATABASE_ERROR, 'Database error occurred')
    }

    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return errorResponse(res, ErrorCode.DUPLICATE_ERROR, 'Duplicate entry')
    }

    // Custom error with code
    if (err.code && err.message) {
        return errorResponse(res, err.code, err.message)
    }

    // Default error
    errorResponse(res, ErrorCode.INTERNAL_ERROR, err.message || 'Internal server error')
}

module.exports = errorHandler

