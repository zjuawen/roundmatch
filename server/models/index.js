/**
 * Created by Christos Ploutarchou
 * Project : node_rest_api_with_mysql
 * Filename : Sequelize.js
 * Date: 03/04/2020
 * Time: 23:33
 **/
const dbConfig = require("../config/db.config")
const Sequelize = require("sequelize")
// const importer = require("../utils/json.importer")

const database = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    },
    dialectOptions: {
        dateStrings: true,
        typeCast: true
    },
    timezone: '+08:00',

    // logging: false
})

const db = {}
db.Sequelize = Sequelize
db.databaseConf = database

db.clubs = require("./Sequelize.model").clubs(database, Sequelize)
db.users = require("./Sequelize.model").users(database, Sequelize)
db.players = require("./Sequelize.model").players(database, Sequelize)
db.matches = require("./Sequelize.model").matches(database, Sequelize)
db.games = require("./Sequelize.model").games(database, Sequelize)
db.system = require("./Sequelize.model").system(database, Sequelize)
db.notices = require("./Sequelize.model").notices(database, Sequelize)

db.matches.hasMany(db.games, {
    foreignKey: 'matchid',
    constraints: false
})

// db.players.belongsToMany(db.games, {
//     foreignKey: ['player1', 'player2', 'player3', 'player4'],
//     sourceKey: '_id',
//     constraints: false
// })

// db.games.hasOne(db.players, {
//     foreignKey: 'player_1',
//     targetKey: '_id',
//     as: 'player1',
//     constraints: false
// })
// db.games.belongsTo(db.players,{
//     foreignKey: 'player_1',
//     // sourceKey: 'player2',
//     as: 'player1',
//     constraints: false
// })

// db.games.hasMany(db.players, {
//     foreignKey: '_id',
//     sourceKey: 'player3',
//     // as: 'player_3'
//     // constraints: false
// })

// db.games.hasMany(db.players, {
//     foreignKey: '_id',
//     sourceKey: 'player4',
//     // as: 'player_4'
//     // constraints: false
// })

// db.doctor.hasMany(db.patient, {foreignKey: 'doctorId'})
// db.patient.belongsTo(db.doctor, {foreignKey: 'doctorId'})

// db.doctor.hasMany(db.data, {foreignKey: 'doctorId'})
// db.data.belongsTo(db.doctor, {foreignKey: 'doctorId'})

// db.patient.hasOne(db.data, {foreignKey: 'patientId'})
// db.data.belongsTo(db.patient, {foreignKey: 'patientId'})

// function to drop existing tables and re-sync database
db.dropRestApiTable = () => {
    db.databaseConf.sync({
        force: true,
        alter: true
    }).then(() => {
        console.log("roundmatch table just dropped and db re-synced.")
    })
}
// db.importData = (folder) => {
//     let count = importer.process('system')
//     console.log('imported records: ' + count)
// }

db.collection = (tableName) => {
    return db[tableName]
}

module.exports = db