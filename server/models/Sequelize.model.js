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
            defaultValue: Sequelize.UUIDV4,
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
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        creator: {
            type: Sequelize.STRING
        },
        delete: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        public: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        createDate: {
            type: Sequelize.DATE,
            set(value) {
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    // console.log(value['$date'])
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime'
    })
}

module.exports.users = (database, Sequelize) => {
    return database.define("users", {
        _id: {
            type: Sequelize.STRING,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        // appid: {
        //     type: Sequelize.STRING
        // },
        avatarUrl: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        gender: {
            type: Sequelize.INTEGER
        },
        openid: {
            type: Sequelize.STRING
        },
        unionid: {
            type: Sequelize.STRING
        },
        city: {
            type: Sequelize.STRING
        },
        province: {
            type: Sequelize.STRING
        },
        country: {
            type: Sequelize.STRING
        },
        createDate: {
            type: Sequelize.DATE,
            set(value) {
                // console.log(typeof value )
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    // console.log(value['$date'])
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        },
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime'
    })
}

module.exports.players = (database, Sequelize) => {
    return database.define("players", {
        _id: {
            type: Sequelize.STRING,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        clubid: {
            type: Sequelize.STRING
        },
        avatarUrl: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        gender: {
            type: Sequelize.INTEGER
        },
        openid: {
            type: Sequelize.STRING
        },
        enable: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        order: {
            type: Sequelize.INTEGER
        },
        createDate: {
            type: Sequelize.DATE,
            set(value) {
                // console.log(typeof value )
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    // console.log(value['$date'])
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        },
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime'
    })
}

module.exports.matches = (database, Sequelize) => {
    return database.define("matches", {
        _id: {
            type: Sequelize.STRING,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        playerCount: {
            type: Sequelize.INTEGER
        },
        clubid: {
            type: Sequelize.STRING
        },
        owner: {
            type: Sequelize.STRING
        },
        finish: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        total: {
            type: Sequelize.INTEGER
        },
        type: {
            type: Sequelize.STRING
        },
        delete: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        remark: {
            type: Sequelize.STRING
        },

        createDate: {
            type: Sequelize.DATE,
            set(value) {
                // console.log(typeof value )
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    // console.log(value['$date'])
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        },
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime'
    })
}

module.exports.games = (database, Sequelize) => {
    return database.define("games", {
        _id: {
            type: Sequelize.STRING,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        clubid: {
            type: Sequelize.STRING
        },
        matchid: {
            type: Sequelize.STRING
        },
        player1: {
            type: Sequelize.STRING
            // as: 'player_1'
        },
        player2: {
            type: Sequelize.STRING
        },
        player3: {
            type: Sequelize.STRING
        },
        player4: {
            type: Sequelize.STRING
        },
        score1: {
            type: Sequelize.INTEGER
        },
        score2: {
            type: Sequelize.INTEGER
        },
        order: {
            type: Sequelize.INTEGER
        },
        delete: {
            type: Sequelize.BOOLEAN,
            defaultValue: Sequelize.false
        },
        createDate: {
            type: Sequelize.DATE,
            set(value) {
                // console.log(typeof value )
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    // console.log(value['$date'])
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        },
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime'
    })
}

module.exports.system = (database, Sequelize) => {
    return database.define("system", {
        _id: {
            type: Sequelize.STRING,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        key: {
            type: Sequelize.STRING
        },
        value: {
            type: Sequelize.STRING(1024)
        },
        type: {
            type: Sequelize.STRING
        },
        nosort: {
            type: Sequelize.STRING
        },
        order: {
            type: Sequelize.INTEGER
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime'
    })
}

module.exports.notices = (database, Sequelize) => {
    return database.define("notices", {
        _id: {
            type: Sequelize.STRING,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        content: {
            type: Sequelize.STRING
        },
        enable: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        page: {
            type: Sequelize.STRING
        },
        order: {
            type: Sequelize.INTEGER
        },
        createDate: {
            type: Sequelize.DATE,
            set(value) {
                // console.log(typeof value )
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    // console.log(value['$date'])
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime'
    })
}