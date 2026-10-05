'use strict';

/**
 * Minimal stable topological sort replacing the `toposort` package.
 *
 * The supported graph contract is an array of directed `[from, to]` edges. The returned array
 * contains every distinct endpoint once and places each `from` value before its corresponding
 * `to` value. Node discovery order is preserved for unrelated nodes, repeated edges are ignored,
 * and cycles throw the same error shape used by the former dependency. Call sites remain
 * responsible for removing sentinel endpoints such as `undefined`.
 *
 * This module intentionally omits the package's separate API for sorting an explicit node list,
 * including its unknown-node validation, because mcdev only sorts nodes discovered from edges.
 */

/**
 * Sort directed graph endpoints while retaining stable order for unrelated nodes.
 *
 * @template T
 * @param {T[][]} edges directed `[dependency, dependent]` pairs
 * @returns {T[]} each distinct endpoint in dependency-first order
 * @throws {Error} when the graph contains a cyclic dependency
 */
export function topologicalSort(edges) {
    const nodes = uniqueNodes(edges);
    const sorted = Array.from({ length: nodes.length });
    const visited = new Set();
    const outgoingEdges = makeOutgoingEdges(edges);
    let cursor = nodes.length;

    /**
     * Visit one node and its dependents in reverse insertion order to preserve package parity.
     *
     * @param {T} node graph endpoint to visit
     * @param {Set.<T>} predecessors nodes in the current traversal path
     * @returns {void}
     * @throws {Error} when the current traversal reaches a predecessor again
     */
    function visit(node, predecessors) {
        if (predecessors.has(node)) {
            throw new Error(`Cyclic dependency${formatCycleNode(node)}`);
        }
        if (visited.has(node)) {
            return;
        }
        visited.add(node);

        const outgoing = [...(outgoingEdges.get(node) || [])];
        if (outgoing.length) {
            predecessors.add(node);
            for (let index = outgoing.length - 1; index >= 0; index--) {
                visit(outgoing[index], predecessors);
            }
            predecessors.delete(node);
        }
        sorted[--cursor] = node;
    }

    for (let index = nodes.length - 1; index >= 0; index--) {
        visit(nodes[index], new Set());
    }
    return sorted;
}

/**
 * Collect distinct graph endpoints in first-seen order.
 *
 * @template T
 * @param {T[][]} edges directed graph edges
 * @returns {T[]} unique endpoints
 */
function uniqueNodes(edges) {
    const nodes = new Set();
    for (const edge of edges) {
        nodes.add(edge[0]);
        nodes.add(edge[1]);
    }
    return [...nodes];
}

/**
 * Build insertion-ordered outgoing-edge sets, deduplicating repeated edges.
 *
 * @template T
 * @param {T[][]} edges directed graph edges
 * @returns {Map.<T, Set.<T>>} outgoing endpoints per node
 */
function makeOutgoingEdges(edges) {
    const outgoingEdges = new Map();
    for (const [from, to] of edges) {
        if (!outgoingEdges.has(from)) {
            outgoingEdges.set(from, new Set());
        }
        if (!outgoingEdges.has(to)) {
            outgoingEdges.set(to, new Set());
        }
        outgoingEdges.get(from).add(to);
    }
    return outgoingEdges;
}

/**
 * Format a cycle endpoint without allowing unusual values to hide the cycle error.
 *
 * @param {unknown} node repeated graph endpoint
 * @returns {string} package-compatible node suffix, or an empty string when serialization fails
 */
function formatCycleNode(node) {
    try {
        return `, node was:${JSON.stringify(node)}`;
    } catch {
        return '';
    }
}
