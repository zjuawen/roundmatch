/**
 * Request logger middleware
 * Project : roundmatch
 **/
const winston = require('winston')

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'roundmatch-api' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
})

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf((info) => {
                const { level, message, timestamp, service, ...meta } = info
                
                // 处理 message，如果是对象则转换为 JSON
                let messageStr = ''
                if (message) {
                    if (typeof message === 'object') {
                        messageStr = JSON.stringify(message, null, 2)
                    } else {
                        messageStr = String(message)
                    }
                }
                
                // 处理 meta 对象
                const metaStr = Object.keys(meta).length > 0 
                    ? JSON.stringify(meta, null, 2) 
                    : ''
                
                const serviceStr = service ? `[${service}]` : ''
                const timestampStr = timestamp ? `[${timestamp}]` : ''
                
                // 组合输出
                const parts = [
                    level,
                    serviceStr,
                    timestampStr,
                    messageStr,
                    metaStr
                ].filter(Boolean)
                
                return parts.join(' ')
            })
        )
    }))
}

const requestLogger = (req, res, next) => {
    const start = Date.now()
    
    res.on('finish', () => {
        const duration = Date.now() - start
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        })
    })
    
    next()
}

module.exports = { logger, requestLogger }

