'use strict'

var $ = require('nd-jquery')

var auth = require('../auth')
var storage = require('../storage')

exports.render = function(router, model) {
  var key = 'TOGG'
  var val

  if (model && model.hasOwnProperty && model.hasOwnProperty('collapsed')) {
    val = model.collapsed

    if (val === -1) {
      val = !$('#container').hasClass('collapsed')
    }

    storage.set(key, val)
  } else {
    val = storage.get(key)
  }

  $('#container').toggleClass('collapsed', val || false)

  // finally, show the root
  $('html')
    .toggleClass('unauthed', !auth.isLogin())
    .addClass('visible')

  // populate scroll
  $('#main')
    .on('scroll', function() {
      $(window).trigger('scroll')
    })
}
