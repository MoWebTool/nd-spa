'use strict';

var __ = require('nd-i18n');
var Promise = require('nd-promise');
var request = require('superagent');

var progress = require('./progress');

function getMsg(data) {
  if (data && data.code) {
    return __(data.code, 'error');
  }

  return __('未知错误');
}

// polyfill for old
Promise.prototype.done = Promise.prototype.then;
Promise.prototype.fail = Promise.prototype.catch;
Promise.prototype.always = Promise.prototype.finally;

module.exports = function(options) {
  return new Promise(function(resolve, reject) {
    request[options.type.toLowerCase()](options.url)
      .set(options.headers)
      .send(options.data)
      .end(function(err, res) {
        if (err) {
          if (!res) {
            reject(__('请求被拒绝'));
          } else {
            if (!res.status) {
              reject(__('请求被拒绝'));
            } else if (res.status === 402) {
              reject(res.body.message);
            } else if (res.status >= 400) {
              reject(getMsg(res.body));
            } else {
              reject(err);
            }
          }
          return;
        }
        resolve(res.body);
      });
  }).finally(function() {
    progress.show(100);
  });
}
