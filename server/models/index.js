/**
 * Created by Christos Ploutarchou
 * Project : node_rest_api_with_mysql
 * Filename : Sequelize.js
 * Date: 03/04/2020
 * Time: 23:33
 **/
const dbConfig = require("../config/db.config");
const Sequelize = require("sequelize");
// const importer = require("../utils/json.importer");

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
});

const db = {};
db.Sequelize = Sequelize;
db.databaseConf = database;

db.clubs = require("./Sequelize.model").clubs(database, Sequelize);

// db.doctor.hasMany(db.patient, {foreignKey: 'doctorId'});
// db.patient.belongsTo(db.doctor, {foreignKey: 'doctorId'});

// db.doctor.hasMany(db.data, {foreignKey: 'doctorId'});
// db.data.belongsTo(db.doctor, {foreignKey: 'doctorId'});

// db.patient.hasOne(db.data, {foreignKey: 'patientId'});
// db.data.belongsTo(db.patient, {foreignKey: 'patientId'});

// function to drop existing tables and re-sync database
db.dropRestApiTable = () => {
    db.databaseConf.sync({
        force: true,
        alter: true 
    }).then(() => {
        console.log("roundmatch table just dropped and db re-synced.");
    });
};
// db.importData = (folder) => {
//     let count = importer.process('clubs');
//     console.log('imported records: ' + count);
// };

db.collection = (tableName) => {
    return db[tableName];
};

module.exports = db;