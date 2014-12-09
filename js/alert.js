/** =======================================================================
 * Bootstrap: alert.js v4.0.0
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


/**
 * Our Alert class.
 * @param {Element=} opt_element
 * @constructor
 */
var Alert = function (opt_element) {
  if (opt_element) {
    $(opt_element).on('click', Alert.DISMISS_SELECTOR, Alert.HANDLE_DISMISS(this))
  }
}


/**
 * @const
 * @type {string}
 */
Alert.VERSION = '4.0.0'


/**
 * @const
 * @type {string}
 */
Alert.DISMISS_SELECTOR = '[data-dismiss="alert"]'


/**
 * @const
 * @type {number}
 */
Alert.TRANSITION_DURATION = 150


/**
 * @const
 * @type {Function}
 */
Alert.JQUERY_NO_CONFLICT = $.fn['alert']


/**
 * Provides the jquery interface for the alert component.
 * @param {string=} opt_config
 * @this {jQuery}
 * @return {jQuery}
 */
Alert.JQUERY_INTERFACE = function (opt_config) {
  return this.each(/** @this {Element} */ (function () {
    var $this = $(this)

    var data  = $this.data('bs.alert')

    if (!data) {
      data = new Alert(this)
      $this.data('bs.alert', data)
    }

    if (opt_config == 'close') {
      data.close.call(data, this)
    }
  }))
}


/**
 * Close the alert component
 * @param {Alert} alertInstance
 * @return {Function}
 */
Alert.HANDLE_DISMISS = function (alertInstance) {
  return function (event) {
    if (event) {
      event.preventDefault()
    }

    alertInstance.close(this)
  }
}


/**
 * Close the alert component
 * @param {Element} element
 */
Alert.prototype.close = function (element) {
  var rootElement = this._getRootElement(element)
  var customEvent = this._triggerCloseEvent(rootElement)

  if (customEvent.isDefaultPrevented()) return

  this._removeElement(rootElement)
}


/**
 * Tries to get the alert's root element
 * @return {Element}
 * @private
 */
Alert.prototype._getRootElement = function (element) {
  var parent = false
  var target = element.getAttribute('data-target')

  if (!target) {
    target = element.getAttribute('href')
  }

  if (target && /\w/.test(target)) {
    parent = document.querySelector(target)
  }

  if (!parent) {
    parent = $(element).closest('.alert')[0]
  }

  return parent
}


/**
 * Trigger close event on element
 * @return {$.Event}
 * @private
 */
Alert.prototype._triggerCloseEvent = function (element) {
  var closeEvent = $.Event('close.bs.alert')
  $(element).trigger(closeEvent)
  return closeEvent
}


/**
 * Trigger closed event and remove element from dom
 * @private
 */
Alert.prototype._removeElement = function (element) {
  element.classList.remove('in')

  if (!$['bootstrap']['transition'] || !element.classList.contains('fade')) {
    this._destroyElement(element)
    return
  }

  $(element)
    .one('bsTransitionEnd', this._destroyElement.bind(this, element))
    .emulateTransitionEnd(Alert.TRANSITION_DURATION)
}


/**
 * clean up any lingering jquery data and kill element
 * @private
 */
Alert.prototype._destroyElement = function (element) {
  $(element)
    .detach()
    .trigger('closed.bs.alert')
    .remove()
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
$.fn['alert'] = Alert.JQUERY_INTERFACE


/**
 * @const
 * @type {Function}
 */
$.fn['alert']['Constructor'] = Alert


/**
 * @return {Function}
 */
$.fn['alert']['noConflict'] = function () {
  $.fn['alert'] = Alert.JQUERY_NO_CONFLICT
  return Alert.JQUERY_INTERFACE
}


/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(document).on('click.bs.alert.data-api', Alert.DISMISS_SELECTOR, Alert.HANDLE_DISMISS(new Alert))
