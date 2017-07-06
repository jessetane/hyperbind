var tape = require('tape')
var hb = require('../')

var body = document.body

tape('set text', t => {
  t.plan(1)
  hb(body, 'hello world')
  t.equal(body.textContent, 'hello world')
})

tape('set html', t => {
  t.plan(2)
  hb(body, {
    $html: '<h1>wow</h1>'
  })
  t.equal(body.firstElementChild.tagName, 'H1')
  t.equal(body.firstElementChild.textContent, 'wow')
})

tape('set attributes', t => {
  t.plan(1)
  hb(body, {
    $attr: {
      beep: 'boop'
    }
  })
  t.equal(body.getAttribute('beep'), 'boop')
})

tape('remove undefined attributes', t => {
  t.plan(1)
  hb(body, {
    $attr: {
      beep: undefined
    }
  })
  t.equal(body.getAttribute('beep'), null)
})

tape('add classes', t => {
  t.plan(1)
  hb(body, {
    $class: {
      a: true
    }
  })
  t.ok(body.classList.contains('a'))
})

tape('remove classes', t => {
  t.plan(1)
  hb(body, {
    $class: {
      a: false
    }
  })
  t.notOk(body.classList.contains('a'))
})

tape('set arbitrary props', t => {
  t.plan(1)
  hb(body, {
    $prop: {
      textContent: 'ok'
    }
  })
  t.equal(body.textContent, 'ok')
})

tape('set elements', t => {
  t.plan(1)
  hb(body, {
    $element: document.createElement('input')
  })
  t.equal(body.firstElementChild.tagName, 'INPUT')
})

tape('permit nested queries', t => {
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

tape('respect boundaries', t => {
  t.plan(1)
  hb(body, {
    '.c': 'snap'
  }, {
    boundary: '.a'
  })
  t.equal(body.querySelector('.c').textContent, 'cool')
})

tape('render lists of primitives', t => {
  t.plan(4)

  // initial render
  body.innerHTML = `<ul></ul>`
  hb(body, {
    ul: {
      $list: {
        items: [
          'foo',
          'bar'
        ],
        createElement: function (item) {
          return document.createElement('li')
        }
      }
    }
  })
  t.deepEqual(Array.from(body.querySelectorAll('li')).map(el => {
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
        createElement: function (item) {
          t.pass() // createElement should only be once for "baz"
          return document.createElement('li')
        }
      }
    }
  })
  t.deepEqual(Array.from(body.querySelectorAll('li')).map(el => {
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
        createElement: function (item) {
          t.fail() // createElement should not be called
          return document.createElement('li')
        }
      }
    }
  })
  t.deepEqual(Array.from(body.querySelectorAll('li')).map(el => {
    return el.textContent
  }), [
    'foo',
    'baz'
  ])
})

tape('render lists of objects', t => {
  t.plan(4)

  // initial render
  body.innerHTML = `<ul></ul>`
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
        }
      }
    }
  })
  t.deepEqual(Array.from(body.querySelectorAll('li')).map(el => {
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
        createElement: function (item) {
          t.pass() // createElement should only be once for "baz"
          var li = document.createElement('li')
          li.textContent = item.text
          return li
        }
      }
    }
  })
  t.deepEqual(Array.from(body.querySelectorAll('li')).map(el => {
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
        createElement: function (item) {
          t.fail() // createElement should not be called
          var li = document.createElement('li')
          li.textContent = item.text
          return li
        }
      }
    }
  })
  t.deepEqual(Array.from(body.querySelectorAll('li')).map(el => {
    return el.textContent
  }), [
    'foo',
    'baz'
  ])
})
