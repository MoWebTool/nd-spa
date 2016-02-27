'use strict';

var __ = require('nd-i18n');
var $ = require('nd-jquery');

var util = require('../../index');

exports.render = function() {
  $('#footer').text(__('网龙网络公司 版权所有') + ' V' + util.APP_VERSION);
};
