'use strict';

var util = require('../index')

// todo: add dyejia

/**
 * @constant {string} UC
 */
var UC = (function() {
  switch (util.ENV) {
    case util.DEVELOPMENT:
    case util.DEBUG:
    case util.PREPRODUCTION:
    case util.PRESSURE:
      return 'https://ucbetapi.101.com';
    case util.PRODUCTION:
      return 'https://aqapi.101.com';
    case util.AWS:
      return 'https://awsuc.101.com';
    default:
      return util.LOC_ORIGIN;
  }
})();

/**
 * @constant {string} CS
 */
var CS = (function() {
  switch (util.ENV) {
    case util.DEVELOPMENT:
    case util.DEBUG:
    case util.PREPRODUCTION:
    case util.PRESSURE:
      return 'http://betacs.101.com';
    case util.PRODUCTION:
      return 'http://cs.101.com';
    case util.AWS:
      return 'https://awscs.101.com';
    default:
      return util.LOC_ORIGIN;
  }
})();

module.exports = {
  UC: UC,
  CS: CS
};
