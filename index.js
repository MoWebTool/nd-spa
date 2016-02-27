'use strict';

var $ = require('nd-jquery');

// fix https://github.com/jquery/jquery/issues/1684
$.ajaxSetup({
  xhr: function() {
    try {
      return new window.XMLHttpRequest();
    } catch (e) {}
  }
});

var util = module.exports = {

  APP_NAME: window.APP_NAME,
  APP_VERSION: window.APP_VERSION,
  APP_AUTHOR: window.APP_AUTHOR,
  APP_TIMESTAMP: window.APP_TIMESTAMP,
  APP_DESCRIPTION: window.APP_DESCRIPTION,

  // 框架版本
  APP_CORE: '3.0.0',

  // 本地模拟
  SIMULATION: 0,
  // 开发
  DEVELOPMENT: 1,
  // 测试
  DEBUG: 2,
  // 生产
  PRODUCTION: 4,
  // 预生产
  PREPRODUCTION: 8,
  // 压测
  PRESSURE: 16,
  // 亚马逊
  AWS: 32,
  // 党员 E 家
  DYEJIA: 64,

  LOC_PROTOCOL: location.protocol,
  LOC_HOST: location.host,
  // host === hostname:port
  LOC_HOSTNAME: location.hostname,
  LOC_PORT: location.port,
  LOC_ORIGIN: location.protocol + '//' + location.host,

  /**
   * @constant {boolean} 开启接口请求缓存（浏览器机制）
   */
  CACHE_ENABLED: false,

  /**
   * @constant {boolean} 开启基于角色的权限控制
   */
  RBAC_ENABLED: true,

  /**
   * @constant {boolean} 开启多语言支持
   */
  I18N_ENABLED: true,

  /**
   * @constant {boolean} 启用接口请求代理
   */
  DISPATCHER_ENABLED: true,

  /**
   * @constant {boolean} 接口请求代理版本
   */
  DISPATCHER_VERSION: 'v0.1',

  /**
   * @constant {boolean} 接口请求代理前缀
   */
  DISPATCHER_PREFIX: 'dispatcher',

  /**
   * @constant {boolean} 请求代理黑名单
   */
  DISPATCHER_IGNORE: [],

  /**
   * @constant {string} DATETIME_FORMAT 默认的时间日期格式
   */
  DATETIME_FORMAT: 'yyyy-MM-dd hh:mm:ss',

  /**
   * @constant {string} DATE_FORMAT 默认的日期格式
   */
  DATE_FORMAT: 'yyyy-MM-dd',

  /**
   * @constant {string} TIME_FORMAT 默认的时间格式
   */
  TIME_FORMAT: 'hh:mm:ss',

  /**
   * @constant {string} TOAST_DURATION 默认提示信息显示毫秒数
   */
  TOAST_DURATION: 3000

};

/**
 * @constant {string} ENV
 */
util.ENV = (function() {
  if (window.ENV && util.hasOwnProperty(window.ENV)) {
    return util[window.ENV];
  }

  switch (util.LOC_HOSTNAME) {
    case '127.0.0.1':
      return util.SIMULATION;
    case 'localhost':
      return util.PRODUCTION;
    default:
      if (/\.dev\.web\.nd$/.test(util.LOC_HOSTNAME)) {
        return util.DEVELOPMENT;
      }
      if (/\.debug\.web\.nd$/.test(util.LOC_HOSTNAME)) {
        return util.DEBUG;
      }
      if (/\.qa\.web\.sdp\.101\.com$/.test(util.LOC_HOSTNAME)) {
        return util.PRESSURE;
      }
      if (/\.beta\.web\.sdp\.101\.com$/.test(util.LOC_HOSTNAME)) {
        return util.PREPRODUCTION;
      }
      if (/\.aws\.101\.com$/.test(util.LOC_HOSTNAME)) {
        return util.AWS;
      }
      if (/\.dyejia\.cn$/.test(util.LOC_HOSTNAME)) {
        return util.DYEJIA;
      }
      return util.PRODUCTION;
  }
})();

var debug = require('nd-debug');
var Message = require('nd-message');

/*jshint maxparams:4*/
function render(msg, cb, ms, level) {
  if (typeof cb === 'number') {
    ms = cb;
    cb = null;
  }

  return new Message({
    parentNode: '#msgbox',
    model: {
      msg: msg,
      close: cb,
      timeout: ms || util.TOAST_DURATION,
      level: level
    }
  }).render();
}

var _debug = {

  log: function() {
    if (util.ENV !== 'PRODUCTION') {
      console.log.apply(null, arguments);
    }
  },

  warn: function(msg, cb, ms) {
    return render(msg, cb, ms, 'warning');
  },

  error: function(msg, cb, ms) {
    return render(msg, cb, ms, 'danger');
  },

  info: function(msg, cb, ms) {
    return render(msg, cb, ms, 'info');
  },

  success: function(msg, cb, ms) {
    return render(msg, cb, ms, 'success');
  }

};

// take care of debug
debug.log = _debug.log;
debug.warn = _debug.warn;
debug.error = _debug.error;
debug.info = _debug.info;
debug.success = _debug.success;
