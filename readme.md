# hyperglue2
a [hyperglue](http://github.com/substack/hyperglue) implementation (dom-only)

if you're not familiar with hyperglue, it's a templating engine that accepts vanilla html strings or dom elements as templates. this is nice because you don't have to learn any fancy new languages and you can update templates you've already rendered as many times as you want.

## why
I really like the original hyperglue library but I find the ":first" selector confusing and array updates don't work - details below. if you've never used the original you can skip to [how](#how)

### the ":first" selector
the first thing you're likely to try with hyperglue is probably something like: `hg('<div></div>', 'hello world')` which of course doesn't work, because to select outer elements you actually need to use the ":first" selector like so: `hg('<div></div>', { ':first': 'hello world' })`. hyperglue2 enables outer element selection by default, which makes rendering a bit more obvious:
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

## <a name="how"></a>how

### set innerText
```javascript
var htmlstring = '<div></div>';
hg(htmlstring, 'hello');
// or 
hg(htmlstring, { _text: 'hello' });
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
hg(el, { input: { _attr: { value: 42 }}});
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
* html compilation via [domify](http://github.com/component/domify)
* dom element selection via `document.querySelectorAll()`
* array re-rendering is achieved by caching a "blueprint" row on the parent element
* the original: [hyperglue](http://github.com/substack/hyperglue)

## license
WTFPL
