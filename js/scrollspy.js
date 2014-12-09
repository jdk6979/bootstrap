/** =======================================================================
 * Bootstrap: scrollspy.js v4.0.0
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ========================================================================
 * @fileoverview - Bootstrap's scrollspy plugin.
 * ========================================================================
 */

'use strict';


/**
 * Our scrollspy class.
 * @param {Element!} element
 * @param {Object=} opt_config
 * @constructor
 */
function ScrollSpy(element, opt_config) {

  /** @private {Element|Window} */
  this._scrollElement = element.tagName == 'BODY' ? window : element

  /** @private {Object} */
  this._config = $.extend({}, ScrollSpy.Defaults, opt_config)

  /** @private {string} */
  this._selector = (this._config.target || '') + ' .nav li > a'

  /** @private {Array} */
  this._offsets = []

  /** @private {Array} */
  this._targets = []

  /** @private {Element} */
  this._activeTarget = null

  /** @private {number} */
  this._scrollHeight = 0

  $(this._scrollElement).on('scroll.bs.scrollspy', this._process.bind(this))

  this['refresh']()

  this._process()
}


/**
 * @const
 * @type {string}
 */
ScrollSpy.VERSION = '4.0.0'


/**
 * @const
 * @type {Object}
 */
ScrollSpy.Defaults = {
  offset: 10
}


/**
 * @const
 * @type {Function}
 */
ScrollSpy.JQUERY_NO_CONFLICT = $.fn['scrollspy']


/**
 * @param {Object=} opt_config
 * @this {jQuery}
 * @return {jQuery}
 */
ScrollSpy.JQUERY_INTERFACE = function (opt_config) {
  return this.each(function () {
    var data   = $(this).data('bs.scrollspy')
    var config = typeof opt_config == 'object' && opt_config || null

    if (!data) {
      data = new ScrollSpy(this, config)
      $(this).data('bs.scrollspy', data)
    }

    if (typeof opt_config == 'string') {
      data[opt_config]()
    }
  })
}


/**
 * Refresh the scrollspy target cache
 */
ScrollSpy.prototype['refresh'] = function () {
  var offsetMethod = 'offset'
  var offsetBase   = 0

  if (this._scrollElement !== this._scrollElement.window) {
    offsetMethod = 'position'
    offsetBase   = this._scrollElement.scrollTop
  }

  this._offsets = []
  this._targets = []

  this._scrollHeight = this._getScrollHeight()

  var targets = Array.prototype.slice.apply(document.querySelectorAll(this._selector))

  targets
    .map(function (element, index) {
      var target
      var targetSelector = element.getAttribute('data-target')

      if (!targetSelector) {
        targetSelector = element.getAttribute('href')
        targetSelector = /^#\w/.test(targetSelector) && targetSelector
      }

      if (targetSelector) {
        target = document.querySelector(targetSelector)
      }

      if (target && (target.offsetWidth || target.offsetHeight)) {
        // todo (fat): remove sketch reliance on jQuery position/offset
        return [$(target)[offsetMethod]().top + offsetBase, targetSelector]
      }
    })
    .sort(function (a, b) { return a[0] - b[0] })
    .forEach(function (item, index) {
      this._offsets.push(item[0])
      this._targets.push(item[1])
    }.bind(this))
}


/**
 * @private
 */
ScrollSpy.prototype._getScrollHeight = function () {
  return this._scrollElement.scrollHeight
      || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
}


/**
 * @private
 */
ScrollSpy.prototype._process = function () {
  var scrollTop    = this._scrollElement.scrollTop + this._config.offset
  var scrollHeight = this._getScrollHeight()
  var maxScroll    = this._config.offset + scrollHeight - this._scrollElement.offsetHeight

  if (this._scrollHeight != scrollHeight) {
    this['refresh']()
  }

  if (scrollTop >= maxScroll) {
    var target = this._targets[this._targets.length - 1]

    if (this._activeTarget != target) {
      this._activate(target)
    }
  }

  if (this._activeTarget && scrollTop < this._offsets[0]) {
    this._activeTarget = null
    this._clear()
    return
  }

  for (var i = this._offsets.length; i--;) {
    var isActiveTarget = this._activeTarget != this._targets[i]
        && scrollTop >= this._offsets[i]
        && (!this._offsets[i + 1] || scrollTop < this._offsets[i + 1])

    if (isActiveTarget) {
      this._activate(this._targets[i])
    }
  }
}


/**
 * @param {Element} target
 * @private
 */
ScrollSpy.prototype._activate = function (target) {
  this._activeTarget = target

  this._clear()

  var selector = this._selector
      + '[data-target="' + target + '"],'
      + this._selector + '[href="' + target + '"]'

  // todo (fat): this seems horribly wrong… getting all raw li elements up the tree ,_,
  var parentListItems = $(selector).parents('li')

  for (var i = parentListItems.length; i--;) {
    parentListItems[i].classList.add('active')

    var itemParent = parentListItems[i].parentNode

    if (itemParent && itemParent.classList.contains('dropdown-menu')) {
      var closestDropdown = $(itemParent).closest('li.dropdown')[0]
      closestDropdown.classList.add('active')
    }
  }

  $(this._scrollElement).trigger('activate.bs.scrollspy', {
    relatedTarget: target
  })
}


/**
 * @private
 */
ScrollSpy.prototype._clear = function () {
  var activeParents = $(this._selector).parentsUntil(this._config.target, '.active')

  for (var i = activeParents.length; i--;) {
    activeParents[i].classList.remove('active')
  }
}


/**
 * ------------------------------------------------------------------------
 * Jquery Interface + noConflict implementaiton
 * ------------------------------------------------------------------------
 */

/**
 * @const
 * @type {Function}
 */
$.fn['scrollspy'] = ScrollSpy.JQUERY_INTERFACE


/**
 * @const
 * @type {Function}
 */
$.fn['scrollspy']['Constructor'] = ScrollSpy


/**
 * @const
 * @type {Function}
 */
$.fn['scrollspy']['noConflict'] = function () {
  $.fn['scrollspy'] = ScrollSpy.JQUERY_NO_CONFLICT
  return this
}


/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(window).on('load.bs.scrollspy.data-api', function () {
  var scrollSpys = document.querySelectorAll('[data-spy="scroll"]')

  for (var i = scrollSpys.length; i--;) {
    var $spy = $(scrollSpys[i])
    ScrollSpy.JQUERY_INTERFACE.call($spy, /** @type {Object|null} */ ($spy.data()))
  }
})
