/**
 * Main application entry point
 * Project : roundmatch
 * Updated: Modernized with PostgreSQL support
 **/
const express = require("express")
const session = require('express-session')
const bodyParser = require("body-parser")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const formidable = require('formidable')

require("dotenv").config()

const db = require("./models")
const { requestLogger } = require("./middleware/logger")
const errorHandler = require("./middleware/errorHandler")
const api = require("./routes/index")

const server = express()

// Security middleware
server.use(helmet())

// Compression middleware
server.use(compression())

// CORS settings
const corsSettings = {
    origin: true,
    credentials: true,
}
server.use(cors(corsSettings))

// Session settings
const sessionSettings = {
    secret: process.env.SESSION_SECRET || 'roundmatch token',
    resave: true,
    rolling: true,
    saveUninitialized: false,
    name: 'token',
    cookie: { 
        maxAge: 60 * 60000,  // 60 mins
    }	
}
server.use(session(sessionSettings))

// Body parser middleware
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

// Request logging
server.use(requestLogger)

// API routes
server.use("/", api)

// Error handler (must be last)
server.use(errorHandler)

// Database sync
// 只创建不存在的表，不修改现有表结构
// 如果需要修改表结构，请使用数据库迁移工具或手动修改
db.databaseConf.sync().then(() => {
    console.log('Database synced successfully')
}).catch(err => {
    console.error('Database sync error:', err)
})

// Start server
const port = process.env.PORT || 8300
server.listen(port, () => {
    console.log(`Server running on port ${port} on ${new Date()}`)
})

module.exports = server

