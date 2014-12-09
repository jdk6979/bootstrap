/** =======================================================================
 * Bootstrap: modal.js v4.0.0
 * http://getbootstrap.com/javascript/#modal
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ========================================================================
 * @fileoverview - Bootstrap's modal plugin. Modals are streamlined, but
 * flexible, dialog prompts with the minimum required functionality and
 * smart defaults.
 * ========================================================================
 */

'use strict';


/**
 * Our modal class.
 * @param {Element} element
 * @param {Object} config
 * @constructor
 */
var Modal = function (element, config) {

  /** @private {Object} */
  this._config = config

  /** @private {Element} */
  this._element = element

  /** @private {Element} */
  this._backdrop = null

  /** @private {boolean} */
  this._isShown = false

  /** @private {boolean} */
  this._isBodyOverflowing = false

  /** @private {number} */
  this._scrollbarWidth = 0

}


/**
 * @const
 * @type {string}
 */
Modal.VERSION  = '4.0.0'


/**
 * @const
 * @type {number}
 */
Modal.TRANSITION_DURATION = 300


/**
 * @const
 * @type {number}
 */
Modal.BACKDROP_TRANSITION_DURATION = 150


/**
 * @const
 * @type {Object}
 */
Modal.Defaults = {
  backdrop: true,
  keyboard: true,
  show: true
}


/**
 * @const
 * @type {Function}
 */
Modal.JQUERY_NO_CONFLICT = $.fn['modal']


/**
 * Provides the jquery interface for the alert component.
 * @param {Object|string=} opt_config
 * @param {Element=} opt_relatedTarget
 * @this {jQuery}
 * @return {jQuery}
 */
Modal.JQUERY_INTERFACE = function Plugin(opt_config, opt_relatedTarget) {
  return this.each(function () {
    var data   = $(this).data('bs.modal')
    var config = $.extend({}, Modal.Defaults, $(this).data(), typeof opt_config == 'object' && opt_config)

    if (!data) {
      data = new Modal(this, config)
      $(this).data('bs.modal', data)
    }

    if (typeof opt_config == 'string') {
      data[opt_config](opt_relatedTarget)

    } else if (config.show) {
      data['show'](opt_relatedTarget)
    }
  })
}


/**
 * @param {Element} relatedTarget
 */
Modal.prototype['toggle'] = function (relatedTarget) {
  return this._isShown ? this['hide']() : this['show'](relatedTarget)
}


/**
 * @param {Element} relatedTarget
 */
Modal.prototype['show'] = function (relatedTarget) {
  var showEvent = $.Event('show.bs.modal', { relatedTarget: relatedTarget })

  $(this._element).trigger(showEvent)

  if (this._isShown || showEvent.isDefaultPrevented()) {
    return
  }

  this._isShown = true

  this._checkScrollbar()
  this._setScrollbar()

  document.body.classList.add('modal-open')

  this._escape()
  this._resize()

  $(this._element).on('click.dismiss.bs.modal', '[data-dismiss="modal"]', this['hide'].bind(this))

  this._showBackdrop(this._showElement.bind(this, relatedTarget))
}


/**
 * @param {Event} event
 */
Modal.prototype['hide'] = function (event) {
  if (event) {
    event.preventDefault()
  }

  var hideEvent = $.Event('hide.bs.modal')

  $(this._element).trigger(hideEvent)

  if (!this._isShown || hideEvent.isDefaultPrevented()) {
    return
  }

  this._isShown = false

  this._escape()
  this._resize()

  $(document).off('focusin.bs.modal')

  this._element.classList.remove('in')
  this._element.setAttribute('aria-hidden', true)

  $(this._element).off('click.dismiss.bs.modal')

  if ($['bootstrap']['transition'] && this._element.classList.contains('fade')) {
    $(this._element)
      .one('bsTransitionEnd', this._hideModal.bind(this))
      .emulateTransitionEnd(Modal.TRANSITION_DURATION)
  } else {
    this._hideModal()
  }
}


/**
 * @param {Element} relatedTarget
 * @private
 */
Modal.prototype._showElement = function (relatedTarget) {
  var transition = $['bootstrap']['transition'] && this._element.classList.contains('fade')

  if (!this._element.parentNode || this._element.parentNode.nodeType != Node.ELEMENT_NODE) {
    document.body.appendChild(this._element) // don't move modals dom position
  }

  this._element.style.display = ''
  this._element.scrollTop = 0

  if (this._config.backdrop) {
    this._adjustBackdrop()
  }

  if (transition) {
    Bootstrap.reflow(this._element)
  }

  this._element.classList.add('in')
  this._element.setAttribute('aria-hidden', false)

  this._enforceFocus()

  var shownEvent = $.Event('shown.bs.modal', { relatedTarget: relatedTarget })

  var transitionComplete = function () {
    this._element.focus()
    $(this._element).trigger(shownEvent)
  }.bind(this)

  if (transition) {
    var dialog = this._element.querySelector('.modal-dialog')
    $(dialog)
      .one('bsTransitionEnd', transitionComplete)
      .emulateTransitionEnd(Modal.TRANSITION_DURATION)
  } else {
    transitionComplete()
  }
}



/**
 * @private
 */
Modal.prototype._enforceFocus = function () {
  $(document)
    .off('focusin.bs.modal') // guard against infinite focus loop
    .on('focusin.bs.modal', function (e) {
      if (this._element !== e.target && !$(this._element).has(e.target).length) {
        this._element.focus()
      }
    }.bind(this))
}


/**
 * @private
 */
Modal.prototype._escape = function () {
  if (this._isShown && this._config.keyboard) {
    $(this._element).on('keydown.dismiss.bs.modal', function (event) {
      if (event.which === 27) {
        this['hide']()
      }
    }.bind(this))

  } else if (!this._isShown) {
    $(this._element).off('keydown.dismiss.bs.modal')
  }
}


/**
 * @private
 */
Modal.prototype._resize = function () {
  if (this._isShown) {
    $(window).on('resize.bs.modal', this._handleUpdate.bind(this))
  } else {
    $(window).off('resize.bs.modal')
  }
}


/**
 * @private
 */
Modal.prototype._hideModal = function () {
  this._element.style.display = 'none'
  this._showBackdrop(function () {
    document.body.classList.remove('modal-open')
    this._resetAdjustments()
    this._resetScrollbar()
    $(this._element).trigger('hidden.bs.modal')
  }.bind(this))
}


/**
 * @private
 */
Modal.prototype._removeBackdrop = function () {
  if (this._backdrop) {
    this._backdrop.parentNode.removeChild(this._backdrop)
    this._backdrop = null
  }
}


/**
 * @param {Function} callback
 * @private
 */
Modal.prototype._showBackdrop = function (callback) {
  var animate = this._element.classList.contains('fade') ? 'fade' : ''

  if (this._isShown && this._config.backdrop) {
    var doAnimate = $['bootstrap']['transition'] && animate

    this._backdrop = document.createElement('div')
    this._backdrop.classList.add('modal-backdrop')

    if (animate) {
      this._backdrop.classList.add(animate)
    }

    this._element.insertBefore(this._backdrop, this._element.firstChild)

    $(this._backdrop).on('click.dismiss.bs.modal', function (event) {
      if (event.target !== event.currentTarget) return
      this._config.backdrop === 'static'
        ? this._element.focus()
        : this['hide']()
    }.bind(this))

    if (doAnimate) {
      Bootstrap.reflow(this._backdrop)
    }

    this._backdrop.classList.add('in')

    if (!callback) {
      return
    }

    if (!doAnimate) {
      callback()
      return
    }

    $(this._backdrop)
      .one('bsTransitionEnd', callback)
      .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION)

  } else if (!this._isShown && this._backdrop) {
    this._backdrop.classList.remove('in')

    var callbackRemove = function () {
      this._removeBackdrop()
      if (callback) {
        callback()
      }
    }.bind(this)

    if ($['bootstrap']['transition'] && this._element.classList.contains('fade')) {
      $(this._backdrop)
        .one('bsTransitionEnd', callbackRemove)
        .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION)
    } else {
      callbackRemove()
    }

  } else if (callback) {
    callback()
  }
}


/**
 * ------------------------------------------------------------------------
 * the following methods are used to handle overflowing modals
 * todo (fat): these should probably be refactored into a
 * ------------------------------------------------------------------------
 */


/**
 * @private
 */
Modal.prototype._handleUpdate = function () {
  if (this._config.backdrop) this._adjustBackdrop()
  this._adjustDialog()
}

/**
 * @private
 */
Modal.prototype._adjustBackdrop = function () {
  this._backdrop.style.height = 0 // todo (fat): no clue why we do this
  this._backdrop.style.height = this._element.scrollHeight + 'px'
}


/**
 * @private
 */
Modal.prototype._adjustDialog = function () {
  var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight

  if (!this._isBodyOverflowing && isModalOverflowing) {
    this._element.style.paddingLeft = this._scrollbarWidth + 'px'
  }

  if (this._isBodyOverflowing && !isModalOverflowing) {
    this._element.style.paddingRight = this._scrollbarWidth + 'px'
  }
}


/**
 * @private
 */
Modal.prototype._resetAdjustments = function () {
  this._element.style.paddingLeft = ''
  this._element.style.paddingRight = ''
}


/**
 * @private
 */
Modal.prototype._checkScrollbar = function () {
  this._isBodyOverflowing = document.body.scrollHeight > document.documentElement.clientHeight
  this._scrollbarWidth = this._getScrollbarWidth()
}


/**
 * @private
 */
Modal.prototype._setScrollbar = function () {
  var bodyPadding = parseInt(($(document.body).css('padding-right') || 0), 10)

  if (this._isBodyOverflowing) {
    document.body.style.paddingRight = bodyPadding + this._scrollbarWidth + 'px'
  }
}


/**
 * @private
 */
Modal.prototype._resetScrollbar = function () {
  document.body.style.paddingRight = ''
}


/**
 * @private
 */
Modal.prototype._getScrollbarWidth = function () { // thx walsh
  var scrollDiv = document.createElement('div')
  scrollDiv.className = 'modal-scrollbar-measure'
  document.body.appendChild(scrollDiv)
  var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)
  return scrollbarWidth
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
$.fn['modal'] = Modal.JQUERY_INTERFACE


/**
 * @const
 * @type {Function}
 */
$.fn['modal']['Constructor'] = Modal


/**
 * @const
 * @type {Function}
 */
$.fn['modal']['noConflict'] = function () {
  $.fn['modal'] = Modal.JQUERY_NO_CONFLICT
  return this
}


/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (event) {
  var target = document.querySelector(this.getAttribute('data-target') || this.getAttribute('href'))
  var config = $(target).data('bs.modal') ? 'toggle' : $.extend({}, $(target).data(), $(this).data())

  if (this.tagName == 'A') {
    event.preventDefault()
  }

  var $target = $(target).one('show.bs.modal', function (showEvent) {
    if (showEvent.isDefaultPrevented()) {
      return // only register focus restorer if modal will actually get shown
    }

    $target.one('hidden.bs.modal', function () {
      if ($(this).is(':visible')) {
        this.focus()
      }
    }.bind(this))
  }.bind(this))

  Modal.JQUERY_INTERFACE.call($(target), config, this)
})
