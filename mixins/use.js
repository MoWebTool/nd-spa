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

  // 当前
  var currentInstance;
  var currentApp;

  // app/**/index 提供的回收函数
  // route 切换前执行以回收内存
  var destroy;

  // GC
  util.recycle = function(obj, force) {
    var returned;

    // 如果下一个等于当前
    // if (obj.app === currentApp/* && obj.sub*/) {
    //   // 如果不是强制销毁，则退出
    //   if (force !== true) {
    //     return;
    //   }
    // }

    if (typeof destroy === 'function') {
      returned = destroy(force);
      // 如果不阻止销毁，则销毁销毁函数
      (returned !== false) && (destroy = null);
    }

    return force ? force : returned;
  };

  util.use = function(obj) {
    //判断页面权限
    if (!hasAuth(obj.app)) {
      util.redirect('error/403');
    } else {
      if (currentInstance && currentApp === obj.app && obj.sub) {
        currentInstance.set('sub', obj.sub);
        return;
      }
      util.progress.show();
      window.seajs.use('app/' + obj.app + '/index.js', function(bootstrap) {
        var ret = bootstrap(util, obj.params, obj.sub);

        if (typeof ret === 'function') {
          destroy = ret;
          currentInstance = null;
        } else if (ret) {
          destroy = ret.destroy;
          currentInstance = ret.instance;
        }

        currentApp = obj.app;

        util.progress.show(100);
      });
    }
  };

  window.seajs.on('error', function() {
    util.redirect('error/404');
  });

};
