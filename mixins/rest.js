'use strict';

var Browser = require('nd-browser');
var Base = require('nd-base');
var RESTful = require('nd-restful');

var encode = window.encodeURIComponent;

var addParam = function(url, params, placeholder) {
  var arr = Object.keys(params).map(function(key) {
    return key + '=' + (placeholder ? '{' + key + '}' : encode(params[key]));
  }).join('&');

  if (!arr) {
    return url;
  }

  return url + (url.indexOf('?') !== -1 ? '&' : '?') + arr;
}

module.exports = function(util) {

  if (!util.DONE) {
    util.DONE = function(defer, data) {
      defer.resolve(data || {});
    };
  }

  if (!util.FAIL) {
    // 400 etc
    util.FAIL = function(defer, error, xhr) {
      if (xhr.status === 0) {
        defer.reject('请求被拒绝');
      } else if (xhr.status >= 400) {
        defer.reject('未知错误');
      } else {
        defer.reject(error);
      }
    };
  }

  if (!util.ALWAYS) {
    util.ALWAYS = function(defer) {
      util.progress.show(100);
      defer.always();
    };
  }

  var ajax = function(options) {
    var defer = util.$.Deferred();

    util.$.ajax({
      headers: options.headers,
      url: options.url,
      type: options.type,
      data: options.data,
      processData: options.processData,
      contentType: options.contentType
    })
    .done(function(data, status, xhr) {
      if (options.done) {
        options.done(defer, data, xhr);
      } else {
        defer.resolve(data);
      }
    })
    .fail(function(xhr, status, error) {
      if (options.fail) {
        options.fail(defer, error, xhr);
      } else {
        defer.reject(error);
      }
    })
    .always(function() {
      if (options.always) {
        options.always(defer);
      } else {
        defer.always();
      }
    });

    return defer.promise();
  };

  util.REST = Base.extend({
    Implements: [RESTful],

    attrs: {
      done: util.DONE,
      fail: util.FAIL,
      always: util.ALWAYS,
      module: null,
      baseUri: [],
      // 默认
      uriVar: 'id',
      data: {},
      vars: {},
      contentType: 'application/json'
    },

    request: function(options) {
      // 拷贝默认参数
      this._mergeOptions(options);

      // 事件通知
      this.trigger(options.type, options);

      // 判断是否需要访问代理
      this._checkDispatcher(options);

      // 处理参数
      this._handleOptions(options);

      // 处理访问代理
      this._handleDispatcher(options);

      // 处理直接访问
      this._handleFinally(options);

      if (!options.headers) {
        options.headers = {};
      }

      // disable cache
      if (!util.CACHE_ENABLED) {
        if (options.dispatcher) {
          options.headers[Browser.browser === 'IE' ? 'Pragma' : 'Cache-Control'] = 'no-cache';
        } else {
          // waf DOESN'T support cors Cache-Control header currently
          // would be REMOVED after waf updated
          options.url += options.url.indexOf('?') === -1 ? '?' : '&';
          options.url += '_=' + new Date().getTime();
        }
      }

      // proxy pass
      if (options.dispatcher) {
        options.headers.Dispatcher = options.dispatcher;
        options.headers.vorg = util.auth.getAuth('vorg');
      }

      // has uc tokens
      if (util.auth.isLogin()) {
        var matched = options.url.match(/^(?:https?:)?\/\/([^\/]+)(\/.+)$/i);
        options.headers.Authorization =
          util.auth.getAuthentization(
            options.type, matched[2], matched[1]
          );
      }

      util.progress.show();
      return ajax(options);
    },

    _checkDispatcher: function(options) {
      // 未开启代理
      if (!util.DISPATCHER_ENABLED) {
        return;
      }

      // 模拟环境下
      if (util.ENV === util.SIMULATION) {
        return;
      }

      var baseUri0 = options.baseUri[0];

      // 本地接口
      if (baseUri0 === util.LOC_ORIGIN) {
        return;
      }

      // 存在忽略名单
      if (util.DISPATCHER_IGNORE.indexOf(baseUri0) !== -1) {
        return;
      }

      options.dispatcher = true;
    },

    _handleOptions: function(options) {
      if (options.additional) {
        console.warn('不建议使用 additional 参数，将在后续版本移除');

        util.$.extend(options.data, options.additional);
        delete options.additional;
      }

      // 替换 URL 中的变量，如 {xxx}
      if (options.replacement) {
        console.warn('不建议使用 replacement 参数，请使用 vars');

        options.vars = options.replacement;
        delete options.replacement;
      }

      var url = [];

      // baseUri: Array
      if (options.baseUri) {
        url = url.concat(options.baseUri);
      }

      // additional uris: Array
      if (options.params) {
        console.warn('不建议使用 params 参数，将在后续版本移除');
        url = url.concat(options.params);
      }

      // uri: id | null | undefined
      if (options.uri || options.uri === 0) {
        url.push('{' + options.uriVar + '}');
        options.vars[options.uriVar] = options.uri;
      }

      // remove empty values
      options.url = url.filter(function(val) {
        return !!val;
      });
    },

    _handleDispatcher: function(options) {
      if (!options.dispatcher) {
        return;
      }

      // 开始设置 dispatcher
      var url = options.url;
      var api = url.slice(2).join('/');
      var vars = options.vars;
      var data = options.data;

      if (!/^POST|PATCH|PUT$/i.test(options.type)) {
        api = addParam(api, data, true);

        Object.keys(data).forEach(function(key) {
          vars[key] = data[key];
        });
      }

      if (vars) {
        for (var key in vars) {
          if (vars.hasOwnProperty(key)) {
            vars[key] = encode(vars[key]);
          }
        }
      }

      options.dispatcher = JSON.stringify({
        'protocol': url[0].match(/^(?:https?:)?\/\//i)[0],
        'host': url[0].replace(/^(?:https?:)?\/\//i, ''),
        'ver': url[1],
        'api': encode(api.replace(/#/g, '%23')),
        'var': vars,
        'module': this.get('module'),
        'vorg': util.auth.getAuth('vorg')
      });

      // 修改默认的地址
      url[0] = util.LOC_ORIGIN;
      url[1] = util.DISPATCHER_VERSION;
      url[2] = util.DISPATCHER_PREFIX + '/' + url[2];
    },

    _handleFinally: function(options) {
      var url = options.url.join('/');
      var vars = options.vars;
      var data = options.data;

      if (vars) {
        Object.keys(vars).forEach(function(key) {
          url = url.replace(new RegExp('{' + key + '}', 'img'), encode(vars[key]));
        });
      }

      // MUST BE A JSON
      if (/^POST|PATCH|PUT$/i.test(options.type)) {
        options.data = JSON.stringify(data);
        options.processData = false;
      } else {
        // GET
        url = addParam(url, data);
        // 防止 jQuery 自动拼接
        options.data = null;
      }

      options.url = url;
    },

    _mergeOptions: function(options) {
      var value;

      [
        'done', 'fail', 'always',
        'baseUri', 'module', 'uriVar',
        'uri', 'data', 'vars', 'contentType',
        'params', 'additional', 'replacement'
      ]
      .forEach(function(key) {
        if (!(key in options) && (value = this.get(key))) {
          if (Array.isArray(value)) {
            options[key] = value.slice();
          } else if (util.$.isPlainObject(value)) {
            options[key] = util.$.extend({}, value);
          } else {
            options[key] = value;
          }
        }
      }, this);
    }
  });

};
