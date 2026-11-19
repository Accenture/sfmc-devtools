'use strict';

/**
 * Small dependency-free reader for the tables a Marketing Cloud SQL query selects from.
 *
 * This is not a SQL parser. It tokenizes the query, ignores comments (including nested block
 * comments) and string literals, and then collects the names that follow FROM (including comma
 * lists), any kind of JOIN, bracketed join groups and CROSS / OUTER APPLY. Subqueries, CTE names,
 * table variables, temp tables, table-valued functions and system data views (names starting with
 * an underscore) are skipped on purpose. Names with mustache placeholders and table positions that
 * cannot be read are returned separately, so callers can tell the user that a dependency might be
 * missing instead of losing it silently.
 */

/**
 * @typedef {object} SqlTable
 * @property {string} name table name as written in the query, without brackets, quotes or ENT. prefix
 * @property {boolean} isEnt true if the table was referenced with the ENT. prefix (shared / enterprise dataExtension)
 */

/**
 * @typedef {object} SqlSkippedReference
 * @property {'template'|'unreadable'} reason template: name contains a mustache placeholder; unreadable: no table name could be read after FROM / JOIN / APPLY
 * @property {string} text short excerpt of the SQL at that position
 */

/**
 * @typedef {object} SqlSources
 * @property {SqlTable[]} tables unique list of tables in order of appearance; comparison ignores case
 * @property {SqlSkippedReference[]} skipped table positions that could not be resolved to a name
 */

/**
 * @typedef {object} SqlToken
 * @property {'word'|'ident'|'string'|'punct'} type word: unquoted identifier or keyword, ident: [bracketed] or "quoted" identifier
 * @property {string} value token text; for ident without the surrounding brackets / quotes
 * @property {boolean} [templated] true if the name contains a mustache placeholder
 * @property {'query'|'other'} [context] for every token: is the innermost bracket a query (top level, subquery, CTE body, join group) or something else (function call, value list)
 */

/** keywords after which a table name is expected */
const TABLE_KEYWORDS = new Set(['from', 'join', 'apply']);

/** keywords that can follow a table name and therefore are never an alias */
const NOT_AN_ALIAS = new Set([
    'apply',
    'cross',
    'except',
    'full',
    'group',
    'having',
    'inner',
    'intersect',
    'join',
    'left',
    'on',
    'option',
    'order',
    'outer',
    'pivot',
    'right',
    'union',
    'unpivot',
    'where',
    'window',
    'with',
]);

/** characters that can be part of an unquoted identifier; letters and digits of any language */
const WORD_CHAR = /[\p{L}\p{M}\p{N}_@#$]/u;

/**
 * placeholder that replaces mustache syntax inside a name; it can never appear in real SQL
 */
const TEMPLATE_MARK = '\u0000';

/**
 * Returns the tables the given SQL selects from.
 *
 * @param {string} [sql] query text
 * @returns {SqlTable[]} unique list of tables in order of appearance; comparison ignores case
 */
export function getSourceTables(sql) {
    return parseSourceTables(sql).tables;
}

/**
 * Returns the tables the given SQL selects from plus the table positions that could not be read.
 *
 * @param {string} [sql] query text
 * @returns {SqlSources} tables and skipped references
 */
export function parseSourceTables(sql) {
    /** @type {SqlSources} */
    const result = { tables: [], skipped: [] };
    if (typeof sql !== 'string' || !sql.trim()) {
        return result;
    }
    const tokens = tokenize(sql);
    setContext(tokens);
    const cteNames = getCteNames(tokens);

    const seen = new Set();
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (
            token.type !== 'word' ||
            token.context !== 'query' ||
            !TABLE_KEYWORDS.has(token.value.toLowerCase())
        ) {
            continue;
        }
        const isFrom = token.value.toLowerCase() === 'from';
        for (const parts of readTableList(tokens, i + 1, isFrom, result.skipped)) {
            if (parts.some((part) => part.templated)) {
                result.skipped.push({ reason: 'template', text: excerpt(tokens, i) });
                continue;
            }
            const table = toTable(parts, cteNames);
            if (!table) {
                continue;
            }
            const id = (table.isEnt ? 'ent.' : '') + table.name.toLowerCase();
            if (seen.has(id)) {
                continue;
            }
            seen.add(id);
            result.tables.push(table);
        }
    }
    return result;
}

/**
 * Splits SQL into tokens and drops comments and whitespace.
 *
 * @param {string} sql query text
 * @returns {SqlToken[]} tokens
 */
function tokenize(sql) {
    /** @type {SqlToken[]} */
    const tokens = [];
    let i = 0;
    while (i < sql.length) {
        const char = sql[i];
        const next = sql[i + 1];
        if (/\s/u.test(char)) {
            i++;
        } else if (char === '-' && next === '-') {
            // line comment
            const end = sql.indexOf('\n', i);
            i = end === -1 ? sql.length : end + 1;
        } else if (char === '/' && next === '*') {
            i = skipBlockComment(sql, i);
        } else if (char === "'") {
            // string literal; '' is an escaped quote
            const end = findClosing(sql, i + 1, "'");
            tokens.push({ type: 'string', value: sql.slice(i + 1, end) });
            i = end + 1;
        } else if (char === '[' || char === '"') {
            // quoted identifier; ]] or "" is an escaped closing character
            const closing = char === '[' ? ']' : '"';
            const end = findClosing(sql, i + 1, closing);
            const value = sql.slice(i + 1, end).replaceAll(closing + closing, closing);
            tokens.push({ type: 'ident', value: value, templated: value.includes('{{') });
            i = end + 1;
        } else if ((char === '{' && next === '{') || WORD_CHAR.test(char)) {
            // a word, possibly with mustache placeholders glued to it like {{{prefix}}}_Orders
            const word = readWord(sql, i);
            tokens.push({
                type: 'word',
                value: word.value,
                templated: word.value.includes(TEMPLATE_MARK),
            });
            i = word.end;
        } else {
            tokens.push({ type: 'punct', value: char });
            i++;
        }
    }
    return tokens;
}

/**
 * skips a block comment; T-SQL allows nesting them, e.g. a commented out block that contains a comment
 *
 * @param {string} sql query text
 * @param {number} start index of the opening slash
 * @returns {number} index after the comment or sql.length if it is not closed
 */
function skipBlockComment(sql, start) {
    let depth = 0;
    let i = start;
    while (i < sql.length) {
        if (sql[i] === '/' && sql[i + 1] === '*') {
            depth++;
            i += 2;
        } else if (sql[i] === '*' && sql[i + 1] === '/') {
            depth--;
            i += 2;
            if (depth === 0) {
                return i;
            }
        } else {
            i++;
        }
    }
    return sql.length;
}

/**
 * finds the closing quote / bracket, skipping doubled (escaped) ones
 *
 * @param {string} sql query text
 * @param {number} start index after the opening character
 * @param {string} closing closing character
 * @returns {number} index of the closing character or sql.length if there is none
 */
function findClosing(sql, start, closing) {
    let i = start;
    while (i < sql.length) {
        if (sql[i] === closing) {
            if (sql[i + 1] === closing) {
                i += 2;
                continue;
            }
            return i;
        }
        i++;
    }
    return sql.length;
}

/**
 * reads an unquoted word; mustache placeholders inside it are replaced by {@link TEMPLATE_MARK}
 *
 * @param {string} sql query text
 * @param {number} start index of the first character
 * @returns {{value: string, end: number}} word and index after it
 */
function readWord(sql, start) {
    let value = '';
    let i = start;
    while (i < sql.length) {
        if (sql[i] === '{' && sql[i + 1] === '{') {
            const end = sql.indexOf('}}', i + 2);
            if (end === -1) {
                return { value: value + TEMPLATE_MARK, end: sql.length };
            }
            i = end + 2;
            // skip the third closing brace of {{{triple}}} mustache
            if (sql[i] === '}') {
                i++;
            }
            value += TEMPLATE_MARK;
        } else if (WORD_CHAR.test(sql[i])) {
            value += sql[i];
            i++;
        } else {
            break;
        }
    }
    return { value, end: i };
}

/**
 * Marks each token with the context it is in. Only FROM / JOIN / APPLY in a query context are
 * table references; this avoids reading FROM inside functions like TRIM('x' FROM field).
 * A bracket is a query context if it starts a subquery or CTE body (SELECT / WITH) or if it is a
 * join group right after FROM / JOIN / APPLY, e.g. JOIN (b JOIN c ON ...) ON ...
 *
 * @param {SqlToken[]} tokens tokens from {@link tokenize}; modified in place
 * @returns {void}
 */
function setContext(tokens) {
    /** @type {('query'|'other')[]} */
    const stack = ['query'];
    /** @type {Set.<number>} indexes of brackets that hold a table reference */
    const tableBrackets = new Set();
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const context = stack.at(-1);
        token.context = context;
        if (isPunct(token, '(')) {
            const previous = tokens[i - 1];
            const isTableBracket =
                context === 'query' &&
                ((previous?.type === 'word' && TABLE_KEYWORDS.has(previous.value.toLowerCase())) ||
                    tableBrackets.has(i - 1));
            if (isTableBracket) {
                tableBrackets.add(i);
            }
            stack.push(
                isTableBracket || isWord(tokens[i + 1], 'select', 'with') ? 'query' : 'other'
            );
        } else if (isPunct(token, ')')) {
            if (stack.length > 1) {
                stack.pop();
            }
            token.context = stack.at(-1);
        }
    }
}

/**
 * Collects names defined via WITH name [(columns)] AS (...) so they are not taken for tables.
 *
 * @param {SqlToken[]} tokens tokens from {@link tokenize}
 * @returns {Set.<string>} lower-case CTE names
 */
function getCteNames(tokens) {
    const names = new Set();
    for (let i = 0; i < tokens.length; i++) {
        if (!isWord(tokens[i], 'with')) {
            continue;
        }
        let j = i + 1;
        while (j < tokens.length) {
            const nameToken = tokens[j];
            if (!nameToken || (nameToken.type !== 'word' && nameToken.type !== 'ident')) {
                break;
            }
            j++;
            if (isPunct(tokens[j], '(')) {
                // optional column list
                j = skipBrackets(tokens, j);
            }
            if (!isWord(tokens[j], 'as') || !isPunct(tokens[j + 1], '(')) {
                break;
            }
            names.add(nameToken.value.toLowerCase());
            j = skipBrackets(tokens, j + 1);
            if (!isPunct(tokens[j], ',')) {
                break;
            }
            j++;
        }
    }
    return names;
}

/**
 * Reads the table reference(s) after FROM / JOIN / APPLY.
 * This only looks ahead; the caller still visits every token, so FROM / JOIN inside a skipped
 * subquery or join group is found by the caller later.
 *
 * @param {SqlToken[]} tokens tokens from {@link tokenize}
 * @param {number} start index of the first token after the keyword
 * @param {boolean} allowList true for FROM, which allows a comma separated list
 * @param {SqlSkippedReference[]} skipped positions without a readable table name are added here
 * @returns {SqlToken[][]} name parts of every table reference found
 */
function readTableList(tokens, start, allowList, skipped) {
    const tables = [];
    let i = start;
    if (i >= tokens.length) {
        skipped.push({ reason: 'unreadable', text: excerpt(tokens, start - 1) });
    }
    while (i < tokens.length) {
        let parts = [];
        if (isPunct(tokens[i], '(')) {
            if (!isWord(tokens[i + 1], 'select', 'with')) {
                // join group like (b JOIN c ON ...): its first table has no keyword in front of it
                tables.push(...readTableList(tokens, i + 1, false, skipped));
            }
            // subqueries and the rest of a join group are handled when the caller reaches their FROM / JOIN
            i = skipBrackets(tokens, i);
        } else {
            while (tokens[i] && (tokens[i].type === 'word' || tokens[i].type === 'ident')) {
                parts.push(tokens[i]);
                i++;
                if (!isPunct(tokens[i], '.')) {
                    break;
                }
                i++;
            }
            if (isPunct(tokens[i], '(')) {
                // table-valued function such as OPENJSON(...)
                parts = [];
                i = skipBrackets(tokens, i);
            } else if (!parts.length || (parts[0].type === 'word' && isKeyword(parts[0]))) {
                // e.g. FROM followed by a string, a keyword or broken template syntax like { { { x } } }
                skipped.push({ reason: 'unreadable', text: excerpt(tokens, start - 1) });
                break;
            }
        }
        if (parts.length) {
            tables.push(parts);
        }
        // optional alias, with or without AS
        if (isWord(tokens[i], 'as')) {
            i += 2;
        } else if (
            tokens[i] &&
            (tokens[i].type === 'ident' ||
                (tokens[i].type === 'word' && !NOT_AN_ALIAS.has(tokens[i].value.toLowerCase())))
        ) {
            i++;
        }
        if (!allowList || !isPunct(tokens[i], ',')) {
            break;
        }
        i++;
    }
    return tables;
}

/**
 * converts the name parts of one reference into a table, or null if it is skipped on purpose
 *
 * @param {SqlToken[]} parts name parts, e.g. ENT and Orders for ENT.[Orders]
 * @param {Set.<string>} cteNames lower-case CTE names
 * @returns {SqlTable|null} table or null
 */
function toTable(parts, cteNames) {
    let isEnt = false;
    if (parts.length > 1 && parts[0].value.toLowerCase() === 'ent') {
        isEnt = true;
        parts = parts.slice(1);
    }
    const name = parts.map((part) => part.value).join('.');
    if (
        !name ||
        // system data views like _Sent or ENT._Subscribers
        name.startsWith('_') ||
        // table variables and temp tables
        name.startsWith('@') ||
        name.startsWith('#') ||
        (!isEnt && cteNames.has(name.toLowerCase()))
    ) {
        return null;
    }
    return { name, isEnt };
}

/**
 * builds a short piece of the SQL for log messages
 *
 * @param {SqlToken[]} tokens tokens from {@link tokenize}
 * @param {number} start index of the first token to show
 * @returns {string} excerpt of up to 4 tokens
 */
function excerpt(tokens, start) {
    return tokens
        .slice(start, start + 4)
        .map((token) => {
            if (token.type === 'ident') {
                return `[${token.value}]`;
            } else if (token.type === 'string') {
                return `'${token.value}'`;
            }
            return token.value.replaceAll(TEMPLATE_MARK, '{{...}}');
        })
        .join(' ');
}

/**
 * catches cases like "FROM WHERE" in broken or partial SQL
 *
 * @param {SqlToken} token word token
 * @returns {boolean} true if the word is a keyword that cannot be a table name
 */
function isKeyword(token) {
    const value = token.value.toLowerCase();
    return NOT_AN_ALIAS.has(value) || value === 'select';
}

/**
 * @param {SqlToken} token token to check
 * @param {...string} values lower-case words to compare with
 * @returns {boolean} true if token is an unquoted word matching one of the values
 */
function isWord(token, ...values) {
    return token?.type === 'word' && values.includes(token.value.toLowerCase());
}

/**
 * @param {SqlToken} token token to check
 * @param {string} value punctuation character
 * @returns {boolean} true if token is the given punctuation
 */
function isPunct(token, value) {
    return token?.type === 'punct' && token.value === value;
}

/**
 * @param {SqlToken[]} tokens tokens from {@link tokenize}
 * @param {number} start index of an opening bracket
 * @returns {number} index after the matching closing bracket
 */
function skipBrackets(tokens, start) {
    let depth = 0;
    for (let i = start; i < tokens.length; i++) {
        if (isPunct(tokens[i], '(')) {
            depth++;
        } else if (isPunct(tokens[i], ')')) {
            depth--;
            if (depth === 0) {
                return i + 1;
            }
        }
    }
    return tokens.length;
}
