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
  element(element, ...modifiers) {
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
  elements(...elements) {
    return BEMList.from(elements, this.element, this);
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
  withElem(...elements) {
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
  modifier(...modifiers) {
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
  withMod(...modifiers) {
    const mods = dedupe(modifiers)
      .map(m => this.modifier(m))
      .filter(bem => bem instanceof BEMList || !!bem.m);
    return this.concat(...mods);
  },

  /**
   * Returns a BEMList of this instance with the given items
   * @param {...BEM|BEMList|string} items
   * @returns {BEMList}
   */
  concat(...items) {
    return BEMList.from([this, ...dedupe(items)]);
  },

  /**
   * Returns the string representation of this BEM class.
   * @return {string} A string in the form of block__element--modifier
   */
  toString() {
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
 * Creates the BEM.propTypes object.
 * @returns {{modifier: ((function(*, *=, *=): Error)|undefined), className: ((function(*, *, *): Error)|undefined), bem: ((function(*, *=, *=): Error)|undefined), element: ((function(*, *=, *=): Error)|undefined)}}
 */
function getPropTypes() {
  /**
   * Returns a prop type error message.
   * @param {string} propName The prop name
   * @param {string} componentName The component name
   * @param {Array} expected The expected types
   * @param {string} actual The type of the value
   * @returns {Error}
   */
  function propTypeError(propName, componentName, expected, actual) {
    return new Error(
      `Invalid prop '${propName}' provided to ${componentName}. Expected ${expected.join(
        ", "
      )}. Got ${actual}.`
    );
  }

  /**
   * Checker function if the value is a BEM instance.
   * @param {*} value The value to check.
   * @param {string} type The type of the value.
   * @param {string} propName Name of the prop.
   * @param {string} componentName Name of the component
   * @returns {Error|undefined}
   */
  function bemPropType(value, type, propName, componentName) {
    if (type !== "object" || !(value instanceof BEM || value instanceof BEMList)) {
      return propTypeError(propName, componentName, ["an instance of BEM"], type);
    }
  }

  /**
   * Checker function if the value is a valid BEM element.
   * @param {*} value The value to check.
   * @param {string} type The type of the value.
   * @param {string} propName Name of the prop.
   * @param {string} componentName Name of the component
   * @returns {Error|undefined}
   */
  function elementPropType(value, type, propName, componentName) {
    const expected = ["string", "number"];
    if (!expected.includes(type)) {
      return propTypeError(propName, componentName, expected, type);
    }
  }

  /**
   * Checker function if the value is a valid BEM modifier.
   * @param {*} value The value to check.
   * @param {string} type The type of the value.
   * @param {string} propName Name of the prop.
   * @param {string} componentName Name of the component
   * @returns {Error|undefined}
   */
  function modifierPropType(value, type, propName, componentName) {
    const expected = ["object", "string", "number"];
    if (!expected.includes(type)) {
      return propTypeError(propName, componentName, expected, type);
    }
  }

  /**
   * Checker function if the value is a valid className prop.
   * @param {*} value The value to check.
   * @param {string} type The type of the value.
   * @param {string} propName Name of the prop.
   * @param {string} componentName Name of the component
   * @returns {Error|undefined}
   */
  function classNamePropType(value, type, propName, componentName) {
    const expected = ["string", "number"];
    if (
      !(expected.includes(type) || value instanceof BEM || value instanceof BEMList)
    ) {
      return propTypeError(
        propName,
        componentName,
        expected.concat("instance of BEM or an instance of BEMList"),
        type
      );
    }
  }

  /**
   * Factory function for a propType function which ensures no Error is returned for
   * falsy values if the prop is not required.
   * @param {boolean} isRequired
   * @param {function} func
   * @returns {function(*, *=, *=): Error|undefined}
   */
  function getPropTypeChecker(isRequired, func) {
    /**
     * The propType function. Handles falsy values based on isRequired and calls the
     * given function if a value is given.
     * @param {Object} props Props object.
     * @param {string} propName Prop name.
     * @param {string} componentName Component name.
     * @return {Error|undefined} Returns an error if an invalid value is given.
     */
    return function propType(props, propName, componentName) {
      const value = props[propName];
      const type = typeof value;
      if (type === "undefined" && !isRequired) {
        // falsy value and not required
        return;
      }

      return func(value, type, propName, componentName);
    };
  }

  /**
   * Returns a non-required custom PropType function with a required variant on it's
   * isRequired property.
   * @param {function} func The checker function
   * @returns {function(*, *=, *=): Error|undefined}
   */
  function getPropType(func) {
    const propType = getPropTypeChecker(false, func);
    propType.isRequired = getPropTypeChecker(true, func);
    return propType;
  }

  return {
    /**
     * PropType for a BEM instance.
     * @type {function(*, *=, *=): Error|undefined}
     */
    bem: getPropType(bemPropType),
    /**
     * PropType for any valid className prop value (which includes BEM(list) instances).
     * @type {function(*, *, *): Error|undefined}
     */
    className: getPropType(classNamePropType),
    /**
     * PropType for a valid BEM element value.
     * @type {function(*, *=, *=): Error|undefined}
     */
    element: getPropType(elementPropType),
    /**
     * PropType for a valid BEM modifier value.
     * @type {function(*, *=, *=): Error|undefined}
     */
    modifier: getPropType(modifierPropType)
  };
}

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
   * Collection of BEM related propTypes.
   * @type {{modifier: ((function(*, *=, *=): Error)|undefined), className: ((function(*, *, *): Error)|undefined), bem: ((function(*, *=, *=): Error)|undefined), element: ((function(*, *=, *=): Error)|undefined)}}
   */
  BEM.propTypes = getPropTypes();

  /**
   * Previous versions had a propType property which checked if a property was a valid
   * className property. This property is now deprecated in favor of
   * BEM.propTypes.className and will be removed in the next major release.
   * @type {((function(*, *, *): Error)|undefined)}
   * @deprecated
   */
  BEM.propType = BEM.propTypes.className;

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
 * @deprecated
 */
export const BEMTypes = BEM.propType;

/**
 * And make the BEM class the default export.
 */
export default BEM;
