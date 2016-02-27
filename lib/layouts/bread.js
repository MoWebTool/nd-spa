'use strict';

var $ = require('nd-jquery');
var Widget = require('nd-widget');
var Template = require('nd-template');

var bread = require('../bread');

var Sidebar = Widget.extend({
  Implements: [Template],

  attrs: {
    template: require('./bread.handlebars'),
    model: {},
    insertInto: function(element, parentNode) {
      $(parentNode).empty().append(element);
    }
  }
});

exports.render = function() {
  var breads = bread.get();

  if (breads.length) {
    new Sidebar({
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
