'use strict'

var util = require('../index')

/**
 * 帐号中心
 * @constant {string} UC
 */
var UC = (function() {
  switch (util.ENV) {
    case util.DEVELOPMENT:
    case util.DEBUG:
    case util.PRESSURE:
    case util.PREPRODUCTION:
      return 'https://ucbetapi.101.com'
    case util.PRODUCTION:
      return 'https://aqapi.101.com'
    case util.AWS:
      return 'https://awsuc.101.com'
    case util.DYEJIA:
      return 'https://uc.dyejia.cn'
    default:
      return util.LOC_ORIGIN
  }
})()

/**
 * 虚拟组织
 * @constant {string} VO
 */
var VO = (function() {
  switch (util.ENV) {
    case util.DEVELOPMENT:
    case util.DEBUG:
    case util.PRESSURE:
    case util.PREPRODUCTION:
      return 'https://ucvorg-beta.101.com'
      // return 'http://virtual-organization.beta.web.sdp.101.com'
    case util.PRODUCTION:
      return 'https://ucvorg.101.com'
    case util.AWS:
      return 'https://awsvorg.101.com'
      // return ' http://virtual-organization.aws.101.com'
    case util.DYEJIA:
      return 'https://vorg.dyejia.cn'
    default:
      return util.LOC_ORIGIN
  }
})()

/**
 * 内容服务
 * @constant {string} CS
 */
var CS = (function() {
  switch (util.ENV) {
    case util.DEVELOPMENT:
    case util.DEBUG:
    case util.PRESSURE:
    case util.PREPRODUCTION:
      return 'http://betacs.101.com'
    case util.PRODUCTION:
      return 'http://cs.101.com'
    case util.AWS:
      return 'https://awscs.101.com'
    case util.DYEJIA:
      return 'https://cs.dyejia.cn'
    default:
      return util.LOC_ORIGIN
  }
})()

/**
 * 评论互动
 * @constant {string} IN_API_ORIGIN
 */
var IN = (function() {
  switch (util.ENV) {
    case util.DEVELOPMENT:
      return 'http://interaction.dev.web.nd'
    case util.DEBUG:
      return 'http://interaction.debug.web.nd'
    case util.PRESSURE:
      return 'http://interaction.qa.web.sdp.101.com'
    case util.PREPRODUCTION:
      return 'http://interaction.beta.web.sdp.101.com'
    case util.PRODUCTION:
      return 'http://interaction.web.sdp.101.com'
    case util.AWS:
      return 'http://interaction.aws.101.com'
    case util.DYEJIA:
      return 'http://interaction.dyejia.cn'
    default:
      return util.LOC_ORIGIN
  }
})()

module.exports = {
  UC: UC,
  VO: VO,
  CS: CS,
  IN: IN
}
