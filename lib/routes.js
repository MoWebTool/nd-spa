'use strict';

var __ = require('nd-i18n');

module.exports = {

  /**
   * @property {array} MODULE_ROUTES 各模块路由
   */
  MODULE_ROUTES: {
    admin: {
      icon: 'admin',
      name: 'admin',
      title: __('系统管理'),
      level: '7',
      folders: [{
        icon: 'devops',
        title: __('运维管理'),
        // 格式：X，匹配 >=X
        // 格式：=X，匹配 =X
        // 格式：=X|=Y|api，或
        level: '9',
        routes: [{
          route: 'role',
          title: __('角色列表')
        }, {
          route: 'service',
          title: __('服务列表')
        }, {
          route: 'api',
          title: __('接口列表')
        }, {
          route: 'lang',
          title: __('翻译列表')
        }]
      }, {
        icon: 'role',
        title: __('角色管理'),
        level: '8',
        routes: [{
          route: 'role',
          title: __('角色列表')
        }]
      }, {
        icon: 'log',
        title: __('日志管理'),
        level: '8',
        routes: [{
          route: 'log',
          title: __('日志列表')
        }]
      }]
    }
  },

  /**
   * @property {array} HEADER_ROUTES 顶部路由
   */
  HEADER_ROUTES: [{
    route: 'logout',
    title: __('退出')
  }]

};
