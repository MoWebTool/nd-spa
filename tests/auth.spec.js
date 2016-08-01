'use strict'

var $ = require('nd-jquery')
var datetime = require('nd-datetime')
var chai = require('chai')
var expect = chai.expect
var auth = require('../lib/auth')
var util = require('../index')

describe('auth', function() {
  it('auth', function() {
    expect(auth).to.be.an('object')
    expect(auth.hasAuth('8|setauth', 'testmod')).to.not.be.ok
  })

  it('set tokens/auth', function() {
    var expireTime = new Date()
    expireTime.setDate(expireTime.getDate() + 1)
    //1天后过期
    var tokens = {
      'access_token': 'XZZ',
       // 'expires_at': expireTime,
      'mac_algorithm': 'hmac-sha-256',
      'mak_key': 'EMuMJ6nrDD',
      'refresh_token': 'YYXZZ',
      'server_time': new Date()
    }

    var authObject = {
      apis: [{
        module: 'testmod',
        level: '=7|setauth'
      }],
      level: 7
    }
    //不设置过期时间，默认为立刻过期
    auth.setTokens(tokens)
    expect(auth.getTokens()).to.equal(null)

    tokens['expires_at'] = expireTime
    auth.setTokens(tokens)
    expect(auth.getTokens().access_token).to.equal('XZZ')

    expect(auth.hasAuth()).to.not.be.ok
    expect(auth.getAuth()).to.not.be.ok
    auth.setAuth(authObject)
    expect(auth.getAuth().level).to.equal(7)
    expect(auth.hasAuth('=7|setauth', 'testmod')).to.be.ok
    expect(auth.hasAuth('setauth', 'testmod')).to.not.be.ok

    expect(auth.getAccessToken()).to.equal(tokens['access_token'])

    var url = '/'
    var host = util.LOC_HOST
    //expect(auth.getAuthentization('GET', url, host).indexOf('id="XZZ"')).to.not.be(-1)

    expect(auth._getNonce()).to.equal(auth.nonce)

    auth.destroy()
    expect(auth.getTokens()).to.equal(null)
    expect(auth.getAuth()).to.equal(null)
  })

})
