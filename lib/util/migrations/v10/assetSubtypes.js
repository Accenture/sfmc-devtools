import AssetDefinition from '../../../metadataTypes/definitions/Asset.definition.js';

// Historical membership is intentionally explicit; current membership belongs to AssetDefinition.
const historicalSubtypes = {
    templatebasedemail: ['message'],
    htmlemail: ['message'],
    textonlyemail: ['message'],
    message: ['message'],
    jsonmessage: ['message', 'asset'],
    webpage: ['asset'],
    webtemplate: ['asset'],
    cloudpages: ['cloudpage'],
    landingpage: ['cloudpage'],
    microsite: ['cloudpage'],
    interactivecontent: ['cloudpage'],
    jscoderesource: ['coderesource'],
    csscoderesource: ['coderesource'],
    jsoncoderesource: ['coderesource'],
    rsscoderesource: ['coderesource'],
    textcoderesource: ['coderesource'],
    xmlcoderesource: ['coderesource'],
};

/**
 * Resolve a documented v10 migration by the exact JSON assetType.name (IDs are not needed).
 *
 * @param {string} assetTypeName API asset type name, not a selector or customer key
 * @returns {{ oldSubtypes: string[], newSubtype: string } | null} migration or null for other types
 */
export function getAssetSubtypeMigration(assetTypeName) {
    if (!Object.hasOwn(historicalSubtypes, assetTypeName)) {
        return null;
    }
    const currentSubtype = Object.entries(AssetDefinition.extendedSubTypes).find(([, members]) =>
        members.includes(assetTypeName)
    )?.[0];
    // This sole grouping rename also works before the canonical definition is renamed in v10.
    const newSubtype = currentSubtype === 'message' ? 'email' : currentSubtype;
    if (!['email', 'mobile', 'webstudio'].includes(newSubtype)) {
        return null;
    }
    return { oldSubtypes: [...historicalSubtypes[assetTypeName]], newSubtype };
}

/**
 * Transform a caller-verified owner's component path relative to its BU's asset directory.
 * Paths use '/' separators, e.g. message/observed%2fkey/index.asset-message-meta.html.
 * Only the first (subtype) segment and an exact terminal metadata suffix can change.
 * Directory-only and suffix-only transitions are supported; current/nonmatching paths are identity.
 * No decoding, encoding, customerKey comparison, ownership discovery, or filesystem access occurs.
 * Callers must establish ownership and separately validate logical JSON customerKey identity,
 * encoding ambiguity, path containment, completeness, and collisions before using the result.
 *
 * @param {string} assetTypeName Owning JSON assetType.name
 * @param {string} assetRelativePath Observed POSIX path relative to the BU asset directory
 * @returns {string} transformed path, or the original string when not applicable
 */
export function transformAssetSubtypePath(assetTypeName, assetRelativePath) {
    const migration = getAssetSubtypeMigration(assetTypeName);
    if (!migration || assetRelativePath.includes('\\')) {
        return assetRelativePath;
    }
    const segments = assetRelativePath.split('/');
    if (
        segments.length < 2 ||
        segments.some((segment) => !segment || segment === '.' || segment === '..') ||
        ![...migration.oldSubtypes, migration.newSubtype].includes(segments[0])
    ) {
        return assetRelativePath;
    }
    segments[0] = migration.newSubtype;
    const filename = segments.at(-1);
    // Match only the final suffix, never key text, directories, or backup filenames.
    const suffix = /\.asset-([a-z]+)-meta\.[^.]+$/.exec(filename);
    if (suffix && migration.oldSubtypes.includes(suffix[1])) {
        segments[segments.length - 1] =
            filename.slice(0, suffix.index) +
            suffix[0].replace(`asset-${suffix[1]}-meta`, `asset-${migration.newSubtype}-meta`);
    }
    return segments.join('/');
}
