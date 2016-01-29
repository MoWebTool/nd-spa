'use strict';

module.exports = function(util) {

  util.avatar = function(uid, realm, size) {
    if (typeof realm === 'number') {
      size = realm;
      realm = null;
    }

    if (!size) {
      size = 80;
    }

    var csname = (function() {
      switch (util.ENV) {
        case util.DEVELOPMENT:
        case util.DEBUG:
        case util.PREPRODUCTION:
        case util.PRESSURE:
          return 'preproduction_content_cscommon';
        case util.PRODUCTION:
        case util.AWS:
        case util.DYEJIA:
          return 'cscommon';
        default:
          return 'cscommon';
      }
    })();

    if (realm) {
      return util.CS_API_ORIGIN + '/v0.1/static/' + csname + '/avatar/' + uid + '/' + realm + '/' + uid + '.jpg?size=' + size;
    }

    return util.CS_API_ORIGIN + '/v0.1/static/' + csname + '/avatar/' + uid + '/' + uid + '.jpg?size=' + size;
  };

};
