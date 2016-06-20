'use strict'

var $ = require('nd-jquery')
var Widget = require('nd-widget')
var Template = require('nd-template')

var auth = require('../auth')
var routes = require('../routes')

var Aside = Widget.extend({
  Implements: [Template],

  attrs: {
    template: require('./aside.handlebars'),
    model: {}
  }
})

function recycle() {
  if (exports.widget) {
    exports.widget.destroy()
  }
}

// 判断是否拥有路由权限
function checkRouteAuth(route, module) {
  // 没有权限控制
  // 或者拥有指定的权限
  return !route.level || auth.hasAuth(route.level, route.module || module.name)
}

exports.widget = null

exports.render = function(router, model) {
  var modules

  /* eslint max-depth: [2, 4]*/
  if (auth.isLogin()) {
    // 拷贝
    modules = $.extend(true, {}, routes.MODULE_ROUTES)

    // 是否开通
    var services = auth.getAuth('services')
    if (services && services.length) {
      Object.keys(modules).forEach(function(key) {
        if (services.indexOf(key) === -1) {
          delete modules[key]
        }
      })
    }

    // 根据权限过滤模块
    Object.keys(modules).forEach(function(key) {
      var module = modules[key]

      // 检查是否有路由
      if (!(module.routes && module.routes.length)) {
        delete modules[key]
        return
      }

      // 检查模块权限
      // if (module.level && !auth.hasAuth(module.level, module.name)) {
      if (!checkRouteAuth(module, module)) {
        delete modules[key]
        return
      }

      // 检查直接挂在模块根下的路由
      module.routes = module.routes.filter(function(route) {
        // 有 routes 属性，说明是目录
        if (route.routes) {
          // 先检查目录权限
          if (!checkRouteAuth(route, module)) {
            return false
          }
          // 检查目录下的路由
          route.routes = route.routes.filter(function(route) {
            // 检查路由权限
            return checkRouteAuth(route, module)
          })

          // 有可用的路由
          return !!route.routes.length
        }

        // 检查路由权限
        return checkRouteAuth(route, module)
      })

      // 检查模块下是否有可用路由
      if (!(module.routes && module.routes.length)) {
        delete modules[key]
      }
    })

    // highlight active folder and route
    if (model && model.hasOwnProperty && model.hasOwnProperty('app')) {
      var appArr = model.app.split('/')
      var mod0 = appArr.shift()
      var mod1 = appArr.join('/')

      var mod = {}

      Object.keys(modules).some(function(key) {
        if (modules[key].name === mod0) {
          mod = modules[key]
          return mod.active = true
        }
      })

      if (mod1 && mod.routes) {
        if (isNaN(mod1)) {
          mod.routes.some(function(route) {
            if (route.routes) {
              return route.active = route.routes.some(function(route) {
                return route.active = (route.route === mod1)
              })
            } else {
              return route.active = (route.route === mod1)
            }
          })
        } else {
          mod.routes.some(function(route, index) {
            return route.active = (index === +mod1)
          })
        }
      }
    }
  }

  recycle()

  exports.widget = new Aside({
    parentNode: '#aside',
    model: {
      modules: modules
    },
    events: {
      'click [data-module]': function(e) {
        var moduleName = e.currentTarget.getAttribute('data-module')
        var module = $('[data-module="' + moduleName + '"]', e.delegateTarget)
        module.siblings().removeClass('module-active')

        module.toggleClass('module-active')
        e.stopPropagation()
      },
      'click [data-folder]': function(e) {
        var folderIndex = e.currentTarget.getAttribute('data-folder')
        var folder = $('.module-active [data-folder="' + folderIndex + '"]', e.delegateTarget)

        folder.siblings().removeClass('folder-active')
        folder.toggleClass('folder-active')
        e.stopPropagation()
      },
      'click [data-route]': function(e) {
        var route = e.currentTarget.getAttribute('data-route')
        if (route === router.getPath()) {
          e.preventDefault()
          router.redirect(route + '!')
        }
        e.stopPropagation()
      }
    }
  }).render()
}
