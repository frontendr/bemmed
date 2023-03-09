const DEFAULT_ELEMENT_SEPARATOR = "__";
const DEFAULT_MODIFIER_SEPARATOR = "--";

/**
 * Internal function to test if a value can be used as a BEM part. E.g. not
 * falsy but also not 0.
 * @param {*} value The value to test.
 * @returns {boolean}
 */
function isValidBEMPart(value: unknown): boolean {
  return value === 0 || !!value;
}

/**
 * Creates a BEM part of value prefixed by the given prefix.
 * @param {*} value
 * @param {String} prefix
 * @returns {String}
 */
function createBEMPart(value: unknown, prefix: string): string {
  return isValidBEMPart(value) ? `${prefix}${value}` : "";
}

/**
 * Returns the array without duplicates.
 * @param {Array} array The array.
 * @returns {Array} A copy of the array without duplicates.
 */
function dedupe<T>(array: T[]): T[] {
  return array.filter((value, index) => array.indexOf(value) === index);
}

/**
 * A BEM modifier value.
 */
type Modifier = string;

/**
 * Value which can be used as a modifier.
 */
type ModifierArgument = string | Record<string, unknown> | number;

/**
 * Convert any input to an array of modifier strings
 * @param {String|*[]|Object} input
 * @returns {String|String[]}
 */
function createModifiers(
  input: ModifierArgument | ModifierArgument[]
): Modifier | Modifier[] | null {
  const type = typeof input;

  if (input !== 0 && !input) {
    return null;
  }

  if (
    type === "string" ||
    input instanceof String ||
    type === "number" ||
    input instanceof Number
  ) {
    return input.toString();
  }

  let mods;
  if (Array.isArray(input)) {
    // Must be an array of strings or objects:
    mods = input.reduce((mods: string[], mod: ModifierArgument): string[] => {
      const subMods = createModifiers(mod);
      return subMods !== null ? mods.concat(subMods) : mods;
    }, []);
  } else {
    // Treat like an object with modifiers as keys and conditions as values
    mods = Object.entries(input).reduce(
      (mods: string[], [mod, condition]): string[] => {
        return condition ? mods.concat(mod) : mods;
      },
      []
    );
  }

  if (mods.length === 0) return null;
  if (mods.length === 1) return mods[0];
  return mods;
}

/**
 * Array object with convenience methods to handle multiple BEM instances.
 */
export class BEMList extends Array {
  /**
   * Forces all items to their string value and returns them joined by a space.
   * @return {string} The full class name composed of all BEM instances in the
   * list.
   */
  toString(): string {
    return this.filter(isValidBEMPart)
      .map((bem) => bem.toString())
      .join(" ");
  }

  /**
   * Shorthand for toString()
   */
  get s(): string {
    return this.toString();
  }

  /**
   * Returns a BEMList of this instance with the given items
   * @param {...BEM|BEMList|string} items
   * @return {*[]}
   */
  concat(...items: unknown[]): unknown[] {
    return super.concat(...dedupe(items));
  }
}

/**
 * BEM base class
 */
class Bemmed {
  b: string;
  e: string | null;
  m: string | null;

  readonly es: string = DEFAULT_ELEMENT_SEPARATOR;
  readonly ms: string = DEFAULT_MODIFIER_SEPARATOR;

  /**
   * Alias for `element()`
   */
  elem: typeof Bemmed.prototype.element;

  /**
   * Alias for `modifier()`
   */
  mod: typeof Bemmed.prototype.modifier;

  constructor(b: string, e: string | null = null, m: string | null = null) {
    this.b = b;
    this.e = e;
    this.m = m;

    // Bind alias methods:
    this.elem = this.element.bind(this);
    this.mod = this.modifier.bind(this);
  }

  /**
   * Create a new BEM class with the given element part.
   * @param {String} element The element part of the class.
   * @param {...String} [modifiers] Optional modifier part(s).
   * @return {BEM|BEMList} A new BEM instance with the current block and given element and
   * modifier parts. If modifier parts are given, an array of BEM instances of the element
   * and all modified classes is returned.
   */
  element(element: string, ...modifiers: ModifierArgument[]) {
    const bem = new this.cls(this.b, element, null);
    if (modifiers.length) {
      return bem.withMod(...modifiers);
    }
    return bem;
  }

  /**
   * Returns a list of BEM instances for the given elements.
   * @example
   * const [itemClass, linkClass] = new BEM('list').elements('item', 'link')
   * // itemClass === "list__item"
   * // linkClass === "list__link"
   * @param {...string} elements
   * @returns {BEMList}
   */
  elements(...elements: string[]) {
    return BEMList.from(elements).map((element) => this.element(element));
  }

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
  withElem(...elements: string[]) {
    return this.concat(...this.elements(...elements));
  }

  /**
   * Create a new BEM class with the given modifier(s)
   * @param {...string|Object} modifiers The modifier part (or an array of modifiers) of
   * the class.
   * @return {BEM|BEMList} A new BEM instance with the current block and element and given
   * modifier parts. If an array
   * is given, an array of BEM instances is returned.
   */
  modifier(...modifiers: ModifierArgument[]): Bemmed | BEMList {
    const mods = createModifiers(modifiers);
    const isArray = Array.isArray(mods);
    if (mods === null || (isArray && !mods.length)) {
      // no new modifiers, so just return this:
      return this;
    }

    if (isArray) {
      return BEMList.from(
        dedupe(mods).map((m) => new this.cls(this.b, this.e, m))
      ) as BEMList;
    }
    return new this.cls(this.b, this.e, mods);
  }

  /**
   * Returns a list of BEM objects starting with this object followed by modifications of
   * this object.
   * @param {...string|Object} modifiers Rest arguments are applied as modifier
   * @return {BEMList} List of BEM instances.
   */
  withMod(...modifiers: ModifierArgument[]): BEMList {
    const mods = dedupe(modifiers)
      .map((m) => this.modifier(m))
      .filter((bem) => bem instanceof BEMList || !!bem.m);
    return this.concat(...mods);
  }

  /**
   * Returns a BEMList of this instance with the given items
   * @param {...BEM|BEMList|string} items
   * @returns {BEMList}
   */
  concat(...items: unknown[]): BEMList {
    return BEMList.from([this, ...dedupe(items)]) as BEMList;
  }

  /**
   * Returns the string representation of this BEM class.
   * @return {string} A string in the form of block__element--modifier
   */
  toString(): string {
    return (
      this.b + createBEMPart(this.e, this.es) + createBEMPart(this.m, this.ms)
    );
  }

  /**
   * Shorthand for toString()
   */
  get s(): string {
    return this.toString();
  }

  /**
   * Returns the class object of this BEM class.
   */
  get cls(): typeof Bemmed {
    return this.constructor as typeof Bemmed;
  }

  static propTypes = getPropTypes();
}

type PropTypeCheckResult = Error | undefined;
export type PropTypeFunction = (
  props: Record<string, unknown>,
  type: string,
  propName: string,
  componentName: string
) => PropTypeCheckResult;

export type PropTypeFunctionWithRequired = PropTypeFunction & {
  isRequired: PropTypeFunction;
};

type PropTypeChecker = (
  value: unknown,
  type: string,
  propName: string,
  componentName: string
) => PropTypeCheckResult;

function getPropTypes() {
  /**
   * Returns a prop type error message.
   * @param {string} propName The prop name
   * @param {string} componentName The component name
   * @param {Array} expected The expected types
   * @param {string} actual The type of the value
   * @returns {Error}
   */
  function propTypeError(
    propName: string,
    componentName: string,
    expected: string[],
    actual: string
  ): Error {
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
  function bemPropType(
    value: unknown,
    type: string,
    propName: string,
    componentName: string
  ): Error | undefined {
    if (
      type !== "object" ||
      !(value instanceof BEM || value instanceof BEMList)
    ) {
      return propTypeError(
        propName,
        componentName,
        ["an instance of BEM"],
        type
      );
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
  function elementPropType(
    value: unknown,
    type: string,
    propName: string,
    componentName: string
  ): Error | undefined {
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
  function modifierPropType(
    value: unknown,
    type: string,
    propName: string,
    componentName: string
  ): Error | undefined {
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
  function classNamePropType(
    value: unknown,
    type: string,
    propName: string,
    componentName: string
  ): Error | undefined {
    const expected = ["string", "number"];
    if (
      !(
        expected.includes(type) ||
        value instanceof BEM ||
        value instanceof BEMList
      )
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
  function getPropTypeChecker(
    isRequired: boolean,
    func: PropTypeChecker
  ): PropTypeFunction {
    /**
     * The propType function. Handles falsy values based on isRequired and calls the
     * given function if a value is given.
     * @param {Object} props Props object.
     * @param {string} propName Prop name.
     * @param {string} componentName Component name.
     * @return {Error|undefined} Returns an error if an invalid value is given.
     */
    return function propType(
      props: Record<string, unknown>,
      propName: string,
      componentName: string
    ): PropTypeCheckResult {
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
  function getPropType(func: PropTypeChecker): PropTypeFunctionWithRequired {
    const propType = getPropTypeChecker(false, func);
    return Object.assign(propType, {
      isRequired: getPropTypeChecker(true, func),
    });
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
    modifier: getPropType(modifierPropType),
  };
}

type BEMSetupOptions = {
  elementSeparator?: string;
  modifierSeparator?: string;
};

export function setup(options: BEMSetupOptions = {}): typeof Bemmed {
  const {
    elementSeparator = DEFAULT_ELEMENT_SEPARATOR,
    modifierSeparator = DEFAULT_MODIFIER_SEPARATOR,
  } = options;
  class BEM extends Bemmed {
    es = elementSeparator;
    ms = modifierSeparator;
  }
  return BEM;
}

export const BEM = setup();
export default BEM;
