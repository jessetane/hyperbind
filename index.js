var domify = require('domify');

module.exports = hyperglue;

function hyperglue(el, data, opts) {

  // if 'el' is an html string, turn it into dom elements
  if (typeof el === 'string') {
    el = domify(el);
  }

  // boundaries must be collect at the highest level possible
  if (opts && opts.boundary && typeof opts.boundary !== 'object') {
    opts.boundary = el.querySelectorAll(opts.boundary);
  }

  // no data so we're done
  if (!data && data !== '') return el;

  if (typeof data === 'object') {
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

      // recursive
      else {

        // arrays need some extra setup so that they can be rendered
        // multiple times without disturbing neighboring elements
        var isArray = Array.isArray(value);
        var needsCache = false;
        var matches = null;
        if (isArray) {
          el.hyperglueArrays = el.hyperglueArrays || {};
          matches = el.hyperglueArrays[selector];
          if (!matches) {
            el.hyperglueArrays[selector] = [];
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
              el.hyperglueArrays[selector].push({
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
            for (var n in value) {
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
