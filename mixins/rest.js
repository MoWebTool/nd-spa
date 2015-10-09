'use strict';

var Browser = require('nd-browser');
var Base = require('nd-base');
var RESTful = require('nd-restful');
var ajax = require('nd-ajax');

module.exports = function(util) {

  function addParam(url, params) {
    var arr = Object.keys(params).map(function(key) {
      return key + '=' + params[key];
    }).join('&');

    if (!arr) {
      return url;
    }

    return url + (url.indexOf('?') !== -1 ? '&' : '?') + arr;
  }

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

  util.REST = Base.extend({
    Implements: [RESTful],

    attrs: {
      done: util.DONE,
      fail: util.FAIL,
      always: util.ALWAYS,
      module: null,
      baseUri: [],
      // 默认
      uriVar: 'id'
    },

    request: function(options) {
      var dispatcher = this._dispatch(options);

      util.progress.show();

      return ajax(function(data) {
        if (!data.url) {
          return data;
        }

        if (!data.headers) {
          data.headers = {};
        }

        // disable cache
        if (!util.CACHE_ENABLED) {
          if (dispatcher) {
            data.headers[Browser.browser === 'IE' ? 'Pragma' : 'Cache-Control'] = 'no-cache';
          } else {
            // waf DOESN'T support cors Cache-Control header currently
            // would be REMOVED after waf updated
            data.url += data.url.indexOf('?') === -1 ? '?' : '&';
            data.url += '_=' + new Date().getTime();
          }
        }

        // proxy pass
        if (dispatcher) {
          data.headers.Dispatcher = dispatcher;
        }

        // has uc tokens
        if (util.auth.isLogin()) {
          var matched = data.url.match(/^(?:https?:)?\/\/([^\/]+)(\/.+)$/i);
          data.headers.Authorization =
            util.auth.getAuthentization(
              data.type, matched[2], matched[1]
            );
        }

        return data;
      })(options);
    },

    _dispatch: function(options) {
      // 拷贝默认参数
      this._mergeOpt(options);

      // 未开启代理
      if (!util.DISPATCHER_ENABLED) {
        return;
      }

      // 模拟环境下
      if (util.ENV === util.SIMULATION) {
        return;
      }

      var baseUri = options.baseUri;

      // 存在白名单
      if (util.DISPATCHER_WHITELIST) {
        // 不在白名单
        if (util.DISPATCHER_WHITELIST.indexOf(baseUri[0]) === -1) {
          return;
        }
      } else {
        // 本地接口
        if (baseUri[0] === util.LOC_ORIGIN) {
          return;
        }
      }

      // 开始设置 dispatcher

      var api = ['', baseUri[2]];
      var uriVar;
      var replacement = options.replacement;

      // additional uris: Array
      if (options.params) {
        api = api.concat(options.params);
      }

      if (options.uri) {
        uriVar = this.get('uriVar');

        api.push('{' + uriVar + '}');

        if (!replacement) {
          replacement = {};
        }

        replacement[uriVar] = options.uri;
      }

      if(options.replacement) {
        for (var key in options.replacement) {
          options.replacement[key] = encodeURIComponent(options.replacement[key]);
        }
      }

      api = api.join('/');

      if (options.data && !/^POST|PATCH|PUT$/i.test(options.type)) {
        api = addParam(api, options.data);
      }

      if (options.additional) {
        api = addParam(api, options.additional);
      }

      var dispatcher = JSON.stringify({
        'host': baseUri[0].replace(/^(?:https?:)?\/\//i, ''),
        'ver': baseUri[1],
        'api': encodeURIComponent(api),
        'var': replacement,
        'module': this.get('module')
      });

      baseUri[0] = util.LOC_ORIGIN;
      baseUri[1] = util.DISPATCHER_VERSION;
      baseUri[2] = util.DISPATCHER_PREFIX + '/' + baseUri[2];

      return dispatcher;
    },

    _mergeOpt: function(options) {
      var value;

      [
        'done', 'fail', 'always',
        'baseUri', 'module', 'uriVar',
        'uri', 'data',
        'params', 'additional', 'replacement'
      ]
      .forEach(function(key) {
        if (!(key in options) && (value = this.get(key))) {
          options[key] = Array.isArray(value) ? value.slice() : value;
        }
      }, this);
    }
  });

};
