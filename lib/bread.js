'use strict'

var router = require('./router')

var bread = module.exports = {
  breads: [],
  set: function(value) {
    this.breads = value
    this.render()
  },
  get: function() {
    return this.breads
  },
  render: function() {
    router.render && router.render('bread', this.breads)
  }
}

;['push', 'unshift', 'splice', 'pop', 'shift'].forEach(function(method) {
  bread[method] = function() {
    this.breads[method].apply(this.breads, arguments)
    this.render()
  }
})

/**
 * @method push
 */

/**
 * @method unshift
 */

/**
 * @method splice
 */

/**
 * @method pop
 */

/**
 * @method shift
 */
