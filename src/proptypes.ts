import BEM, { BEMList } from "./index";

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

export const propTypes = {
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

export default propTypes;
