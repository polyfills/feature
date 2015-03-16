'use strict'

const assert = require('assert')

const Feature = require('..')

describe('Feature()', function () {
  it('should default .filter() to true', function () {
    assert(Feature({
      name: 'asdf'
    }).filter())
  })

  it('should default .url w/ "/" to githubusercontent', function () {
    assert(Feature({
      name: 'asdf',
      url: '/component/emitter/master/index.js',
    }).url === 'https://raw.githubusercontent.com/component/emitter/master/index.js')
  })

  it('should support a custom filter function', function () {
    assert(!Feature({
      name: 'asdf',
      filter: function () {
        return false
      }
    }).filter())
  })

  it('should support the caniuse database', function () {
    let feature = new Feature({
      name: 'promises',
      caniuse: 'promises'
    })

    assert(feature.filter({
      family: 'ie',
      major: 8
    }))
    assert(!feature.filter({
      family: 'ff',
      major: 50
    }))
  })
})

describe('.filter()', function () {
  it('should pass if any agents satisfy', function () {
    let transforms = [new Feature({
      name: 'asdf',
      browsers: {
        ff: 20
      }
    })]
    let agent = {
      family: 'firefox',
      major: 27 // after generators
    }
    assert(Feature.filter(transforms, agent))
  })

  it('should include any transforms where .filter does not exist', function () {
    let transforms = [{}]
    let agent = {
      family: 'firefox',
      major: 27
    }
    assert.deepEqual(transforms, Feature.filter(transforms, agent))
  })

  it('should remove subsets', function () {
    let transforms = [new Feature({
      name: 'asdf',
      supersets: ['1234'],
      browsers: {
        ie: 9
      }
    }), new Feature({
      name: '1234',
      browsers: {
        ie: 10
      }
    })]
    transforms = Feature.filter(transforms, {
      family: 'ie',
      major: 8
    })
    let names = transforms.map(function (transform) {
      return transform.name
    })
    assert(~names.indexOf('1234'))
    assert(!~names.indexOf('asdf'))
  })
})
