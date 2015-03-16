'use strict'

const ua = require('polyfill-ua')

module.exports = Feature

// filter a list of transforms against a list of agents
Feature.filter = function (transforms, agent) {
  transforms = transforms.filter(function (transform) {
    return !transform.filter // if .filter does not exist, it is assumed to be true
      || transform.filter(agent)
  })

  // remove supersets
  label_top:
  for (let i = 0; i < transforms.length; i++) {
    let transform = transforms[i]
    let supersets = transform.supersets
    if (!supersets || !supersets.length) continue
    for (let j = 0; j < supersets.length; j++) {
      let superset = supersets[j]
      for (let k = 0; k < transforms.length; k++) {
        if (transforms[k].name !== superset) continue
        transforms.splice(i--, 1)
        continue label_top
      }
    }
  }

  return transforms
}

function Feature(options) {
  if (!(this instanceof Feature)) return new Feature(options)

  // the name of this feature
  this.name = options.name
  // a shortname for this feature
  this.shortName = options.shortName || options.name
  // the module associated with this feature
  this.moduleName = options.moduleName || options.module
  // optional URL to download this file
  if (options.url) {
    this.url = options.url[0] === '/'
      ? 'https://raw.githubusercontent.com' + options.url
      : options.url
  }
  // github repo
  this.repository = options.repository || options.repo
  // supersets, i.e. packages that contain this feature
  this.supersets = options.supersets || []

  if (typeof options.filter === 'function') {
    this.filter = options.filter
  } else if (typeof options.browsers === 'object') {
    this.filter = ua.compile(options.browsers)
  } else if (typeof options.caniuse === 'string') {
    this.filter = ua.caniuse(options.caniuse)
  }
}

// by default, a feature is always enabled
Feature.prototype.filter = function () {
  return true
}
