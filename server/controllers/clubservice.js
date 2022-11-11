// 云函数入口函数
exports.main = async (request, result) => {
  // const wxContext = context;// cloud.getWXContext()
  let event = request.query;
  
  console.log(event);
  // console.log(cloud.DYNAMIC_CURRENT_ENV);

  let action = event.action;
  // console.log("action: " + action);
  let data;
  if (action == 'join') {
    data = await joinClub( wxContext, event);
  } else if (action == 'list') {
    let private = await listPrivateClub( wxContext );
    // let public = await listPublicClub( wxContext );
    data = {
      private, //public
    }
  } else if (action == 'create') {
    data = await createClub(wxContext, event.info, event.userInfo);
  } else if (action == 'update') {
    data = await updateClub(wxContext, event.info, event.userInfo);
  } else if( action == 'statis') {
     data = await statisUserInClub(event.clubid, event.date, event.minMatchCount);
  } else if ( action == 'info') {
    data = await getClubInfo(event.clubid);
  } else if ( action == 'listByOwner') {
    data = await listOwnClub(wxContext);
  } else if ( action == 'search') {
    data = await searchClub(event.keyword);
  } else if ( action == 'checkMatchCount') {
    data = await checkMatchCount(event.clubid);
  } else if ( action == 'incMatchCountAllow'){
    data = await incMatchCountAllow(event.clubid);
  }

  return {
    data,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

//查找包含关键字的俱乐部
searchClub = async (keyword) => {
  let regex = '.*' + keyword;
  return await db.collection('clubs')
    .aggregate()
    .project({
      wholeName: true,
      shortName: true,
      public: true,
      length: $.strLenBytes( '$password'),
      full: $.concat(['$shortName', ' ', '$wholeName'])
    })
    .project({
      wholeName: true,
      shortName: true,
      public: true,
      locked: $.gt(['$length', 0]),
      full: true,
    })
    .match({
      full: {
        $regex: regex
      },
      public: _.neq(false),
    })
    .project({
      public:false,
      full: false,
    })
    .end()
    .then(async res => {
      console.log(res);
      return res.list;
    });
}
