/**
 * Internal function to test if a value can be used as a BEM part. E.g. not falsy but
 * also not 0.
 * @param {*} value The value to test.
 * @returns {boolean}
 */
function isValidBEMPart(value) {
  return value === 0 || !!value;
}

/**
 * Creates a BEM part of value prefixed by the given prefix.
 * @param {string} value
 * @param {string} prefix
 * @returns {string}
 */
function createBEMPart(value, prefix) {
  return isValidBEMPart(value) ? `${prefix}${value}` : "";
}

/**
 * Returns the array without duplicates.
 * @param {Array} array The array.
 * @returns {Array} A copy of the array without duplicates.
 */
function dedupe(array) {
  return array.filter((value, index) => array.indexOf(value) === index);
}

/**
 * convert any input to an array of modifier strings
 * @param {String|*[]|Object} input
 * @returns {String|String[]}
 */
function createModifiers(input) {
  if (!isValidBEMPart(input)) {
    return null;
  }

  const type = typeof input;
  if (
    type === "string" ||
    input instanceof String ||
    type === "number" ||
    input instanceof Number
  ) {
    return input;
  }
  if (Array.isArray(input)) {
    return input.reduce((mods, mod) => mods.concat(createModifiers(mod)), []);
  }
  return Object.entries(input).reduce((mods, [mod, condition]) => {
    return mods.concat(condition ? [mod] : []);
  }, []);
}

/**
 * Array object with convenience methods to handle multiple BEM instances.
 */
export class BEMList extends Array {}

/**
 * Forces all items to their string value and returns them joined by a space.
 * @return {string} The full class name composed from all BEM instances in the list.
 */
BEMList.prototype.toString = function toString() {
  return this.filter(isValidBEMPart)
    .map(bem => bem.toString())
    .join(" ");
};

/**
 * BEM class prototype
 */
const Proto = {
  /**
   * Create a new BEM class with the given element part.
   * @param {string} element The element part of the class.
   * @param {...String} [modifiers] Optional modifier part(s).
   * @return {BEM|BEMList} A new BEM instance with the current block and given element and
   * modifier parts. If modifier parts are given, an array of BEM instances of the element
   * and all modified classes is returned.
   */
  element: function element(element, ...modifiers) {
    const cls = new this.constructor(this.b, element, null);
    if (modifiers.length) {
      return cls.withMod(...modifiers);
    }
    return cls;
  },

  /**
   * Returns a list of BEM instances for the given elements.
   * @example
   * const [itemClass, linkClass] = new BEM('list').elements('item', 'link')
   * // itemClass === "list__item"
   * // linkClass === "list__link"
   * @param {...string} elements
   * @returns {BEMList}
   */
  elements: function elements(...elements) {
    return BEMList.from(elements.map(element => this.element(element)));
  },

  /**
   * Returns a list of BEM objects starting with this object followed the element and
   * optionally modifications of the element.
   * @param {...string} elements The element to add.
   * @return {BEMList} List of BEM instances.
   * @example
   * const cls = new BEM('block');
   * cls.withElem('element');
   * > ["block", "block__element"]
   * cls.withElem('element1', 'element2');
   * > ["block", "block__element1", "block__element2"]
   */
  withElem: function withElem(...elements) {
    return this.concat(...this.elements(...elements));
  },

  /**
   * Create a new BEM class with the given modifier(s)
   * @param {...string|Object} modifiers The modifier part (or an array of modifiers) of
   * the class.
   * @return {BEM|BEMList} A new BEM instance with the current block and element and given
   * modifier parts. If an array
   * is given, an array of BEM instances is returned.
   */
  modifier: function modifier(...modifiers) {
    const mods = createModifiers(modifiers);
    if (mods.length > 1) {
      return BEMList.from(
        dedupe(mods).map(m => new this.constructor(this.b, this.e, m))
      );
    }
    return new this.constructor(this.b, this.e, mods[0]);
  },

  /**
   * Returns a list of BEM objects starting with this object followed by modifications of
   * this object.
   * @param {...string|Object} modifiers Rest arguments are applied as modifier
   * @return {BEMList} List of BEM instances.
   */
  withMod: function withMod(...modifiers) {
    const mods = dedupe(modifiers)
      .map(m => (isValidBEMPart(m) ? this.modifier(m) : null))
      .filter(bem => isValidBEMPart(bem) && bem.m);
    return this.concat(...mods);
  },

  /**
   * Returns a BEMList of this instance with the given items
   * @param {...BEM|BEMList|string} items
   * @returns {BEMList}
   */
  concat: function concat(...items) {
    return BEMList.from([this, ...dedupe(items)]);
  },

  /**
   * Returns the string representation of this BEM class.
   * @return {string} A string in the form of block__element--modifier
   */
  toString: function toString() {
    return this.b + createBEMPart(this.e, this.es) + createBEMPart(this.m, this.ms);
  }
};

/**
 * Add method aliases
 */
Object.assign(Proto, {
  elem: Proto.element,
  mod: Proto.modifier
});

/**
 * Object with options for the created BEM class.
 * @typedef {{elementSeparator: string, modifierSeparator: string}} BEMOptions
 */

/**
 * Factory function for a BEM class
 * @param {BEMOptions} [options={}] Customizations for the created class.
 * @returns {BEM}
 */
export function setup(options = {}) {
  const {elementSeparator = "__", modifierSeparator = "--"} = options;

  /**
   * BEM class constructor
   * @param {string} block The block part of the class.
   * @param {string|null} [element=null] Optional element part of the class.
   * @param {string|null} [modifier=null] Optional modifier part of the class.
   * @constructor
   */
  function BEM(block, element = null, modifier = null) {
    this.b = block;
    this.e = element;
    this.m = modifier;
  }

  /**
   * A propType that can be used to check a CSS class that can be a BEM instance or just a
   * plain string.
   * @param {Object} props Props object.
   * @param {string} propName Prop name.
   * @param {string} componentName Component name.
   * @return {Error|undefined} Returns an error if the property is invalid.
   */
  BEM.propType = function propType(props, propName, componentName) {
    const value = props[propName];
    if (
      ["string", "number"].includes(typeof value) ||
      value instanceof BEM ||
      value instanceof BEMList
    ) {
      return;
    }
    return new Error(
      `Invalid prop '${propName}' provided to ${componentName}. Should be a string or String instance got ${typeof value}`
    );
  };

  /**
   * Set the prototype to Proto extended with the `es` and `ms` properties.
   * @type {Proto}
   */
  BEM.prototype = Object.create(Proto, {
    es: {value: elementSeparator},
    ms: {value: modifierSeparator},
    constructor: {value: BEM}
  });

  return BEM;
}

/**
 * Setup a BEM class with default settings.
 * @type {BEM}
 */
export const BEM = setup();

/**
 * Export it's propType as BEMType.
 */
export const BEMType = BEM.propType;

/**
 * And make the BEM class the default export.
 */
export default BEM;
