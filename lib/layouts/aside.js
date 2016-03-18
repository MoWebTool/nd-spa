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

exports.widget = null

exports.render = function(router, model) {
  var modules

  /*eslint max-depth: [2, 4]*/
  if (auth.isLogin()) {
    // 拷贝
    modules = $.extend(true, {}, routes.MODULE_ROUTES)

    // 是否开通
    var services = auth.getAuth('services')
    if (services) {
      // 添加默认
      services.push('admin', 'demo')
      Object.keys(modules).forEach(function(key) {
        if (services.indexOf(key) === -1) {
          delete modules[key]
        }
      })
    }

    // 根据权限过滤模块
    Object.keys(modules).forEach(function(key) {
      var module = modules[key]

      // 检查模块权限
      if (module.level && !auth.hasAuth(module.level, module.name)) {
        delete modules[key]
        return
      }

      // 检查目录
      var folders = module.folders || []
      folders = folders.filter(function(folder) {
        // 检查目录权限
        if (folder.level && !auth.hasAuth(folder.level, module.name)) {
          return false
        }

        var routes = folder.routes || []
        folder.routes = routes.filter(function(route) {
          // 检查路由权限
          return !route.level || auth.hasAuth(route.level, route.module || module.name)
        })

        // 有可用的模块（route）
        return !!folder.routes.length
      })

      // 检查直接挂在模块根下的路由
      var routes = module.routes || []
      routes = routes.filter(function(route) {
        // 检查路由权限
        return !route.level || auth.hasAuth(route.level, route.module || module.name)
      })

      // 检查模块下是否有可用路由
      if (!folders.length && !routes.length) {
        delete modules[key]
      } else {
        module.folders = folders.length ? folders : []
        module.routes = routes.length ? routes : []
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

      if (mod.folders) {
        if (isNaN(mod1)) {
          mod.folders.some(function(folder) {
            return folder.active = folder.routes.some(function(route) {
              return route.active = (route.route === mod1)
            })
          })
        } else {
          mod.folders.some(function(folder, index) {
            return folder.active = (index === +mod1)
          })
        }
      }

      if (mod.routes) {
        if (isNaN(mod1)) {
          mod.routes.some(function(route) {
            return route.active = (route.route === mod1)
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
      'click [data-route]': function(e) {
        var route = e.currentTarget.getAttribute('data-route')
        if (route === router.getPath()) {
          e.preventDefault()
          router.redirect(route + '!')
        }
      }
    }
  }).render()
}
