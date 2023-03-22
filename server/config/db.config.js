/**
 * Created by Christos Ploutarchou
 * Project : node_rest_api_with_mysql
 * Filename : db.config.js
 * Date: 03/04/2020
 * Time: 21:32
 **/
module.exports = {
  HOST: "localhost",
  PORT: 3306, 
  USER: "roundmatch",
  PASSWORD: "Weilan123!@#",
  DB: "roundmatch",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// module.exports = {
//   HOST: "10.23.199.81",
//   PORT: 3306, 
//   USER: "db_user",
//   PASSWORD: "_yhMed2018_",
//   DB: "tattoo",
//   dialect: "mysql",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// };

