# hyperglue2
a [hyperglue](http://github.com/substack/hyperglue) implementation (dom-only)

## why
The best HTML templates are just HTML.

I really like the original hyperglue library but I find the ":first" selector confusing and array updates don't work. details below:

### the ":first" selector
the first thing you're likely to try with hyperglue is probably something like: `hg('<div></div>', 'hello world')` which of course doesn't work, because to select outer elements you actually need to use the ":first" selector like so: `hg('<div></div>', { ':first': 'hello world' })`. hyperglue2 enables outer element selection by default, which makes rendering a bit more obvious:
```
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
```
// original hyperglue

// first render
var el = hg('<ul><li></li></ul>', { li: [ { ':first': 1 }, { ':first': 2 }, { ':first': 3 } ] });

// update
hg(el, { li: [ { ':first': 'a' }, { ':first': 'b' }, { ':first': 'c' } ] });

console.log(el);
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

## how
### set innerText
```
var htmlstring = '<div></div>';
hg(htmlstring, 'hello');
// or 
hg(htmlstring, { _text: 'hello' });
// <div>hello</div>
```

### make updates
```
// note: 'el' is a dom element, not a string
hg(el, 'hello world');
// <div>hello world</div>
```

### innerHTML
```
hg(el, { _html: '<input>' });
// <div><input></div>
```

### attributes
```
hg(el, { input: { _attr: { value: 42 }}});
// <div><input value="42"></div>
```

### arrays
```
hg('<ul><li></li></ul>', { li: [ 1, 2, 3 ] });
// <ul>
//   <li>1</li>
//   <li>2</li>
//   <li>3</li>
// </ul>
```

### array updates
```
hg('<ul><li></li></ul>', { li: [ 1, 'the end' ] });
// <ul>
//   <li>1</li>
//   <li>the end</li>
// </ul>
```

## notes
* html compilation via [domify](http://github.com/component/domify)
* dom element selection via `document.querySelectorAll()`
* array re-rendering is achieved by caching a "blueprint" row on the parent element
* the original: [hyperglue](http://github.com/substack/hyperglue)

## license
WTFPL
