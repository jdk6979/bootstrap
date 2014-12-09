/** =======================================================================
 * Bootstrap: collapse.js v4.0.0
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ========================================================================
 * @fileoverview - Bootstrap's collapse plugin. Flexible support for
 * collapsible components like accordions and navigation.
 * ========================================================================
 */

'use strict';


/**
 * Our collapse class.
 * @param {Element!} element
 * @param {Object=} opt_config
 * @constructor
 */
var Collapse = function (element, opt_config) {

  /** @private {Element} */
  this._element  = element

  /** @private {Object} */
  this._config = $.extend({}, Collapse.Defaults, opt_config)

  /** @private {Element} */
  this._trigger = typeof this._config.trigger == 'string' ?
    document.querySelector(this._config.trigger) : this._config.trigger

  /** @private {boolean} */
  this._isTransitioning = false

  /** @private {?Element} */
  this._parent = this._config.parent ? this._getParent() : null

  if (!this._config.parent) {
    this._addAriaAndCollapsedClass(this._element, this._trigger)
  }

  if (this._config.toggle) {
    this['toggle']()
  }

}


/**
 * @const
 * @type {string}
 */
Collapse.VERSION = '4.0.0'


/**
 * @const
 * @type {number}
 */
Collapse.TRANSITION_DURATION = 600


/**
 * @const
 * @type {Object}
 */
Collapse.Defaults = {
  toggle: true,
  trigger: '[data-toggle="collapse"]',
  parent: null
}


/**
 * Function for getting target element from element
 * @return {Element}
 */
Collapse.GET_TARGET_FROM_ELEMENT = function (element) {
  var target = element.getAttribute('data-target')

  if (!target) {
    target = element.getAttribute('href')
  }

  return document.querySelector(target)
}


/**
 * @const
 * @type {Function}
 */
Collapse.JQUERY_NO_CONFLICT = $.fn['collapse']


/**
 * Provides the jquery interface for the alert component.
 * @param {Object|string=} opt_config
 * @this {jQuery}
 * @return {jQuery}
 */
Collapse.JQUERY_INTERFACE = function (opt_config) {
  return this.each(function () {
    var $this   = $(this)
    var data    = $this.data('bs.collapse')
    var config = $.extend({}, Collapse.Defaults, $this.data(), typeof opt_config == 'object' && opt_config)


    if (!data && config.toggle && opt_config == 'show') {
      config.toggle = false
    }

    if (!data) {
      data = new Collapse(this, config)
      $this.data('bs.collapse', data)
    }

    if (typeof opt_config == 'string') {
      data[opt_config]()
    }
  })
}


/**
 * Toggles the collapse element based on the presence of the 'in' class
 */
Collapse.prototype['toggle'] = function () {
  if (this._element.classList.contains('in')){
    this['hide']()
  } else {
    this['show']()
  }
}


/**
 * Show's the collapsing element
 */
Collapse.prototype['show'] = function () {
  if (this._isTransitioning || this._element.classList.contains('in')) {
    return
  }

  var activesData, actives

  if (this._parent) {
    actives = this._parent.querySelectorAll('.panel > .in, .panel > .collapsing')
    if (!actives.length) {
      actives = null
    }
  }

  if (actives) {
    activesData = $(actives).data('bs.collapse')
    if (activesData && activesData._isTransitioning) {
      return
    }
  }

  var startEvent = $.Event('show.bs.collapse')
  $(this._element).trigger(startEvent)
  if (startEvent.isDefaultPrevented()) {
    return
  }

  if (actives) {
    Collapse.JQUERY_INTERFACE.call($(actives), 'hide')
    if (!activesData) {
      $(actives).data('bs.collapse', null)
    }
  }

  var dimension = this._getDimension()

  this._element.classList.remove('collapse')
  this._element.classList.add('collapsing')
  this._element.style[dimension] = 0
  this._element.setAttribute('aria-expanded', true)

  if (this._trigger) {
    this._trigger.classList.remove('collapsed')
    this._trigger.setAttribute('aria-expanded', true)
  }

  this._isTransitioning = true

  var complete = function () {
    this._element.classList.remove('collapsing')
    this._element.classList.add('collapse')
    this._element.classList.add('in')
    this._element.style[dimension] = ''

    this._isTransitioning = false

    $(this._element).trigger('shown.bs.collapse')
  }.bind(this)

  if (!$['bootstrap']['transition']) {
    complete()
    return
  }

  var scrollSize = 'scroll' + (dimension[0].toUpperCase() + dimension.slice(1))

  $(this._element)
    .one('bsTransitionEnd', complete)
    .emulateTransitionEnd(Collapse.TRANSITION_DURATION)

  this._element.style[dimension] = this._element[scrollSize] + 'px'
}


/**
 * Hides's the collapsing element
 */
Collapse.prototype['hide'] = function () {
  if (this._isTransitioning || !this._element.classList.contains('in')) {
    return
  }

  var startEvent = $.Event('hide.bs.collapse')
  $(this._element).trigger(startEvent)
  if (startEvent.isDefaultPrevented()) return

  var dimension = this._getDimension()

  Bootstrap.reflow(this._element)

  this._element.classList.add('collapsing')
  this._element.classList.remove('collapse')
  this._element.classList.remove('in')
  this._element.setAttribute('aria-expanded', false)

  if (this._trigger) {
    this._trigger.classList.add('collapsed')
    this._trigger.setAttribute('aria-expanded', false)
  }

  this._isTransitioning = true

  var complete = function () {
    this._isTransitioning = false
    this._element.classList.remove('collapsing')
    this._element.classList.add('collapse')
    $(this._element).trigger('hidden.bs.collapse')
  }.bind(this)

  this._element.style[dimension] = 0

  if (!$['bootstrap']['transition']) {
    return complete()
  }

  $(this._element)
    .one('bsTransitionEnd', complete)
    .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
}


/**
 * Returns the collapsing dimension
 * @private
 * @return {string}
 */
Collapse.prototype._getDimension = function () {
  var hasWidth = this._element.classList.contains('width')
  return hasWidth ? 'width' : 'height'
}


/**
 * Returns the parent element
 * @private
 * @return {Element}
 */
Collapse.prototype._getParent = function () {
  var selector = '[data-toggle="collapse"][data-parent="' + this._config.parent + '"]'
  var parent = document.querySelector(this._config.parent)
  var elements = parent.querySelectorAll(selector)

  for (var i = 0; i < elements.length; i++) {
    this._addAriaAndCollapsedClass(Collapse.GET_TARGET_FROM_ELEMENT(elements[i]), elements[i])
  }

  return parent
}


/**
 * Returns the parent element
 * @param element
 * @param trigger
 * @private
 */
Collapse.prototype._addAriaAndCollapsedClass = function (element, trigger) {
  var isOpen = element.classList.contains('in')
  element.setAttribute('aria-expanded', isOpen)

  if (trigger) {
    trigger.setAttribute('aria-expanded', isOpen)
    trigger.classList.toggle('collapsed', !isOpen)
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
$.fn['collapse'] = Collapse.JQUERY_INTERFACE


/**
 * @const
 * @type {Function}
 */
$.fn['collapse']['Constructor'] = Collapse


/**
 * @const
 * @type {Function}
 */
$.fn['collapse']['noConflict'] = function () {
  $.fn['collapse'] = Collapse.JQUERY_NO_CONFLICT
  return this
}


/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (event) {
  event.preventDefault()

  var target = Collapse.GET_TARGET_FROM_ELEMENT(this)

  var data = $(target).data('bs.collapse')
  var config = data ? 'toggle' : $.extend({}, $(this).data(), { trigger: this })

  Collapse.JQUERY_INTERFACE.call($(target), config)
})
