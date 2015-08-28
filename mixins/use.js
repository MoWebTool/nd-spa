'use strict';

module.exports = function(util) {

  var routes;

  function checkInit() {
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
    checkInit();
    return !routes.hasOwnProperty(entry) || util.auth.hasAuth(routes[entry][0], routes[entry][1]);
  }

  // app/**/index 提供的回收函数
  // route 切换前执行以回收内存
  var recycle;

  util.use = function(id, params) {
    // GC
    if (typeof recycle === 'function') {
      recycle();
      recycle = null;
    }

    // just for /index.js currently
    if (typeof id === 'function') {
      recycle = id(util);
    } else {
      //判断页面权限
      if (!hasAuth(id)) {
        util.redirect('error/403');
      } else {
        util.progress.show();
        window.seajs.use('app/' + id + '/index.js', function(bootstrap) {
          recycle = bootstrap(util, params);
          util.progress.show(100);
        });
      }
    }
  };

  window.seajs.on('error', function() {
    util.redirect('error/404');
  });

};
