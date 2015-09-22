# hyperglue2
A [hyperglue](http://github.com/substack/hyperglue) implementation (DOM-only).

[![npm](http://img.shields.io/npm/v/hyperglue2.svg?style=flat)](http://npmjs.org/package/hyperglue2)

## Why
Hyperglue is an awesome templating engine that accepts vanilla html strings or DOM elements as templates. This is nice because you don't have to learn any fancy new languages and you can update templates you've already rendered without recompiling any HTML.

Although the concept behind this library is faithful to the original, the API is not. More about this under [Notes](#notes).

## How

### Set textContent
```javascript
var hg = require('hyperglue2');
var el = hg('<div></div>', 'hello');
// or 
var el = hg('<div></div>', { _text: 'hello' });
// <div>hello</div>
```

### Make updates
```javascript
// note: 'el' is a dom element, not a string
hg(el, 'hello world');
// <div>hello world</div>
```

### InnerHTML
```javascript
hg(el, { _html: '<input>' });
// <div><input></div>
```

### Attributes
```javascript
hg(el, { input: { _attr: { name: 'field', value: 42 }}}); // add
// <div><input name="field" value="42"></div>
hg(el, { input: { _attr: { name: null }}});               // remove
// <div><input value="42"></div>
```

### Form element value (attributes only work for inital values)
```javascript
hg(el, { input: { _value: 23 }});              // add
// <div><input value="42"></div>               // but display and js will show 23
hg(el, { input: { _value: null }});            // remove
// <div><input value="42"></div>               // but display and js will show ""
```

### ClassList
```javascript
hg(el, { input: { _class: { hidden: true }}}); // add
// <div><input class="my-input hidden"></div>
hg(el, { input: { _class: { hidden: false }}}); // remove
// <div><input class="my-input"></div>
```

### Elements
```javascript
var el = hg('<div></div>');
var header = hg('<h1></h1>');
var bold = hg('<b>elementary</b>');

hg(el, header);                     // element literal
hg(el, { h1: { _element: bold }});  // element selector
// <div><h1><b>elementary</b></h1></div>
```

### Arrays
```javascript
var el = hg('<ul><li></li></ul>', { li: [ 1, 2, 3 ] });
// <ul>
//   <li>1</li>
//   <li>2</li>
//   <li>3</li>
// </ul>
```

### Array updates
```javascript
hg(el, { li: [ 1, 'the end' ] });
// <ul>
//   <li>1</li>
//   <li>the end</li>
// </ul>
```

### Respect element boundaries
``` javascript
hg('<section><h1></h1><section><h1></h1></section></section>', { h1: 'the title' }, { boundary: 'section' });
// <section>
//   <h1>the title</h1>
//   <section>
//     <h1></h1>
//   </section>
// </section>
```

## Notes
So, I really like the original hyperglue library, but!
* the ":first" selector confused me
* array updates don't work
* can't remove attributes

Detailed explanations below:

### The ":first" selector
The first thing you're likely to try with hyperglue is probably something along the lines of: `hg('<div></div>', 'hello world')` which of course doesn't work, because to select outer elements you actually need to use the ":first" selector like so: `hg('<div></div>', { ':first': 'hello world' })`. Hyperglue2 does away with ":first" and just assumes you are always talking about the outermost element you've selected, this sacrifices attribute manipulation ease in favor of a more obvious way to set inner content:

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

### Array updates

Updating an existing dom element (instead of generating a new one from a string) is possible with the original hyperglue, but it doesn't work for arrays. Consider:

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

// Works in hyperglue2
var el = hg('<ul><li></li></ul>', { li: [ 1, 2, 3 ] })
hg(el, { li: [ 'a', 'b', 'c' ] });
// <ul>
//   <li>a</li>
//   <li>b</li>
//   <li>c</li>
// </ul>
```

### Attribute removal

Some html attributes like "checked" or "selected" can't be set to falsy values, so the only way to disable them is to completely remove the attribute. You can remove attributes with hyperglue2 by setting the attribute data value to `null`.
```javascript
hg('<input type="checkbox" checked>', { _attr: { checked: null }});
// <input type="checkbox">
```

## Releases
The latest stable release is published to [npm](http://npmjs.org/package/hyperglue2). Below is an abbreviated changelog:

* [2.x](https://github.com/jessetane/hyperglue2/archive/2.0.0.tar.gz)
  * Explictly passing null values now removes elements matched by the given selector. Clearing textContent can be done by passing an empty string.

* [1.6.x](https://github.com/jessetane/hyperglue2/archive/1.6.0.tar.gz)
  * Add _value selector for working with form inputs (value attribute and textContent only work for setting an [initial value](http://www.w3.org/TR/html401/interact/forms.html#initial-value))

* [1.5.x](https://github.com/jessetane/hyperglue2/archive/1.5.0.tar.gz)
  * Don't use for-in loop as it doesn't work properly on arrays with unset indexes

* [1.4.x](https://github.com/jessetane/hyperglue2/archive/1.4.1.tar.gz)
  * Add classList support via the `_class` selector

* [1.3.x](https://github.com/jessetane/hyperglue2/archive/1.3.0.tar.gz)
  * Improved falsy value handling

* [1.1.x](https://github.com/jessetane/hyperglue2/archive/1.1.0.tar.gz)
  * Added _element selector

* [1.0.x](https://github.com/jessetane/hyperglue2/archive/1.0.0.tar.gz)
  * Added ability to pass DOM elements as data
  * Added "boundary" option

* [0.0.x](https://github.com/jessetane/hyperglue2/archive/0.0.3.tar.gz)
  * Prototype

## License
Copyright © 2014 Jesse Tane <jesse.tane@gmail.com>

This work is free. You can redistribute it and/or modify it under the
terms of the [WTFPL](http://www.wtfpl.net/txt/copying).

This work is provided "as is" without warranty of any kind, either express or implied, including without limitation any implied warranties of condition, uninterrupted use, merchantability, fitness for a particular purpose, or non-infringement.
