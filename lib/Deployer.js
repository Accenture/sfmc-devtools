'use strict';

import MetadataTypeInfo from './MetadataTypeInfo.js';
import path from 'node:path';
import Cli from './util/cli.js';
import { Util } from './util/util.js';
import File from './util/file.js';
import config from './util/config.js';
import cache from './util/cache.js';
import auth from './util/auth.js';

/**
 * @typedef {import('../types/mcdev.d.js').BuObject} BuObject
 * @typedef {import('../types/mcdev.d.js').CodeExtract} CodeExtract
 * @typedef {import('../types/mcdev.d.js').CodeExtractItem} CodeExtractItem
 * @typedef {import('../types/mcdev.d.js').Mcdevrc} Mcdevrc
 * @typedef {import('../types/mcdev.d.js').MetadataTypeItem} MetadataTypeItem
 * @typedef {import('../types/mcdev.d.js').MetadataTypeItemDiff} MetadataTypeItemDiff
 * @typedef {import('../types/mcdev.d.js').MetadataTypeItemObj} MetadataTypeItemObj
 * @typedef {import('../types/mcdev.d.js').MetadataTypeMap} MetadataTypeMap
 * @typedef {import('../types/mcdev.d.js').MetadataTypeMapObj} MetadataTypeMapObj
 * @typedef {import('../types/mcdev.d.js').MultiMetadataTypeList} MultiMetadataTypeList
 * @typedef {import('../types/mcdev.d.js').SoapRequestParams} SoapRequestParams
 * @typedef {import('../types/mcdev.d.js').TemplateMap} TemplateMap
 * @typedef {import('../types/mcdev.d.js').MultiMetadataTypeMap} MultiMetadataTypeMap
 * @typedef {import('../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 */

/**
 * Reads metadata from local directory and deploys it to specified target business unit.
 * Source and target business units are also compared before the deployment to apply metadata specific patches.
 */
class Deployer {
    /**
     * Creates a Deployer, uses v2 auth if v2AuthOptions are passed.
     *
     * @param {Mcdevrc} properties General configuration to be used in retrieve
     * @param {BuObject} buObject properties for auth
     */
    constructor(properties, buObject) {
        this.buObject = buObject;
        this.properties = properties;
        this.deployDir = File.normalizePath([
            properties.directories.deploy,
            buObject.credential,
            buObject.businessUnit,
        ]);
        this.retrieveDir = File.normalizePath([
            properties.directories.retrieve,
            buObject.credential,
            buObject.businessUnit,
        ]);
        // prep folders for auto-creation
        MetadataTypeInfo.folder.client = auth.getSDK(buObject);
        MetadataTypeInfo.folder.properties = this.properties;
    }
    /**
     * Deploys all metadata located in the 'deploy' directory to the specified business unit
     *
     * @param {string} businessUnit references credentials from properties.json
     * @param {string[] | TypeKeyCombo} [selectedTypesArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @returns {Promise.<Object.<string, MultiMetadataTypeMap>>} deployed metadata per BU (first key: bu name, second key: metadata type)
     */
    static async deploy(businessUnit, selectedTypesArr, keyArr) {
        Util.logger.info('mcdev:: Deploy');
        /** @type {Object.<string, MultiMetadataTypeMap>} */
        const buMultiMetadataTypeMap = {};
        const properties = await config.getProperties();
        if (!(await config.checkProperties(properties))) {
            return null;
        }
        const deployDirBak = properties.directories.deploy;
        if (Util.OPTIONS.fromRetrieve) {
            properties.directories.deploy = properties.directories.retrieve;
        }
        if (selectedTypesArr) {
            for (const selectedType of Array.isArray(selectedTypesArr)
                ? selectedTypesArr
                : Object.keys(selectedTypesArr)) {
                if (!Util._isValidType(selectedType)) {
                    return;
                }
            }
        }
        if (Util.OPTIONS.fromRetrieve) {
            // check if either type & key or typeKeyCombo including keys was supplied
            // we dont want to allow deploying without key from the retrieve dir for safety reasons
            let keysFound = false;
            if (
                Array.isArray(selectedTypesArr) &&
                selectedTypesArr.length &&
                Array.isArray(keyArr) &&
                keyArr.length
            ) {
                // check legacy way of passing in type(s) and key(s)
                keysFound = true;
            } else if (
                selectedTypesArr &&
                !Array.isArray(selectedTypesArr) &&
                Object.values(selectedTypesArr).length
            ) {
                // TypeKeyCombo - a single null value (== no keys for one type) should lead to the error
                keysFound = true;
                for (const keys of Object.values(selectedTypesArr)) {
                    if (keys === null) {
                        keysFound = false;
                        break;
                    }
                }
            }
            if (!keysFound) {
                Util.logger.error('type & key need to be defined to deploy from retrieve folder');
                return;
            }
        }
        let counter_credBu = 0;
        if (businessUnit === '*') {
            if (Util.OPTIONS.changeKeyValue) {
                Util.logger.error('--changeKeyValue is not supported for deployments to all BUs');
                return;
            }
            // all credentials and all BUs shall be deployed to
            const deployFolders = await File.readDirectories(
                properties.directories.deploy,
                2,
                false
            );

            for (const buPath of deployFolders.filter((r) => r.includes(path.sep))) {
                const [cred, bu] = buPath.split(path.sep);
                const multiMetadataTypeMap = await this._deployBU(
                    cred,
                    bu,
                    properties,
                    selectedTypesArr,
                    keyArr
                );
                buMultiMetadataTypeMap[cred + '/' + bu] = multiMetadataTypeMap;
                counter_credBu++;
                Util.logger.info('');
                Util.startLogger(true);
            }
        } else {
            // anything but "*" passed in
            let [cred, bu] = businessUnit ? businessUnit.split('/') : [null, null];

            // to allow all-BU via user selection we need to run this here already
            if (
                properties.credentials &&
                (!properties.credentials[cred] ||
                    (bu !== '*' && properties.credentials[cred].businessUnits[bu]))
            ) {
                const buObject = await Cli.getCredentialObject(
                    properties,
                    cred === null ? null : cred + '/' + bu,
                    null,
                    true
                );
                if (buObject === null) {
                    return;
                } else {
                    cred = buObject.credential;
                    bu = buObject.businessUnit;
                }
            }

            if (bu === '*' && properties.credentials && properties.credentials[cred]) {
                if (Util.OPTIONS.changeKeyValue) {
                    Util.logger.error(
                        '--changeKeyValue is not supported for deployments to all BUs'
                    );
                    return;
                }
                // valid credential given and -all- BUs targeted
                Util.logger.info(`:: Deploying all BUs for ${cred}`);
                let counter_credBu = 0;
                // for (const bu in properties.credentials[cred].businessUnits) {
                const deployFolders = await File.readDirectories(
                    File.normalizePath([properties.directories.deploy, cred]),
                    1,
                    false
                );
                for (const buPath of deployFolders) {
                    const multiMetadataTypeMap = await this._deployBU(
                        cred,
                        buPath,
                        properties,
                        selectedTypesArr,
                        keyArr
                    );
                    buMultiMetadataTypeMap[cred + '/' + buPath] = multiMetadataTypeMap;
                    counter_credBu++;
                    Util.logger.info('');
                    Util.startLogger(true);
                }
                Util.logger.info(` :: ${counter_credBu} BUs for ${cred}\n`);
            } else {
                // either bad credential or specific BU or no BU given
                const multiMetadataTypeMap = await this._deployBU(
                    cred,
                    bu,
                    properties,
                    selectedTypesArr,
                    keyArr
                );
                counter_credBu++;
                buMultiMetadataTypeMap[cred + '/' + bu] = multiMetadataTypeMap;
            }
        }
        if (Util.OPTIONS.fromRetrieve) {
            properties.directories.deploy = deployDirBak;
        }
        if (counter_credBu !== 0) {
            Util.logger.info(`:: Deployed ${counter_credBu} BUs\n`);
        }
        return buMultiMetadataTypeMap;
    }
    /**
     * helper for {@link Deployer.deploy}
     *
     * @param {string} cred name of Credential
     * @param {string} bu name of BU
     * @param {Mcdevrc} properties General configuration to be used in retrieve
     * @param {string[] | TypeKeyCombo} [typeArr] limit deployment to given metadata type
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @returns {Promise.<MultiMetadataTypeMap>} ensure that BUs are worked on sequentially
     */
    static async _deployBU(cred, bu, properties, typeArr, keyArr) {
        const buPath = `${cred}/${bu}`;
        Util.logger.info(`:: Deploying to ${buPath}`);
        const buObject = await Cli.getCredentialObject(properties, buPath, null, true);
        let multiMetadataTypeMap;

        if (buObject !== null) {
            cache.initCache(buObject);
            const deployer = new Deployer(properties, buObject);
            try {
                // await is required or the calls end up conflicting
                multiMetadataTypeMap = await deployer._deploy(typeArr, keyArr);
            } catch (ex) {
                Util.logger.errorStack(ex, 'mcdev.deploy failed');
            }
        }
        return multiMetadataTypeMap;
    }

    /**
     * Deploy all metadata that is located in the deployDir
     *
     * @param {string[] | TypeKeyCombo} [types] limit deployment to given metadata type (can include subtype)
     * @param {string[]} [keyArr] limit deployment to given metadata keys
     * @returns {Promise.<MultiMetadataTypeMap>} Promise of all deployed metadata
     */
    async _deploy(types, keyArr) {
        const typeArr = types ? (Array.isArray(types) ? types : Object.keys(types)) : undefined;
        const typeKeyCombo = Array.isArray(types)
            ? Util.createTypeKeyCombo(typeArr, keyArr, true)
            : types;
        if (await File.pathExists(this.deployDir)) {
            /** @type {MultiMetadataTypeMap} */
            this.metadata = await Deployer.readBUMetadata(this.deployDir, typeArr);
            // filter found metadata by key if given
            if (typeArr && Array.isArray(typeArr)) {
                for (const selectedType of typeArr) {
                    const type = selectedType.split('-')[0];
                    this.metadata[type] = Util.filterObjByKeys(
                        this.metadata[type],
                        typeKeyCombo[selectedType]
                    );
                    if (!Object.keys(this.metadata[type]).length) {
                        Util.logger.warn(
                            `No deployable metadata found for type ${type} for selected keys`
                        );
                        delete this.metadata[type];
                    }
                }
            }
        } else {
            this.metadata = null;
            Util.logger.error(
                'Please create a directory called deploy and include your metadata in it: ' +
                    this.deployDir
            );
            return null;
        }
        if (this.metadata === null || !Object.keys(this.metadata).length) {
            Util.logger.error('No metadata found in deploy folder for selected BU');
            return null;
        }
        if (Util.OPTIONS.changeKeyValue && Object.keys(this.metadata).length) {
            if (Object.keys(this.metadata).length > 1) {
                Util.logger.error('--changeKeyValue expects a single type to be deployed');
                return null;
            } else if (Object.keys(Object.values(this.metadata)[0]).length > 1) {
                Util.logger.error('--changeKeyValue expects a single key to be deployed');
                return null;
            }
        }

        const foundDeployTypes = Object.keys(this.metadata)
            // remove empty types
            .filter((type) => Object.keys(this.metadata[type]).length)
            // make sure we keep the subtype in this list if that's what the user defined
            .map((type) =>
                type === 'asset' && Util.includesStartsWith(typeArr, type)
                    ? typeArr[Util.includesStartsWithIndex(typeArr, type)]
                    : type
            );
        if (!foundDeployTypes.length) {
            throw new Error('No metadata found for deployment');
        }
        const deployOrder = Util.getMetadataHierachy(foundDeployTypes);

        if (!Util.OPTIONS.fromRetrieve) {
            // run this AFTER identifying deployOrder or else ALL folders will be cached
            await Deployer.createFolderDefinitions(
                this.deployDir,
                this.metadata,
                Object.keys(this.metadata)
            );
        }
        // build cache, including all metadata types which will be deployed (Avoids retrieve later)
        for (const metadataType in deployOrder) {
            const type = metadataType;
            const subTypeArr = deployOrder[metadataType];
            // add metadata & client to metadata process class instead of passing cache/mapping every time
            MetadataTypeInfo[type].client = auth.getSDK(this.buObject);
            MetadataTypeInfo[type].properties = this.properties;
            MetadataTypeInfo[type].buObject = this.buObject;
            Util.logger.info(`Caching dependent Metadata: ${metadataType}`);
            Util.logSubtypes(subTypeArr);
            const result = await MetadataTypeInfo[type].retrieveForCache(null, subTypeArr);
            cache.setMetadata(type, result.metadata);
        }
        /** @type {MultiMetadataTypeMap} */
        const multiMetadataTypeMap = {};
        // deploy metadata files, extending cache once deploys
        for (const metadataType in deployOrder) {
            // TODO rewrite to allow deploying only a specific sub-type; currently, subtypes are ignored when executing deploy
            const type = metadataType;
            if (this.metadata[type]) {
                Util.logger.info(
                    'Deploying: ' +
                        metadataType +
                        (Util.OPTIONS.fromRetrieve ? ' (from retrieve folder)' : '')
                );

                const result = await MetadataTypeInfo[type].deploy(
                    this.metadata[type],
                    this.deployDir,
                    this.retrieveDir
                );
                multiMetadataTypeMap[type] = result;
                cache.mergeMetadata(type, result);
            }
        }
        return multiMetadataTypeMap;
    }

    /**
     * Returns metadata of a business unit that is saved locally
     *
     * @param {string} deployDir root directory of metadata.
     * @param {string[]} [typeArr] limit deployment to given metadata type
     * @param {boolean} [listBadKeys] do not print errors, used for badKeys()
     * @returns {Promise.<MultiMetadataTypeMap>} Metadata of BU in local directory
     */
    static async readBUMetadata(deployDir, typeArr, listBadKeys) {
        /** @type {MultiMetadataTypeMap} */
        const buMetadata = {};
        try {
            await File.ensureDir(deployDir);
            const metadataTypes = await File.readdir(deployDir);
            for (const metadataType of metadataTypes) {
                if (
                    MetadataTypeInfo[metadataType] &&
                    (!typeArr || Util.includesStartsWith(typeArr, metadataType))
                ) {
                    // check if folder name is a valid metadataType, then check if the user limited to a certain type in the command params
                    buMetadata[metadataType] = await MetadataTypeInfo[metadataType].getJsonFromFS(
                        File.normalizePath([deployDir, metadataType]),
                        listBadKeys,
                        typeArr
                    );
                }
            }
            if (Object.keys(buMetadata).length === 0) {
                throw new Error('No metadata found in deploy folder for selected BU & type');
            }
            return buMetadata;
        } catch (ex) {
            throw new Error(ex.message);
        }
    }

    /**
     * parses asset metadata to auto-create folders in target folder
     *
     * @param {string} deployDir root directory of metadata.
     * @param {MultiMetadataTypeMap} metadata list of metadata
     * @param {string[]} metadataTypeArr list of metadata types
     * @returns {Promise.<object>} folder metadata
     */
    static async createFolderDefinitions(deployDir, metadata, metadataTypeArr) {
        let i = 0;
        const folderMetadata = {};
        const allowedDeFolderContentTypes = ['dataextension', 'shared_dataextension'];
        for (const metadataType of metadataTypeArr) {
            // check if folder or folder-like metadata type is in dependencies
            if (
                !MetadataTypeInfo[metadataType].definition.dependencies.includes('folder') &&
                !MetadataTypeInfo[metadataType].definition.dependencies.some((dep) =>
                    dep.startsWith('folder-')
                )
            ) {
                Util.logger.debug(` ☇ skipping ${metadataType} folders: folder not a dependency`);
                continue;
            }
            if (!MetadataTypeInfo[metadataType].definition.folderType) {
                Util.logger.debug(` ☇ skipping ${metadataType} folders: folderType not set`);
                continue;
            }
            if (
                !MetadataTypeInfo.folder.definition.deployFolderTypes.includes(
                    MetadataTypeInfo[metadataType].definition.folderType
                )
            ) {
                Util.logger.warn(
                    ` ☇ skipping ${metadataType} folders: folderType ${MetadataTypeInfo[metadataType].definition.folderType} not supported for deployment. Please consider creating folders for this type manually as a pre-deployment step, if you see errors about missing dependent folders for this type later in this log.`
                );
                continue;
            }
            Util.logger.debug(
                ` - create ${metadataType} folders: Creating relevant folders in deploy dir`
            );

            const allFolders = Object.keys(metadata[metadataType])
                .filter(
                    // filter out root folders (which would not have a slash in their path)
                    (key) => metadata[metadataType][key].r__folder_Path?.includes('/')
                )
                .filter(
                    // filter out dataExtension folders other than standard & shared (--> synchronized / salesforce are not allowed)
                    (key) =>
                        metadataType !== 'dataExtension' ||
                        allowedDeFolderContentTypes.includes(
                            metadata[metadataType][key].r__folder_ContentType
                        )
                )
                .map((key) => metadata[metadataType][key].r__folder_Path);

            // deduplicate
            const folderPathSet = new Set(allFolders);
            for (const item of [...folderPathSet].sort()) {
                let aggregatedPath = '';
                const parts = item.split('/');
                for (const pathElement of parts) {
                    if (aggregatedPath) {
                        aggregatedPath += '/';
                    }
                    aggregatedPath += pathElement;
                    folderPathSet.add(aggregatedPath);
                }
            }
            const folderPathArrExtended = [...folderPathSet]
                // strip root folders
                .filter((folderName) => folderName.includes('/'))
                .sort();

            for (const folder of folderPathArrExtended) {
                i++;
                let contentType = MetadataTypeInfo[metadataType].definition.folderType;
                if (
                    metadataType === 'dataExtension' &&
                    folder.startsWith('Shared Items/Shared Data Extensions')
                ) {
                    contentType = 'shared_dataextension';
                }
                if (
                    metadataType === 'triggeredSend' &&
                    folder.startsWith('Journey Builder Sends/')
                ) {
                    contentType = 'triggered_send_journeybuilder';
                }
                folderMetadata[`on-the-fly-${i}`] = {
                    Path: folder,
                    Name: folder.split('/').pop(),
                    Description: '', // required for Create, omitted for update via definition file
                    ContentType: contentType,
                    IsActive: true, // would be auto-updated for existing folders if needed
                    IsEditable: true, // would be auto-updated for existing folders if needed
                    AllowChildren: true, // would be auto-updated for existing folders if needed
                    _generated: true,
                };
            }
        }

        if (i > 0) {
            MetadataTypeInfo.folder.definition.fields._generated.retrieving = true; // ensure we keep that flag in deploy folder
            // await results to allow us to re-read it right after
            await MetadataTypeInfo.folder.saveResults(folderMetadata, deployDir, null);
            MetadataTypeInfo.folder.definition.fields._generated.retrieving = false; // reset flag
            Util.logger.info(`Created folders in deploy dir: ${i}`);

            // reload from file system to ensure we use the same logic for building the temporary JSON
            metadata.folder = await MetadataTypeInfo.folder.getJsonFromFS(
                File.normalizePath([deployDir, 'folder'])
            );
        }
        return folderMetadata;
    }
}

export default Deployer;
