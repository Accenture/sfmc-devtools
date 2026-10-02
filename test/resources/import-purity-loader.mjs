const blockedImports = new Set((process.env.MCDEV_BLOCKED_IMPORTS || '').split(',').filter(Boolean));

/**
 * Reject package resolution so subprocess tests can prove optional code paths do not evaluate it.
 *
 * @param {string} specifier requested module specifier
 * @param {object} context loader context
 * @param {Function} nextResolve next loader resolver
 * @returns {Promise<object>} resolved module descriptor
 */
export async function resolve(specifier, context, nextResolve) {
    if (blockedImports.has(specifier)) {
        throw new Error(`Blocked import evaluated: ${specifier} from ${context.parentURL}`);
    }
    return nextResolve(specifier, context);
}
