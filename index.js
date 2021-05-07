var compiler = document.createElement('div')
var elements = new Map()
var sessions = 0

function hyperbind (el, data, opts) {
  if (!opts) opts = {}
  if (typeof el === 'string') {
    compiler.innerHTML = el
    el = compiler.firstElementChild
  }
  if (data === undefined) return el
  var session = sessions++
  elements.set(el, session)
  if (data === null) {
    if (el.parentNode) {
      el.parentNode.removeChild(el)
    }
  } else if (data instanceof Element) {
    while (el.childNodes.length) {
      el.removeChild(el.firstChild)
      if (elements.get(el) !== session) break
    }
    el.appendChild(data)
  } else if (typeof data === 'object') {
    for (var selector in data) {
      var value = data[selector]
      switch (selector) {
        case '$text':
          el.textContent = value
          break
        case '$html':
          el.innerHTML = value
          break
        case '$attribute':
        case '$attr':
          for (var attr in value) {
            var val = value[attr]
            if (val === null || val === undefined) {
              el.removeAttribute(attr)
            } else if (el.getAttribute(attr) !== val) {
              el.setAttribute(attr, val)
            }
          }
          break
        case '$class':
          for (var className in value) {
            if (value[className]) {
              el.classList.add(className)
            } else {
              el.classList.remove(className)
            }
          }
          break
        case '$value':
          value = { value }
        case '$prop':
          for (var prop in value) {
            el[prop] = value[prop]
          }
          break
        case '$element':
          while (el.childNodes.length) {
            el.removeChild(el.firstChild)
            if (elements.get(el) !== session) break
          }
          el.appendChild(value)
          break
        case '$list':
          var key = value.key
          var CreateElement = value.createElement
          var each = value.each
          var empty = value.empty
          var children = el.childNodes
          var existing = {}
          var items = value.items
          if (!items) items = []
          for (var i = 0; i < children.length; i++) {
            var exists = false
            var child = children[i]
            var uid = key ? child.item && child.item[key] : child.textContent
            for (var n = 0; n < items.length; n++) {
              var item = items[n]
              if (key) {
                if (item[key] === uid) {
                  exists = true
                  break
                }
              } else {
                if (item === uid) {
                  exists = true
                  break
                }
              }
            }
            if (exists) {
              existing[uid] = child
            } else {
              el.removeChild(child)
              if (elements.get(el) !== session) break
              i--
            }
          }
          for (i = 0; i < items.length; i++) {
            item = items[i]
            uid = key ? item[key] : item
            var existingChild = existing[uid]
            if (existingChild) {
              if (key) {
                existingChild.item = item
              }
            } else {
              existingChild = new CreateElement(item, i)
              if (key) {
                existingChild.item = item
              } else {
                existingChild.textContent = item
              }
            }
            child = children[i]
            if (child !== existingChild) {
              el.insertBefore(existingChild, child)
              if (elements.get(el) !== session) break
            }
            if (each) {
              each(existingChild, item, i)
              if (elements.get(el) !== session) break
            }
          }
          if (items.length === 0 && empty) {
            hyperbind(el, empty)
          }
          break
        default:
          var matches = el.querySelectorAll(selector)
          for (i = 0; i < matches.length; i++) {
            var match = matches[i]
            if (opts.boundary) {
              if (typeof opts.boundary !== 'object') {
                opts.boundary = el.querySelectorAll(opts.boundary)
              }
              var withinBoundary = true
              for (n = 0; n < opts.boundary.length; n++) {
                var boundary = opts.boundary[n]
                var parent = match.parentNode
                while (parent !== el && parent !== boundary) {
                  parent = parent.parentNode
                }
                if (parent === boundary) {
                  withinBoundary = false
                  break
                }
              }
              if (!withinBoundary) {
                continue
              }
            }
            hyperbind(match, value, opts)
            if (elements.get(el) !== session) break
          }
      }
    }
  } else {
    el.textContent = data
  }
  elements.delete(el)
  return el
}

export default hyperbind
