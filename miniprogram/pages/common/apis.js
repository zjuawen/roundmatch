/******** common funtions below *******************/
const ServerUrl = 'http://localhost:8300/';

function commonCallFuction(that, callback, serviceName, actionName, params) {
    commonStartCloudFunction(that);
    let func = serviceName;
    let action = actionName;
    let data = {
        action: action
    };
    if (params) {
        data = params;
        data.action = action;
    }
    console.log(func + " " + action + " with data:");
    console.log(data);
    // wx.cloud.callFunction({
    //     name: func,
    //     data: data,
    //     success: res => {
    //         console.log('[云函数] ' + func + ' return: ', res);
    //         if( res.result){
    //             let data = res.result.data;
    //             commonSuccessHandler( data, that, callback);
    //         }
    //     },
    //     fail: err => {
    //         console.error('[云函数] ' + func + ' 调用失败', err);
    //         commonErrorHandler(that);
    //     }
    // });
    wx.request({
        url: ServerUrl + 'api/' + serviceName,
        data: data,
        header: {
            'content-type': 'application/json'
        },
        success(res) {
            console.log(res)
            if (res.data) {
                let data = res.data;
                commonSuccessHandler(data, that, callback);
            }
        },
        fail: err => {
            console.error('[服务] ' + func + ' 调用失败', err);
            commonErrorHandler(that);
        }
    })
}

function commonStartCloudFunction(that) {
    if (that && that.loading) {
        that.loading(true);
    }
}

function commonSuccessHandler(data, that, callback) {
    if (that && that.loading) {
        that.loading(false);
    }
    if (callback) {
        callback(data);
    }
}

function commonErrorHandler(that) {
    if (that && that.loading) {
        that.loading(false);
    }
    wx.hideLoading();
    wx.navigateTo({
        url: '../error/deployFunctions',
    })
}

/******** end of common funtions *******************/

function joinClub(clubid, userInfo, password, that, callback) {
    commonCallFuction(that, callback, 'clubService', 'join', {
        clubid: clubid,
        password: password,
        userInfo: userInfo,
    });
}

function updateUserInfo(userInfo, that, callback) {
    commonCallFuction(that, callback, 'userService', 'update', {
        userInfo: userInfo,
    });
}

function getClubInfo(clubid, that, callback) {
    commonCallFuction(that, callback, 'clubService', 'info', {
        clubid: clubid,
    });
}

function login(code, that, callback) {
    commonCallFuction(that, callback, 'userService', 'login', {
        code: code
    });
}

function getUserDetail(that, callback) {
    commonCallFuction(that, callback, 'userService', 'detail');
}

function loadClubs(that, callback) {
    commonCallFuction(that, callback, 'clubService', 'list');
}

function checkCreateClubEnable(that, callback) {
    commonCallFuction(that, callback, 'clubService', 'listByOwner');
}

function needUnlockMatchCount(that, clubid, callback) {
    commonCallFuction(that, callback, 'clubService', 'checkMatchCount', {
        clubid: clubid,
    });
}

function unlockMatchCount(that, clubid, callback) {
    commonCallFuction(that, callback, 'clubService', 'incMatchCountAllow', {
        clubid: clubid,
    });
}

function listMatch(clubid, pageNum, pageSize, that, callback) {
    commonCallFuction(that, callback, 'matchService', 'list', {
        clubid: clubid,
        pageNum: pageNum,
        pageSize: pageSize
    });
}

function createNewMatch(that, players, type, callback) {
    commonCallFuction(that, callback, 'matchService', 'create', {
        type: type,
        players: players,
    });
}

function readMatch(that, clubid, matchid, callback) {
    commonCallFuction(that, callback, 'matchService', 'read', {
        clubid: clubid,
        matchid: matchid
    });
}

function deleteMatch(that, clubid, matchid, callback) {
    commonCallFuction(that, callback, 'matchService', 'delete', {
        clubid: clubid,
        matchid: matchid
    });
}

function saveNewMatch(that, type, matchdata, playerCount, clubid, callback) {
    commonCallFuction(that, callback, 'matchService', 'save', {
        type: type,
        matchdata: matchdata,
        playerCount: playerCount,
        clubid: clubid,
    });
}

function searchClubs(that, keyword) {
    commonStartCloudFunction(that);
    let func = 'clubService';
    let action = 'search';
    let data = {
        action: action,
        keyword: keyword,
    };
    console.log(func + " " + action + " with data:");
    console.log(data);
    return wx.cloud.callFunction({
        name: func,
        data: data,
    });
}

function searchPlayers(that, clubid, keyword) {
    commonStartCloudFunction(that);
    let func = 'userService';
    let action = 'search';
    let data = {
        action: action,
        clubid: clubid,
        keyword: keyword,
    };
    console.log(func + " " + action + " with data:");
    console.log(data);
    return wx.cloud.callFunction({
        name: func,
        data: data,
    });
}

function createClub(clubInfo, userInfo, that, callback) {
    commonCallFuction(that, callback, 'clubService', 'create', {
        info: clubInfo,
        userInfo: userInfo,
    });
}

function updateClub(clubInfo, userInfo, that, callback) {
    commonCallFuction(that, callback, 'clubService', 'update', {
        info: clubInfo,
        userInfo: userInfo,
    });
}

function listClubUsers(that, clubid, callback) {
    commonCallFuction(that, callback, 'userService', 'listAll', {
        clubid: clubid
    });
}

function pagedClubPlayers(that, clubid, pageNum, pageSize, callback) {
    commonCallFuction(that, callback, 'userService', 'list', {
        clubid: clubid,
        pageNum: pageNum,
        pageSize: pageSize,
    });
}

function isVip(that, clubid, callback) {
    commonCallFuction(that, callback, 'userService', 'isVip', {
        clubid: clubid
    })
}

function statisClub(that, clubid, date, minMatchCount, callback) {
    commonCallFuction(that, callback, 'clubService', 'statis', {
        clubid: clubid,
        date: date,
        minMatchCount: minMatchCount,
    });
}

function getNotices(that, page, callback) {
    commonCallFuction(that, callback, 'systemService', 'notices', {
        page: page
    });
}

function isAuditing(that, callback) {
    commonCallFuction(that, callback, 'systemService', 'auditing');
}

function msgSecCheck(that, content, callback) {
    commonCallFuction(that, callback, 'systemService', 'msgSecCheck', {
        content: content
    });
}

function imageSecCheck(that, imageContent, callback) {
    commonCallFuction(that, callback, 'systemService', 'imgSecCheck', {
        img: imageContent
    });
}

function readUserConfig(that, key, callback) {
    commonCallFuction(that, callback, 'userService', 'readconfig', {
        key: key
    });
}

function saveUserConfig(that, key, value, callback) {
    commonCallFuction(that, callback, 'userService', 'saveconfig', {
        key: key,
        value: value,
    });
}

function saveGameData(that, clubid, gamedata, callback) {
    commonCallFuction(that, callback, 'gameService', 'save', {
        clubid: clubid,
        gamedata: gamedata,
    });
}

//exports
module.exports = {
    // user api
    updateUserInfo: updateUserInfo,
    login: login,
    getUserDetail: getUserDetail,
    isVip: isVip,

    // club api
    getClubInfo: getClubInfo,
    joinClub: joinClub,
    loadClubs: loadClubs,
    searchClubs: searchClubs,
    createClub: createClub,
    updateClub: updateClub,
    checkCreateClubEnable: checkCreateClubEnable,
    statisClub: statisClub,
    needUnlockMatchCount: needUnlockMatchCount,
    unlockMatchCount: unlockMatchCount,

    // match api
    listMatch: listMatch,
    createNewMatch: createNewMatch,
    saveNewMatch: saveNewMatch,
    readMatch: readMatch,
    deleteMatch: deleteMatch,

    // game api
    saveGameData: saveGameData,

    //user api
    listClubUsers: listClubUsers,
    pagedClubPlayers: pagedClubPlayers,
    readUserConfig: readUserConfig,
    saveUserConfig: saveUserConfig,
    searchPlayers: searchPlayers,

    //system api
    msgSecCheck: msgSecCheck,
    imageSecCheck: imageSecCheck,
    isAuditing: isAuditing,
    getNotices: getNotices,
}