export default sessionStore;
declare namespace sessionStore {
    /**
     * Read one session value.
     *
     * @param {string} key session key
     * @returns {unknown} stored value
     */
    function get(key: string): unknown;
    /**
     * Persist one session value while preserving unrelated keys.
     *
     * @param {string} key session key
     * @param {unknown} value session value
     * @returns {void}
     */
    function set(key: string, value: unknown): void;
    /**
     * Remove all stored sessions.
     *
     * @returns {void}
     */
    function clear(): void;
}
//# sourceMappingURL=sessionStore.d.ts.map