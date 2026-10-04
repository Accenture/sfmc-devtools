'use strict';

/**
 * Converts one object or an array of objects into rows with flattened headers.
 * Empty input produces a table containing one empty header row.
 *
 * @param {object | object[]} input object or objects to tabulate
 * @returns {unknown[][]} header row followed by value rows
 */
export default function jsonToTable(input) {
    const records = Array.isArray(input) ? input : input ? [input] : [];
    if (records.length === 0) {
        return [[]];
    }

    const flattenedRecords = records.map((record) => flatten(record));
    const headers = [];
    const knownHeaders = new Set();

    for (const record of flattenedRecords) {
        for (const header of Object.keys(record)) {
            if (knownHeaders.has(header)) {
                continue;
            }
            knownHeaders.add(header);
            headers.push(header);
        }
    }

    if (headers.length === 0) {
        return [[]];
    }

    return [
        headers,
        ...flattenedRecords.map((record) =>
            headers.map((header) =>
                Object.prototype.hasOwnProperty.call(record, header) ? record[header] : ''
            )
        ),
    ];
}

/**
 * Flattens nested values into dotted leaf paths without changing the source object.
 *
 * @param {object} input object to flatten
 * @returns {Record<string, unknown>} flattened path/value map
 */
function flatten(input) {
    /** @type {Record<string, unknown>} */
    const result = {};

    /**
     * Visits one value and records its leaf path.
     *
     * @param {unknown} value current value
     * @param {string} path current dotted path
     * @returns {void}
     */
    function visit(value, path) {
        if (value !== null && typeof value === 'object' && Object.keys(value).length > 0) {
            for (const [key, nestedValue] of Object.entries(value)) {
                visit(nestedValue, path ? `${path}.${key}` : key);
            }
            return;
        }

        if (path) {
            result[path] = value;
        }
    }

    visit(input, '');
    return result;
}
