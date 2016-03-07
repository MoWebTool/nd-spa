'use strict';

var $ = require('nd-jquery');

var progress = $('#progress');

module.exports = {

  show: function(percent) {
    if (typeof percent === 'undefined') {
      percent = 98;
    }

    progress.addClass('active').css('width', percent + '%');

    if (percent === 100) {
      this.hide();
    }
  },

  hide: function() {
    progress.removeClass('active').css('width', '0%');
  }

};
