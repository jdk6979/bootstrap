/** =======================================================================
 * Bootstrap: dropdown.js v4.0.0
 * http://getbootstrap.com/javascript/#dropdown
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ========================================================================
 * @fileoverview - Add dropdown menus to nearly anything with this simple
 * plugin, including the navbar, tabs, and pills.
 * ========================================================================
 */

'use strict';


/**
 * Our dropdown class.
 * @param {Element!} element
 * @constructor
 */
var Dropdown = function (element) {
  $(element).on('click.bs.dropdown', this['toggle'])
}


/**
 * @const
 * @type {string}
 */
Dropdown.VERSION = '4.0.0'


/**
 * @const
 * @type {string}
 */
Dropdown.BACKDROP_SELECTOR = '.dropdown-backdrop'


/**
 * @const
 * @type {string}
 */
Dropdown.TOGGLE_SELECTOR = '[data-toggle="dropdown"]'


/**
 * @const
 * @type {Function}
 */
Dropdown.JQUERY_NO_CONFLICT = $.fn['dropdown']


/**
 * Provides the jquery interface for the alert component.
 * @param {string=} opt_config
 * @this {jQuery}
 * @return {jQuery}
 */
Dropdown.jQueryInterface = function (opt_config) {
  return this.each(function () {
    var data  = $(this).data('bs.dropdown')

    if (!data) {
      $(this).data('bs.dropdown', (data = new Dropdown(this)))
    }

    if (typeof opt_config == 'string') {
      data[opt_config].call(this)
    }
  })
}


/**
 * @param {Event=} opt_event
 */
Dropdown.clearMenus = function (opt_event) {
  if (opt_event && opt_event.which == 3) {
    return
  }

  var backdrop = document.querySelector(Dropdown.BACKDROP_SELECTOR)
  if (backdrop) {
    backdrop.parentNode.removeChild(backdrop)
  }

  var toggles = document.querySelectorAll(Dropdown.TOGGLE_SELECTOR)

  for (var i = 0; i < toggles.length; i++) {
    var parent = Dropdown.getParentFromElement(toggles[i])
    var relatedTarget = { 'relatedTarget': toggles[i] }

    if (!parent.classList.contains('open')) {
      continue
    }

    var hideEvent = $.Event('hide.bs.dropdown', relatedTarget)
    $(parent).trigger(hideEvent)
    if (hideEvent.isDefaultPrevented()) {
      continue
    }

    toggles[i].setAttribute('aria-expanded', 'false')
    parent.classList.remove('open')
    $(parent).trigger('hidden.bs.dropdown', relatedTarget)
  }
}


/**
 * @param {Element} element
 * @return {Element}
 */
Dropdown.getParentFromElement = function (element) {
  var selector = element.getAttribute('data-target')

  if (!selector) {
    selector = element.getAttribute('href') || ''
    selector = /#\w/.test(selector) && selector
  }

  if (selector) {
    var parent = document.querySelector(/** @type {string} */ (selector))
  }

  return /** @type {Element} */ (parent || element.parentNode)
}


/**
 * @param {Event} event
 * @this {Element}
 */
Dropdown.dataApiKeydownHandler = function (event) {
  if (!/(38|40|27|32)/.test(event.which) || /input|textarea/i.test(event.target.tagName)) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  if (this.disabled || this.classList.contains('disabled')) {
    return
  }

  var parent  = Dropdown.getParentFromElement(this)
  var isActive = parent.classList.contains('open')

  if ((!isActive && event.which != 27) || (isActive && event.which == 27)) {
    if (event.which == 27) {
      var toggle = parent.querySelector(Dropdown.TOGGLE_SELECTOR)
      $(toggle).trigger('focus')
    }
    $(this).trigger('click')
    return
  }

  var desc = ' li:not(.divider):visible a'
  var items = parent.querySelectorAll('[role="menu"]' + desc + ', [role="listbox"]' + desc)

  if (!items.length) {
    return
  }

  var index = Array.prototype.slice.apply(items).indexOf(event.target)

  if (event.which == 38 && index > 0)                index--                        // up
  if (event.which == 40 && index < items.length - 1) index++                        // down
  if (!~index)                                       index = 0

  items[index].focus()
}


/**
 * Toggles the dropdown
 * @this {Element}
 * @return {boolean|undefined}
 */
Dropdown.prototype['toggle'] = function () {
  if (this.disabled || this.classList.contains('disabled')) {
    return
  }

  var parent   = Dropdown.getParentFromElement(this)
  var isActive = parent.classList.contains('open')

  Dropdown.clearMenus()

  if (isActive) {
    return false
  }

  if ('ontouchstart' in document.documentElement && !$(parent).closest('.navbar-nav').length) {
    // if mobile we use a backdrop because click events don't delegate
    var dropdown = document.createElement('div')
    dropdown.classList.add('dropdown-backdrop')
    this.parentNode.insertBefore(this, dropdown)
    $(dropdown).on('click', Dropdown.clearMenus)
  }

  var relatedTarget = { 'relatedTarget': this }
  var showEvent     = $.Event('show.bs.dropdown', relatedTarget)
  $(parent).trigger(showEvent)

  if (showEvent.isDefaultPrevented()) {
    return
  }

  this.focus()
  this.setAttribute('aria-expanded', 'true')

  parent.classList.toggle('open')
  $(parent).trigger('shown.bs.dropdown', relatedTarget)

  return false
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
$.fn['dropdown'] = Dropdown.jQueryInterface


/**
 * @const
 * @type {Function}
 */
$.fn['dropdown']['Constructor'] = Dropdown


/**
 * @const
 * @type {Function}
 */
$.fn['dropdown']['noConflict'] = function () {
  $.fn['dropdown'] = Dropdown.JQUERY_NO_CONFLICT
  return this
}


/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(document)
  .on('click.bs.dropdown.data-api', Dropdown.clearMenus)
  .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
  .on('click.bs.dropdown.data-api', Dropdown.TOGGLE_SELECTOR, Dropdown.prototype['toggle'])
  .on('keydown.bs.dropdown.data-api', Dropdown.TOGGLE_SELECTOR, Dropdown.dataApiKeydownHandler)
  .on('keydown.bs.dropdown.data-api', '[role="menu"]', Dropdown.dataApiKeydownHandler)
  .on('keydown.bs.dropdown.data-api', '[role="listbox"]', Dropdown.dataApiKeydownHandler)
