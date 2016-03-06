'use strict';

var Router = require('nd-router');

var auth = require('./auth');
var progress = require('./progress');

var encode = window.encodeURIComponent;
var decode = window.decodeURIComponent;

var appHandler;
var pendingRequire;

var router = module.exports = new Router();

var redirect = router.redirect = function(value) {
  router.setRoute(value);
};

var render = router.render = function(partial, model, isLogin) {
  var partials = {
    header: require('./layouts/header'),
    aside: require('./layouts/aside'),
    footer: require('./layouts/footer'),
    bread: require('./layouts/bread'),
    rootnode: require('./layouts/rootnode')
  };

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

  console.group('render');
  partial.forEach(function(key) {
    console.log(key);
    partials[key].render(router, model, isLogin);
  });
  console.groupEnd('render');
};

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

router.getPath = function() {
  return router.getRoute().join(router.delimiter);
};

// 阻止下一次跳转生效
var cancelNext;
var lastRoute;
var nextRoute;
var currRoute = router.getPath();

function goLast() {
  if (lastRoute) {
    redirect(lastRoute);
  }
}

router.goNext = function() {
  if (nextRoute) {
    cancelNext = false;
    redirect(nextRoute);
    nextRoute = null;
  }
};

router.cancelNext = function() {
  cancelNext = null;
  nextRoute = null;
};

function startup(obj) {
  var isLogin = auth.isLogin();

  if (isLogin && obj.app === 'login') {
    auth.destroy();
    isLogin = false;
  }

  render(undefined, obj, isLogin);

  var instance;

  if (appHandler) {
    if (appHandler.__obj.app === obj.app && obj.sub) {
      instance = appHandler.getInstance();
      if (instance) {
        return instance.set('sub', obj.sub);
      }
    }
  }

  function isValidHandler(handler) {
    if (!handler) {
      return false;
    }

    if (typeof handler === 'function') {
      return true;
    }

    if (!handler.destroy) {
      return false;
    }

    return true;
  }

  progress.show();
  pendingRequire = true;

  try {
    require('app/' + obj.app + '/index.js')(function(cb) {
      pendingRequire = false;

      if (!typeof cb === 'function') {
        throw new Error('`app/**/index.js` must exports a function');
      }

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
    pendingRequire = false;
    redirect('error/404');
  }
}

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
          redirect('home');
          return false;
        }
      } else {
        // 如果不是 login，跳转到 login
        if (router.getRoute(0).indexOf('login') !== 0) {
          redirect('login');
          return false;
        }
      }
    }

    var isCommon = /^(error(\/\d+)?|home|login|logout)$/.test(app);
    var isModule = /^[0-9a-zA-Z]+(\/\d+)?$/.test(app);

    var obj = {
      app: app,
      sep: sep,
      params: params
    };

    // filter sub routes: {id}/{act}
    var matched = app.match(/^(.+)\/([-0-9a-f]+)\/([a-z]+)$/);

    if (matched) {
      obj.app = matched[1];
      obj.sub = {
        id: matched[2],
        act: matched[3]
      };
    }

    if (params && sep !== '!') {
      var _params = {};
      params.split('&').forEach(function(pair) {
        pair = pair.split('=');
        _params[decode(pair[0])] = decode(pair[1]);
      });
      obj.params = _params;
    }

    // is common
    if (isCommon) {
      // render('aside', obj, isLogin);
    }
    // if module with/out index
    // check login state and update layouts
    else if (isModule) {
      if (!isLogin) {
        redirect('login');
        return false;
      }

      render(undefined, obj, isLogin);
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
        redirect('home');
        return false;
      }
    } else {
      // 未登录，且当前不是 login 或 logout 页面
      // 跳转到带 back 参数的 login 页面
      if (obj.app !== 'login' && obj.app !== 'logout') {
        redirect('login?back=' + encode(app));
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
    redirect('error/404');
  }
});
