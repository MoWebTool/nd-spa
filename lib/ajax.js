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

var METHOD_MAP = {
  'DELETE': 'del',
  'GET': 'get',
  'HEAD': 'head',
  'OPTION': 'option',
  'PATCH': 'patch',
  'POST': 'post',
  'PUT': 'put'
};

module.exports = function(options) {
  return new Promise(function(resolve, reject) {
    var req = request[METHOD_MAP[options.type]](options.url)

    req.set(options.headers);

    if (options.data) {
      req.send(options.data);
    }

    req.end(function(err, res) {
      if (err) {
        if (!res) {
          reject(__('请求被拒绝'));
        } else {
          if (!res.status) {
            reject(__('请求被拒绝'));
          } else if (res.status === 402) {
            reject(res.body && res.body.message);
          } else if (res.status >= 400) {
            reject({
              brief: getMsg(res.body),
              detail: res.body && res.body.message
            });
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
