# hyperbind
[![npm](http://img.shields.io/npm/v/hyperbind.svg?style=flat)](http://npmjs.org/package/hyperbind)

Create or update DOM elements by mapping query selectors to hypertext, plain text, attributes, classes, properties, other elements or lists.

This libary is based on substack's excellent [hyperglue](https://github.com/substack/hyperglue), it adds some additional mapping mechanisms and diff-based list support that integrates naturally with [custom-elements](http://w3c.github.io/webcomponents/spec/custom).

## Why
Look ma, no virtual DOMs

## How
``` javascript
import hb from 'hyperbind/index.js'

// compile html
var div = hb('<div>')
document.body.appendChild(div)
console.log(document.body.outerHTML) // => <body><div></div></body>

// hypertext
hb(div, {
  $html: '<h1>hi</h1>'
})
console.log(div.outerHTML) // => <div><h1>hi</h1></div>

// plain text
hb(div, {
  $text: 'cool'
})
// shorthand: hb(div, 'cool')
console.log(div.outerHTML) // => <div>cool</div>

// attributes
hb(div, {
  $attr: {
    'my-attr': 42 // or null to remove
  }
})
console.log(div.outerHTML) // => <div my-attr="42"><h1>hi</h1></div>

// classes
hb(div, {
  $class: {
    'my-class': true // or falsy to remove
  }
})
console.log(div.outerHTML) // => <div my-attr="42" class="my-class"><h1>hi</h1></div>

// properties
document.body.innerHTML = '<input value=initial>'
hb(document.body, {
  input: {
    $prop: {
      value: 'updated'
    }
  }
})
console.log(document.querySelector('input').value) // => updated

// elements
hb(document.body, document.createElement('ul'))
console.log(document.body.outerHTML) // => <body><ul></ul></body>
hb(document.body, { ul: null })
console.log(document.body.outerHTML) // => <body></body>

// lists of primitives
hb(document.body, {
  ul: {
    $list: {
      items: [
        'foo',
        'bar'
      ],
      empty: 'No items', // optional placeholder for when there are no items
      createElement: () => document.createElement('li')
    }
  }
})
console.log(document.body.outerHTML) // => <body><ul><li>foo</li><li>bar</li></ul></body>

// lists of objects
hb(document.body, {
  ul: {
    $list: {
      key: 'id',
      items: [
        { id: 0, data: 'foo' },
        { id: 1, data: 'bar' }
      ],
      empty: {
        $html: `<b>No items</b>` // empty option is a recursive hyperbind
      },
      createElement: (item, i) => {
        var li = document.createElement('li')
        li.textContent = `item #${i}: ${item.data}`
        return li
      }
    }
  }
})
console.log(document.body.outerHTML) // => <body><ul><li>item #0: foo</li><li>item #1: bar</li></ul></body>

// lists of objects (custom-element style)
document.body.innerHTML = ''
class Row extends HTMLElement {
  constructor (item, i) {
    super()
    this.textContent = item.data
  }
}
customElements.define('x-row', Row)
hb(document.body, {
  $list: {
    key: 'id',
    items: [
      { id: 0, data: 'foo' },
      { id: 1, data: 'bar' }
    ],
    createElement: Row
  }
})
console.log(document.body.outerHTML) // => <body><x-row>foo</x-row><x-row>bar</x-row></body>
```

## Example
```
$ npm run example
```

## Test
```
$ npm run test
```

## License
MIT
