var domify = require('domify');

module.exports = hyperglue;

function hyperglue(el, data, opts) {
  if (!opts) opts = {};

  // if 'el' is an html string, turn it into dom elements
  if (typeof el === 'string') {
    el = domify(el);
  }

  // boundaries must be collected at the highest level possible
  if (opts.boundary && typeof opts.boundary !== 'object') {
    opts.boundary = el.querySelectorAll(opts.boundary);
  }

  // no data so we're done
  if (data === undefined) return el;

  // null should remove elements
  if (data === null) {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
    return el;
  }

  // if data is an HTML element just replace whatever was there with it
  if (data instanceof Element) {
    while (el.childNodes.length) {
      el.removeChild(el.firstChild);
    }
    el.appendChild(data);
  }

  // elsewise assume other object types are hashes
  else if (typeof data === 'object') {
    for (var selector in data) {
      var value = data[selector];

      // plain text
      if (selector === '_text') {
        el.textContent = value;
      }

      // raw html
      else if (selector === '_html') {
        el.innerHTML = value;
      }

      // value for form elements
      else if (selector === '_value') {
        el.value = value === undefined ? '' : value;
      }

      // dom element
      else if (selector === '_element') {
        while (el.childNodes.length) {
          el.removeChild(el.firstChild);
        }
        el.appendChild(value);
      }

      // attribute setting
      else if (selector === '_attr') {
        for (var attr in value) {
          var val = value[attr];
          if (val === null || 
              val === undefined) {
            el.removeAttribute(attr);
          }
          else {
            el.setAttribute(attr, value[attr]);
          }
        }
      }

      // el.classList
      else if (selector === '_class') {
        var toAdd = []
        var toRemove = []

        for (var className in value) {
          if (value[className]) {
            toAdd.push(className)
          } else {
            toRemove.push(className)
          }
        }

        for (var i in toAdd) {
          el.classList.add(toAdd[i])
        }

        for (var i in toRemove) {
          el.classList.remove(toRemove[i])
        }
      }

      // recursive
      else {

        // arrays need some extra setup so that they can be rendered
        // multiple times without disturbing neighboring elements
        var isArray = Array.isArray(value);
        var needsCache = false;
        var matches = null;
        if (isArray) {
          el._hyperglueArrays = el._hyperglueArrays || {};
          matches = el._hyperglueArrays[selector];
          if (!matches) {
            el._hyperglueArrays[selector] = [];
            needsCache = true;
          }
        }

        matches = matches || el.querySelectorAll(selector);
        for (var i=0; i<matches.length; i++) {
          var match = matches[i];

          // make sure match is not beyond a boundary
          if (opts.boundary) {
            var withinBoundary = true;
            for (var n=0; n<opts.boundary.length; n++) {
              if (opts.boundary[n].contains(match)) {
                withinBoundary = false;
                break;
              }
            }
            if (!withinBoundary) continue;
          }

          // render arrays
          if (isArray) {

            // in case the template contained multiple rows (we only use the first one)
            if (!match.parentNode) continue;

            // cache blueprint node
            if (needsCache && needsCache !== match.parent) {
              needsCache = match.parentNode;
              el._hyperglueArrays[selector].push({
                node: match.cloneNode(true),
                parentNode: match.parentNode,
                cloneNode: function() {
                  return this.node.cloneNode(true);
                }
              });
            }

            // remove any existing rows
            var parent = match.parentNode;
            while (parent.childNodes.length) {
              parent.removeChild(parent.childNodes[0]);
            }

            // render new rows
            for (var n=0; n<value.length; n++) {
              var item = value[n];
              parent.appendChild(hyperglue(match.cloneNode(true), item));
            }
          }

          // render non-arrays
          else {
            hyperglue(match, value);
          }
        }
      }
    }
  }
  else {
    el.textContent = data;
  }

  return el;
};
