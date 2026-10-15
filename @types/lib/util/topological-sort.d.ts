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
export function topologicalSort<T>(edges: T[][]): T[];
//# sourceMappingURL=topological-sort.d.ts.map