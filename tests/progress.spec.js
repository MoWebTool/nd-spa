'use strict'

var chai = require('chai')
var expect = chai.expect
var $ = require('nd-jquery')

$('<div id="progress"><div/>').appendTo(document.body)
var progress = require('../lib/progress')

describe('progress', function() {
  after(function() {
    $('#progress').remove()
  })

  it('show', function() {
    progress.show()
    progress.show(50)
    expect($('#progress').width()).to.above($('#progress').parent().width() * 0.48)
    expect($('#progress').width()).to.below($('#progress').parent().width() * 0.52)
    progress.show(100)
    expect($('#progress').width()).to.equal(0)
  })

  it('hide', function() {
    progress.hide()
    expect($('#progress').width()).to.equal(0)
  })
})
