'use strict'

var $ = require('nd-jquery')
var Widget = require('nd-widget')
var Template = require('nd-template')

var Bread = Widget.extend({
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

exports.render = function(router, breads) {
  if (breads.length) {
    recycle()

    exports.widget = new Bread({
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
