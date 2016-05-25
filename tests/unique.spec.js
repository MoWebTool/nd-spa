'use strict'

var chai = require('chai')
var sinonChai = require('sinon-chai')
var unique = require('../lib/unique')

var expect = chai.expect
// var sinon = window.sinon

chai.use(sinonChai)

/* globals describe,it*/

describe('unique', function() {
  it('is uuid', function() {
    var n = 100
    var r = /^[0-9a-f]{8}\-[0-9a-f]{4}\-4[0-9a-f]{3}\-[8-9a-b][0-9a-f]{3}\-[0-9a-f]{12}$/
    while (n--) {
      expect(unique()).to.match(r)
    }
  })

  it('is unique', function() {
    var n = 100
    var a = []
    var u
    while (n--) {
      u = unique()
      expect(u).to.not.be.oneOf(a)
      a.push(u)
    }
  })
})
