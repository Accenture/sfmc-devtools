/**
 * Returns the tables the given SQL selects from.
 *
 * @param {string} [sql] query text
 * @returns {SqlTable[]} unique list of tables in order of appearance; comparison ignores case
 */
export function getSourceTables(sql?: string): SqlTable[];
/**
 * Returns the tables the given SQL selects from plus the table positions that could not be read.
 *
 * @param {string} [sql] query text
 * @returns {SqlSources} tables and skipped references
 */
export function parseSourceTables(sql?: string): SqlSources;
export type SqlTable = {
    /**
     * table name as written in the query, without brackets, quotes or ENT. prefix
     */
    name: string;
    /**
     * true if the table was referenced with the ENT. prefix (shared / enterprise dataExtension)
     */
    isEnt: boolean;
};
export type SqlSkippedReference = {
    /**
     * template: name contains a mustache placeholder; unreadable: no table name could be read after FROM / JOIN / APPLY
     */
    reason: "template" | "unreadable";
    /**
     * short excerpt of the SQL at that position
     */
    text: string;
};
export type SqlSources = {
    /**
     * unique list of tables in order of appearance; comparison ignores case
     */
    tables: SqlTable[];
    /**
     * table positions that could not be resolved to a name
     */
    skipped: SqlSkippedReference[];
};
export type SqlToken = {
    /**
     * word: unquoted identifier or keyword, ident: [bracketed] or "quoted" identifier
     */
    type: "word" | "ident" | "string" | "punct";
    /**
     * token text; for ident without the surrounding brackets / quotes
     */
    value: string;
    /**
     * true if the name contains a mustache placeholder
     */
    templated?: boolean;
    /**
     * for every token: is the innermost bracket a query (top level, subquery, CTE body, join group) or something else (function call, value list)
     */
    context?: "query" | "other";
};
//# sourceMappingURL=sqlTables.d.ts.map