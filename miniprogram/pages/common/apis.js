/******** common funtions below *******************/

function commonCallFuction(that, callback, serviceName, actionName, params){
    commonStartCloudFunction(that);
    let func = serviceName;
    let action = actionName;
    let data = { action: action };
    if( params) {
        data = params;   
        data.action = action;
    } 
    console.log(func + " " + action + " with data:");
    console.log(data);
    wx.cloud.callFunction({
        name: func,
        data: data,
        success: res => {
            console.log('[云函数] ' + func + ' return: ', res.result.data);
            let data = res.result.data;
            commonSuccessHandler( data, that, callback);
        },
        fail: err => {
            console.error('[云函数] ' + func + ' 调用失败', err);
            commonErrorHandler(that);
        }
    });
}

function commonStartCloudFunction(that) {
    if( that && that.loading){
        that.loading(true);
    }
}

function commonSuccessHandler(data, that, callback) {
    if( that && that.loading){
        that.loading(false);
    }
    if( callback){
        callback(data);
    }
}

function commonErrorHandler(that) {
    if( that && that.loading){
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
        clubid:   clubid,
        password: password,
        userInfo: userInfo,
    });
}

function updateUserInfo(userInfo, that, callback) {
    commonCallFuction(that, callback, 'userService', 'info', { 
        userInfo: userInfo,
    });
}

function getClubInfo(clubid, that, callback) {
    commonCallFuction(that, callback, 'clubService', 'info', { 
        clubid: clubid,
    });
}

function getOpenid(that, callback) {
    commonCallFuction(that, callback, 'userService', 'login');
}

function loadClubs(that, callback) {
    commonCallFuction(that, callback, 'clubService', 'list');
}

function checkCreateClubEnable(that, callback) {
    commonCallFuction(that, callback, 'clubService', 'listByOwner');
}

// function searchClubs(keyword, that, callback) {
    // commonCallFuction(that, callback, 'clubService', 'search', {
    //     keyword: keyword,
    // });
// }
function searchClubs(keyword, that) {
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

function createClub(clubInfo, userInfo, that, callback){
    commonCallFuction(that, callback, 'clubService', 'create', { 
        info:  clubInfo,
        userInfo: userInfo,
    });
}

//exports
module.exports = {
  getClubInfo:      getClubInfo,
  joinClub: 	    joinClub,
  updateUserInfo:   updateUserInfo,
  getOpenid:        getOpenid,
  loadClubs:        loadClubs,
  searchClubs:      searchClubs,
  createClub:       createClub,
  checkCreateClubEnable: checkCreateClubEnable,
}



