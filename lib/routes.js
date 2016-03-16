'use strict'

module.exports = {

  /**
   * @property {array} MODULE_ROUTES 各模块路由
   */
  MODULE_ROUTES: {
    admin: {
      icon: 'admin',
      name: 'admin',
      title: '系统管理',
      level: '7',
      folders: [{
        icon: 'devops',
        title: '运维管理',
        // 格式：X，匹配 >=X
        // 格式：=X，匹配 =X
        // 格式：=X|=Y|api，或
        level: '9',
        routes: [{
          route: 'devops/role',
          title: '角色列表'
        }, {
          route: 'devops/service',
          title: '服务列表'
        }, {
          route: 'devops/api',
          title: '接口列表'
        }, {
          route: 'devops/lang',
          title: '翻译列表'
        }]
      }],
      routes: [{
        icon: 'role',
        route: 'role',
        title: '权限管理'
      }, {
        icon: 'log',
        route: 'log',
        title: '日志管理'
      }]
    }
  },

  /**
   * @property {array} HEADER_ROUTES 顶部路由
   */
  HEADER_ROUTES: [{
    route: 'logout',
    title: '退出'
  }]

}
