'use strict';

var __ = require('nd-i18n');

var util = require('../index');

/**
 * @constant {array} MODULE_ROUTES 各模块路由
 */
var MODULE_ROUTES = {
  admin: {
    icon: 'admin',
    name: 'admin',
    title: __('系统管理'),
    folders: []
  }
};

/**
 * @constant {array} HEADER_ROUTES 顶部路由
 */
var HEADER_ROUTES = [{
  route: 'logout',
  title: __('退出')
}];

if (util.RBAC_ENABLED) {
  MODULE_ROUTES.admin.folders.push({
    icon: 'role',
    title: __('角色管理'),
    routes: [{
      route: 'role',
      title: __('角色列表'),
      // 用于权限控制
      level: '=9|=8'
    }]
  }, {
    icon: 'api',
    title: __('接口管理'),
    routes: [{
      route: 'api',
      title: __('接口列表'),
      // 用于权限控制
      level: '=9'
    }]
  }, {
    icon: 'log',
    title: __('日志管理'),
    routes: [{
      route: 'log',
      title: __('日志列表'),
      // 用于权限控制
      level: '=9|=8'
    }]
  });
}

if (util.I18N_ENABLED) {
  MODULE_ROUTES.admin.folders.push({
    icon: 'lang',
    title: __('翻译管理'),
    routes: [{
      route: 'lang',
      title: __('翻译列表'),
      level: '=9|=8'
    }]
  });
}

module.exports = {
  MODULE_ROUTES: MODULE_ROUTES,
  HEADER_ROUTES: HEADER_ROUTES
}
