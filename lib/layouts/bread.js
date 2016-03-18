'use strict'

var $ = require('nd-jquery')
var Widget = require('nd-widget')
var Template = require('nd-template')

var bread = require('../bread')

var Sidebar = Widget.extend({
  Implements: [Template],

  attrs: {
    template: require('./bread.handlebars'),
    model: {}
  }
})

function recycle() {
  if (exports.widget) {
    exports.widget.destroy()
  }
}

exports.widget = null

exports.render = function() {
  var breads = bread.get()

  if (breads.length) {
    recycle()

    exports.widget = new Sidebar({
      parentNode: '#bread',
      model: {
        breads: breads
      }
    }).render()
    $('#bread').show()
  } else {
    $('#bread').hide()
  }
}
