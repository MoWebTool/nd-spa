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
    level: '7',
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

if (util.I18N_ENABLED) {
  MODULE_ROUTES.admin.folders.push({
    icon: 'lang',
    title: __('翻译管理'),
    // 格式：X，匹配 >=X
    // 格式：=X，匹配 =X
    // 格式：=X|=Y|api，或
    level: '9',
    routes: [{
      route: 'lang',
      title: __('翻译列表')
    }]
  });
}

if (util.RBAC_ENABLED) {
  MODULE_ROUTES.admin.folders.push({
    icon: 'service',
    title: __('服务管理'),
    level: '9',
    routes: [{
      route: 'service',
      title: __('服务列表')
    }]
  }, {
    icon: 'api',
    title: __('接口管理'),
    level: '9',
    routes: [{
      route: 'api',
      title: __('接口列表')
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
  });
}

module.exports = {
  MODULE_ROUTES: MODULE_ROUTES,
  HEADER_ROUTES: HEADER_ROUTES
};
