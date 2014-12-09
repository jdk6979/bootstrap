/** =======================================================================
 * Bootstrap: transition.js v4.0.0
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ========================================================================
 * @fileoverview - Bootstrap's generic alert component. Add dismiss
 * functionality to all alert messages with this plugin.
 * ========================================================================
 */

'use strict';

var Bootstrap = {}


/**
 * @const
 * @type {Object}
 */
Bootstrap.TransitionEndEvent = {
  'WebkitTransition' : 'webkitTransitionEnd',
  'MozTransition'    : 'transitionend',
  'OTransition'      : 'oTransitionEnd otransitionend',
  'transition'       : 'transitionend'
}


/**
 * @return {string}
 */
Bootstrap.getUID = function (prefix) {
  do prefix += ~~(Math.random() * 1000000)
  while (document.getElementById(prefix))
  return prefix
}


/**
 * @return {Object}
 */
Bootstrap.getSpecialTransitionEndEvent = function () {
  return {
    bindType: Bootstrap['transition']['end'],
    delegateType: Bootstrap['transition']['end'],
    handle: /** @param {jQuery.Event} event */ (function (event) {
      if ($(event.target).is(this)) {
        return event.handleObj.handler.apply(this, arguments)
      }
    })
  }
}


/**
 * @param {Element} element
 */
Bootstrap.reflow = function (element) {
  new Function('bs',"return bs")(element.offsetHeight)
}


/**
 * @return {Object|boolean}
 */
Bootstrap.transitionEndTest = function () {
  if (window.QUnit) {
    return false
  }

  var el = document.createElement('bootstrap')
  for (var name in Bootstrap.TransitionEndEvent) {
    if (el.style[name] !== undefined) {
      return { 'end': Bootstrap.TransitionEndEvent[name] }
    }
  }
  return false
}


/**
 * @param {number} duration
 * @this {Element}
 * @return {Object}
 */
Bootstrap.transitionEndEmulator = function (duration) {
  var called = false

  $(this).one('bsTransitionEnd', function () {
    called = true
  })

  var callback = function () {
    if (!called) {
      $(this).trigger(Bootstrap['transition']['end'])
    }
  }.bind(this)

  setTimeout(callback, duration)

  return this
}


$(function () {
  Bootstrap['transition'] = Bootstrap.transitionEndTest()

  if (!Bootstrap['transition']) {
    return
  }

  $.event.special.bsTransitionEnd = Bootstrap.getSpecialTransitionEndEvent()
})


/**
 * ------------------------------------------------------------------------
 * Jquery Interface
 * ------------------------------------------------------------------------
 */

$['bootstrap'] = Bootstrap

$.fn.emulateTransitionEnd = Bootstrap.transitionEndEmulator

