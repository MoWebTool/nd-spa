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

  function isValidHandler(obj) {
    if (!obj) {
      return false;
    }

    if (typeof obj === 'function') {
      return true;
    }

    if (!obj.destroy) {
      return false;
    }

    return true;
  }

  // 当前
  var appHandler;

  // GC
  util.recycle = function(obj, force) {
    var returned;

    if (appHandler) {
      if (!appHandler.isReady()) {
        util.progress.show();
        return false;
      }

      returned = appHandler.destroy(force);
      // 如果不阻止销毁，则销毁销毁函数
      (returned !== false) && (appHandler = null);
    }

    return force ? force : returned;
  };

  util.use = function(obj) {
    //判断页面权限
    if (!hasAuth(obj.app)) {
      util.redirect('error/403');
    } else {
      var instance;

      if (appHandler) {
        if (appHandler.appId === obj.app && obj.sub) {
          instance = appHandler.getInstance();
          if (instance) {
            return instance.set('sub', obj.sub);
          }
        }
      }

      util.progress.show();
      window.seajs.use('app/' + obj.app + '/index.js', function(bootstrap) {
        appHandler = bootstrap(util, obj.params, obj.sub);

        if (!isValidHandler(appHandler)) {
          throw new Error('`app/**/index.js` must return a function or object');
        }

        if (typeof appHandler === 'function') {
          appHandler = {
            destroy: appHandler,
            getInstance: function() {
              return null;
            },
            isReady: function() {
              return true;
            }
          };
        }

        if (!appHandler.getInstance) {
          appHandler.getInstance = function() {
            return null;
          };
        }

        if (!appHandler.isReady) {
          appHandler.isReady = function() {
            return true;
          };
        }

        appHandler.appId = obj.app;

        if (appHandler.onReady) {
          appHandler.onReady(function() {
            util.progress.show(100);
          });
        }

        if (appHandler.isReady()) {
          util.progress.show(100);
        } else {
          util.progress.show();
        }
      });
    }
  };

  window.seajs.on('error', function() {
    util.redirect('error/404');
  });

};
