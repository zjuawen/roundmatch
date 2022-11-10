/**
 * Created by Christos Ploutarchou
 * Project : node_rest_api_with_mysql
 * Filename : Tutorial.js
 * Date: 04/04/2020
 * Time: 00:01
 **/
module.exports.clubs = (database, Sequelize) => {
    return database.define("clubs", {
        _id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        wholeName: {
            type: Sequelize.STRING
        },
        shortName: {
            type: Sequelize.STRING
        },
        logo: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        vip: {
            type: Sequelize.BOOLEAN
        },
        creator: {
            type: Sequelize.STRING
        },
        delete: {
            type: Sequelize.BOOLEAN
        },
        public: {
            type: Sequelize.BOOLEAN
        },
        createDate: {
            type: Sequelize.DATE,
            set(value) {
                if( value instanceof String){
                    this.setDataValue('createDate', hash(value));
                } else {
                    // console.log(value['$date'])
                    this.setDataValue('createDate', value['$date']);
                }
            }
        }
    }, {
        freezeTableName: true
    });
};
// module.exports.doctor = (database, Sequelize) => {
//     return database.define("doctor", {
//         openid: {
//             type: Sequelize.STRING
//         },
//         name: {
//             type: Sequelize.STRING
//         },
//         hospital: {
//             type: Sequelize.STRING
//         },
//         depart: {
//             type: Sequelize.STRING
//         },
//         mobile: {
//             type: Sequelize.STRING
//         },
//         avatar: {
//             type: Sequelize.STRING
//         },
//         bindQrcode: {
//             type: Sequelize.STRING
//         },
//         inviteQrcode: {
//             type: Sequelize.JSON
//         },
//         latestSign: {
//             type: Sequelize.STRING
//         },
//         sex: {
//             type: Sequelize.INTEGER
//         }
//     }, {
//         freezeTableName: true
//     });
// };
// module.exports.patient = (database, Sequelize) => {
//     return database.define("patient", {
//         openid: {
//             type: Sequelize.STRING
//         },
//         name: {
//             type: Sequelize.STRING
//         },
//         avatar: {
//             type: Sequelize.STRING
//         },
//         mobile: {
//             type: Sequelize.STRING
//         },
//         idcardNo: {
//             type: Sequelize.STRING
//         },
//         idcardImage: {
//             type: Sequelize.STRING
//         },
//         doctorId: {
//             type: Sequelize.INTEGER
//         },
//         surveyType: {
//             type: Sequelize.INTEGER
//         },
//         projectId: {
//             type: Sequelize.INTEGER
//         },
//         enable: {
//             type: Sequelize.INTEGER
//         }
//     }, {
//         freezeTableName: true
//     });
// };
// module.exports.dict = (database, Sequelize) => {
//     return database.define("dict", {
//         name: {
//             type: Sequelize.STRING
//         },
//         value: {
//             type: Sequelize.STRING
//         }
//     }, {
//         freezeTableName: true
//     });
// };
// module.exports.data = (database, Sequelize) => {
//     return database.define("data", {
//         doctorId: {
//             type: Sequelize.INTEGER,
//             // validate: {
//             //     isInt: true,              // 检查有效的整数
//             // }
//         },
//         patientId: {
//             type: Sequelize.INTEGER
//         },
//         stage: {
//             type: Sequelize.INTEGER
//         },
//         encrypt: {
//             type: Sequelize.BOOLEAN
//         },
//         editable: {
//             type: Sequelize.BOOLEAN
//         },
//         invalid: {
//             type: Sequelize.BOOLEAN
//         },
//         dataInfoDr: {
//             type: Sequelize.TEXT
//         },
//         tmInfoDr: {
//             type: Sequelize.DATE
//         },
//         dataInfoPt: {
//             type: Sequelize.TEXT
//         },
//         tmInfoPt: {
//             type: Sequelize.DATE
//         },
//         dataSuryOneDr: {
//             type: Sequelize.TEXT
//         },
//         tmSuryOneDr: {
//             type: Sequelize.DATE
//         },
//         dataSuryOnePt: {
//             type: Sequelize.TEXT
//         },
//         tmSuryOnePt: {
//             type: Sequelize.DATE
//         },
//         dataSuryTwoDr: {
//             type: Sequelize.TEXT
//         },
//         tmSuryTwoDr: {
//             type: Sequelize.DATE
//         },
//         dataSuryTwoPt: {
//             type: Sequelize.TEXT
//         },
//         tmSuryTwoPt: {
//             type: Sequelize.DATE
//         },
//         dataSuryTrdDr: {
//             type: Sequelize.TEXT
//         },
//         tmSuryTrdDr: {
//             type: Sequelize.DATE
//         },
//         dataSuryTrdPt: {
//             type: Sequelize.TEXT
//         },
//         tmSuryTrdPt: {
//             type: Sequelize.DATE
//         },
//     }, {
//         freezeTableName: true
//     });
// };
