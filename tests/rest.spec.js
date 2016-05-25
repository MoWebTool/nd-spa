'use strict'

var chai = require('chai')
var sinonChai = require('sinon-chai')
var REST = require('../lib/rest')
var Base = require('nd-base')
var request = require('superagent')
var config = require('./superagent-mock-config')

var expect = chai.expect
// var sinon = window.sinon

chai.use(sinonChai)

/* globals describe,it,before,after*/

describe('REST', function() {
  var superagentMock

  before(function() {
    superagentMock = require('superagent-mock')(request, config)
  })

  it('instanceOf Base', function() {
    expect(new REST).to.be.instanceOf(Base)
  })

  it('restful verbs: GET', function() {
    expect(new REST()).to.have.property('GET')
    expect(new REST()).to.not.have.ownProperty('GET')
    return new REST({
      baseUri: ['http://127.0.0.1:9876', 'v0.1', 'test']
    }).GET(1).then(function(data) {
      expect(data).to.deep.equal({a: 1, b: 2})
    })
  })

  it('uriVar', function() {
    expect(new REST().get('uriVar')).to.equal('id')
    expect(new REST({uriVar: 'uriVar'}).get('uriVar')).to.equal('uriVar')
  })

  after(function() {
    superagentMock.unset()
  })
})
