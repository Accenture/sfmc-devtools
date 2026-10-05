'use strict';

/**
 * Compares arrays and plain objects recursively while allowing scalar type coercion.
 *
 * @param {unknown} left first value
 * @param {unknown} right second value
 * @returns {boolean} whether both values are equivalent
 */
export function isDeepEqual(left, right) {
    if (Array.isArray(left) || Array.isArray(right)) {
        return (
            Array.isArray(left) &&
            Array.isArray(right) &&
            left.length === right.length &&
            left.every((value, index) => isDeepEqual(value, right[index]))
        );
    }

    if (isPlainObject(left) || isPlainObject(right)) {
        if (!isPlainObject(left) || !isPlainObject(right)) {
            return false;
        }
        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        return (
            leftKeys.length === rightKeys.length &&
            leftKeys.every((key) => Object.hasOwn(right, key) && isDeepEqual(left[key], right[key]))
        );
    }

    // Match the loose scalar comparison previously provided by deep-equal.
    return left == right;
}

/**
 * Checks whether a value is a plain object.
 *
 * @param {unknown} value value to inspect
 * @returns {value is Record<string, unknown>} whether the value is a plain object
 */
function isPlainObject(value) {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}
