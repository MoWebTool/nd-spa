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

    var csname;

    if (util.ENV === util.PRODUCTION || util.ENV === util.AWS) {
      csname = 'cscommon';
    } else {
      csname = 'preproduction_content_cscommon';
    }

    if (realm) {
      return util.CS_API_ORIGIN + '/v0.1/static/' + csname + '/avatar/' + uid + '/' + realm + '/' + uid + '.jpg?size=' + size;
    }

    return util.CS_API_ORIGIN + '/v0.1/static/' + csname + '/avatar/' + uid + '/' + uid + '.jpg?size=' + size;
  };

};
