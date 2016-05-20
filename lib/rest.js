'use strict'

var $ = require('nd-jquery')
var Browser = require('nd-browser')
var Base = require('nd-base')
var RESTful = require('nd-restful')

var util = require('../index')
var auth = require('./auth')
var ajax = require('./ajax')
var progress = require('./progress')

var encode = window.encodeURIComponent

var addParam = function(url, params, placeholder) {
  var arr = Object.keys(params).map(function(key) {
    return key + '=' + (placeholder ? '{' + key + '}' : encode(params[key]))
  }).join('&')

  if (!arr) {
    return url
  }

  return url + (url.indexOf('?') !== -1 ? '&' : '?') + arr
}

module.exports = Base.extend({
  Implements: [RESTful],

  attrs: {
    module: null,
    baseUri: null,
    // 默认
    uriVar: 'id',
    data: {},
    vars: {},
    headers: {
      'Content-Type': 'application/json'
    }
  },

  request: function(options) {
    // 拷贝默认参数
    this._mergeOptions(options)

    // 事件通知
    this.trigger(options.type, options)

    // 判断是否需要访问代理
    this._checkDispatcher(options)

    // 处理参数
    this._handleOptions(options)

    // 处理访问代理
    this._handleDispatcher(options)

    // 处理直接访问
    this._handleFinally(options)

    if (!options.headers) {
      options.headers = {}
    }

    // disable cache
    if (!util.CACHE_ENABLED) {
      if (options.dispatcher) {
        options.headers[Browser.browser === 'IE' ? 'Pragma' : 'Cache-Control'] = 'no-cache'
      } else {
        // waf DOESN'T support cors Cache-Control header currently
        // would be REMOVED after waf updated
        options.url += options.url.indexOf('?') === -1 ? '?' : '&'
        options.url += '_=' + new Date().getTime()
      }
    }

    var vorg = auth.getAuth('vorg')

    if (vorg) {
      options.headers.vorg = vorg
    }

    // proxy pass
    if (options.dispatcher) {
      options.headers.Dispatcher = options.dispatcher
    }

    // has uc tokens
    if (auth.isLogin()) {
      var matched = options.url.match(/^(?:https?:)?\/\/([^\/]+)(\/.+)$/i)
      options.headers.Authorization =
        auth.getAuthentization(
          options.type, matched[2], matched[1]
        )
    }

    progress.show()
    return ajax(options).finally(function() {
      progress.show(100)
    })
  },

  _checkDispatcher: function(options) {
    // 模拟环境下
    if (util.ENV === util.SIMULATION) {
      return
    }

    var baseUri0 = options.baseUri[0]

    // 本地接口
    if (baseUri0 === util.LOC_ORIGIN) {
      return
    }

    // 存在忽略名单
    if (util.DISPATCHER_IGNORE.indexOf(baseUri0) !== -1) {
      return
    }

    options.dispatcher = true
  },

  _handleOptions: function(options) {
    if (options.replacement) {
      throw new Error('不再支持 replacement 参数，请使用 vars')
    }

    if (options.additional || options.params) {
      throw new Error('不再支持 additional/params 参数，请移除')
    }

    var url = []

    // baseUri: Array
    if (options.baseUri) {
      url = url.concat(options.baseUri)
    }

    // uri: id | null | undefined
    if (options.uri || options.uri === 0) {
      var uriVar = '{' + options.uriVar + '}'
      var needPush = true
      url = url.map(function(urlItem){
        if(urlItem.indexOf('?') !== -1) {
          urlItem = urlItem.replace('?','/'+uriVar+'?')
          needPush = false
        }
        return urlItem
      })
      if(needPush) {
        url.push('{' + options.uriVar + '}')
      }
      options.vars[options.uriVar] = options.uri
    }

    // remove empty values
    options.url = url.filter(function(val) {
      return !!val
    })
  },

  _handleDispatcher: function(options) {
    if (!options.dispatcher) {
      return
    }

    // 开始设置 dispatcher
    var url = options.url
    var api = '/' + url.slice(2).join('/')
    var vars = options.vars
    var data = options.data

    if (!/^POST|PATCH|PUT$/i.test(options.type)) {
      api = addParam(api, data, true)

      Object.keys(data).forEach(function(key) {
        vars[key] = data[key]
      })
    }

    if (vars) {
      for (var key in vars) {
        if (vars.hasOwnProperty(key)) {
          vars[key] = encode(vars[key])
        }
      }
    }

    var dispatcher = {
      'protocol': url[0].match(/^(?:https?:)?\/\//i)[0],
      'host': url[0].replace(/^(?:https?:)?\/\//i, ''),
      'ver': url[1],
      'api': encode(api.replace(/#/g, '%23')),
      'vars': vars,
      'module': this.get('module')
    }

    var vorg = auth.getAuth('vorg')

    if (vorg) {
      dispatcher.header = {
        vorg: vorg
      }
    }

    options.dispatcher = JSON.stringify(dispatcher)

    // 修改默认的地址
    url[0] = util.LOC_ORIGIN
    url[1] = util.DISPATCHER_VERSION
    url[2] = util.DISPATCHER_PREFIX + '/' + url[2]
  },

  _handleFinally: function(options) {
    var url = options.url.join('/')
    var vars = options.vars
    var data = options.data

    if (vars) {
      Object.keys(vars).forEach(function(key) {
        url = url.replace(new RegExp('{' + key.replace(/\$/g, '\\$') + '}', 'img'), encode(vars[key]))
      })
    }

    // MUST BE A JSON
    if (/^POST|PATCH|PUT$/i.test(options.type)) {
      options.data = JSON.stringify(data)
      options.processData = false
    } else {
      // GET
      url = addParam(url, data)
      // 防止 jQuery 自动拼接
      options.data = null
    }

    options.url = url
  },

  _mergeOptions: function(options) {
    var value;

    [
      'baseUri', 'module', 'uriVar',
      'uri', 'data', 'vars', 'headers'
    ]
    .forEach(function(key) {
      if ((value = this.get(key))) {
        if (Array.isArray(value)) {
          options[key] = value.slice()
        } else if ($.isPlainObject(value)) {
          options[key] = $.extend({}, value, options[key])
        } else if (!(key in options)) {
          options[key] = value
        }
      }
    }, this)
  }
})
