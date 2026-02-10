/**
 * Sequelize models adapted for PostgreSQL
 * Project : roundmatch
 * Filename : Sequelize.model.js
 * Updated: Migrated to PostgreSQL
 **/

module.exports.clubs = (database, Sequelize) => {
    return database.define("clubs", {
        _id: {
            type: Sequelize.UUID,
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
            type: Sequelize.INTEGER,
            defaultValue: 0,
            get() {
                const value = this.getDataValue('vip')
                return value === 1 || value === true
            },
            set(value) {
                const intValue = value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0
                this.setDataValue('vip', intValue)
            }
        },
        creator: {
            type: Sequelize.STRING
        },
        delete: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            get() {
                const value = this.getDataValue('delete')
                return value === 1 || value === true
            },
            set(value) {
                const intValue = value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0
                this.setDataValue('delete', intValue)
            }
        },
        public: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            get() {
                const value = this.getDataValue('public')
                return value === 1 || value === true
            },
            set(value) {
                const intValue = value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0
                this.setDataValue('public', intValue)
            }
        },
        maxMatchAllow: {
            type: Sequelize.INTEGER,
            defaultValue: 10
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        createDate: {
            type: Sequelize.DATE,
            set(value) {
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime',
        indexes: [
            { fields: ['creator'] },
            { fields: ['public'] }
        ]
    })
}

module.exports.users = (database, Sequelize) => {
    return database.define("users", {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
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
            type: Sequelize.STRING,
            unique: true
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
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        },
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime',
        indexes: [
            { fields: ['openid'] },
            { fields: ['unionid'] }
        ]
    })
}

module.exports.players = (database, Sequelize) => {
    return database.define("players", {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        clubid: {
            type: Sequelize.UUID
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
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        },
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime',
        indexes: [
            { fields: ['clubid'] },
            { fields: ['openid'] },
            { fields: ['clubid', 'openid'] }
        ]
    })
}

module.exports.matches = (database, Sequelize) => {
    return database.define("matches", {
        _id: {
            type: Sequelize.UUID,
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
            type: Sequelize.UUID
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
            type: Sequelize.INTEGER,
            defaultValue: 0,
            set(value) {
                // 将布尔值转换为整数：true -> 1, false -> 0
                if (typeof value === 'boolean') {
                    this.setDataValue('delete', value ? 1 : 0)
                } else {
                    this.setDataValue('delete', value)
                }
            }
        },
        remark: {
            type: Sequelize.STRING
        },
        qrcodeUrl: {
            type: Sequelize.STRING,
            allowNull: true  // 小程序码URL
        },
        createDate: {
            type: Sequelize.DATE,
            set(value) {
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        },
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime',
        indexes: [
            { fields: ['clubid'] },
            { fields: ['owner'] },
            { fields: ['createDate'] },
            { fields: ['clubid', 'delete'] }
        ]
    })
}

module.exports.games = (database, Sequelize) => {
    return database.define("games", {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        clubid: {
            type: Sequelize.UUID
        },
        matchid: {
            type: Sequelize.UUID
        },
        player1: {
            type: Sequelize.UUID
        },
        player2: {
            type: Sequelize.UUID
        },
        player3: {
            type: Sequelize.UUID
        },
        player4: {
            type: Sequelize.UUID
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
            type: Sequelize.INTEGER,
            defaultValue: 0,
            set(value) {
                // 将布尔值转换为整数：true -> 1, false -> 0
                if (typeof value === 'boolean') {
                    this.setDataValue('delete', value ? 1 : 0)
                } else {
                    this.setDataValue('delete', value)
                }
            }
        },
        createDate: {
            type: Sequelize.DATE,
            set(value) {
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        },
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime',
        indexes: [
            { fields: ['matchid'] },
            { fields: ['clubid'] },
            { fields: ['matchid', 'order'] }
        ]
    })
}

module.exports.system = (database, Sequelize) => {
    return database.define("system", {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        key: {
            type: Sequelize.STRING,
            unique: true
        },
        value: {
            type: Sequelize.TEXT
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
        updatedAt: 'updateTime',
        indexes: [
            { fields: ['key'] },
            { fields: ['type'] }
        ]
    })
}

module.exports.admins = (database, Sequelize) => {
    return database.define("admins", {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        username: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        openid: {
            type: Sequelize.STRING,
            allowNull: true
        },
        clubid: {
            type: Sequelize.STRING,
            allowNull: true  // 超级管理员可以为空，保留用于向后兼容
            // 注意：改为STRING类型以兼容非UUID格式的俱乐部ID
        },
        role: {
            type: Sequelize.STRING,
            defaultValue: 'club_admin',  // super_admin 或 club_admin
            allowNull: false
        },
        status: {
            type: Sequelize.INTEGER,
            defaultValue: 1  // 1=启用, 0=禁用
        },
        createDate: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime',
        indexes: [
            { fields: ['username'] },
            { fields: ['openid'] },
            { fields: ['clubid'] },
            { fields: ['role'] }
        ]
    })
}

// 管理员-俱乐部关联表（支持多对多关系）
module.exports.adminClubs = (database, Sequelize) => {
    return database.define("admin_clubs", {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        adminid: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'admins',
                key: '_id'
            }
        },
        clubid: {
            type: Sequelize.STRING,
            allowNull: false
            // 注意：改为STRING类型以兼容非UUID格式的俱乐部ID
            // 不设置外键约束，因为clubs表的_id可能是UUID类型，但实际数据可能是字符串
        },
        createDate: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        freezeTableName: true,
        createdAt: 'createDate',
        updatedAt: false,
        indexes: [
            { fields: ['adminid'] },
            { fields: ['clubid'] },
            { unique: true, fields: ['adminid', 'clubid'] }  // 防止重复关联
        ]
    })
}

module.exports.notices = (database, Sequelize) => {
    return database.define("notices", {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        content: {
            type: Sequelize.TEXT
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
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime',
        indexes: [
            { fields: ['enable'] },
            { fields: ['page'] },
            { fields: ['enable', 'page'] }
        ]
    })
}

module.exports.scorelogs = (database, Sequelize) => {
    return database.define("scorelogs", {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        matchid: {
            type: Sequelize.STRING,
            allowNull: false  // 改为 STRING 类型以兼容非 UUID 格式的 match ID
        },
        gameid: {
            type: Sequelize.STRING,
            allowNull: false  // 改为 STRING 类型以兼容非 UUID 格式的 game ID
        },
        clubid: {
            type: Sequelize.STRING,
            allowNull: true  // 改为 STRING 类型以兼容非 UUID 格式的俱乐部ID（与 admin_clubs 和 club_config 表一致）
        },
        oldScore1: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        oldScore2: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        newScore1: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        newScore2: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        operator: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: '操作者（管理员用户名或微信openid）'
        },
        operatorType: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'admin',
            comment: '操作者类型：admin（管理台）或 wechat（微信小程序）'
        },
        remark: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: '备注'
        },
        createDate: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            set(value) {
                if (typeof value === 'string') {
                    this.setDataValue('createDate', Date.parse(value))
                } else if (typeof value === 'object' && value['$date']) {
                    this.setDataValue('createDate', value['$date'])
                } else {
                    this.setDataValue('createDate', value)
                }
            }
        }
    }, {
        freezeTableName: true,
        createdAt: 'createDate',
        updatedAt: false,
        indexes: [
            { fields: ['matchid'] },
            { fields: ['gameid'] },
            { fields: ['clubid'] },
            { fields: ['operator'] },
            { fields: ['createDate'] }
        ]
    })
}

// 俱乐部配置表（积分规则等配置项）
module.exports.clubConfig = (database, Sequelize) => {
    return database.define("club_config", {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            field: '_id'
        },
        clubid: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            field: 'clubid'
        },
        useScoreRanking: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            comment: '是否使用积分排名',
            field: 'usescoreranking'
        },
        scoreWinPoints: {
            type: Sequelize.INTEGER,
            defaultValue: null,
            comment: '局胜分（每局胜利获得的积分）',
            field: 'scorewinpoints'
        },
        scoreRewardThreshold: {
            type: Sequelize.INTEGER,
            defaultValue: null,
            comment: '奖励分差值：净胜分每超过此值，就加奖励分',
            field: 'scorerewardthreshold'
        },
        scoreRewardPoints: {
            type: Sequelize.INTEGER,
            defaultValue: null,
            comment: '奖励分：每超过差值获得的积分',
            field: 'scorerewardpoints'
        },
        scoreRewardMaxPerGame: {
            type: Sequelize.INTEGER,
            defaultValue: null,
            comment: '每局封顶奖励分：每局最多能获得的奖励积分',
            field: 'scorerewardmaxpergame'
        },
        createDate: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            field: 'createdate'
        },
        updateTime: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            field: 'updatetime'
        }
    }, {
        freezeTableName: true,
        createdAt: 'createDate',
        updatedAt: 'updateTime',
        indexes: [
            { fields: ['clubid'], unique: true }
        ]
    })
}

module.exports.userconfig = (database, Sequelize) => {
    return database.define("userconfig", {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        openid: {
            type: Sequelize.STRING
        },
        key: {
            type: Sequelize.STRING
        },
        value: {
            type: Sequelize.TEXT
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: 'updateTime',
        indexes: [
            { fields: ['openid'] },
            { fields: ['openid', 'key'] },
            { unique: true, fields: ['openid', 'key'] }
        ]
    })
}

// 头像有效性缓存表
module.exports.avatarCache = (database, Sequelize) => {
    return database.define("avatar_cache", {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        avatarUrl: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            comment: '头像URL（唯一索引）',
            field: 'avatarurl'
        },
        isValid: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: '头像是否有效：true=有效，false=无效',
            field: 'isvalid'
        },
        checkedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            comment: '最后检查时间',
            field: 'checkedat'
        },
        checkCount: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            comment: '检查次数',
            field: 'checkcount'
        }
    }, {
        freezeTableName: true,
        createdAt: 'checkedAt',
        updatedAt: 'checkedAt',
        indexes: [
            { fields: ['avatarurl'], unique: true },
            { fields: ['isvalid'] },
            { fields: ['checkedat'] }
        ]
    })
}

