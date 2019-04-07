# BEM

> JavaScript reusable composer class for BEM (Block Element Modifier) CSS classes.

## Features

- ✅ 1.86kB minified / 791B minified+gzipped
- ✅ `BEM` instances are reusable and can be modified.
- ✅ `BEM` methods are plain or short english, no letters.
- ✅ Methods to ease the creation of multiple classes without duplication.
- ✅ Arguments are passed in a consistent way without specific syntax requirements such
     as `$dollar` variables.
- ✅ `BEM` or `BEMList` instances can be converted to a string by simply concatenating
     them with a string or just calling `.toString()` like any other JavaScript object.
- ✅ Adding multiple modifiers, requesting the base _with_ an element or modifier or
     concatenating it results in a `BEMList` which is a subclass of `Array` and renders
     as proper CSS classes separated by a space character.
- ✖️ Acts like `block__element--modifier`, no way of setting other separators.

## Installation

Not published on npm (yet).

```bash
npm install github:frontendr/bem
```

## Usage

By example:

```js
const cls = new BEM("block", "element", "modifier");
//=> BEM(b: "block", e: "element", m: "modifier")

// Convert to String:
String(cls);
//=> "block__element--modifier"
cls.toString();
//=> "block__element--modifier"
"" + cls;
//=> "block__element--modifier"
`${cls}`;
//=> "block__element--modifier"

// Use in JSX:
<div className={cls}>x</div>
//=> <div class="block__element--modifier">x</div>

// Just a block
String(new BEM("block"));
//=> "block"

// Block with element
String(new BEM("block", "element"));
//=> "block__element"

// Set modifier
const modified = cls.modifier("mod2"); // aliased as .mod()
String(modified);
//=> "block__element--mod2"

// Modifications return a new instance, original is unmodified:
String(cls);
//=> "block__element--modifier"

// Set multiple modifiers
String(cls.mod("mod-a", "mod-b", "mod-c"));
//=> "block__element--mod-a block__element--mod-b block__element--mod-c"

// Modify using an object, only keys of truthy values are applied:
String(cls.mod({
  foo: true,
  bar: false,
  "foo-bar": "yes"
}));
//=> "block__element--foo block__element--foo-bar"

// Set element
const newElement = cls.element("el2"); // aliased as elem()
String(newElement);
//=> "block__el2--modifier"

// Combine the class with a modified variant
const withMod = new BEM("block", "element").withMod("modifier");
//=> BEMList<[BEM(b: "block", e: "element", m: null), BEM(b: "block", e: "element", m: "modifier")]>
String(withMod);
//=> "block__element block__element--modifier"

// Get several elements (useful to pre-generate reusable classes):
const block = new BEM("block");
const [header, body, footer] = block.elements("header", "body", "footer");
String(header);
//=> "block__header"
String(body);
//=> "block__body"
String(footer);
//=> "block__footer"

// Concatenate with multiple strings, Array's, BEM instances or BEMList's
String(new BEM("block").concat(
  "just-a-string", // String
  new BEM("b", "e", "m"), // BEM instance
  new BEM("foo").withMod('bar') // BEMList
));
//=> "block just-a-string b__e--m foo foo--bar"
```

### Compared to other solutions

Other choices, in alphabetical order:

- [b_](https://www.npmjs.com/package/b_)
  - ❌ Not BEM by default
  - ❌ Not a reusable object
  - ✅ 1.3kB minified / 602B minified+gzipped [(source)](https://bundlephobia.com/result?p=b_@1.3.4)
- [bem-class-gen](https://www.npmjs.com/package/bem-class-gen)
  - ❌ Badly readable name `B` and only short methods.
  - ❌ Odd syntax just to create a block: `B().bl('block')`.
  - ❌ Having to use a `.bem` property for a string representation
  - ❌ Can't generate multiple classes (only multiple modifiers)
  - ❌ Bootstrap specific code
  - ❌ 2.2kB minified / 676B minified+gzipped [(source)](https://bundlephobia.com/result?p=bem-class-gen@1.0.2)
- [bem-classes](https://www.npmjs.com/package/bem-classes)
  - ❌ Odd syntax to apply modifiers: `{ $modifier: true }`
  - ❌ No reusable objects
  - ❌ Having to type your own `__element` part
  - ❌ Can't generate multiple classes
  - ❌ 5.6kB minified / 1.5kB minified+gzipped [(source)](https://bundlephobia.com/result?p=bem-classes@2.0.1)
- [bem-classname](https://www.npmjs.com/package/bem-classname)
  - ❌ Not a reusable object
  - ❌ Having to put modifiers in an array or object
  - ❌ 1.6kB minified / 572B minified+gzipped [(source)](https://bundlephobia.com/result?p=bem-classname@0.1.1)
- [bem-classnames](https://www.npmjs.com/package/bem-classnames)
  - ❌ Having to pre-define an object with the block, elements and modifiers 
  - ❌ Slow 
  - ✅ 1.3kB minified / 646B minified+gzipped [(source)](https://bundlephobia.com/result?p=bem-classnames@1.0.7)
- [bem-cn](https://www.npmjs.com/package/bem-cn)
  - ❌ Not BEM by default
  - ❌ Having to call as function to get the string representation
  - ❌ 3.7kB minified / 1.4kB minified+gzipped [(source)](https://bundlephobia.com/result?p=bem-cn@3.0.1)
- [bem-join](https://www.npmjs.com/package/bem-join)
  - ❌ Having to call as function to get the string representation
  - ❌ Not a reusable object
  - ✅ Small
  - ✅ 956B minified / 496B minified+gzipped [(source)](https://bundlephobia.com/result?p=bem-join@1.2.0)
- [react-bem-helper](https://www.npmjs.com/package/react-bem-helper)
  - ❌ Needs to be constructed with an object
  - ❌ Having to call as function to get the string representation
  - ❌ No support for multiple modifiers
  - ❌ 1.9kB minified / 941B minified+gzipped [(source)](https://bundlephobia.com/result?p=react-bem-helper@1.4.1)

## Why not use a real `class`?
The reason for this is simply minification. Without a `class` transpiling code using this
tool doesn't require alot of extra code simply to define a `class`. This code just works
directly and doesn't bloat your code after transpiling.

## Developing

- Clone
- Build with `npm run build`
- Run tests with `npm run test` or `npm run test:unit`.

## LICENSE

MIT
