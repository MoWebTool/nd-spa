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
    }

    // loading
    // util.$('#main').removeClass('route-loading');

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

  route.mount({
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
    notfound: function() {
      util.redirect('error/404');
    }
  });

  route.init();

};
