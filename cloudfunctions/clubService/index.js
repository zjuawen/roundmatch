// 云函数入口文件
const cloud = require('wx-server-sdk')

var config = require('../config.js');

const env = config.debug ? 'test-roundmatch' : cloud.DYNAMIC_CURRENT_ENV;
cloud.init({
  env: env
})

const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

const RECORD_MAX_COUNT = 100;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  console.log("current env: " + env);

  let action = event.action;
  let data;
  if (action == 'join') {
    data = await joinClub( wxContext, event);
  } else if (action == 'list') {
    let private = await listPrivateClub( wxContext );
    let public = await listPublicClub( wxContext );
    data = {
      private, public
    }
  }  else if (action == 'create') {
    data = await createClub(wxContext, event.info);
  } else if( action == 'statis') {
     data = await statisUserInClub(event.clubid);
  } else if ( action == 'info') {
    data = await getClubInfo(event.clubid);
  } 

  return {
    data,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

//读取俱乐部信息
getClubInfo = async (clubid) => {
  return await db.collection('clubs')
    .doc(clubid)
    .get()
    .then(res => {
      console.log(res);
      let club = res.data;
      if( club != null){
        let password = club.password;
        if( password != null && password.length > 0){
          club.locked = true;
        } else {
          club.locked = false;
        }
        club.password = null;
      }
      return club;
    });
}

//公开的俱乐部列表
listPublicClub = async (wxContext) => {
  return await db.collection('clubs')
    .where({
      public: true,
      delete: _.neq(true),
    })
    .get()
    .then(res => {
      console.log(res);
      res.data.forEach(function (club){
        let password = club.password;
        if( password != null && password.length > 0){
          club.locked = true;
        } else {
          club.locked = false;
        }
        club.password = null;
      })
      console.log(res);
      return res.data;
    });
}

//参与的俱乐部列表
listPrivateClub = async (wxContext) => {
	return await db.collection('players')
    .where({
  		openid: wxContext.OPENID
  	})
  	.get()
  	.then(res => {
  		console.log(res);
  		return loadClubData(res.data);
  	})
}

loadClubData = async (uacs) => {
	let clubids = uacs.map(a=> a.clubid);
	return await db.collection('clubs')
		.where({
			_id: _.in(clubids),
      delete: _.neq(true),
		})
		.get()
  	.then(res => {
      console.log(res);
      return res.data;
  	});
}

//加入俱乐部
joinClub = async (wxContext, event) => {
  let clubid = event.clubid;
  let userInfo = event.userInfo;
  let password = event.password;

  return await db.collection('players')
    .where({
  		openid: wxContext.OPENID,
  		clubid: clubid
  	})
  	.get()
  	.then( async res => {
  		console.log(res);
  		if( res.data.length > 0){
  			return ({ 
          status: "fail", 
          errMsg: 'Already join Club!'
        });
  		}

      let passwordCheck = await checkPassword(clubid, password);
      if(passwordCheck == false) {
        return ({ 
          status: "fail", 
          errMsg: 'Incorrect password!'
        });
      }

  		//add user info
  		return addUserToClubs(clubid, wxContext.OPENID, userInfo);
  	})
}

//密码校验
checkPassword = async (clubid, password) => {

  return await db.collection('clubs')
    .doc(clubid)
    // .where({
    //   _id: clubid
    // })
    .get()
    .then( res => {
      console.log(res);
      let result = false;
      if( res.data != null){
        let club = res.data;
        if( club.password == null || club.password.length == 0){
          result = true;
        } else if( club.password == password){
          result = true;
        } 
      }
      return result;
    })
}

addUserToClubs = async (clubid, openid, userInfo) => {
	let dt = db.serverDate();
  return await db.collection('players')
  	.add({
  		data: {
  			openid: openid,
  			clubid: clubid,
        enable: true,
        order: 1,
        name: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender,
  			createDate: dt
  		}
  	})
  	.then(res => {
  		console.log(res);
  		if( res.errMsg != "collection.add:ok"){
        return {
          errMsg: res.errMsg
        };
      } else {
        return {
          _id: res._id,
          openid: openid,
          clubid: clubid,
          createDate: dt
        }
      }
  	})
}

//创建俱乐部
createClub = async (wxContext, info) => {
  let dt = db.serverDate();
  let exist = await db.collection('clubs')
  .where({
    creator: wxContext.OPENID,
    delete: _.neq(true),
  })
  .get()
  .then( async res => {
    console.log(res);
    return (res.data.length > 0);
    // if( res.data && res.data.)
  });
  if( exist){
    return {
      errCode: 1,
      errMsg: "每个用户仅可以创建一个俱乐部"
    }
  }


  return await db.collection('clubs')
    .add({
      data: {
        creator: wxContext.OPENID,
        password: info.password,
        shortName: info.shortName,
        wholeName: info.wholeName,
        public: info.public,
        delete: false,
        createDate: dt
      }
    })
    .then(async res =>  {
      console.log(res);
      if (res.errMsg == "collection.add:ok") {
        let clubid = res._id;
        // let dataTableRes = await createClubGameDataTable(clubid, info);
        return {
          _id: res._id,
          creator: wxContext.OPENID,
          password: info.password,
          shortName: info.shortName,
          wholeName: info.wholeName,
          public: info.public,
          createDate: dt,
          // dataTableRes: dataTableRes
        };
      }
    });
}


//统计俱乐部成员胜率
statisUserInClub = async (clubid) => {
  return await db.collection('players')
    .where({
      clubid: clubid
    })
    .orderBy('order', 'desc')
    .get()
    .then( async res =>  {
      console.log(res);
      let players = res.data;
      let matches = await listClubMatches(clubid);
      let games = await listClubGames(clubid);
      let result = startStatisticPlayers(players, matches, games);
      let data = players;
      return data;
    })
}

//获取该俱乐部所有比赛
listClubMatches = async (clubid) => {
  return await db.collection('matches')
    .where({
      clubid: clubid,
      delete: _.neq(true),
    })
    .get()
    .then(res => {
      console.log("listClubMatches: ");
      console.log(res);
      let data = res.data;
      return data;
    })
}

//获取该俱乐部所有场次
listClubGames = async (clubid, page = 1) => {
  // let page = 1;
  let page_size = RECORD_MAX_COUNT;

  return await db.collection('games_' + clubid)
    .where({
      clubid: clubid,
      delete: _.neq(true),
    })
    .skip((page-1)*page_size)
    .get()
    .then(async res => {
      console.log("listClubGames: page" + page);
      console.log(res);

      let data = res.data;
      if( data.length < page_size){
        return data;
      } else {
        let dataMore = await listClubGames(clubid, page+1);
        return data.concat(dataMore);
      }
      
    })
}

//开始统计
startStatisticPlayers = (players, matches, games) => {
  //start for each game
  statisticWinAndLost(players, games);
  statisticPigAndCrown(players, matches, games);
}

//统计胜场数和负场数
statisticWinAndLost = (players, games) => {
  //clear
  players.forEach(function (player){
    player.winCount = 0;
    player.lostCount = 0;
    player.pigCount = 0;
    player.crownCount = 0;
    player.total = 0;
    player.delta = 0;
  });

  games.forEach(function (game) {
 
    let score1 = game.score1;
    let score2 = game.score2;
    if( score1 < 0 || score2 < 0){
      return;
    }

    let delta = score1 - score2;

    let player1 = findPlayerById(players, game.player1);
    let player2 = findPlayerById(players, game.player2);
    let player3 = findPlayerById(players, game.player3);
    let player4 = findPlayerById(players, game.player4);
    
    player1.delta += delta;
    player2.delta += delta;
    player3.delta -= delta;
    player4.delta -= delta;

    player1.total += score1;
    player2.total += score1;
    player3.total += score2;
    player4.total += score2;

    if( delta > 0){
      player1.winCount++;
      player2.winCount++;
      player3.lostCount++;
      player4.lostCount++;
    } else if( delta < 0){ 
      player1.lostCount++;
      player2.lostCount++;
      player3.winCount++;
      player4.winCount++;
    } else {
      //draw game
    }
  });
}

//统计猪头和皇冠
statisticPigAndCrown = (players, matches, games) => {
  matches.forEach(function (match){

    let gameArray = getGamesInMatch(match, games);
    if( gameArray.length == 0){
      return;
    }
    //debug
    // if( gameArray.length != match.total){
    //   console.log("match: " + match.createDate);
    //   console.log("match.total: " + match.total);
    //   console.log("game array: " + gameArray.length);
    // }

    if( !isAllGamesDone(gameArray)){
      return;
    }
    let playersClone = JSON.parse(JSON.stringify(players));
    let playerArray = getPlayersInMatch(gameArray, playersClone);
    statisticWinAndLost(playerArray, gameArray);
    
    //sort
    playerArray.sort(comparePlayer);
    let first = playerArray[0];
    let last = playerArray[playerArray.length-1];
    let realFirst = findPlayerById(players, first._id);
    let realLast = findPlayerById(players,last._id);
    realFirst.crownCount++;
    realLast.pigCount++;
  });
}

isAllGamesDone = (games) => {
  let done = true;
  games.forEach(function (game) {
    if( done == false)
      return false;
    if((game.score1<0) || (games.score2<0)){
      done = false;
    }
  })
  return done;
}

//获取该比赛所有场次
getGamesInMatch = (match, games) =>{
  let gameArray = [];
  games.forEach(function (game) {
    if( game.matchid == match._id){
      gameArray.push(game);
    }
  });
  return gameArray;
}

//获取该比赛所有人员
getPlayersInMatch = (games, players) =>{
  let playerArray = [];
  games.forEach(function (game) {
    let fourPlayersId = [game.player1, game.player2, game.player3, game.player4]
    fourPlayersId.forEach(function (id){
      let already = findPlayerById(playerArray, id);
      if( already == null){
        let player = findPlayerById(players, id);
        playerArray.push(player);
      }
    });
  });
  return playerArray;
}

//根据玩家id查找
findPlayerById = ( players, id ) => { 
  return players.find(
    function( player, index){
      return player._id == id;
    }
  ); 
}

//按比分排序
comparePlayer = (player1, player2) => {
  //比较胜率
  let rate1 = Math.round((player1.winCount/(player1.winCount+player1.lostCount))*100)*100;
  let rate2 = Math.round((player2.winCount/(player2.winCount+player2.lostCount))*100)*100;
  if (isNaN(rate1) ){ 
    rate1 = 0;
  }
  if (isNaN(rate2) ){ 
    rate2 = 0;
  }
  if( rate1 != rate2){
    return rate2 - rate1;
  }

  //比较净胜分
  let delta1 = player1.delta;
  let delta2 = player2.delta;
  if( delta1 != delta2){
    return delta2 - delta1;
  }

  //比较总得分
  let total1 = player1.total;
  let total2 = player2.total;
  if( total1 != total2){
    return total2 - total1;
  }
}






