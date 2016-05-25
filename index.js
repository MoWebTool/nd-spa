'use strict'

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
  // 压测
  PRESSURE: 3,
  // 预生产
  PREPRODUCTION: 4,
  // 生产
  PRODUCTION: 5,
  // 亚马逊
  AWS: 6,
  // 党员 E 家
  DYEJIA: 7,

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

}

/**
 * @constant {string} ENV
 */
util.ENV = (function() {
  var env = window.ENV
  if (env && util.hasOwnProperty(env)) {
    return util[env]
  }

  var loc = util.LOC_HOSTNAME

  switch (loc) {
    case '127.0.0.1':
    case 'localhost':
      return util.DEVELOPMENT
    default:
      if (/\.dev\.web\.nd$/.test(loc)) {
        return util.DEVELOPMENT
      }
      if (/\.debug\.web\.nd$/.test(loc)) {
        return util.DEBUG
      }
      if (/\.qa\.web\.sdp\.101\.com$/.test(loc)) {
        return util.PRESSURE
      }
      if (/\.beta\.web\.sdp\.101\.com$/.test(loc)) {
        return util.PREPRODUCTION
      }
      if (/\.aws\.101\.com$/.test(loc)) {
        return util.AWS
      }
      if (/\.dyejia\.cn$/.test(loc)) {
        return util.DYEJIA
      }
      return util.PRODUCTION
  }
})()

var debug = require('nd-debug')
var Message = require('nd-message')

/* eslint max-params: [2, 4]*/
function render(msg, cb, ms, level) {
  if (typeof cb === 'number') {
    ms = cb
    cb = null
  }

  if (typeof msg === 'string') {
    msg = {
      brief: msg
    }
  } else {
    if (msg.detail === msg.brief) {
      delete msg.detail
    }
  }

  return new Message({
    parentNode: '#msgbox',
    model: {
      msg: msg,
      close: cb,
      timeout: ms || util.TOAST_DURATION,
      level: level
    }
  }).render()
}

// take care of debug
debug.log = function() {
  if (util.ENV !== 'PRODUCTION') {
    console.log.apply(console, arguments)
  }
}

debug.warn = function(msg, cb, ms) {
  return render(msg, cb, ms, 'warning')
}

debug.error = function(msg, cb, ms) {
  return render(msg, cb, ms, 'danger')
}

debug.info = function(msg, cb, ms) {
  return render(msg, cb, ms, 'info')
}

debug.success = function(msg, cb, ms) {
  return render(msg, cb, ms, 'success')
}
