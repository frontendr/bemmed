# BEM

> JavaScript reusable composer class for BEM (Block Element Modifier) CSS classes.

## Installation

Not published on npm (yet).

```bash
npm install github:frontendr/bem
```

## The problem solved

When using BEM notation there usually is a lot of repetition. The name of the block gets
repeated for every element and when a modifier is applied it is not uncommon that the
`className` of an element gets quite long and unwieldy.

The goal of this package is to be able to create a reusable object which is used to
build every possible BEM class we want but only having to type each part of that class
only once.

### The old way:

Here an example of a simple component using JSX:

```jsx harmony
function Profile({theme, collapsed, avatar, name}) {
  return (
    <article className={"profile profile--" + theme}>
      <header className="profile__header profile__header--with-avatar profile__header--extra-space">
        <h2 className={"profile__title" + (collapsed ? " profile__title--small" : "") + (theme === "dark" ? " profile__title--inverted" : "")}>{name}</h2>
        <figure className={"profile__avatar" + (collapsed ? " profile__avatar--collapsed" : "")}>
          <img src={avatar} alt={name} />
        </figure>
      </header>
      ...
    </article>    
  );
}
```
Results in 521b of code when transpiled with [babel](https://babeljs.io/repl/#?babili=false&browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=GYVwdgxgLglg9mABABQE52DANgUwBQDeUAFjgLY4A0iEcWWAhgA4DOOAJtQwG4NQOpqYBhQC-ASkQEAUIkSocUEKiR5ZcxAB4BsCLhqMWLAHIicAXgIAiJukz7bGbDgC0Lq4gDUiEuRyiAPnUNLVIGdhxUAwYjUwpzGztnAH1ksIiox3scVPTItwB3GBIXHj4BRCyUtJxw_JccAA8oVAYXFiYGCBwrIJCQzWIAJmjYs0tEp1xU2ChcD288WnpmNnZEAH5EDyrp5NncNxYyBnoPAC5tq0lF3wpEc0ft9gEAaw8tnaS9g9cXGDA3EiUA4Fyu4kCBGEYk0AHphn1-nJNJgAObKHCjEzjay7HLJMr8VALRBLOiMVgcTbbSrffGEgRuZYUtZgqzXQLBJFaGBkVGIFioCCWBmoUSIU5QSzQ_yIWGIpFwtEYhUaOF5VCquQAOl1XLhOhgehwARC6nEAG5pKIgA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=es2017%2Creact%2Cstage-2&prettier=false&targets=&version=7.4.3&externalPlugins=)
and then minified with [terser](https://xem.github.io/terser-online/).

This is not an uncommon pattern. Ok, some of the modifiers are a bit weird but we've all
seen worse right? As you can see there is quite a lot of repetition. The word `profile`
is used 10 times in `className` attributes, not to mention the `header`, `title` and
`avatar` elements.

Usually I would add newlines inside the `className` to make the ternary operators more
readable or compose the `className`s outside the JSX but I wanted to keep the same amount
of lines in the component between this and the next example:

### The new way:
```jsx harmony
// we can pre-initialize the classes used in this component, we don't have to but we can.
const [profileCls, headerCls, titleCls, avatarCls] = new BEM("profile").withElem("header", "title", "avatar");

function Profile({theme, collapsed, avatar, name}) {
  return (
    <article className={profileCls}>
      <header className={headerCls.withMod("with-avatar", "extra-space")}>
        <h2 className={titleCls.withMod({small: collapsed, inverted: theme === "dark"})}>{name}</h2>
        <figure className={avatarCls.withMod({collapsed})}>
          <img src={avatar} alt={name} />
        </figure>
      </header>
      ...
    </article>
  );
}
```
Results in 452b of code when transpiled with [babel](https://babeljs.io/repl/#?babili=false&browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=MYewdgzgLgBA2gBwE4gGYEsA2BTAwpiAGhgAtsBDAE2yXyJinShzuPIDdypzaCBdGAF4YYbAHcYAIQCiAWQAUAImRos2RQEoAdGKYlpOALZKyVGouKLGzdZY5cemgNwAoF6gCuYYI3AwACigYOPIA3lBkhtjEoJiY5AgQ2JRsnNxIxGDkUQC-GjChLjAwSNhQHkhgMPJFxTAAPDyMwDgwLeQQEABy2diCoSrBeAQ5AHy1dQ2m1Eht8Z09Uf3TNHQ6erIglEq6EQC09ukWMIrYAB5QSOR7EAjkwOoaYxOTUwBMcx3dvf3WLATrCKbbahCCGchxABcbRAcQSSRSMHQYHYNCgyWhEWwUSEgmEikoPAA1oo8mNQllcvUAPQkN7jV51eoYADmFWwnwWP1Chx4a12JGBYVi8USyTJDMZTPQhhZMAgSGA_V5SByMAhUH6lOwaupksZNNZ7P1TNpFBmJuKWmtLxpTXQLWwko0rhyQA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=es2017%2Creact%2Cstage-2&prettier=false&targets=Node-11&version=7.4.3&externalPlugins=)
and then minified with [terser](https://xem.github.io/terser-online/).

That's 69 bytes (-14%) *and* we gained the ability to reuse the classes allowing even
greater benefits.

As you can see in the example above, there is **no** repetition. The className variables
can be easily minified and mangled. Each `BEM` instance stays reusable to it can be
modified later as you can see when we use `withMod` inside the component based on it's
props.

## Features

- ✅ 1.681kB minified / 726B minified+gzipped
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
- ✖️ Acts like `block__element--modifier`, no way of setting other separators (yet).

## Usage

By example:

```jsx harmony
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

## FAQ

### Why not use a real ES2015 `class`?
The reason for this is simply minification. Without a `class` transpiling code using this
tool doesn't require a lot of extra code simply to define a `class`. This code just works
directly and doesn't bloat your code after transpiling.

### Why bother, doesn't gzip solve this already?
Yes it does help in some cases but it can never yield the same results and does not give
any of the benefits such as reusable objects, readability and ease of development.

### Improved readability? I find it harder to read
I can imagine never seeing a fully written `className` can be harder to read at first
but I got used to it quite fast.

### But now my IDE can't find the usages of a specific class!
True, but are your classes that scattered throughout your application? And if that's
the case then reusing a `BEM` instance for that class could help you by simply looking
for the usages for that instance instead of searching for the css class.

## Developing

- Build with `npm run build`
- Run tests with `npm run test` or `npm run test:unit`.

## LICENSE

MIT
