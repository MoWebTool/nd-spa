'use strict'

var util = require('../index')
var origins = require('./origins')

module.exports = function(uid, realm, size) {
  if (typeof realm === 'number') {
    size = realm
    realm = ''
  }

  realm = realm ? (realm + '/') : ''

  if (!size) {
    size = 80
  }

  var csname = (util.ENV >= util.PRODUCTION) ? 'cscommon' : 'preproduction_content_cscommon'

  return origins.CS + '/v0.1/static/' + csname + '/avatar/' + uid + '/' + realm + uid + '.jpg?size=' + size
}
