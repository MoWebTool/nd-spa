'use strict';

var Router = require('nd-router');

module.exports = function(util) {

  var isLogin = util.auth.isLogin();
  var decode = window.decodeURIComponent;

  function convertQuery(params, sep) {
    var obj = {};

    if (sep === '!') {
      // OLD AND NEW STYLE.
      obj.params = params;
    } else {
      // FUTURE STYLE.
      params.split('&').forEach(function(pair) {
        pair = pair.split('=');
        obj[decode(pair[0])] = decode(pair[1]);
      });
    }

    return obj;
  }

  function convertObj(obj) {
    // filter sub routes: {id}/{act}
    var matched = obj.app.match(/^(.+)\/([-0-9a-f]+)\/([a-z]+)$/);

    if (matched) {
      obj.app = matched[1];
      obj.sub = {
        id: matched[2],
        act: matched[3]
      };
    }

    if (obj.params) {
      obj.params = convertQuery(obj.params, obj.sep);
    }

    return obj;
  }

  // 更新侧栏
  function updateAside(index) {
    setTimeout(util.layout.render, 0, 'aside', index);
  }

  function startup(obj) {
    var _isLogin = util.auth.isLogin();

    // 登录状态变化
    if (isLogin !== _isLogin) {
      isLogin = _isLogin;

      // 重新渲染
      util.layout.render();
    } else if (_isLogin && obj.app === 'login') {
      util.layout.render(null, null, (isLogin = false));
    }

    util.use(obj);
  }

  var route = util.route = new Router();

  var timeout;

  util.redirect = function(value) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(route.setRoute.bind(route), 80, value);
  };

  util.getPath = function() {
    return route.getRoute().join(route.delimiter);
  };

  // 阻止下一次跳转生效
  var cancelNext;
  var lastRoute;
  var nextRoute;
  var currRoute = util.getPath();

  util.goLast = function() {
    if (lastRoute) {
      util.redirect(lastRoute);
    }
  };

  util.goNext = function(yes) {

    if (!yes) {
      cancelNext = null;
      nextRoute = null;
    }

    if (nextRoute) {
      cancelNext = false;
      util.redirect(nextRoute);
      nextRoute = null;
    }
  };

  route.mount({
    // /#/login?auth={auth}&vorg={vorg}
    '([^!?]+)?([!?])?(.+)?': function(app, sep, params) {
      // 处理首页
      if (typeof app ==='undefined') {
        // 已登录
        if (util.auth.isLogin()) {
          // 如果是首页，跳转到 home
          if (!util.route.getRoute(0)) {
            util.redirect('home');
            return false;
          }
        } else {
          // 如果不是 login，跳转到 login
          if (util.route.getRoute(0).indexOf('login') !== 0) {
            util.redirect('login');
            return false;
          }
        }
      }

      var obj = convertObj({
        app: app,
        sep: sep,
        params: params
      });

      // 处理阻止跳转
      if (cancelNext === false) {
        // if (nextRoute !== currRoute) {
          // 重置，以免下次无效
          cancelNext = null;
          // 强制回收
          util.recycle({
            app: lastRoute
          }, true);
        // }
      } else if (util.recycle(obj) === false) {
        if (lastRoute) {
          cancelNext = true;

          if (!nextRoute) {
            nextRoute = util.getPath();
          } else if (lastRoute !== currRoute) {
            nextRoute = currRoute;
          }

          util.goLast();
        }

        return false;
      }

      if (cancelNext) {
        // return (cancelNext = false);
        return;
      }

      if (util.auth.isLogin()) {
        if (obj.app === 'login' && !obj.params) {
          util.redirect('home');
          return false;
        }
      } else {
        if (obj.app !== 'login' && obj.app !== 'logout') {
          util.redirect('login');
          return false;
        }
      }

      updateAside(obj.app);

      // aside
      if (!/^\d+$/.test(obj.app)) {
        startup(obj);
      }
    }
  });

  route.configure({
    recurse: 'forward',
    after: function() {
      if (!cancelNext) {
        if (isNaN(currRoute)) {
          lastRoute = currRoute;
        }
      }
      currRoute = util.getPath();
    },
    notfound: function() {
      util.redirect('error/404');
    }
  });

  route.init('/');

};
