'use strict';

var $ = require('jquery');
var Widget = require('nd-widget');
var Template = require('nd-template');

var util = require('../../index');
var auth = require('../auth');
var routes = require('../routes');

var Aside = Widget.extend({
  Implements: [Template],

  attrs: {
    template: require('./aside.handlebars'),
    model: {}
  }
});

var instance;

exports.render = function(router, model) {
  var modules;
  var folders;

  if (auth.isLogin()) {
    // 拷贝
    modules = $.extend(true, {}, routes.MODULE_ROUTES);

    if (util.RBAC_ENABLED) {
      // 根据权限过滤模块
      Object.keys(modules).forEach(function(key) {
        var folders = modules[key].folders;

        folders = folders.filter(function(folder) {
          folder.routes = folder.routes.filter(function(route) {
            return !route.level || auth.hasAuth(route.level, route.module);
          });

          // 有可用的模块（route）
          return !!folder.routes.length;
        });

        // 检查模块下是否有目录
        if (folders.length) {
          modules[key].folders = folders;
        } else {
          delete modules[key];
        }
      });
    }

    // highlight active folder and route
    if (model) {
      var mod0 = model.shift();
      var mod1 = model.join('/');

      var mod;

      Object.keys(modules).forEach(function(key) {
        if (modules[key].name === mod0) {
          mod = modules[key];
          mod.active = true;
        } else {
          modules[key].active = false;
        }
      });

      if (mod && mod.folders) {
        if (isNaN(mod1)) {
          mod.folders.forEach(function(folder) {
            var found;

            folder.routes.forEach(function(route) {
              if (route.route === mod1) {
                route.active = found = true;
              } else {
                route.active = false;
              }
            });

            folder.active = found;
          });
        } else {
          mod.folders.forEach(function(folder, index) {
            folder.active = (index === +mod1);
          });
        }
      }
    }
  }

  if (instance) {
    instance.destroy();
  }

  instance = new Aside({
    parentNode: '#aside',
    model: {
      modules: modules
    },
    events: {
      'click [data-route]': function(e) {
        var route = e.currentTarget.getAttribute('data-route');
        if (route === router.getPath()) {
          e.preventDefault();
          router.redirect(route + '!');
        }
      }
    }
  }).render();
};
