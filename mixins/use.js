'use strict';

module.exports = function(util) {

  var routes;

  function initRoutes() {
    if (routes) {
      return;
    }

    routes = {};

    Object.keys(util.ROUTES)
      .reduce(function(a, b) {
        return util.ROUTES[a].concat(util.ROUTES[b]);
      })
      .map(function(r) {
        return r.routes || [r];
      })
      .reduce(function(a, b) {
        return (a.routes || a).concat(b.routes || b);
      })
      .forEach(function(r) {
        if (r.hasOwnProperty('level')) {
          routes[r.route] = [r.level, r.module];
        }
      });
  }

  function hasAuth(entry) {
    initRoutes();
    return !routes.hasOwnProperty(entry) || util.auth.hasAuth(routes[entry][0], routes[entry][1]);
  }

  // app/**/index 提供的回收函数
  // route 切换前执行以回收内存
  var destroy;

  // GC
  util.recycle = function() {
    var returned;

    if (typeof destroy === 'function') {
      // 当前阻止销毁
      returned = destroy();
      returned !== false && (destroy = null);
    }

    return returned;
  };

  util.use = function(id, params) {
    //判断页面权限
    if (!hasAuth(id)) {
      util.redirect('error/403');
    } else {
      util.progress.show();
      window.seajs.use('app/' + id + '/index.js', function(bootstrap) {
        destroy = bootstrap(util, params);
        util.progress.show(100);
      });
    }
  };

  window.seajs.on('error', function() {
    util.redirect('error/404');
  });

};
