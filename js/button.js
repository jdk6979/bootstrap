/** =======================================================================
 * Bootstrap: button.js v4.0.0
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ========================================================================
 * @fileoverview - Bootstrap's generic button component.
 *
 * Note (@fat): Deprecated "setState" – imo, better solutions for managing a
 * buttons state should exist outside this plugin.
 * ========================================================================
 */

'use strict';


/**
 * Our Button class.
 * @param {Element!} element
 * @constructor
 */
var Button = function (element) {

  /** @private {Element} */
  this._element = element

}


/**
 * @const
 * @type {string}
 */
Button.VERSION  = '4.0.0'


/**
 * @const
 * @type {Function}
 */
Button.JQUERY_NO_CONFLICT = $.fn.button


/**
 * Provides the jquery interface for the Button component.
 * @this {jQuery}
 * @return {jQuery}
 */
Button.JQUERY_INTERFACE = function (option) {
  return this.each(function () {
    var $this = $(this)
    var data  = $this.data('bs.button')

    if (!data) {
      data = new Button(this)
      $this.data('bs.button', data)
    }

    if (option == 'toggle') {
      data.toggle()
    }
  })
}


/**
 * Toggle's the button active state
 */
Button.prototype.toggle = function () {
  var triggerChangeEvent = true
  var rootElement = $(this._element).closest('[data-toggle="buttons"]')[0]

  if (rootElement) {
    var input = this._element.querySelector('input')
    if (input) {
      if (input.type == 'radio') {
        if (input.checked && this._element.classList.contains('active')) {
          triggerChangeEvent = false
        } else {
          var activeElement = rootElement.querySelector('.active')
          if (activeElement) activeElement.classList.remove('active')
        }
      }

      if (triggerChangeEvent) {
        input.checked = !this._element.classList.contains('active')
        $(this._element).trigger('change')
      }
    }
  } else {
    this._element.setAttribute('aria-pressed', !this._element.classList.contains('active'))
  }

  if (triggerChangeEvent) {
    this._element.classList.toggle('active')
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
$.fn['button'] = Button.JQUERY_INTERFACE


/**
 * @const
 * @type {Function}
 */
$.fn['button']['Constructor'] = Button


/**
 * @const
 * @type {Function}
 */
$.fn['button']['noConflict'] = function () {
  $.fn.button = Button.JQUERY_NO_CONFLICT
  return this
}


/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(document)
  .on('click.bs.button.data-api', '[data-toggle^="button"]', function (event) {
    event.preventDefault()

    var button = event.target

    if (!button.classList.contains('btn')) {
      button = $(button).closest('.btn')
    }

    Button.JQUERY_INTERFACE.call(button, 'toggle')
  })
  .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (event) {
    var button = $(event.target).closest('.btn')[0]
    button.classList.toggle('focus', /^focus(in)?$/.test(event.type))
  })
