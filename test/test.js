import hb from './index.js'
import tap from './tap-esm/index.js'

var body = document.body

tap('compile', t => {
  t.plan(3)
  let el = hb('<div><h1>wow</h1></div>')
  t.equal(el.outerHTML, '<div><h1>wow</h1></div>')
  el = hb('<div><h1>wow</h1></div>', null)
  t.equal(el.outerHTML, '<div><h1>wow</h1></div>')
  el = hb('<div><h1>wow</h1></div>', undefined)
  t.equal(el.outerHTML, '<div></div>')
})

tap('set text', t => {
  t.plan(2)
  hb(body, 'hello world')
  t.equal(body.textContent, 'hello world')
  hb(body, undefined)
  t.equal(body.textContent, '')
})

tap('set html', t => {
  t.plan(2)
  hb(body, {
    $html: '<h1>wow</h1>'
  })
  t.equal(body.firstElementChild.tagName, 'H1')
  t.equal(body.firstElementChild.textContent, 'wow')
})

tap('set attributes', t => {
  t.plan(1)
  hb(body, {
    $attr: {
      beep: 'boop'
    }
  })
  t.equal(body.getAttribute('beep'), 'boop')
})

tap('remove undefined attributes', t => {
  t.plan(1)
  hb(body, {
    $attr: {
      beep: undefined
    }
  })
  t.equal(body.getAttribute('beep'), null)
})

tap('add classes', t => {
  t.plan(1)
  hb(body, {
    $class: {
      a: true
    }
  })
  t.ok(body.classList.contains('a'))
})

tap('remove classes', t => {
  t.plan(1)
  hb(body, {
    $class: {
      a: false
    }
  })
  t.notOk(body.classList.contains('a'))
})

tap('set arbitrary props', t => {
  t.plan(1)
  hb(body, {
    $prop: {
      textContent: 'ok'
    }
  })
  t.equal(body.textContent, 'ok')
})

tap('set/remove elements', t => {
  t.plan(2)
  hb(body, document.createElement('input'))
  t.equal(body.firstElementChild.tagName, 'INPUT')
  hb(body, { input: null })
  t.equal(body.innerHTML, '')
})

tap('permit nested queries', t => {
  t.plan(1)
  body.innerHTML = `<div class=a>
  <div class=b>
    <div class=c></div>
  </div>
</div>`
  hb(body, {
    '.a': {
      '.b': {
        '.c': 'cool'
      }
    }
  })
  t.equal(body.querySelector('.c').textContent, 'cool')
})

tap('respect boundaries', t => {
  t.plan(1)
  hb(body, {
    '.c': 'snap'
  }, {
    boundary: '.a'
  })
  t.equal(body.querySelector('.c').textContent, 'cool')
})

tap('render lists of primitives', t => {
  t.plan(6)
  body.innerHTML = `<ul></ul>`

  // initial render
  hb(body, {
    ul: {
      $list: {
        items: [],
        empty: 'No items',
        createElement: function () {
          return document.createElement('li')
        }
      }
    }
  })
  t.arrayEqual(body.querySelector('ul').innerHTML, 'No items')

  // first content
  hb(body, {
    ul: {
      $list: {
        items: [
          'foo',
          'bar'
        ],
        empty: 'No items',
        createElement: function () {
          return document.createElement('li')
        }
      }
    }
  })
  t.arrayEqual(Array.from(body.querySelectorAll('li')).map(el => {
    return el.textContent
  }), [
    'foo',
    'bar'
  ])

  // insert
  hb(body, {
    ul: {
      $list: {
        items: [
          'foo',
          'baz',
          'bar'
        ],
        empty: 'No items',
        createElement: function () {
          t.pass() // createElement should only be once for "baz"
          return document.createElement('li')
        }
      }
    }
  })
  t.arrayEqual(Array.from(body.querySelectorAll('li')).map(el => {
    return el.textContent
  }), [
    'foo',
    'baz',
    'bar'
  ])

  // remove
  hb(body, {
    ul: {
      $list: {
        items: [
          'foo',
          'baz'
        ],
        empty: 'No items',
        createElement: function () {
          t.fail() // createElement should not be called
          return document.createElement('li')
        }
      }
    }
  })
  t.arrayEqual(Array.from(body.querySelectorAll('li')).map(el => {
    return el.textContent
  }), [
    'foo',
    'baz'
  ])

  // empty
  hb(body, {
    ul: {
      $list: {
        items: [],
        empty: 'No items',
        createElement: function () {
          t.fail() // createElement should not be called
          return document.createElement('li')
        }
      }
    }
  })
  t.arrayEqual(body.querySelector('ul').innerHTML, 'No items')
})

tap('render lists of objects', t => {
  t.plan(6)
  body.innerHTML = `<ul></ul>`

  // initial render
  hb(body, {
    ul: {
      $list: {
        key: 'uid',
        items: [],
        empty: 'No items',
        createElement: function (item) {
          var li = document.createElement('li')
          li.textContent = item.text
          return li
        }
      }
    }
  })
  t.arrayEqual(body.querySelector('ul').innerHTML, 'No items')

  // first content
  hb(body, {
    ul: {
      $list: {
        key: 'uid',
        items: [
          { uid: 0, text: 'foo' },
          { uid: 1, text: 'bar' }
        ],
        empty: 'No items',
        createElement: function (item) {
          var li = document.createElement('li')
          li.textContent = item.text
          return li
        }
      }
    }
  })
  t.arrayEqual(Array.from(body.querySelectorAll('li')).map(el => {
    return el.textContent
  }), [
    'foo',
    'bar'
  ])

  // insert
  hb(body, {
    ul: {
      $list: {
        key: 'uid',
        items: [
          { uid: 0, text: 'foo' },
          { uid: 2, text: 'baz' },
          { uid: 1, text: 'bar' }
        ],
        empty: 'No items',
        createElement: function (item) {
          t.pass() // createElement should only be once for "baz"
          var li = document.createElement('li')
          li.textContent = item.text
          return li
        }
      }
    }
  })
  t.arrayEqual(Array.from(body.querySelectorAll('li')).map(el => {
    return el.textContent
  }), [
    'foo',
    'baz',
    'bar'
  ])

  // remove
  hb(body, {
    ul: {
      $list: {
        key: 'uid',
        items: [
          { uid: 0, text: 'foo' },
          { uid: 2, text: 'baz' }
        ],
        empty: 'No items',
        createElement: function (item) {
          t.fail() // createElement should not be called
          var li = document.createElement('li')
          li.textContent = item.text
          return li
        }
      }
    }
  })
  t.arrayEqual(Array.from(body.querySelectorAll('li')).map(el => {
    return el.textContent
  }), [
    'foo',
    'baz'
  ])

  // empty
  hb(body, {
    ul: {
      $list: {
        key: 'uid',
        items: [],
        empty: {
          $html: '<b>No items</b>'
        },
        createElement: function (item) {
          t.fail() // createElement should not be called
          var li = document.createElement('li')
          li.textContent = item.text
          return li
        }
      }
    }
  })
  t.arrayEqual(body.querySelector('ul').innerHTML, '<b>No items</b>')
})

tap('be reentrant', t => {
  t.plan(1)

  body.innerHTML = `<ul></ul>`

  function render () {
    hb(body, {
      ul: {
        $list: {
          key: 'uid',
          items: [
            { uid: 0, text: 'foo' },
            { uid: 1, text: 'bar' }
          ],
          createElement: function (item) {
            var li = document.createElement('li')
            li.textContent = item.text
            return li
          },
          each: el => {
            if (!el.initialized) {
              el.initialized = true
              render()
            }
          }
        }
      }
    })
  }

  render()

  t.arrayEqual(Array.from(body.querySelectorAll('li')).map(el => {
    return el.textContent
  }), [
    'foo',
    'bar'
  ])
})
