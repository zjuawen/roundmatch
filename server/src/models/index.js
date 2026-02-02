/**
 * Sequelize database initialization for PostgreSQL
 * Project : roundmatch
 * Filename : index.js
 * Updated: Migrated to PostgreSQL
 **/
const dbConfig = require("../config/db.config")
const Sequelize = require("sequelize")

const database = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    schema: dbConfig.SCHEMA,
    quoteIdentifiers: false, // PostgreSQL 会将未加引号的标识符转换为小写
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    },
    dialectOptions: dbConfig.dialectOptions,
    timezone: dbConfig.timezone,
    logging: dbConfig.logging,
    define: {
        schema: dbConfig.SCHEMA
    }
})

const db = {}
db.Sequelize = Sequelize
db.databaseConf = database

// Load models
db.clubs = require("./Sequelize.model").clubs(database, Sequelize)
db.users = require("./Sequelize.model").users(database, Sequelize)
db.players = require("./Sequelize.model").players(database, Sequelize)
db.matches = require("./Sequelize.model").matches(database, Sequelize)
db.games = require("./Sequelize.model").games(database, Sequelize)
db.system = require("./Sequelize.model").system(database, Sequelize)
db.notices = require("./Sequelize.model").notices(database, Sequelize)
db.userconfig = require("./Sequelize.model").userconfig(database, Sequelize)
db.admins = require("./Sequelize.model").admins(database, Sequelize)
db.adminClubs = require("./Sequelize.model").adminClubs(database, Sequelize)
db.scorelogs = require("./Sequelize.model").scorelogs(database, Sequelize)
db.clubConfig = require("./Sequelize.model").clubConfig(database, Sequelize)
db.avatarCache = require("./Sequelize.model").avatarCache(database, Sequelize)

// Define associations
db.matches.hasMany(db.games, {
    foreignKey: 'matchid',
    constraints: false
})

// Helper functions
db.dropRestApiTable = () => {
    db.databaseConf.sync({
        force: true,
        alter: true
    }).then(() => {
        console.log("roundmatch tables just dropped and db re-synced.")
    })
}

db.serverDate = () => {
    return new Date()
}

db.collection = (tableName) => {
    return db[tableName]
}

module.exports = db

