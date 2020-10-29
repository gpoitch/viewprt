import { Observer } from './observer'

export function ElementObserver(element, opts = {}) {
  if (!(this instanceof ElementObserver)) return new ElementObserver(element, opts)

  this.element = element
  this.onEnter = opts.onEnter
  this.onExit = opts.onExit
  this._didEnter = false

  const viewport = Observer.call(this, opts)
  if (isElementInDOM(element)) this.check(viewport.getState())
}

ElementObserver.prototype = Object.create(Observer.prototype)
ElementObserver.prototype.constructor = ElementObserver

ElementObserver.prototype.check = function (viewportState) {
  const {
    container,
    onEnter,
    onExit,
    element,
    offsetXEnter,
    offsetXExit,
    offsetYEnter,
    offsetYExit,
    once,
    _didEnter
  } = this
  if (!isElementInDOM(element)) return this.destroy()

  const offsetX = _didEnter ? offsetXExit : offsetXEnter
  const offsetY = _didEnter ? offsetYExit : offsetYEnter
  const inViewport = isElementInViewport(element, offsetX, offsetY, viewportState, container)
  if (!_didEnter && inViewport) {
    this._didEnter = true
    if (onEnter) {
      onEnter.call(this, element, viewportState)
      if (once) this.destroy()
    }
  } else if (_didEnter && !inViewport) {
    this._didEnter = false
    if (onExit) {
      onExit.call(this, element, viewportState)
      if (once) this.destroy()
    }
  }
}

function isElementInViewport(element, offsetX, offsetY, viewportState, container) {
  const elRect = element.getBoundingClientRect()

  if (!elRect.width || !elRect.height) return false

  let topBound, bottomBound, leftBound, rightBound
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const windowTopBound = windowHeight
  const windowLeftBound = windowWidth
  const windowRightBound = 0
  const windowBottomBound = 0

  if (container === document.body) {
    topBound = windowTopBound
    bottomBound = windowBottomBound
    leftBound = windowLeftBound
    rightBound = windowRightBound
  } else {
    const isInWindow =
      elRect.top < windowTopBound &&
      elRect.bottom > windowBottomBound &&
      elRect.left < windowLeftBound &&
      elRect.right > windowRightBound
    if (!isInWindow) return false
    const scrollElRect = container.getBoundingClientRect()
    topBound = scrollElRect.bottom
    bottomBound = scrollElRect.top
    leftBound = scrollElRect.right
    rightBound = scrollElRect.left
  }

  return (
    elRect.top < topBound + offsetY &&
    elRect.bottom > bottomBound - offsetY &&
    elRect.left < leftBound + offsetX &&
    elRect.right > rightBound - offsetX
  )
}

function isElementInDOM(element) {
  return element && element.parentNode
}
