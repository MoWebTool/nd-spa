'use strict';

var $ = require('jquery');

var elem = $('#progress');

module.exports = {

  show: function(percent) {
    if (typeof percent === 'undefined') {
      percent = 98;
    }

    elem.addClass('active').css('width', percent + '%');

    if (percent === 100) {
      this.hide();
    }
  },

  hide: function() {
    elem.removeClass('active').css('width', '0%');
  }

};
