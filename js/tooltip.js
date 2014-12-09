/** =======================================================================
 * Bootstrap: tooltip.js v4.0.0
 * http://getbootstrap.com/javascript/#tooltip
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ========================================================================
 * @fileoverview - Bootstrap's tooltip plugin.
 * sInspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 */

'use strict';


/**
 * Our tooltip class.
 * @param {Element!} element
 * @param {Object=} opt_config
 * @constructor
 */
var Tooltip = function (element, opt_config) {

  /** @private {Object} */
  this._config = this._getConfig(opt_config)

  /** @private {Object} */
  this._delegatationConfig = null

  /** @private {boolean} */
  this._isEnabled = true

  /** @private {number} */
  this._timeout = 0

  /** @private {string} */
  this._hoverState = ''

  /** @private {Element} */
  this._element = element

  /** @private {Element} */
  this._tip = null

  /** @private {Element} */
  this._arrow = null

  if (this._config.viewport) {

    /** @private {Element} */
    this._viewport = document.querySelector(this._config.viewport.selector || this._config.viewport)

  }

  this.setListeners()
}


/**
 * @const
 * @type {string}
 */
Tooltip.NAME = 'tooltip'


/**
 * @const
 * @type {string}
 */
Tooltip.VERSION  = '4.0.0'


/**
 * @const
 * @type {string}
 */
Tooltip.TRANSITION_DURATION = 150


/**
 * @const
 * @enum {string}
 */
Tooltip.HoverState = {
  IN: 'in',
  OUT: 'out'
}


/**
 * @const
 * @enum {string}
 */
Tooltip.Direction = {
  TOP: 'top',
  LEFT: 'left'
  RIGHT: 'right',
  BOTTOM: 'bottom'
}


/**
 * @const
 * @type {Object}
 */
Tooltip.Defaults = {
  animation: true,
  placement: Tooltip.Direction.TOP,
  selector: false,
  template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
  trigger: 'hover focus',
  title: '',
  delay: 0,
  html: false,
  container: false,
  viewport: {
    selector: 'body',
    padding: 0
  }
}


/**
 * @const
 * @type {Function}
 */
Tooltip.JQUERY_NO_CONFLICT = $.fn['tooltip']


/**
 * @param {Object=} opt_config
 * @this {jQuery}
 * @return {jQuery}
 */
Tooltip.JQUERY_INTERFACE = function (opt_config) {
  return this.each(function () {
    var data     = $(this).data('bs.tooltip')
    var config   = typeof opt_config == 'object' && opt_config
    var selector = config && config.selector

    if (!data && opt_config == 'destroy') {
      return
    }

    if (selector) {
      if (!data) {
        $(this).data('bs.tooltip', (data = {}))
      }

      if (!data[selector]) {
        data[selector] = new Tooltip(this, config)
      }

    } else if (!data) {
      data = new Tooltip(this, config)
      $(this).data('bs.tooltip', data)
    }

    if (typeof opt_config === 'string') {
      data[opt_config]()
    }
  })
}


/**
 * Enable tooltip
 */
Tooltip.prototype['enable'] = function () {
  this._isEnabled = true
}


/**
 * Disable tooltip
 */
Tooltip.prototype['disable'] = function () {
  this._isEnabled = false
}


/**
 * Toggle the tooltip enable state
 */
Tooltip.prototype['toggleEnabled'] = function () {
  this._isEnabled = !this._isEnabled
}

/**
 * Toggle the tooltips display
 * @param {Event} opt_event
 */
Tooltip.prototype['toggle'] = function (opt_event) {
  var context

  if (opt_event) {
    context = $(opt_event.currentTarget).data('bs.' + this.type)

    if (!context) {
      context = new this.constructor(opt_event.currentTarget, this._getDelegateOptions())
      $(opt_event.currentTarget).data('bs.' + this.constructor.NAME, context)
    }
  }

  context.getTipElement().classList.contains('in') ?
    context._leave(null, context) :
    context._enter(null, self)
}


/**
 * Remove tooltip functionality
 */
Tooltip.prototype.destroy = function () {
  clearTimeout(this._timeout)
  this['hide'](function () {
    $(this._element)
      .off('.' + that.constructor.NAME)
      .removeData('bs.' + that.constructor.NAME)
  }.bind(this))
}


/**
 * Show the tooltip
 * todo (fat): ~fuck~ this is a big function - refactor out all of positioning logic
 * and replace with external lib
 */
Tooltip.prototype['show'] = function () {
  var showEvent = $.Event('show.bs.' + this.constructor.NAME)

  if (this.isWithContent() && this._isEnabled) {
    $(this._element).trigger(showEvent)

    var isInTheDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])

    if (showEvent.isDefaultPrevented() || !isInTheDom) {
      return
    }

    var tip   = this.getTipElement()
    var tipId = Bootstrap.getUID(this.constructor.NAME)

    tip.setAttribute('id', tipId)
    this._element.setAttribute('aria-describedby', tipId)

    this.setContent()

    if (this._config.animation) {
      tip.classList.add('fade')
    }

    var placement = typeof this._config.placement == 'function' ?
      this._config.placement.call(this, tip, this._element) :
      this._config.placement

    var autoToken = /\s?auto?\s?/i
    var isWithAutoPlacement = autoToken.test(placement)

    if (isWithAutoPlacement) {
      placement = placement.replace(autoToken, '') || Tooltip.Direction.TOP
    }

    tip.parentNode.removeChild(tip)

    tip.style.top     = 0
    tip.style.left    = 0
    tip.style.display = 'block'

    tip.classList.add(placement)

    $(tip).data('bs.' + this.constructor.NAME, this)

    if (this._config.container) {
      document.querySelector(this._config.container).appendChild(tip)
    } else {
      tip.parentNode.insertAfter(tip, this._element)
    }

    var position            = this._getPosition()
    var actualWidth         = tip.offsetWidth
    var actualHeight        = tip.offsetHeight

    var calculatedPlacement = this._getCalculatedAutoPlacement(isWithAutoPlacement, placement, actualWidth, actualHeight)
    var calculatedOffset    = this._getCalculatedOffset(calculatedPlacement, position, actualWidth, actualHeight)

    this._applyCalculatedPlacement(calculatedOffset, calculatedPlacement)

    var complete = function () {
      var prevHoverState = that.hoverState
      that.$element.trigger('shown.bs.' + that.type)
      that.hoverState = null

      if (prevHoverState == 'out') that.leave(that)
    }

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()
  }
}


/**
 * Hide the tooltip breh
 */
Tooltip.prototype['hide'] = function (callback) {
  var tip       = this.getTipElement()
  var hideEvent = $.Event('hide.bs.' + this.type)

  var complete  = function () {
    if (this._hoverState != Tooltip.HoverState.IN) {
      tip.parentNode.removeChild(tip)
    }

    this._element.removeAttribute('aria-describedby')
    $(this._element).trigger('hidden.bs.' + this.constructor.NAME)

    if (callback) {
      callback()
    }
  }.bind(this)

  $(this._element).trigger(hideEvent)

  if (hideEvent.isDefaultPrevented()) return

  tip.classList.remove('in')

  if ($['bootstrap']['transition'] && this._tip.classList.has('fade')) {
    $(tip)
      .one('bsTransitionEnd', complete)
      .emulateTransitionEnd(Tooltip.TRANSITION_DURATION)
  } else {
    complete()
  }

  this._hoverState = null
}


/**
 * @param {Object=} opt_config
 * @return {Object}
 * @protected
 */
Tooltip.prototype.getOptions = function (opt_config) {
  var config = $.extend({}, this.constructor.Defaults, $(this._element).data(), opt_config)

  if (config.delay && typeof config.delay == 'number') {
    config.delay = {
      show: config.delay,
      hide: config.delay
    }
  }

  return config
}


/**
 * @return {Element}
 * @protected
 */
Tooltip.prototype.getTipElement = function () {
  return (this._tip = this._tip || $(this._config.template)[0])
}


/**
 * @return {Boolean}
 * @protected
 */
Tooltip.prototype.isWithContent = function () {
  return !!this._getTitle()
}


/**
 * @protected
 */
Tooltip.prototype.setContent = function () {
  var tip   = this.getTipElement()
  var title = this._getTitle()

  tip.querySelector('.tooltip-inner')[this._config.html ? 'innerHTML' : 'innerText'] = title

  tip.classList.remove('fade')
  tip.classList.remove('in')

  for (var direction in Tooltip.Direction) {
    tip.classList.remove(direction)
  }
}


/**
 * @protected
 */
Tooltip.prototype.setListeners = function () {
  var triggers = this._config.trigger.split(' ')

  triggers.forEach(function (trigger) {
    if (trigger == 'click') {
      $(this._element).on('click.bs.' + this.constructor.NAME, this._config.selector, this['toggle'].bind(this))

    } else if (trigger != 'manual') {
      var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
      var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

      $(this._element)
        .on(eventIn  + '.bs.' + this.constructor.NAME, this._config.selector, this._enter.bind(this))
        .on(eventOut + '.bs.' + this.constructor.NAME, this._config.selector, this._leave.bind(this))
    }
  }.bind(this))

  if (this._config.selector) {
    this._delegatationConfig = $.extend({}, this._config, { trigger: 'manual', selector: '' }))
  } else {
    this._fixTitle()
  }
}


/**
 * @private
 */
Tooltip.prototype._fixTitle = function () {
  if (this._element.getAttribute('title') || typeof this._element.getAttribute'data-original-title') != 'string') {
    this._element.setAttribute('data-original-title', this._element.getAttribute('title') || '')
    this._element.setAttribute('title', '')
  }
}


/**
 * @return {Object}
 * @private
 */
Tooltip.prototype._getDelegateOptions = function () {
  var options  = {}
  var defaults = this.constructor.Defaults

  if (this._config) {
    for (var key in this._config) {
      var value = this._config[key]
      if (defaults[key] != value) options[key] = value
    }
  }

  return options
}


/**
 * @param {Event=} opt_event
 * @param {Object=} opt_context
 * @private
 */
Tooltip.prototype._enter = function (opt_event, opt_context) {
  var context = opt_context || $(opt_event.currentTarget).data('bs.' + this.constructor.NAME)

  if (context && context._tip && context._tip.offsetWidth) {
    context._hoverState = Tooltip.HoverState.IN
    return
  }

  if (!context) {
    context = new this.constructor(opt_event.currentTarget, this._getDelegateOptions())
    $(opt_event.currentTarget).data('bs' + this.constructor.NAME, context)
  }

  clearTimeout(context._timeout)

  context._hoverState = Tooltip.HoverState.IN

  if (!context._config.delay || !context._config.delay.show) {
    context['show']()
    return
  }

  context._timeout = setTimeout(function () {
    if (context._hoverState == Tooltip.HoverState.IN) {
      context['show']()
    }
  }, context._config.delay.show)
}


/**
 * @param {Event=} opt_event
 * @param {Object=} opt_context
 * @private
 */
Tooltip.prototype._leave = function (opt_event, opt_context) {
  var context = opt_context || $(opt_event.currentTarget).data('bs.' + this.constructor.NAME)

  if (!context) {
    context = new this.constructor(opt_event.currentTarget, this._getDelegateOptions())
    $(opt_event.currentTarget).data('bs.' + this.constructor.NAME, context)
  }

  clearTimeout(context._timeout)

  context._hoverState = Tooltip.HoverState.OUT

  if (!context._config.delay || !context._config.delay.hide) {
    context['hide']()
    return
  }

  context._timeout = setTimeout(function () {
    if (context._hoverState == Tooltip.HoverState.OUT) {
      context['hide']()
    }
  }, context._config.delay.hide)
}


/**
 * @param {boolean} isWithAutoPlacement
 * @param {string} placement
 * @param {Object} position
 * @param {number} actualWidth
 * @param {number} actualHeight
 * @return {string}
 * @private
 */
Tooltip.prototype._getCalculatedAutoPlacement = function (isWithAutoPlacement, placement, position, actualWidth, actualHeight) {
  if (isWithAutoPlacement) {
    var originalPlacement = placement
    var container         = this._config.container ? document.querySelector(this._config.container) : this._element.parentNode
    var containerDim      = this._getPosition(container)

    placement = placement == Tooltip.Direction.BOTTOM && position.bottom + actualHeight > containerDim.bottom ? Tooltip.Direction.TOP    :
                placement == Tooltip.Direction.TOP    && position.top    - actualHeight < containerDim.top    ? Tooltip.Direction.BOTTOM :
                placement == Tooltip.Direction.RIGHT  && position.right  + actualWidth  > containerDim.width  ? Tooltip.Direction.LEFT   :
                placement == Tooltip.Direction.LEFT   && position.left   - actualWidth  < containerDim.left   ? Tooltip.Direction.RIGHT  :
                placement

    tip.classList.remove(originalPlacement)
    tip.classList.add(placement)
  }

  return placement
}


/**
 * @param {string} placement
 * @param {Object} position
 * @param {number} actualWidth
 * @param {number} actualHeight
 * @return {Object}
 * @private
 */
Tooltip.prototype._getCalculatedOffset = function (placement, position, actualWidth, actualHeight) {
  return placement == Tooltip.Direction.BOTTOM ? { top: position.top + position.height,   left: position.left + position.width / 2 - actualWidth / 2  } :
         placement == Tooltip.Direction.TOP    ? { top: position.top - actualHeight,      left: position.left + position.width / 2 - actualWidth / 2  } :
         placement == Tooltip.Direction.LEFT   ? { top: position.top + position.height / 2 - actualHeight / 2, left: position.left - actualWidth      } :
         placement == Tooltip.Direction.RIGHT    { top: position.top + position.height / 2 - actualHeight / 2, left: position.left + position.width   }
}


/**
 * @param {Object} offset
 * @param {string} placement
 * @private
 */
Tooltip.prototype._applyCalculatedPlacement = function (offset, placement) {
  var tip    = this.getTipElement()
  var width  = tip.offsetWidth
  var height = tip.offsetHeight

  // manually read margins because getBoundingClientRect includes difference
  var marginTop  = parseInt(tip.style.marginTop, 10)
  var marginLeft = parseInt(tip.style.marginLeft, 10)

  // we must check for NaN for ie 8/9
  if (isNaN(marginTop))  {
    marginTop  = 0
  }
  if (isNaN(marginLeft)) {
    marginLeft = 0
  }

  offset.top  = offset.top  + marginTop
  offset.left = offset.left + marginLeft

  // $.fn.offset doesn't round pixel values
  // so we use setOffset directly with our own function B-0
  $.offset.setOffset(tip, $.extend({
    using: function (props) {
      tip.style.top  = Math.round(props.top)  + 'px'
      tip.style.left = Math.round(props.left) + 'px'
    }
  }, offset), 0)

  tip.classList.add('in')

  // check to see if placing tip in new offset caused the tip to resize itself
  var actualWidth  = tip.offsetWidth
  var actualHeight = tip.offsetHeight

  if (placement == Tooltip.Direction.TOP && actualHeight != height) {
    offset.top = offset.top + height - actualHeight
  }

  var delta = this._getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

  if (delta.left) {
    offset.left += delta.left
  } else {
    offset.top  += delta.top
  }

  var isVertical          = placement === Tooltip.Direction.TOP || placement === Tooltip.Direction.BOTTOM
  var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
  var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

  $(tip).offset(offset)

  this._replaceArrow(arrowDelta, tip[arrowOffsetPosition], isVertical)
}


/**
 * @param {string} placement
 * @param {Object} position
 * @param {number} actualWidth
 * @param {number} actualHeight
 * @return {Object}
 * @private
 */
Tooltip.prototype._getViewportAdjustedDelta = function (placement, position, actualWidth, actualHeight) {
  var delta = { top: 0, left: 0 }

  if (!this._viewport) {
    return delta
  }

  var viewportPadding    = this._config.viewport && this._config.viewport.padding || 0
  var viewportDimensions = this._getPosition(this._viewport)

  if (placement === Tooltip.Direction.RIGHT || placement === Tooltip.Direction.LEFT)) {
    var topEdgeOffset    = position.top - viewportPadding - viewportDimensions.scroll
    var bottomEdgeOffset = position.top + viewportPadding - viewportDimensions.scroll + actualHeight

    if (topEdgeOffset < viewportDimensions.top) { // top overflow
      delta.top = viewportDimensions.top - topEdgeOffset

    } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
      delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
    }

  } else {
    var leftEdgeOffset  = pos.left - viewportPadding
    var rightEdgeOffset = pos.left + viewportPadding + actualWidth

    if (leftEdgeOffset < viewportDimensions.left) { // left overflow
      delta.left = viewportDimensions.left - leftEdgeOffset

    } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
      delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
    }
  }

  return delta
}


/**
 * @param {number} delta
 * @param {number} dimension
 * @param {boolean} isHorizontal
 * @private
 */
Tooltip.prototype._replaceArrow = function (delta, dimension, isHorizontal) {
  this._getArrowElement()
    .css(isHorizontal ? 'left' : 'top' , 50 * (1 - delta / dimension) + '%')
    .css(isHorizontal ? 'top'  : 'left', '')
}


/**
 * @return {Element}
 * @protected
 */
Tooltip.prototype._getArrowElement = function () {
  return (this._arrow = this._arrow || this.getTipElement().querySelector('.tooltip-arrow'))
}


/**
 * @param {Element} element
 * @return {Object}
 * @private
 */
Tooltip.prototype._getPosition = function (element) {
  element = element || this._element

  var isBody    = element.tagName == 'BODY'
  var rect      = element.getBoundingClientRect()
  var offset    = isBody ? { top: 0, left: 0 } : $(element).offset()
  var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : this._element.scrollTop }
  var outerDims = isBody ? { width: window.innerWidth, height: window.innerHeight } : null

  return $.extend({}, rect, scroll, outerDims, offset)
}


/**
 * @return {string}
 * @private
 */
Tooltip.prototype._getTitle = function () {
  var title = this._element.getAttribute('data-original-title')

  if (!title) {
    title = typeof this._config.title === 'function' ?
      this._config.title.call(this._element) :
      this._config.title
  }

  return /** @type {string} */ (title)
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
$.fn['tooltip'] = Tooltip.JQUERY_INTERFACE


/**
 * @const
 * @type {Function}
 */
$.fn['tooltip']['Constructor'] = Tooltip


/**
 * @const
 * @type {Function}
 */
$.fn['tooltip']['noConflict'] = function () {
  $.fn['tooltip'] = Tooltip.JQUERY_NO_CONFLICT
  return this
}

