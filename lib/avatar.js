'use strict';

var util = require('../index');
var origins = require('./origins');

module.exports = function(uid, realm, size) {
  if (typeof realm === 'number') {
    size = realm;
    realm = null;
  }

  if (!size) {
    size = 80;
  }

  var csname;

  // todo: add dyejia?

  if (util.ENV === util.PRODUCTION || util.ENV === util.AWS) {
    csname = 'cscommon';
  } else {
    csname = 'preproduction_content_cscommon';
  }

  if (realm) {
    return origins.CS + '/v0.1/static/' + csname + '/avatar/' + uid + '/' + realm + '/' + uid + '.jpg?size=' + size;
  }

  return origins.CS + '/v0.1/static/' + csname + '/avatar/' + uid + '/' + uid + '.jpg?size=' + size;
};
