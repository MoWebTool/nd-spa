'use strict';

var $ = require('jquery');
var Widget = require('nd-widget');
var Template = require('nd-template');

var bread = require('../bread');

var Sidebar = Widget.extend({
  Implements: [Template],

  attrs: {
    template: require('./bread.handlebars'),
    model: {}
  }
});

var instance;

exports.render = function(/* router, model */) {
  if (instance) {
    instance.destroy();
  }

  var breads = bread.get();

  if (breads.length) {
    instance = new Sidebar({
      parentNode: '#bread',
      model: {
        breads: breads
      }
    }).render();
    $('#bread').show();
  } else {
    $('#bread').hide();
  }
};
