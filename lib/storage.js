'use strict';

var Storage = require('nd-storage');

// 默认一周有效期
module.exports = new Storage(null, 7 * 24 * 3600);
