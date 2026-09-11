/**
 * Read committed Git changes without consulting working-tree file contents.
 * Git rename/copy configuration is inherited from the injected repository client.
 * Paths are literal Git paths, never platform-normalized or display-name parsed.
 *
 * @param {{raw: (commands: string[]) => PromiseLike<string>}} git repository-scoped client
 * @param {string} range bare base, base..target, or base...target; omitted endpoints mean HEAD
 * @returns {Promise.<{comparison: {base: string, target: string}, changes: object[]}>} resolved commits and structured changes
 */
export function readGitDelta(git: {
    raw: (commands: string[]) => PromiseLike<string>;
}, range: string): Promise<{
    comparison: {
        base: string;
        target: string;
    };
    changes: object[];
}>;
//# sourceMappingURL=gitDelta.d.ts.map