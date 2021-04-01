const assert = require("assert");
const {describe, it} = require("mocha");

const {BEM, BEMList, setup} = require("../lib/bemmed");
const DefaultExport = require("../lib/bemmed").default;

describe("When constructing a new BEM instance", () => {
  it("should be able to only create a block", () => {
    const cls = new BEM("block");
    assert.strictEqual(cls.toString(), "block");
  });

  it("should be able to create a block with an element", () => {
    const cls = new BEM("block", "element");
    assert.strictEqual(cls.toString(), "block__element");
  });

  it("should be able to create a block with an element and modifier", () => {
    const cls = new BEM("block", "element", "modifier");
    assert.strictEqual(cls.toString(), "block__element--modifier");
  });
});

describe("When setting the element of an instance", () => {
  const block = new BEM("block");
  const blockElement = block.element("element");

  it("should create a BEM instance", () => {
    assert.strictEqual(blockElement instanceof BEM, true);
  });

  it("should create a new instance", () => {
    assert.notStrictEqual(block, blockElement);
  });

  it("should change the element part", () => {
    assert.strictEqual(blockElement.toString(), "block__element");
  });

  it("should not change the element part on the original instance", () => {
    assert.strictEqual(block.toString(), "block");
  });
});

describe("When setting the modifier of an instance", () => {
  const block = new BEM("block");
  const blockModifier = block.modifier("modifier");

  it("should create a new instance", () => {
    assert.notStrictEqual(block, blockModifier);
  });

  it("should create a BEM instance", () => {
    assert.strictEqual(blockModifier instanceof BEM, true);
  });

  it("should change the element part", () => {
    assert.strictEqual(blockModifier.toString(), "block--modifier");
  });

  it("should not change the element part on the original instance", () => {
    assert.strictEqual(block.toString(), "block");
  });

  it("should ignore falsy modifier values", () => {
    assert.strictEqual(block.modifier(null, false, undefined).toString(), "block");
  });

  it("should treat 0 as a valid modifier value", () => {
    assert.strictEqual(block.modifier(0).toString(), "block--0");
  });
});

describe("When using an object as modifier", () => {
  const modifiers = {
    "mod-true": true,
    "mod-1": 1,
    "mod-object": {},
    "mod-array": [],
    "mod-false": false,
  };
  const block = new BEM("block").modifier(modifiers);

  it("should create a BEMList instance", () => {
    assert.strictEqual(block instanceof BEMList, true);
  });

  it("should use all keys with a truthy value as modifiers", () => {
    assert.strictEqual(
      block.toString(),
      "block--mod-true block--mod-1 block--mod-object block--mod-array"
    );
  });
});

describe("When setting multiple modifiers of an instance", () => {
  const block = new BEM("block");
  const blockModifiers = block.modifier("mod1", "mod2");
  const blockModifiedWithObject = block.modifier({
    yes: true,
    awesome: true,
  });

  it("should create a BEMList", () => {
    assert.strictEqual(blockModifiers instanceof BEMList, true);
  });

  it("should create a list with 2 classes", () => {
    assert.strictEqual(blockModifiers.length, 2);
  });

  it("should create 2 block--modifier classes", () => {
    assert.strictEqual(blockModifiers.toString(), "block--mod1 block--mod2");
  });

  it("should also work with an object", () => {
    assert.strictEqual(blockModifiedWithObject.toString(), "block--yes block--awesome");
  });
});

describe("When setting both the element and modifier of an instance", () => {
  const block = new BEM("block", "old-element");
  const blockElementModifier = block.element("element", "modifier");

  it("should create a BEMList", () => {
    assert.strictEqual(blockElementModifier instanceof BEMList, true);
  });

  it("should create a list with 2 classes", () => {
    assert.strictEqual(blockElementModifier.length, 2);
  });

  it("should create a block__element and block__element--modifier class", () => {
    assert.strictEqual(
      blockElementModifier.toString(),
      "block__element block__element--modifier"
    );
  });

  it("should not modify the original instance", () => {
    assert.strictEqual(block.toString(), "block__old-element");
  });
});

describe("When setting an element with multiple modifiers", () => {
  const block = new BEM("block");
  const blockElementModifiers = block.element("element", "mod1", "mod2");

  it("should create a BEMList", () => {
    assert.strictEqual(blockElementModifiers instanceof BEMList, true);
  });

  it("should create a list with 3 classes", () => {
    assert.strictEqual(blockElementModifiers.length, 3);
  });

  it("should create a block__element and 2 block__element--modifier classes", () => {
    assert.strictEqual(
      blockElementModifiers.toString(),
      "block__element block__element--mod1 block__element--mod2"
    );
  });

  it("should not create duplicate modifiers", () => {
    const blockElementDuplicateMods = block.element("element", "mod1", "mod2", "mod1");

    assert.strictEqual(blockElementDuplicateMods.length, 3);
    assert.strictEqual(
      blockElementDuplicateMods.toString(),
      "block__element block__element--mod1 block__element--mod2"
    );
  });
});

describe("When creating multiple elements", () => {
  const block = new BEM("block", "element", "modifier");
  const elements = block.elements("el1", "el2", "el3");

  it("should create a BEMList", () => {
    assert.strictEqual(elements instanceof BEMList, true);
  });

  it("should create a list with 3 classes", () => {
    assert.strictEqual(elements.length, 3);
  });

  it("should create 3 block__element classes", () => {
    assert.strictEqual(elements.toString(), "block__el1 block__el2 block__el3");
  });
});

describe("When creating a block *with* an element", () => {
  const block = new BEM("block");
  const blockWithElement = block.withElem("element");

  it("should create a BEMList", () => {
    assert.strictEqual(blockWithElement instanceof BEMList, true);
  });

  it("should create a list with 2 classes", () => {
    assert.strictEqual(blockWithElement.length, 2);
  });

  it("should create a block and a block__element class", () => {
    assert.strictEqual(blockWithElement.toString(), "block block__element");
  });

  it("should reuse the original block as the first item of the list", () => {
    assert.strictEqual(blockWithElement[0], block);
  });

  it("should leave the existing element", () => {
    const blockElement = new BEM("block", "element");
    const blockWithNewElement = blockElement.withElem("element2");
    assert.strictEqual(
      blockWithNewElement.toString(),
      "block__element block__element2"
    );
  });
});

describe("When creating a block *with* a modifier", () => {
  const block = new BEM("block");
  const blockWithModifier = block.withMod("modifier");
  const blockWithAllFalsyModifiers = block.withMod({
    falsy: false,
    nully: null,
    empty: "",
  });
  const blockWithMixedObjectModifiers = block.withMod({
    foo: true,
    bar: true,
    falsy: false,
  });

  it("should create a BEMList", () => {
    assert.strictEqual(blockWithModifier instanceof BEMList, true);
  });

  it("should create a list with 2 classes", () => {
    assert.strictEqual(blockWithModifier.length, 2);
  });

  it("should create a block and a block__element class", () => {
    assert.strictEqual(blockWithModifier.toString(), "block block--modifier");
  });

  it("should reuse the original block as the first item of the list", () => {
    assert.strictEqual(blockWithModifier[0], block);
  });

  it("should return only 1 class if no modifiers are applied", () => {
    assert.strictEqual(blockWithAllFalsyModifiers.length, 1);
  });

  it("should only return the base class with no valid modifiers", () => {
    assert.strictEqual(block.toString(), blockWithAllFalsyModifiers.toString());
  });

  it("should correctly apply object modifiers", () => {
    assert.strictEqual(
      blockWithMixedObjectModifiers.toString(),
      "block block--foo block--bar"
    );
  });
});

/**
 * PropType testing function which should succeed.
 * @param {function} func The propType function
 * @param {Object} props The props object
 * @param {string} prop The prop name
 */
function shouldAccept(func, props, prop) {
  assert.strictEqual(func(props, prop, "TestComponent"), undefined);
}

/**
 * PropType testing function which should fail.
 * @param {function} func The propType function
 * @param {Object} props The props object
 * @param {string} prop The prop name
 */
function shouldReject(func, props, prop) {
  assert.strictEqual(func(props, prop, "TestComponent") instanceof Error, true);
}

const props = {
  bem: new BEM("block", "element", "modifier"),
  bemList: BEMList.from(["foo", "bar"]),
  emptyString: "",
  str: "string",
  num: 123,
  boolTrue: true,
  boolFalse: false,
  nullValue: null,
  array: ["a", "r", "r", "a", "y"],
  undef: undefined,
};

describe("BEM.propTypes.bem", () => {
  const func = BEM.propTypes.bem;

  it("should only reject undefined when required", () => {
    shouldAccept(func, props, "undef");
    shouldReject(func.isRequired, props, "undef");
  });
  it("should accept BEM instances", () => {
    shouldAccept(func, props, "bem");
    shouldAccept(func.isRequired, props, "bem");
  });
  it("should accept BEMList instances", () => {
    shouldAccept(func, props, "bemList");
    shouldAccept(func.isRequired, props, "bemList");
  });
  it("should reject strings", () => {
    shouldReject(func, props, "str");
    shouldReject(func.isRequired, props, "str");
  });
  it("should reject numbers", () => {
    shouldReject(func, props, "num");
    shouldReject(func.isRequired, props, "num");
  });
  it("should reject boolean true", () => {
    shouldReject(func, props, "boolTrue");
    shouldReject(func.isRequired, props, "boolTrue");
  });
  it("should reject boolean false", () => {
    shouldReject(func, props, "boolFalse");
    shouldReject(func.isRequired, props, "boolFalse");
  });
  it("should reject arrays", () => {
    shouldReject(func, props, "array");
    shouldReject(func.isRequired, props, "array");
  });
  it("should reject null", () => {
    shouldReject(func, props, "nullValue");
    shouldReject(func.isRequired, props, "nullValue");
  });
});

describe("BEM.propTypes.className", () => {
  const func = BEM.propTypes.className;

  it("should only reject undefined when required", () => {
    shouldAccept(func, props, "undef");
    shouldReject(func.isRequired, props, "undef");
  });
  it("should accept BEM instances", () => {
    shouldAccept(func, props, "bem");
    shouldAccept(func.isRequired, props, "bem");
  });
  it("should accept BEMList instances", () => {
    shouldAccept(func, props, "bemList");
    shouldAccept(func.isRequired, props, "bemList");
  });
  it("should accept empty strings", () => {
    shouldAccept(func, props, "emptyString");
    shouldAccept(func.isRequired, props, "emptyString");
  });
  it("should accept strings", () => {
    shouldAccept(func, props, "str");
    shouldAccept(func.isRequired, props, "str");
  });
  it("should accept numbers", () => {
    shouldAccept(func, props, "num");
    shouldAccept(func.isRequired, props, "num");
  });
  it("should reject boolean true", () => {
    shouldReject(func, props, "boolTrue");
    shouldReject(func.isRequired, props, "boolTrue");
  });
  it("should reject boolean false", () => {
    shouldReject(func, props, "boolFalse");
    shouldReject(func.isRequired, props, "boolFalse");
  });
  it("should reject arrays", () => {
    shouldReject(func, props, "array");
    shouldReject(func.isRequired, props, "array");
  });
  it("should reject null", () => {
    shouldReject(func, props, "nullValue");
    shouldReject(func.isRequired, props, "nullValue");
  });
});

describe("BEM.propTypes.element", () => {
  const func = BEM.propTypes.element;

  it("should only reject undefined when required", () => {
    shouldAccept(func, props, "undef");
    shouldReject(func.isRequired, props, "undef");
  });
  it("should reject BEM instances", () => {
    shouldReject(func, props, "bem");
    shouldReject(func.isRequired, props, "bem");
  });
  it("should reject BEMList instances", () => {
    shouldReject(func, props, "bemList");
    shouldReject(func.isRequired, props, "bemList");
  });
  it("should accept empty strings", () => {
    shouldAccept(func, props, "emptyString");
    shouldAccept(func.isRequired, props, "emptyString");
  });
  it("should accept strings", () => {
    shouldAccept(func, props, "str");
    shouldAccept(func.isRequired, props, "str");
  });
  it("should accept numbers", () => {
    shouldAccept(func, props, "num");
    shouldAccept(func.isRequired, props, "num");
  });
  it("should reject boolean true", () => {
    shouldReject(func, props, "boolTrue");
    shouldReject(func.isRequired, props, "boolTrue");
  });
  it("should reject boolean false", () => {
    shouldReject(func, props, "boolFalse");
    shouldReject(func.isRequired, props, "boolFalse");
  });
  it("should reject arrays", () => {
    shouldReject(func, props, "array");
    shouldReject(func.isRequired, props, "array");
  });
  it("should reject null", () => {
    shouldReject(func, props, "nullValue");
    shouldReject(func.isRequired, props, "nullValue");
  });
});

describe("BEM.propTypes.modifier", () => {
  const func = BEM.propTypes.modifier;

  it("should only reject undefined when required", () => {
    shouldAccept(func, props, "undef");
    shouldReject(func.isRequired, props, "undef");
  });
  it("should accept BEM instances", () => {
    shouldAccept(func, props, "bem");
    shouldAccept(func.isRequired, props, "bem");
  });
  it("should accept BEMList instances", () => {
    shouldAccept(func, props, "bemList");
    shouldAccept(func.isRequired, props, "bemList");
  });
  it("should accept empty strings", () => {
    shouldAccept(func, props, "emptyString");
    shouldAccept(func.isRequired, props, "emptyString");
  });
  it("should accept strings", () => {
    shouldAccept(func, props, "str");
    shouldAccept(func.isRequired, props, "str");
  });
  it("should accept numbers", () => {
    shouldAccept(func, props, "num");
    shouldAccept(func.isRequired, props, "num");
  });
  it("should reject boolean true", () => {
    shouldReject(func, props, "boolTrue");
    shouldReject(func.isRequired, props, "boolTrue");
  });
  it("should reject boolean false", () => {
    shouldReject(func, props, "boolFalse");
    shouldReject(func.isRequired, props, "boolFalse");
  });
  it("should reject arrays", () => {
    shouldAccept(func, props, "array");
    shouldAccept(func.isRequired, props, "array");
  });
  it("should reject null", () => {
    shouldAccept(func, props, "nullValue");
    shouldAccept(func.isRequired, props, "nullValue");
  });
});

describe("When working with a BEMList", () => {
  it("should remain a BEMList after using from()", () => {
    const list = BEMList.from(["a", "b"]);
    assert.strictEqual(list instanceof BEMList, true);
  });

  it("should remain a BEMList after using concat()", () => {
    const list = BEMList.from(["a", "b"]);
    const concatenated = list.concat("c");
    assert.strictEqual(concatenated instanceof BEMList, true);
  });

  it("should remove any duplicates when using concat()", () => {
    const list = BEMList.from(["a", "b"]);
    const concatenated = list.concat("c", "a", "a");
    assert.strictEqual(concatenated.toString(), "a b c a");
  });
});

describe("When the default export", () => {
  it("should be the same object as the named export 'BEM'", () => {
    assert.strictEqual(DefaultExport, BEM);
  });
});

describe("When changing separators using setup()", () => {
  const CustomBEM = setup({elementSeparator: "~", modifierSeparator: "~~"});
  const cls = new CustomBEM("block", "element", "modifier");

  it("should be an instance of CustomBEM", () => {
    assert.strictEqual(cls instanceof CustomBEM, true);
  });

  it("should generate a class with custom separators", () => {
    assert.strictEqual(cls.toString(), "block~element~~modifier");
  });

  it("the instance should look like a BEM object", () => {
    assert.strictEqual(new CustomBEM("block").constructor.name, "BEM");
  });
});
