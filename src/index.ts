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
   * @return {BEMList}
   */
  concat(...items: unknown[]): BEMList {
    return super.concat(...dedupe(items)) as BEMList;
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
