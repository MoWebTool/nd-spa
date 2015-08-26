'use strict';

module.exports = function(util) {

  var routes = util.ROUTES.ASIDE
    .map(function(route) {
      return route.routes;
    })
    .reduce(function(route1, route2) {
      return route1.concat(route2);
    });

  function hasAuth(entry) {
    entry = routes.filter(function(route) {
      return route.route === entry;
    });

    return !entry.length || util.auth.hasAuth(entry[0].level, entry[0].module);
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
