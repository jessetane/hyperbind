# hyperglue2
a [hyperglue](http://github.com/substack/hyperglue) implementation (dom-only)

if you're not familiar with hyperglue, it's a templating engine that accepts vanilla html strings or dom elements as templates. this is nice because you don't have to learn any fancy new languages and you can update templates you've already rendered as many times as you want.

## why
I really like the original hyperglue library, but!
* the ":first" selector is confusing
* array updates don't work
* can't remove attributes

detailed explanations below. if you've never used the original you can skip to [how](#how).

### the ":first" selector
the first thing you're likely to try with hyperglue is probably something along the lines of: `hg('<div></div>', 'hello world')` which of course doesn't work, because to select outer elements you actually need to use the ":first" selector like so: `hg('<div></div>', { ':first': 'hello world' })`. hyperglue2 does away with ":first" and just assumes you are always talking about the outermost element you've selected, which makes mapping your data a little more obvious:
```javascript
// original hyperglue
hg('<ul><li></li></ul>', { li: [ { ':first': 1 }, { ':first': 2 }, { ':first': 3 } ] });
// <ul>
//   <li>1</li>
//   <li>2</li>
//   <li>3</li>
// </ul>

// hyperglue2
hg('<ul><li></li></ul>', { li: [ 1, 2, 3 ] });
// <ul>
//   <li>1</li>
//   <li>2</li>
//   <li>3</li>
// </ul>
```

### array updates

updating an existing dom element (instead of generating a new one from a string) is possible with the original hyperglue, but it doesn't work for arrays. consider:
```javascript
// original hyperglue

// first render
var el = hg('<ul><li></li></ul>', { li: [ { ':first': 1 }, { ':first': 2 }, { ':first': 3 } ] });

// update
hg(el, { li: [ { ':first': 'a' }, { ':first': 'b' }, { ':first': 'c' } ] });
// <ul>
//   <li>a</li>
//   <li>b</li>
//   <li>c</li>
//   <li>a</li>
//   <li>b</li>
//   <li>c</li>
//   <li>a</li>
//   <li>b</li>
//   <li>c</li>
// </ul>

// works in hyperglue2
var el = hg('<ul><li></li></ul>', { li: [ 1, 2, 3 ] })
hg(el, { li: [ 'a', 'b', 'c' ] });
// <ul>
//   <li>a</li>
//   <li>b</li>
//   <li>c</li>
// </ul>
```

### attribute removal

some html attributes like "checked" or "selected" can't be set to falsy values, so the only way to disable them is to completely remove the attribute. you can remove attributes with hyperglue2 by setting the attribute data value to `null`.
```javascript
hg('<input type="checkbox" checked>', { _attr: { checked: null }});
// <input type="checkbox">
```

## how

### set innerText
```javascript
var hg = require('hyperglue2');
var el = hg('<div></div>', 'hello');
// or 
var el = hg('<div></div>', { _text: 'hello' });
// <div>hello</div>
```

### make updates
```javascript
// note: 'el' is a dom element, not a string
hg(el, 'hello world');
// <div>hello world</div>
```

### innerHTML
```javascript
hg(el, { _html: '<input>' });
// <div><input></div>
```

### attributes
```javascript
hg(el, { input: { _attr: { name: 'field', value: 42 }}}); // add
// <div><input name="field" value="42"></div>
hg(el, { input: { _attr: { name: null }}});               // remove
// <div><input value="42"></div>
```

### arrays
```javascript
var el = hg('<ul><li></li></ul>', { li: [ 1, 2, 3 ] });
// <ul>
//   <li>1</li>
//   <li>2</li>
//   <li>3</li>
// </ul>
```

### array updates
```javascript
hg(el, { li: [ 1, 'the end' ] });
// <ul>
//   <li>1</li>
//   <li>the end</li>
// </ul>
```

## notes
* original [hyperglue](http://github.com/substack/hyperglue) by [substack](http://github.com/substack)
* html compilation via [domify](http://github.com/component/domify)
* dom element selection via `document.querySelectorAll()`
* array re-rendering is achieved by caching a "blueprint" on the parent element

## license
WTFPL
