'use strict'

var $ = require('nd-jquery')
var chai = require('chai')
var expect = chai.expect
var util = require('../index')

/* globals describe,it*/
describe('util', function() {
  it('APP_CORE', function() {
    expect(util.APP_CORE).to.equal('3.0.0')
  })
})

describe('debug', function() {
  var debug = require('nd-debug')
  var msgBox
  before(function() {
    msgBox = $('<input id="msgbox" type="text" />').appendTo(document.body)
  })

  after(function() {
    $('#msgbox').remove()
  })

  it('log', function() {
    debug.log('www')
  })

  it('warn', function() {
    var message = debug.warn('w', 1000)
    expect(message.attrs.model.value.level).to.equal('warning')
  })

  it('error', function() {
    var message = debug.error('e', 1000)
    expect(message.attrs.model.value.level).to.equal('danger')
  })

  it('info', function() {
    var message = debug.info('i', 1000)
    expect(message.attrs.model.value.level).to.equal('info')
  })

  it('success', function() {
    var msg = {
      detail: 'success',
      brief: 'success'
    }
    var message = debug.success(msg, 1000)
    expect(message.attrs.model.value.level).to.equal('success')
  })

})
