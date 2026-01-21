export default {
  pages: [
    'pages/login/index',
    'pages/clubs/list',
    'pages/clubs/create',
    'pages/clubs/detail',
    'pages/matches/list',
    'pages/matches/detail',
    'pages/players/list',
    'pages/players/detail'
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
        pagePath: 'pages/clubs/list',
        iconPath: 'assets/images/match-list.png',
        selectedIconPath: 'assets/images/match-list-selected.png',
        text: '俱乐部'
      },
      {
        pagePath: 'pages/matches/list',
        iconPath: 'assets/images/match-list.png',
        selectedIconPath: 'assets/images/match-list-selected.png',
        text: '比赛'
      }
    ]
  }
}

