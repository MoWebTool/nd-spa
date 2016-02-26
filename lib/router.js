'use strict';

var Router = require('nd-router');

var auth = require('./auth');
var progress = require('./progress');

var encode = window.encodeURIComponent;
var decode = window.decodeURIComponent;

var router = module.exports = new Router();

/*********************
 * Layouts begin
 */
var partials = {
  header: require('./layouts/header'),
  aside: require('./layouts/aside'),
  footer: require('./layouts/footer'),
  bread: require('./layouts/bread'),
  rootnode: require('./layouts/rootnode')
};

var render = router.render = function(partial, model, isLogin) {
  if (partial) {
    if (!Array.isArray(partial)) {
      if (partial.charAt(0) === '!') {
        partial = partial.substring(1);
        partial = Object.keys(partials).filter(function(key) {
          return key !== partial;
        });
      } else {
        partial = [partial];
      }
    }
  } else {
    partial = Object.keys(partials);
  }

  if (typeof isLogin === 'undefined') {
    isLogin = auth.isLogin();
  }

  partial.forEach(function(key) {
    partials[key].render(router, model, isLogin);
  });
};
/**
 * Layouts end
 *********************/

 /*********************
  * Use begin
  */
// 当前
var appHandler;
var pendingRequire;

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

// GC
var recycle = router.recycle = function(force) {
  var returned;

  if (pendingRequire) {
    return false;
  }

  if (appHandler) {
    if (!appHandler.isReady()) {
      progress.show();
      return false;
    }

    returned = appHandler.destroy(force);
    // 如果不阻止销毁，则销毁销毁函数
    (returned !== false) && (appHandler = null);
  }

  return force ? force : returned;
};

function asyncRequire(obj) {
  var instance;

  if (appHandler) {
    if (appHandler.__obj.app === obj.app && obj.sub) {
      instance = appHandler.getInstance();
      if (instance) {
        return instance.set('sub', obj.sub);
      }
    }
  }

  progress.show();
  pendingRequire = true;
  require.ensure([], function(require) {
    pendingRequire = false;

    try {
      require('app/' + obj.app + '/index.js')(function(cb) {
        appHandler = cb(obj.params, obj.sub);

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

        appHandler.__obj = obj;

        if (appHandler.onReady) {
          appHandler.onReady(function() {
            progress.show(100);
          });
        }

        if (appHandler.isReady()) {
          progress.show(100);
        } else {
          progress.show();
        }
      });
    } catch(e) {
      router.redirect('error/404');
    }
  });
}
/**
 * Use end
 *********************/

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

function convertRequest(obj) {
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

var asyncRender = router.asyncRender = function(a, b, c) {
  setTimeout(render, 0, a, b, c);
};

function startup(obj, undef) {
  var isLogin = auth.isLogin();

  if (isLogin && obj.app === 'login') {
    auth.destroy();
    isLogin = false;
  }

  asyncRender(undef, obj, isLogin);

  asyncRequire(obj);
}

var timeout;
router.redirect = function(value) {
  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(router.setRoute.bind(router), 80, value);
};

router.getPath = function() {
  return router.getRoute().join(router.delimiter);
};

// 阻止下一次跳转生效
var cancelNext;
var lastRoute;
var nextRoute;
var currRoute = router.getPath();

var goLast = function() {
  if (lastRoute) {
    router.redirect(lastRoute);
  }
};

router.goNext = function() {
  if (nextRoute) {
    cancelNext = false;
    router.redirect(nextRoute);
    nextRoute = null;
  }
};

router.cancelNext = function() {
  cancelNext = null;
  nextRoute = null;
};

router.mount({
  // /#/login?auth={auth}&vorg={vorg}
  '([^!?]+)?([!?])?(.+)?': function(app, sep, params) {
    var isLogin = auth.isLogin();

    // 处理首页
    if (typeof app === 'undefined') {
      // 已登录
      if (isLogin) {
        // 如果是首页，跳转到 home
        if (!router.getRoute(0)) {
          router.redirect('home');
          return false;
        }
      } else {
        // 如果不是 login，跳转到 login
        if (router.getRoute(0).indexOf('login') !== 0) {
          router.redirect('login');
          return false;
        }
      }
    }

    var isCommon = /^(error(\/\d+)?|home|login|logout)$/.test(app);
    var isModule = /^[0-9a-zA-Z]+(\/\d+)?$/.test(app);

    var obj = convertRequest({
      app: app,
      sep: sep,
      params: params
    });

    // is common
    if (isCommon) {
      asyncRender('aside', obj, isLogin);
    }
    // if module with/out index
    // check login state and update layouts
    else if (isModule) {
      if (!isLogin) {
        router.redirect('login');
        return false;
      }

      asyncRender('aside', obj, isLogin);
      return false;
    }

    if (cancelNext) {
      return (cancelNext = null);
    }

    // 处理阻止跳转
    if (cancelNext === false) {
      // 重置，以免下次无效
      cancelNext = null;
      // 强制回收
      recycle(true);
    } else if (recycle() === false) {
      if (lastRoute) {
        cancelNext = true;

        if (!nextRoute) {
          nextRoute = router.getPath();
        } else if (lastRoute !== currRoute) {
          nextRoute = currRoute;
        }

        goLast();
      }

      return false;
    }

    if (isLogin) {
      // 已登录，且当前在 login 页面，且未包含参数
      // 跳转到主页
      if (obj.app === 'login' && !obj.params) {
        router.redirect('home');
        return false;
      }
    } else {
      // 未登录，且当前不是 login 或 logout 页面
      // 跳转到带 back 参数的 login 页面
      if (obj.app !== 'login' && obj.app !== 'logout') {
        router.redirect('login?back=' + encode(app));
        return false;
      }
    }

    startup(obj);
  }
});

router.configure({
  recurse: 'forward',
  after: function() {
    if (!cancelNext) {
      if (isNaN(currRoute)) {
        lastRoute = currRoute;
      }
    }
    currRoute = router.getPath();
  },
  notfound: function() {
    router.redirect('error/404');
  }
});

// router.init('/');
