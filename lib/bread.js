'use strict';

var router = require('./router');

var breads = [];

var bread = module.exports = {
  set: function(value) {
    breads = value;
    this.render();
  },
  get: function() {
    return breads;
  },
  render: function() {
    router.render && router.render('bread');
  }
};

['push', 'unshift', 'splice', 'pop', 'shift'].forEach(function(method) {
  bread[method] = function() {
    breads[method].apply(breads, arguments);
    this.render();
  };
});

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
