 /** =======================================================================
 * Bootstrap: carousel.js v4.0.0
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ========================================================================
 * @fileoverview - Bootstrap's carousel. A slideshow component for cycling
 * through elements, like a carousel. Nested carousels are not supported.
 * ========================================================================
 */

'use strict';


/**
 * Our carousel class.
 * @param {Element!} element
 * @param {Object=} opt_config
 * @constructor
 */
var Carousel = function (element, opt_config) {

  /** @private {Element} */
  this._element = element

  /** @private {Element} */
  this._indicatorsElement = this._element.querySelector('.carousel-indicators')

  /** @private {?Object} */
  this._config = opt_config || null

  /** @private {boolean} */
  this._isPaused = false

  /** @private {boolean} */
  this._isSliding = false

  /** @private {?number} */
  this._interval = null

  /** @private {?Element} */
  this._activeElement = null

  /** @private {?NodeList} */
  this._items = null

  this._addEventListeners()

}


/**
 * @const
 * @type {string}
 */
Carousel.VERSION = '4.0.0'


/**
 * @const
 * @type {number}
 */
Carousel.TRANSITION_DURATION = 600


/**
 * @const
 * @enum {string}
 */
Carousel.DirectionalClassName = {
  LEFT: 'left',
  RIGHT: 'right'
}


/**
 * @const
 * @enum {string}
 */
Carousel.Direction = {
  NEXT: 'next',
  PREVIOUS: 'prev'
}


/**
 * @const
 * @type {Object}
 */
Carousel.Defaults = {
  interval: 5000,
  pause: 'hover',
  wrap: true,
  keyboard: true,
  slide: true
}


/**
 * @const
 * @type {Function}
 */
Carousel.JQUERY_NO_CONFLICT = $.fn['carousel']


/**
 * @param {Object=} opt_config
 * @this {jQuery}
 * @return {jQuery}
 */
Carousel.JQUERY_INTERFACE = function (opt_config) {
  return this.each(function () {
    var $this  = $(this)
    var data   = $this.data('bs.carousel')
    var config = $.extend({}, Carousel.Defaults, $this.data(), typeof opt_config == 'object' && opt_config)
    var action = typeof opt_config == 'string' && opt_config

    if (!data) {
      data = new Carousel(this, config)
      $this.data('bs.carousel', data)
    }

    if (typeof opt_config == 'number') {
      data.to(opt_config)

    } else if (action) {
      data[action]()

    } else if (config.interval) {
      data['pause']()
      data['cycle']()
    }
  })
}


/**
 * Click handler for data api
 * @param {Event} event
 * @this {Element}
 */
Carousel.DATA_API_CLICK_HANDLER = function (event) {
  var target = document.querySelector(this.getAttribute('data-target') || this.getAttribute('href'))

  if (!target || !target.classList.contains('carousel')) {
    return
  }

  var config = $.extend({}, $(target).data(), $(this).data())

  var slideIndex = this.getAttribute('data-slide-to')
  if (slideIndex) {
    config.interval = false
  }

  Carousel.JQUERY_INTERFACE.call($(target), config)

  if (slideIndex) {
    $(target).data('bs.carousel').to(slideIndex)
  }

  event.preventDefault()
}


/**
 * Advance the carousel to the next slide
 */
Carousel.prototype['next'] = function () {
  if (!this._isSliding) {
    this._slide(Carousel.Direction.NEXT)
  }
}


/**
 * Return the carousel to the previous slide
 */
Carousel.prototype['prev'] = function () {
  if (!this._isSliding) {
    this._slide(Carousel.Direction.PREVIOUS)
  }
}


/**
 * Pause the carousel cycle
 * @param {Event=} opt_event
 */
Carousel.prototype['pause'] = function (opt_event) {
  if (!opt_event) {
    this._isPaused = true
  }

  if (this._element.querySelector('.next, .prev') && $['bootstrap']['transition']) {
    $(this._element).trigger($['bootstrap']['transition']['end'])
    this['cycle'](true)
  }

  clearInterval(this._interval)
  this._interval = null
}


/**
 * Cycle to the next carousel item
 * @param {Event|boolean=} opt_event
 * @private
 */
Carousel.prototype['cycle'] = function (opt_event) {
  if (!opt_event) {
    this._isPaused = false
  }

  if (this._interval) {
    clearInterval(this._interval)
    this._interval = null
  }

  if (this._config.interval && !this._isPaused) {
    this._interval = setInterval(this['next'].bind(this), this._config.interval)
  }
}


/**
 * Move active carousel item to specified index
 * @param {number} index
 */
Carousel.prototype.to = function (index) {
  this._activeElement = this._element.querySelector('.item.active')

  var activeIndex = this._getItemIndex(this._activeElement)

  if (index > (this._items.length - 1) || index < 0) {
    return
  }

  if (this._isSliding) {
    $(this._element).one('slid.bs.carousel', function () { this.to(index) }.bind(this))
    return
  }

  if (activeIndex == index) {
    this['pause']()
    this['cycle']()
    return
  }

  var direction = index > activeIndex ?
    Carousel.Direction.NEXT :
    Carousel.Direction.PREVIOUS

  this._slide(direction, this._items[index])
}


/**
 * Add event listeners to root element
 * @private
 */
Carousel.prototype._addEventListeners = function () {
  if (this._config.keyboard) {
    $(this._element).on('keyboard.bs.carousel', this._keydown.bind(this))
  }

  if (this._config.pause == 'hover' && !('ontouchstart' in document.documentElement)) {
    $(this._element)
      .on('mouseenter.bs.carousel', this['pause'].bind(this))
      .on('mouseleave.bs.carousel', this['cycle'].bind(this))
  }
}


/**
 * Keydown handler
 * @param {Event} event
 * @private
 */
Carousel.prototype._keydown = function (event) {
  event.preventDefault()

  if (/input|textarea/i.test(event.target.tagName)) return
  switch (event.which) {
    case 37: this['prev'](); break
    case 39: this['next'](); break
    default: return
  }
}


/**
 * Get item index
 * @param {Element} element
 * @return {number}
 * @private
 */
Carousel.prototype._getItemIndex = function (element) {
  this._items = element.parentNode.querySelectorAll('.item')

  var itemsArray = Array.prototype.slice.call(this._items)

  return itemsArray.indexOf(element)
}


/**
 * Get next displayed item based on direction
 * @param {Carousel.Direction} direction
 * @param {Element} activeElement
 * @return {Element}
 * @private
 */
Carousel.prototype._getItemByDirection = function (direction, activeElement) {
  var activeIndex = this._getItemIndex(activeElement)

  var isGoingToWrap = (direction === Carousel.Direction.PREVIOUS && activeIndex === 0) ||
                      (direction === Carousel.Direction.NEXT && activeIndex == (this._items.length - 1))

  if (isGoingToWrap && !this._config.wrap) {
    return activeElement
  }

  var delta = direction == Carousel.Direction.PREVIOUS ? -1 : 1
  var itemIndex = activeIndex + delta % this._items.length

  return this._items[itemIndex]
}


/**
 * Trigger slide event on element
 * @param {Element} relatedTarget
 * @param {Carousel.Direction} direction
 * @return {$.Event}
 * @private
 */
Carousel.prototype._triggerSlideEvent = function (relatedTarget, direction) {
  var slideEvent = $.Event('slide.bs.carousel', {
    relatedTarget: relatedTarget,
    direction: direction
  })

  $(this._element).trigger(slideEvent)

  return slideEvent
}


/**
 * Set the active indicator if available
 * @param {Element} element
 * @private
 */
Carousel.prototype._setActiveIndicatorElement = function (element) {
  if (this._indicatorsElement) {
    this._indicatorsElement.querySelector('.active').classList.remove('active')

    var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)]
    if (nextIndicator) {
      nextIndicator.classList.add('active')
    }
  }
}


/**
 * Slide the carousel element in a direction
 * @param {Carousel.Direction} direction
 * @param {Element=} opt_nextElement
 */
Carousel.prototype._slide = function (direction, opt_nextElement) {
  var activeElement = this._element.querySelector('.item.active')
  var nextElement = opt_nextElement || activeElement && this._getItemByDirection(direction, activeElement)

  var isCycling = !!this._interval
  var directionalClassName = direction == Carousel.Direction.NEXT ?
    Carousel.DirectionalClassName.LEFT :
    Carousel.DirectionalClassName.RIGHT

  if (nextElement && nextElement.classList.contains('active')) {
    this._isSliding = false
    return
  }

  var slideEvent = this._triggerSlideEvent(nextElement, direction)
  if (slideEvent.isDefaultPrevented()) {
    return
  }

  if (!activeElement || !nextElement) {
    // some weirdness is happening, so we bail (maybe throw exception here alerting user that they're dom is off
    return
  }

  this._isSliding = true

  if (isCycling) {
    this['pause']()
  }

  this._setActiveIndicatorElement(nextElement)

  var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: nextElement, direction: direction })

  if ($['bootstrap']['transition'] && this._element.classList.contains('slide')) {
    nextElement.classList.add(direction)
    Bootstrap.reflow(nextElement)

    activeElement.classList.add(directionalClassName)
    nextElement.classList.add(directionalClassName)

    $(activeElement)
      .one('bsTransitionEnd', function () {
        nextElement.classList.remove(directionalClassName)
        nextElement.classList.remove(direction)
        nextElement.classList.add('active')

        activeElement.classList.remove('active')
        activeElement.classList.remove(direction)

        this._isSliding = false

        setTimeout(function () {
          $(this._element).trigger(slidEvent)
        }.bind(this), 0)
      }.bind(this))
      .emulateTransitionEnd(Carousel.TRANSITION_DURATION)

  } else {
    activeElement.classList.remove('active')
    nextElement.classList.add('active')
    this._isSliding = false
    $(this._element).trigger(slidEvent)
  }

  if (isCycling) {
    this['cycle']()
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
$.fn['carousel'] = Carousel.JQUERY_INTERFACE


/**
 * @const
 * @type {Function}
 */
$.fn['carousel']['Constructor'] = Carousel


/**
 * @const
 * @type {Function}
 */
$.fn['carousel']['noConflict'] = function () {
  $.fn['carousel'] = Carousel.JQUERY_NO_CONFLICT
  return this
}


/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

$(document)
  .on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', Carousel.DATA_API_CLICK_HANDLER)

$(window).on('load', function () {
  $('[data-ride="carousel"]').each(function () {
    var $carousel = $(this)
    Carousel.JQUERY_INTERFACE.call($carousel, /** @type {Object} */ ($carousel.data()))
  })
})
