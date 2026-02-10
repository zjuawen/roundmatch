export default {
  pages: [
    'pages/login/index',
    'pages/clubs/list',
    'pages/clubs/create',
    'pages/clubs/detail',
    'pages/clubs/public-list',
    'pages/matches/list',
    'pages/matches/detail',
    'pages/players/list',
    'pages/players/detail',
    'pages/profile/index',
    'pages/profile/edit'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F6F6F6',
    navigationBarTitleText: '八人转',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F6F6F6'
  },
  tabBar: {
    color: '#7A7E83',
    selectedColor: '#3cc51f',
    borderStyle: 'black',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/matches/list',
        iconPath: 'assets/images/match-list.png',
        selectedIconPath: 'assets/images/match-list-selected.png',
        text: '比赛'
      },
      {
        pagePath: 'pages/profile/index',
        iconPath: 'assets/images/match-list.png',
        selectedIconPath: 'assets/images/match-list-selected.png',
        text: '个人中心'
      }
    ]
  }
}

