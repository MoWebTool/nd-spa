'use strict';

var Router = require('nd-router');

module.exports = function(util) {

  var isLogin = util.auth.isLogin();

  function updateSidebar(id) {
    setTimeout(util.layout.render, 0, 'aside', id);
  }

  function startup(id, params) {
    var _isLogin = util.auth.isLogin();

    // 登录状态变化
    if (isLogin !== _isLogin) {
      isLogin = _isLogin;

      // 重新渲染
      util.layout.render();
    } else if (_isLogin && id === 'login') {
      util.layout.render(null, null, (isLogin = false));
    }

    util.use(id, params);
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

  util.goNext = function(clear) {
    if (clear) {
      nextRoute = null;
    }

    if (nextRoute) {
      cancelNext = false;
      util.redirect(nextRoute);
      nextRoute = null;
    }
  };

  route.mount({
    '': function(id) {
      if (typeof id ==='undefined') {
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

      if (util.recycle() === false) {
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
        return (cancelNext = false);
      }
    },
    '([^!]+)[!]?(.+)?': function(id, params) {
      if (util.auth.isLogin()) {
        if (id === 'login' && !params) {
          util.redirect('home');
          return false;
        }
      } else {
        if (id !== 'login' && id !== 'logout') {
          util.redirect('login');
          return false;
        }
      }
    }
  });

  route.configure({
    recurse : 'forward',
    before: function(id) {
      // 纯数字，左侧分类切换
      if (!isNaN(id)) {
        updateSidebar(id);
        // prevent on
        return false;
      }
    },
    on: function(id, params) {
      startup(id, params);
      updateSidebar(id);
    },
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
