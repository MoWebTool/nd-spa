'use strict'

// var $ = require('nd-jquery')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var util = require('../index')

var expect = chai.expect
// var sinon = window.sinon

chai.use(sinonChai)

/*globals describe,it*/

describe('util', function() {

  it('APP_CORE', function() {
    expect(util.APP_CORE).to.equal('3.0.0')
  })

})
