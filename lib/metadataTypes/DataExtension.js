'use strict';

const jsonToTable = require('json-to-table');
const TYPE = require('../../types/mcdev.d');
const MetadataType = require('./MetadataType');
const DataExtensionField = require('./DataExtensionField');
const Folder = require('./Folder');
const AttributeSet = require('./AttributeSet');
const Util = require('../util/util');
const File = require('../util/file');
const auth = require('../util/auth');
const cache = require('../util/cache');
const pLimit = require('p-limit');
const inquirer = require('inquirer');

/**
 * DataExtension MetadataType
 *
 * @augments MetadataType
 */
class DataExtension extends MetadataType {
    /**
     * Upserts dataExtensions after retrieving them from source and target to compare
     * if create or update operation is needed.
     *
     * @param {TYPE.DataExtensionMap} metadataMap dataExtensions mapped by their customerKey
     * @returns {Promise} Promise
     */
    static async upsert(metadataMap) {
        // get existing DE-fields for DE-keys in deployment package to properly handle add/update/delete of fields
        const fieldOptions = {};
        for (const key of Object.keys(metadataMap)) {
            fieldOptions.filter = fieldOptions.filter
                ? {
                      leftOperand: {
                          leftOperand: 'DataExtension.CustomerKey',
                          operator: 'equals',
                          rightOperand: key,
                      },
                      operator: 'OR',
                      rightOperand: fieldOptions.filter,
                  }
                : {
                      leftOperand: 'DataExtension.CustomerKey',
                      operator: 'equals',
                      rightOperand: key,
                  };
        }
        Util.logger.info(` - Caching dependent Metadata: dataExtensionField`);
        await this.#attachFields(metadataMap, fieldOptions);

        /** @type {object[]} */
        const metadataToCreate = [];
        /** @type {object[]} */
        const metadataToUpdate = [];
        let filteredByPreDeploy = 0;
        for (const metadataKey in metadataMap) {
            try {
                metadataMap[metadataKey] = await this.preDeployTasks(metadataMap[metadataKey]);
            } catch (ex) {
                // output error & remove from deploy list
                Util.logger.error(
                    ` ☇ skipping ${this.definition.type} ${
                        metadataMap[metadataKey][this.definition.keyField]
                    } / ${metadataMap[metadataKey][this.definition.nameField]}: ${ex.message}`
                );
                delete metadataMap[metadataKey];
                // skip rest of handling for this DE
                filteredByPreDeploy++;
                continue;
            }
            await this.createOrUpdate(
                metadataMap,
                metadataKey,
                false,
                metadataToUpdate,
                metadataToCreate
            );
        }
        if (metadataToUpdate.length) {
            Util.logger.info(
                ' - Please note that Data Retention Policies can only be set during creation, not during update.'
            );
        }
        const createLimit = pLimit(10);
        const createResults = (
            await Promise.allSettled(
                metadataToCreate
                    .filter((r) => r !== undefined && r !== null)
                    .map((metadataEntry) => createLimit(() => this.create(metadataEntry)))
            )
        )
            .filter((r) => r !== undefined && r !== null)
            .filter(this.#filterUpsertResults);

        const updateLimit = pLimit(10);
        const updateResults = (
            await Promise.allSettled(
                metadataToUpdate
                    .filter((r) => r !== undefined && r !== null)
                    .map((metadataEntry) =>
                        updateLimit(() => this.update(metadataEntry.after, metadataEntry.before))
                    )
            )
        )
            .filter((r) => r !== undefined && r !== null)
            .filter(this.#filterUpsertResults);

        const successfulResults = [...createResults, ...updateResults];
        Util.logger.info(
            `${this.definition.type} upsert: ${createResults.length} of ${metadataToCreate.length} created / ${updateResults.length} of ${metadataToUpdate.length} updated` +
                (filteredByPreDeploy > 0 ? ` / ${filteredByPreDeploy} filtered` : '')
        );
        let upsertResults;
        if (successfulResults.length > 0) {
            const metadataResults = successfulResults
                .map((r) => r.value.Results[0].Object)
                .map((r) => {
                    // if only one fields added will return object otherwise array
                    if (Array.isArray(r?.Fields?.Field)) {
                        r.Fields = r.Fields.Field;
                    } else if (r?.Fields?.Field) {
                        r.Fields = [r.Fields.Field];
                    }
                    return r;
                });
            upsertResults = super.parseResponseBody({ Results: metadataResults });
        } else {
            upsertResults = {};
        }
        await this.postDeployTasks(upsertResults, metadataMap, {
            created: createResults.length,
            updated: updateResults.length,
        });
        return upsertResults;
    }

    /**
     * helper for {@link MetadataType.upsert}
     *
     * @param {TYPE.MetadataTypeMap} metadataMap list of metadata
     * @param {string} metadataKey key of item we are looking at
     * @param {boolean} hasError error flag from previous code
     * @param {TYPE.MetadataTypeItemDiff[]} metadataToUpdate list of items to update
     * @param {TYPE.MetadataTypeItem[]} metadataToCreate list of items to create
     * @returns {'create' | 'update' | 'skip'} action to take
     */
    static async createOrUpdate(
        metadataMap,
        metadataKey,
        hasError,
        metadataToUpdate,
        metadataToCreate
    ) {
        const action = await super.createOrUpdate(
            metadataMap,
            metadataKey,
            hasError,
            metadataToUpdate,
            metadataToCreate
        );

        if (action === 'update') {
            // Update dataExtension + Columns if they already exist; Create them if not
            // Modify columns for update call
            DataExtensionField.client = this.client;
            DataExtensionField.properties = this.properties;
            DataExtension.oldFields ||= {};
            DataExtension.oldFields[metadataMap[metadataKey][this.definition.keyField]] =
                await DataExtensionField.prepareDeployColumnsOnUpdate(
                    metadataMap[metadataKey].Fields,
                    metadataKey
                );

            if (
                metadataMap[metadataKey][this.definition.keyField] !== metadataKey &&
                metadataMap[metadataKey].Fields.length
            ) {
                // changeKeyValue / changeKeyField used
                Util.logger.warn(
                    ` - ${this.definition.type} ${metadataKey}: Cannot change fields while updating the key. Skipping field update in favor of key update.`
                );
                metadataMap[metadataKey].Fields.length = 0;
            }

            // convert simple array into object.Array.object format to cope with how the XML body in the SOAP call needs to look like:
            // <Fields>
            //   <Field>
            //     <CustomerKey>SubscriberKey</CustomerKey>
            //      ..
            //   </Field>
            // </Fields>
            metadataMap[metadataKey].Fields = { Field: metadataMap[metadataKey].Fields };
        } else if (action === 'create') {
            this.#cleanupRetentionPolicyFields(metadataMap[metadataKey]);

            // convert simple array into object.Array.object format to cope with how the XML body in the SOAP call needs to look like:
            // <Fields>
            //   <Field>
            //     <CustomerKey>SubscriberKey</CustomerKey>
            //      ..
            //   </Field>
            // </Fields>
            metadataMap[metadataKey].Fields = { Field: metadataMap[metadataKey].Fields };
        }
    }
    /**
     * helper for {@link DataExtension.upsert}
     *
     * @private
     * @param {object} res -
     * @returns {boolean} true: keep, false: discard
     */
    static #filterUpsertResults(res) {
        if (res.status === 'rejected') {
            // promise rejects, whole request failed
            Util.logger.error('- error upserting dataExtension: ' + res.reason);
            return false;
        } else if (res.value == undefined || Object.keys(res.value).length === 0) {
            // in case of returning empty result handle gracefully
            // TODO: consider if SOAP handler for this should really return empty object
            return false;
        } else if (res.value.results) {
            Util.logger.error(
                '- error upserting dataExtension: ' +
                    (res.value.Results[0].Object ? res.value.Results[0].Object.Name : '') +
                    '. ' +
                    res.value.Results[0].StatusMessage
            );
            return false;
        } else if (res.status === 'fulfilled' && res?.value?.faultstring) {
            // can happen that the promise does not reject, but that it resolves an error
            Util.logger.error('- error upserting dataExtension: ' + res.value.faultstring);
            return false;
        } else {
            return true;
        }
    }

    /**
     * Create a single dataExtension. Also creates their columns in 'dataExtension.columns'
     *
     * @param {TYPE.DataExtensionItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static async create(metadata) {
        return super.createSOAP(metadata);
    }

    /**
     * SFMC saves a date in "RetainUntil" under certain circumstances even
     * if that field duplicates whats in the period fields
     * during deployment, that extra value is not accepted by the APIs which is why it needs to be removed
     *
     * @private
     * @param {TYPE.DataExtensionItem} metadata single metadata entry
     * @returns {void}
     */
    static #cleanupRetentionPolicyFields(metadata) {
        if (
            metadata.DataRetentionPeriodLength &&
            metadata.DataRetentionPeriodUnitOfMeasure &&
            metadata.RetainUntil !== ''
        ) {
            metadata.RetainUntil = '';
            Util.logger.warn(
                ` - RetainUntil date was reset automatically because RetentionPeriod info was found in: ${metadata.CustomerKey}`
            );
        }
    }
    /**
     * Updates a single dataExtension. Also updates their columns in 'dataExtension.columns'
     *
     * @param {TYPE.DataExtensionItem} metadata single metadata entry
     * @returns {Promise} Promise
     */
    static async update(metadata) {
        return super.updateSOAP(metadata);
    }
    /**
     * Gets executed after deployment of metadata type
     *
     * @param {TYPE.DataExtensionMap} upsertedMetadata metadata mapped by their keyField
     * @param {TYPE.DataExtensionMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @param {{created: number, updated: number}} createdUpdated counter representing successful creates/updates
     * @returns {void}
     */
    static async postDeployTasks(upsertedMetadata, originalMetadata, createdUpdated) {
        for (const key in upsertedMetadata) {
            const item = upsertedMetadata[key];

            const oldKey = Util.changedKeysMap?.[this.definition.type]?.[key] || key;
            delete Util.changedKeysMap?.[this.definition.type]?.[key];

            const cachedVersion = createdUpdated.updated
                ? cache.getByKey(this.definition.type, oldKey)
                : null;
            if (cachedVersion) {
                // UPDATE
                // restore retention values that are typically not returned by the update call
                item.RowBasedRetention = cachedVersion.RowBasedRetention;
                item.ResetRetentionPeriodOnImport = cachedVersion.ResetRetentionPeriodOnImport;
                item.DeleteAtEndOfRetentionPeriod = cachedVersion.DeleteAtEndOfRetentionPeriod;
                item.RetainUntil = cachedVersion.RetainUntil;

                const existingFields = DataExtension.oldFields[item[this.definition.keyField]];

                if (item.Fields === '') {
                    // if no fields were updated, we need to set Fields to "empty string" for the API to work
                    // reset here to get the correct field list
                    item.Fields = Object.keys(existingFields)
                        .map((el) => existingFields[el])
                        .sort((a, b) => a.Ordinal - b.Ordinal);
                } else if (existingFields) {
                    // get list of updated fields
                    /** @type {TYPE.DataExtensionFieldItem[]} */
                    const updatedFieldsArr = originalMetadata[oldKey].Fields.Field.filter(
                        (field) => field.ObjectID && field.ObjectID !== ''
                    );
                    // convert existing fields obj into array and sort
                    /** @type {TYPE.DataExtensionFieldItem[]} */
                    const finalFieldsArr = Object.keys(existingFields)
                        .map((el) => {
                            /** @type {TYPE.DataExtensionFieldItem} */
                            const existingField = existingFields[el];
                            // check if the current field was updated and then override with it. otherwise use existing value
                            const field =
                                updatedFieldsArr.find(
                                    (field) => field.ObjectID === existingField.ObjectID
                                ) || existingField;
                            // field does not have a ordinal value because we rely on array order
                            field.Ordinal = existingField.Ordinal;
                            // updating FieldType is not supported by API and hence removed
                            field.FieldType = existingField.FieldType;
                            return field;
                        })
                        .sort((a, b) => a.Ordinal - b.Ordinal);

                    // get list of new fields
                    /** @type {TYPE.DataExtensionFieldItem[]} */
                    const newFieldsArr = originalMetadata[oldKey].Fields.Field.filter(
                        (field) => !field.ObjectID
                    );
                    // push new fields to end of list
                    if (newFieldsArr.length) {
                        finalFieldsArr.push(...newFieldsArr);
                    }

                    // sort Fields entry to the end of the object for saving in .json
                    delete item.Fields;
                    item.Fields = finalFieldsArr;
                }
            }
            // UPDATE + CREATE
            for (const field of item.Fields) {
                DataExtensionField.postRetrieveTasks(field, true);
            }
        }
        await this.#fixShared(upsertedMetadata, originalMetadata, createdUpdated);
    }

    /**
     * takes care of updating attribute groups on child BUs after an update to Shared DataExtensions
     * helper for {@link DataExtension.postDeployTasks}
     * fixes an issue where shared data extensions are not visible in data designer on child BU; SF known issue: https://issues.salesforce.com/#q=W-11031095
     *
     * @param {TYPE.DataExtensionMap} upsertedMetadata metadata mapped by their keyField
     * @param {TYPE.DataExtensionMap} originalMetadata metadata to be updated (contains additioanl fields)
     * @param {{created: number, updated: number}} createdUpdated counter representing successful creates/updates
     * @returns {void}
     */
    static async #fixShared(upsertedMetadata, originalMetadata, createdUpdated) {
        if (this.buObject.eid !== this.buObject.mid || createdUpdated.updated === 0) {
            // only if we were executing a deploy on parent bu could we be deploying shared data extensions
            // only if updates were made could the issue in https://issues.salesforce.com/#q=W-11031095 affect data designer
            Util.logger.debug(`EID != MID or nothing updated`);
            return;
        }

        // find all shared data extensions
        const sharedDataExtensionsKeys = this.deployedSharedKeys;
        this.deployedSharedKeys = null;

        if (sharedDataExtensionsKeys.length > 0 && !Util.OPTIONS.fixShared) {
            Util.logger.warn(
                'Shared Data Extensions were updated but --fixShared option is not set. This can result in your changes not being visible in attribute groups on child BUs.'
            );
            Util.logger.info(
                'We recommend to re-run your deployment with the --fixShared option unless you are sure your Shared Data Extension is not used in attribute groups on any child BU.'
            );
        }
        if (sharedDataExtensionsKeys.length > 0 && Util.OPTIONS.fixShared) {
            // select which BUs to run this for
            const selectedBuNames = await this.#fixShared_getBUs();

            // backup settings
            const buObjectBak = this.buObject;
            const clientBak = this.client;

            // get dataExtension ID-Key relationship
            const sharedDataExtensionMap = {};
            for (const key of sharedDataExtensionsKeys) {
                try {
                    const id = cache.searchForField(
                        'dataExtension',
                        key,
                        'CustomerKey',
                        'ObjectID',
                        this.buObject.eid
                    );
                    sharedDataExtensionMap[id] = key;
                } catch {
                    continue;
                }
            }

            // run the fix-data-model logic
            Util.logger.info(
                `Fixing Shared Data Extensions details in data models of child BUs` +
                    Util.getKeysString(sharedDataExtensionsKeys)
            );

            for (const buName of selectedBuNames) {
                await this.#fixShared_onBU(
                    buName,
                    buObjectBak,
                    clientBak,

                    sharedDataExtensionMap
                );
            }
            Util.logger.info(`Finished fixing Shared Data Extensions details in data models`);

            // restore settings
            this.buObject = buObjectBak;
            this.client = clientBak;
        } else {
            // no shared dataExtensions or fixShared option not enabled
            return;
        }
    }

    /**
     * helper for {@link DataExtension.#fixShared}
     *
     * @returns {string[]} list of selected BU names
     */
    static async #fixShared_getBUs() {
        const buListObj = this.properties.credentials[this.buObject.credential].businessUnits;
        const fixBuPreselected = [];
        const availableBuNames = Object.keys(buListObj).filter(
            (buName) => buName !== Util.parentBuName
        );
        if (typeof Util.OPTIONS.fixShared === 'string') {
            if (Util.OPTIONS.fixShared === '*') {
                // pre-select all BUs
                fixBuPreselected.push(...availableBuNames);
            } else {
                // pre-select BUs from comma-separated list
                fixBuPreselected.push(
                    ...Util.OPTIONS.fixShared
                        .split(',')
                        .filter(Boolean)
                        .map((bu) => bu.trim())
                        .filter((bu) => availableBuNames.includes(bu))
                );
            }
        }
        if (Util.skipInteraction && fixBuPreselected.length) {
            // assume programmatic use case or user that wants to skip the wizard. Use pre-selected BUs
            return fixBuPreselected;
        }

        const buList = availableBuNames.map((name) => ({
            name,
            value: name,
            checked: fixBuPreselected.includes(name),
        }));
        const questions = {
            type: 'checkbox',
            name: 'businessUnits',
            message: 'Please select BUs that have access to the updated Shared Data Extensions:',
            pageSize: 10,
            choices: buList,
        };
        let responses = null;

        try {
            responses = await inquirer.prompt(questions);
        } catch (ex) {
            Util.logger.info(ex);
        }
        return responses.businessUnits;
    }

    /**
     * helper for {@link DataExtension.#fixShared}
     *
     * @param {string} childBuName name of child BU to fix
     * @param {TYPE.BuObject} buObjectParent bu object for parent BU
     * @param {object} clientParent SDK for parent BU
     * @param {Object.<string, string>} sharedDataExtensionMap ID-Key relationship of shared data extensions
     * @returns {Promise.<string[]>} updated shared DE keys on BU
     */
    static async #fixShared_onBU(
        childBuName,
        buObjectParent,
        clientParent,
        sharedDataExtensionMap
    ) {
        /** @type {TYPE.BuObject} */
        const buObjectChildBu = {
            eid: this.properties.credentials[buObjectParent.credential].eid,
            mid: this.properties.credentials[buObjectParent.credential].businessUnits[childBuName],
            businessUnit: childBuName,
            credential: this.buObject.credential,
        };
        const clientChildBu = auth.getSDK(buObjectChildBu);

        try {
            // check if shared data Extension is used in an attributeSet on current BU
            AttributeSet.properties = this.properties;
            AttributeSet.buObject = buObjectChildBu;
            AttributeSet.client = clientChildBu;
            const sharedDeIdsUsedOnBU = await AttributeSet.retrieveForSharedDEs(
                Object.keys(sharedDataExtensionMap)
            );
            if (sharedDeIdsUsedOnBU.length) {
                let sharedDataExtensionsKeys = sharedDeIdsUsedOnBU.map(
                    (deId) => sharedDataExtensionMap[deId]
                );
                Util.logger.info(
                    ` - Fixing dataExtensions on BU ${childBuName} ` +
                        Util.getKeysString(sharedDataExtensionsKeys)
                );

                for (const deId of sharedDeIdsUsedOnBU) {
                    // dont use Promise.all to ensure order of execution; otherwise, switched BU contexts in one step will affect the next
                    const fixed = await this.#fixShared_item(
                        deId,
                        sharedDataExtensionMap[deId],
                        buObjectChildBu,
                        clientChildBu,
                        buObjectParent,
                        clientParent
                    );
                    if (!fixed) {
                        // remove from list of shared DEs that were fixed
                        sharedDataExtensionsKeys = sharedDataExtensionsKeys.filter(
                            (key) => key !== sharedDataExtensionMap[deId]
                        );
                    }
                }
                if (sharedDataExtensionsKeys.length) {
                    Util.logger.debug(
                        ` - Fixed ${sharedDataExtensionsKeys.length}/${
                            sharedDeIdsUsedOnBU.length
                        }: ${sharedDataExtensionsKeys.join(', ')}`
                    );
                }
                return sharedDataExtensionsKeys;
            } else {
                Util.logger.info(
                    Util.getGrayMsg(
                        ` - No matching attributeSet found for given Shared Data Extensions keys found on BU ${childBuName}`
                    )
                );
                return [];
            }
        } catch (ex) {
            Util.logger.error(ex.message);
            return [];
        }
    }

    /**
     * method that actually takes care of triggering the update for a particular BU-sharedDe combo
     * helper for {@link DataExtension.#fixShared_onBU}
     *
     * @param {string} deId data extension ObjectID
     * @param {string} deKey dataExtension key
     * @param {TYPE.BuObject} buObjectChildBu BU object for Child BU
     * @param {object} clientChildBu SDK for child BU
     * @param {TYPE.BuObject} buObjectParent BU object for Parent BU
     * @param {object} clientParent SDK for parent BU
     * @returns {Promise.<boolean>} flag that signals if the fix was successful
     */
    static async #fixShared_item(
        deId,
        deKey,
        buObjectChildBu,
        clientChildBu,
        buObjectParent,
        clientParent
    ) {
        try {
            // add field via child BU
            const randomSuffix = await DataExtension.#fixShared_item_addField(
                buObjectChildBu,
                clientChildBu,
                deKey,
                deId
            );

            // get field ID from parent BU (it is not returned on child BU)
            const fieldObjectID = await DataExtension.#fixShared_item_getFieldId(
                randomSuffix,
                buObjectParent,
                clientParent,
                deKey
            );

            // delete field via child BU
            await DataExtension.#fixShared_item_deleteField(
                randomSuffix,
                buObjectChildBu,
                clientChildBu,
                deKey,
                fieldObjectID
            );

            Util.logger.info(
                `   - Fixed dataExtension ${deKey} on BU ${buObjectChildBu.businessUnit}`
            );

            return true;
        } catch (ex) {
            Util.logger.error(
                `- error fixing dataExtension ${deKey} on BU ${buObjectChildBu.businessUnit}: ${ex.message}`
            );
            return false;
        }
    }

    /**
     * add a new field to the shared DE to trigger an update to the data model
     * helper for {@link DataExtension.#fixShared_item}
     *
     * @param {TYPE.BuObject} buObjectChildBu BU object for Child BU
     * @param {object} clientChildBu SDK for child BU
     * @param {string} deKey dataExtension key
     * @param {string} deId dataExtension ObjectID
     * @returns {Promise.<string>} randomSuffix
     */
    static async #fixShared_item_addField(buObjectChildBu, clientChildBu, deKey, deId) {
        this.buObject = buObjectChildBu;
        this.client = clientChildBu;
        const randomSuffix = Util.OPTIONS._runningTest
            ? '_randomNumber_'
            : Math.floor(Math.random() * 9999999999);
        // add a new field to the shared DE to trigger an update to the data model
        const soapType = this.definition.soapType || this.definition.type;
        await this.client.soap.update(
            Util.capitalizeFirstLetter(soapType),
            {
                CustomerKey: deKey,
                ObjectID: deId,
                Fields: {
                    Field: [
                        {
                            Name: 'TriggerUpdate' + randomSuffix,
                            IsRequired: false,
                            IsPrimaryKey: false,
                            FieldType: 'Boolean',
                            ObjectID: null,
                        },
                    ],
                },
            },
            null
        );
        return randomSuffix;
    }

    /**
     * get ID of the field added by {@link DataExtension.#fixShared_item_addField} on the shared DE via parent BU
     * helper for {@link DataExtension.#fixShared_item}
     *
     * @param {string} randomSuffix -
     * @param {TYPE.BuObject} buObjectParent BU object for Parent BU
     * @param {object} clientParent SDK for parent BU
     * @param {string} deKey dataExtension key
     * @returns {Promise.<string>} fieldObjectID
     */
    static async #fixShared_item_getFieldId(randomSuffix, buObjectParent, clientParent, deKey) {
        DataExtensionField.buObject = buObjectParent;
        DataExtensionField.client = clientParent;
        const fieldKey = `[${deKey}].[TriggerUpdate${randomSuffix}]`;
        const fieldResponse = await DataExtensionField.retrieveForCache(
            {
                filter: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: fieldKey,
                },
            },
            ['Name', 'ObjectID']
        );
        const fieldObjectID = fieldResponse.metadata[fieldKey]?.ObjectID;
        return fieldObjectID;
    }

    /**
     * delete the field added by {@link DataExtension.#fixShared_item_addField}
     * helper for {@link DataExtension.#fixShared_item}
     *
     * @param {string} randomSuffix -
     * @param {TYPE.BuObject} buObjectChildBu BU object for Child BU
     * @param {object} clientChildBu SDK for child BU
     * @param {string} deKey dataExtension key
     * @param {string} fieldObjectID field ObjectID
     * @returns {Promise} -
     */
    static async #fixShared_item_deleteField(
        randomSuffix,
        buObjectChildBu,
        clientChildBu,
        deKey,
        fieldObjectID
    ) {
        DataExtensionField.buObject = buObjectChildBu;
        DataExtensionField.client = clientChildBu;
        await DataExtensionField.deleteByKeySOAP(
            deKey + '.TriggerUpdate' + randomSuffix,
            fieldObjectID
        );
    }

    /**
     * Retrieves dataExtension metadata. Afterwards starts retrieval of dataExtensionColumn metadata retrieval
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {void} [_] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<{metadata: TYPE.DataExtensionMap, type: string}>} Promise of item map
     */
    static async retrieve(retrieveDir, additionalFields, _, key) {
        /** @type {TYPE.SoapRequestParams} */
        let requestParams = null;
        /** @type {TYPE.SoapRequestParams} */
        let fieldOptions = null;
        if (key) {
            requestParams = {
                filter: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
            };
            fieldOptions = {
                filter: {
                    leftOperand: 'DataExtension.CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
            };
        }
        let metadata = await this._retrieveAll(additionalFields, requestParams);
        // in case of cache dont get fields
        if (metadata && retrieveDir) {
            // get fields from API
            await this.#attachFields(metadata, fieldOptions, additionalFields);
        }
        if (!retrieveDir && this.buObject.eid !== this.buObject.mid) {
            const metadataParentBu = await this.retrieveSharedForCache(additionalFields);

            // make sure to overwrite parent bu DEs with local ones
            metadata = { ...metadataParentBu, ...metadata };
        }
        if (retrieveDir) {
            const savedMetadata = await super.saveResults(metadata, retrieveDir, null);
            Util.logger.info(
                `Downloaded: ${this.definition.type} (${Object.keys(savedMetadata).length})` +
                    Util.getKeysString(key)
            );
            await this.runDocumentOnRetrieve(key, savedMetadata);
        }
        return { metadata: metadata, type: 'dataExtension' };
    }

    /**
     * get shared dataExtensions from parent BU and merge them into the cache
     * helper for {@link DataExtension.retrieve} and for AttributeSet.retrieveForSharedDEs
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<TYPE.DataExtensionMap>} keyField => metadata map
     */
    static async retrieveSharedForCache(additionalFields = []) {
        // for caching, we want to retrieve shared DEs as well from the instance parent BU
        Util.logger.info(' - Caching dependent Metadata: dataExtension (shared via _ParentBU_)');
        const buObjectBak = this.buObject;
        const clientBak = this.client;
        /** @type {TYPE.BuObject} */
        const buObjectParentBu = {
            eid: this.properties.credentials[this.buObject.credential].eid,
            mid: this.properties.credentials[this.buObject.credential].eid,
            businessUnit: Util.parentBuName,
            credential: this.buObject.credential,
        };
        try {
            this.buObject = buObjectParentBu;
            this.client = auth.getSDK(buObjectParentBu);
        } catch (ex) {
            Util.logger.error(ex.message);
            return;
        }
        const metadataParentBu = await this._retrieveAll(additionalFields);

        // get shared folders to match our shared / synched Data Extensions
        const subTypeArr = this.definition.dependencies
            .filter((item) => item.startsWith('folder-'))
            .map((item) => item.slice(7));
        Util.logger.info(' - Caching dependent Metadata: folder (shared via _ParentBU_)');
        Util.logSubtypes(subTypeArr);
        Folder.client = this.client;
        Folder.buObject = this.buObject;
        Folder.properties = this.properties;
        const result = await Folder.retrieveForCache(null, subTypeArr);
        cache.mergeMetadata('folder', result.metadata, this.buObject.eid);

        // get the types and clean out non-shared ones
        const folderTypesFromParent = require('../MetadataTypeDefinitions').folder
            .folderTypesFromParent;
        for (const metadataEntry in metadataParentBu) {
            try {
                // get the data extension type from the folder
                const folderContentType = cache.searchForField(
                    'folder',
                    metadataParentBu[metadataEntry].CategoryID,
                    'ID',
                    'ContentType',
                    this.buObject.eid
                );
                if (!folderTypesFromParent.includes(folderContentType)) {
                    Util.logger.verbose(
                        `removing ${metadataEntry} because r__folder_ContentType '${folderContentType}' identifies this DE as not being shared`
                    );
                    delete metadataParentBu[metadataEntry];
                }
            } catch (ex) {
                Util.logger.debug(
                    `removing ${metadataEntry} because of error while retrieving r__folder_ContentType: ${ex.message}`
                );
                delete metadataParentBu[metadataEntry];
            }
        }

        // revert client to current default
        this.client = clientBak;
        this.buObject = buObjectBak;
        Folder.client = clientBak;
        Folder.buObject = buObjectBak;

        return metadataParentBu;
    }

    /**
     * helper to retrieve all dataExtension fields and attach them to the dataExtension metadata
     *
     * @private
     * @param {TYPE.DataExtensionMap} metadata already cached dataExtension metadata
     * @param {TYPE.SoapRequestParams} [fieldOptions] optionally filter results
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<void>} -
     */
    static async #attachFields(metadata, fieldOptions, additionalFields) {
        const fieldsObj = await this._retrieveFields(fieldOptions, additionalFields);
        const fieldKeys = Object.keys(fieldsObj);
        // add fields to corresponding DE
        for (const key of fieldKeys) {
            const field = fieldsObj[key];
            if (metadata[field?.DataExtension?.CustomerKey]) {
                metadata[field.DataExtension.CustomerKey].Fields.push(field);
            } else {
                Util.logger.warn(` - Issue retrieving data extension fields. key='${key}'`);
            }
        }

        // sort fields by Ordinal value (API returns field unsorted)
        for (const metadataEntry in metadata) {
            metadata[metadataEntry].Fields.sort(DataExtensionField.sortDeFields);
        }

        // remove attributes that we do not want to retrieve
        // * do this after sorting on the DE's field list
        for (const key of fieldKeys) {
            DataExtensionField.postRetrieveTasks(fieldsObj[key], true);
        }
    }

    /**
     * Retrieves dataExtension metadata. Afterwards starts retrieval of dataExtensionColumn metadata retrieval
     *
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<{metadata: TYPE.DataExtensionMap, type: string}>} Promise of item map
     */
    static async retrieveChangelog(additionalFields) {
        const metadata = await this._retrieveAll(additionalFields);
        return { metadata: metadata, type: 'dataExtension' };
    }
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.DataExtensionItem} metadata a single dataExtension
     * @returns {TYPE.DataExtensionItem} metadata
     */
    static async postRetrieveTasks(metadata) {
        // Error during deploy if SendableSubscriberField.Name = '_SubscriberKey' even though it is retrieved like that
        // Therefore map it to 'Subscriber Key'. Retrieving afterward still results in '_SubscriberKey'
        if (metadata.SendableSubscriberField?.Name === '_SubscriberKey') {
            metadata.SendableSubscriberField.Name = 'Subscriber Key';
        }
        this.setFolderPath(metadata);

        // DataExtensionTemplate
        if (metadata.Template?.CustomerKey) {
            try {
                metadata.r__dataExtensionTemplate_Name = cache.searchForField(
                    'dataExtensionTemplate',
                    metadata.Template.CustomerKey,
                    'CustomerKey',
                    'Name'
                );
                delete metadata.Template;
            } catch (ex) {
                Util.logger.debug(ex.message);
                // Let's allow retrieving such DEs but warn that they cannot be deployed to another BU.
                // Deploying to same BU  still works!
                // A workaround exists but it's likely not beneficial to explain to users:
                // Create a DE based on the not-supported template on the target BU, retrieve it, copy the Template.CustomerKey into the to-be-deployed DE (or use mcdev-templating), done
                Util.logger.warn(
                    ` - Issue with dataExtension '${
                        metadata[this.definition.nameField]
                    }': Could not find specified DataExtension Template. Please note that DataExtensions based on SMSMessageTracking and SMSSubscriptionLog cannot be deployed automatically across BUs at this point.`
                );
            }
        }
        // remove the date fields manually here because we need them in the changelog but not in the saved json
        delete metadata.CreatedDate;
        delete metadata.ModifiedDate;

        return metadata;
    }

    /**
     * Helper to retrieve Data Extension Fields
     *
     * @private
     * @param {TYPE.SoapRequestParams} [options] options (e.g. continueRequest)
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @returns {Promise.<TYPE.DataExtensionFieldMap>} Promise of items
     */
    static async _retrieveFields(options, additionalFields) {
        if (!options) {
            // dont print this during updates or templating which retrieves fields DE-by-DE
            Util.logger.info(' - Caching dependent Metadata: dataExtensionField');
        }
        DataExtensionField.client = this.client;
        DataExtensionField.properties = this.properties;

        const response = await DataExtensionField.retrieveForCache(options, additionalFields);
        return response.metadata;
    }
    /**
     * helps retrieving fields during templating and deploy where we dont want the full list
     *
     * @private
     * @param {TYPE.DataExtensionMap} metadata list of DEs
     * @param {string} customerKey external key of single DE
     * @returns {Promise.<void>} -
     */
    static async _retrieveFieldsForSingleDe(metadata, customerKey) {
        const fieldOptions = {
            filter: {
                leftOperand: 'DataExtension.CustomerKey',
                operator: 'equals',
                rightOperand: customerKey,
            },
        };
        const fieldsObj = await this._retrieveFields(fieldOptions);

        DataExtensionField.client = this.client;
        DataExtensionField.properties = this.properties;
        const fieldArr = DataExtensionField.convertToSortedArray(fieldsObj);

        // remove attributes that we do not want to retrieve
        // * do this after sorting on the DE's field list
        for (const field of fieldArr) {
            DataExtensionField.postRetrieveTasks(field, true);
        }

        metadata[customerKey].Fields = fieldArr;
    }
    /**
     * helper for {@link MetadataType.updateREST} and {@link MetadataType.updateSOAP} that removes old files after the key was changed
     *
     * @private
     * @param {TYPE.MetadataTypeItem} metadataEntry a single metadata Entry
     * @returns {void}
     */
    static async _postChangeKeyTasks(metadataEntry) {
        super._postChangeKeyTasks(metadataEntry, true);
    }

    /**
     * prepares a DataExtension for deployment
     *
     * @param {TYPE.DataExtensionItem} metadata a single data Extension
     * @returns {Promise.<TYPE.DataExtensionItem>} Promise of updated single DE
     */
    static async preDeployTasks(metadata) {
        if (metadata.Name?.startsWith('_')) {
            throw new Error(`Cannot Upsert Strongly Typed Data Extensions`);
        }
        if (
            !Util.OPTIONS._fixSharedOnBu &&
            this.buObject.eid !== this.buObject.mid &&
            metadata.r__folder_Path?.startsWith('Shared Items')
        ) {
            throw new Error(`Cannot Create/Update a Shared Data Extension from the Child BU`);
        }
        if (metadata.r__folder_ContentType === 'shared_dataextension') {
            this.deployedSharedKeys ||= [];
            this.deployedSharedKeys.push(metadata.CustomerKey);
        }
        if (metadata.r__folder_Path?.startsWith('Synchronized Data Extensions')) {
            throw new Error(
                `Cannot Create/Update a Synchronized Data Extension. Please use Contact Builder to maintain these`
            );
        }

        // folder
        super.setFolderId(metadata);

        // DataExtensionTemplate
        if (metadata.r__dataExtensionTemplate_Name) {
            // remove templated fields
            for (const templateField of this.definition.templateFields[
                metadata.r__dataExtensionTemplate_Name
            ]) {
                for (let index = 0; index < metadata.Fields.length; index++) {
                    const element = metadata.Fields[index];
                    if (element.Name === templateField) {
                        metadata.Fields.splice(index, 1);
                        Util.logger.debug(`Removed template field: ${templateField}`);
                        break;
                    }
                }
            }

            // get template's CustomerKey
            try {
                metadata.Template = {
                    CustomerKey: cache.searchForField(
                        'dataExtensionTemplate',
                        metadata.r__dataExtensionTemplate_Name,
                        'Name',
                        'CustomerKey'
                    ),
                };
                delete metadata.r__dataExtensionTemplate_Name;
            } catch (ex) {
                Util.logger.debug(ex.message);
                // It is assumed that non-supported types would not have been converted to r__dataExtensionTemplate_Name upon retrieve.
                // Deploying to same BU therefore still works!
                // A workaround for cross-BU deploy exists but it's likely not beneficial to explain to users:
                // Create a DE based on the not-supported template on the target BU, retrieve it, copy the Template.CustomerKey into the to-be-deployed DE (or use mcdev-templating), done
                throw new Error(
                    `Could not find specified DataExtension Template. Please note that DataExtensions based on SMSMessageTracking and SMSSubscriptionLog cannot be deployed automatically across BUs at this point.`
                );
            }
        }

        // contenttype
        delete metadata.r__folder_ContentType;

        // Error if SendableSubscriberField.Name = '_SubscriberKey' even though it is retrieved like that
        // Therefore map it to 'Subscriber Key'. Retrieving afterward still results in '_SubscriberKey'
        // TODO remove from preDeploy with release of version 4, keep until then to help with migration of old metadata
        if (
            metadata.SendableSubscriberField &&
            metadata.SendableSubscriberField.Name === '_SubscriberKey'
        ) {
            metadata.SendableSubscriberField.Name = 'Subscriber Key';
        }

        return metadata;
    }

    /**
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     *
     * @private
     * @param {TYPE.DataExtensionItem} json single dataextension
     * @param {object[][]} tabled prepped array for output in tabular format
     * @returns {string} file content
     */
    static _generateDocHtml(json, tabled) {
        let output =
            '<html> <head> <style> html, table { font-family: arial, sans-serif; border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; } tbody>tr:hover { background-color: #EBECF0; } </style> </head> <body></body>';

        output += `<h2>${json.CustomerKey}</h2>`;
        if (json.CustomerKey !== json.Name) {
            output += `<p><b>Error - Name not equal to External Key:</b> ${json.Name}</p>`;
        }

        output += `<p><b>Description:</b> ${json.Description || 'n/a'}</p>`;
        output += `<p><b>Folder:</b> ${
            json.r__folder_Path ||
            '<i>Hidden! Could not find folder with ID ' + json.CategoryID + '</i>'
        }</p>`;
        output += `<p><b>Fields in table:</b> ${tabled.length - 1}</p>`;
        output += '<p><b>Sendable:</b> ';
        output +=
            json.IsSendable === true
                ? 'Yes (<i>' +
                  json.SendableDataExtensionField.Name +
                  '</i> to <i>' +
                  json.SendableSubscriberField.Name +
                  '</i>)</p>\n\n'
                : `No</p>\n\n`;
        output += `<p><b>Testable:</b> ${json.IsTestable === true ? 'Yes' : 'No'}</p>\n\n`;
        if (json.r__dataExtensionTemplate_Name) {
            output += `<p><b>Template:</b> ${json.r__dataExtensionTemplate_Name}</p>`;
        }

        output += '<table><thead><tr>';
        for (const element of tabled[0]) {
            output += '<th>' + element + '</th>';
        }
        output += '</tr><thead><tbody>';
        for (let i = 1; i < tabled.length; i++) {
            output += '<tr>';
            for (const field of tabled[i]) {
                output += `<td>${field}</td>`;
            }
            output += '</tr>';
        }
        output += '</tbody></table>';
        return output;
    }

    /**
     * Experimental: Only working for DataExtensions:
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     *
     * @private
     * @param {TYPE.DataExtensionItem} json dataextension
     * @param {object[][]} tabled prepped array for output in tabular format
     * @returns {string} file content
     */
    static _generateDocMd(json, tabled) {
        let output = `## ${json.CustomerKey}\n\n`;
        if (json.CustomerKey !== json.Name) {
            output += `**Name** (not equal to External Key)**:** ${json.Name}\n\n`;
        }

        output +=
            `**Description:** ${json.Description || 'n/a'}\n\n` +
            `**Folder:** ${
                json.r__folder_Path ||
                '_Hidden! Could not find folder with ID ' + json.CategoryID + '_'
            }/\n\n` +
            `**Fields in table:** ${tabled.length - 1}\n\n`;
        output += '**Sendable:** ';
        output +=
            json.IsSendable === true
                ? 'Yes (`' +
                  json.SendableDataExtensionField.Name +
                  '` to `' +
                  json.SendableSubscriberField.Name +
                  '`)\n\n'
                : `No\n\n`;
        output += `**Testable:** ${json.IsTestable === true ? 'Yes' : 'No'}\n\n`;
        if (json.r__dataExtensionTemplate_Name) {
            output += `**Template:** ${json.r__dataExtensionTemplate_Name}\n\n`;
        }

        let tableSeparator = '';
        for (const column of tabled[0]) {
            output += `| ${column} `;
            tableSeparator += '| --- ';
        }
        output += `|\n${tableSeparator}|\n`;
        for (let i = 1; i < tabled.length; i++) {
            for (const field of tabled[i]) {
                output += `| ${field} `;
            }
            output += '|\n';
        }
        return output;
    }

    /**
     * Saves json content to a html table in the local file system. Will create the parent directory if it does not exist.
     * The json's first level of keys must represent the rows and the secend level the columns
     *
     * @private
     * @param {string} directory directory the file will be written to
     * @param {string} filename name of the file without '.json' ending
     * @param {TYPE.DataExtensionItem} json dataextension.columns
     * @param {'html'|'md'} mode html or md
     * @param {string[]} [fieldsToKeep] list of keys(columns) to show. This will also specify
     * @returns {Promise.<boolean>} Promise of success of saving the file
     */
    static async _writeDoc(directory, filename, json, mode, fieldsToKeep) {
        let fieldsJson = Object.values(json.Fields);
        if (fieldsToKeep) {
            const newJson = [];
            for (const element of fieldsJson) {
                const newJsonElement = {};
                for (const field of fieldsToKeep) {
                    newJsonElement[field] = element[field];
                }
                newJson.push(newJsonElement);
            }
            fieldsJson = newJson;
        }
        const tabled = jsonToTable(fieldsJson);
        let output;
        if (mode === 'html') {
            output = DataExtension._generateDocHtml(json, tabled);
        } else if (mode === 'md') {
            output = DataExtension._generateDocMd(json, tabled);
        }
        try {
            // write to disk
            await File.writeToFile(directory, filename + '.dataExtension-doc', mode, output);
        } catch (ex) {
            Util.logger.error(`DataExtension.writeDeToX(${mode}):: error | ` + ex.message);
        }
    }
    /**
     * Parses metadata into a readable Markdown/HTML format then saves it
     *
     * @param {TYPE.DataExtensionMap} [metadataMap] a list of dataExtension definitions
     * @returns {Promise.<void>} -
     */
    static async document(metadataMap) {
        try {
            if (!metadataMap) {
                metadataMap = this.readBUMetadataForType(
                    File.normalizePath([
                        this.properties.directories.retrieve,
                        this.buObject.credential,
                        this.buObject.businessUnit,
                    ]),
                    true
                ).dataExtension;
            }
        } catch (ex) {
            Util.logger.error(ex.message);
            return;
        }
        const docPath = File.normalizePath([
            this.properties.directories.retrieve,
            this.buObject.credential,
            this.buObject.businessUnit,
            this.definition.type,
        ]);
        if (!metadataMap || !Object.keys(metadataMap).length) {
            // as part of retrieve & manual execution we could face an empty folder
            return;
        }
        const columnsToIterateThrough = ['IsNullable', 'IsPrimaryKey'];
        const columnsToPrint = [
            'Name',
            'FieldType',
            'MaxLength',
            'IsPrimaryKey',
            'IsNullable',
            'DefaultValue',
        ];
        return Promise.all(
            Object.keys(metadataMap).map((key) => {
                if (metadataMap[key]?.Fields?.length) {
                    for (const field of metadataMap[key].Fields) {
                        field.IsNullable = !Util.isTrue(field.IsRequired);
                        for (const prop of columnsToIterateThrough) {
                            if (Util.isTrue(field[prop])) {
                                field[prop] = '+';
                            } else if (Util.isFalse(field[prop])) {
                                field[prop] = '-';
                            }
                        }
                    }

                    if (['html', 'both'].includes(this.properties.options.documentType)) {
                        return this._writeDoc(
                            docPath + '/',
                            key,
                            metadataMap[key],
                            'html',
                            columnsToPrint
                        );
                    }
                    if (['md', 'both'].includes(this.properties.options.documentType)) {
                        return this._writeDoc(
                            docPath + '/',
                            key,
                            metadataMap[key],
                            'md',
                            columnsToPrint
                        );
                    }
                }
            })
        );
    }

    /**
     * Delete a metadata item from the specified business unit
     *
     * @param {string} customerKey Identifier of data extension
     * @returns {Promise.<boolean>} deletion success status
     */
    static deleteByKey(customerKey) {
        return super.deleteByKeySOAP(customerKey);
    }

    /**
     * clean up after deleting a metadata item
     *
     * @param {string} customerKey Identifier of metadata item
     * @returns {Promise.<void>} - promise
     */
    static async postDeleteTasks(customerKey) {
        // delete local copy: retrieve/cred/bu/dataExtension/...-meta.json
        // delete local copy: doc/dataExtension/cred/bu/...md
        await super.postDeleteTasks(customerKey, [`${this.definition.type}-doc.md`]);
    }

    /**
     * Retrieves folder metadata into local filesystem. Also creates a uniquePath attribute for each folder.
     *
     * @returns {Promise.<{metadata: TYPE.DataExtensionMap, type: string}>} Promise
     */
    static async retrieveForCache() {
        return this.retrieve(null, ['ObjectID', 'CustomerKey', 'Name'], this.buObject, null, null);
    }
    /**
     * Retrieves dataExtension metadata in template format.
     *
     * @param {string} templateDir Directory where retrieved metadata directory will be saved
     * @param {string} name name of the metadata item
     * @param {TYPE.TemplateMap} templateVariables variables to be replaced in the metadata
     * @returns {Promise.<{metadata: TYPE.DataExtensionMap, type: string}>} Promise of items
     */
    static async retrieveAsTemplate(templateDir, name, templateVariables) {
        const options = {
            filter: {
                leftOperand: 'Name',
                operator: 'equals',
                rightOperand: name,
            },
        };

        const metadata = await this._retrieveAll(null, options);

        if (!Object.keys(metadata).length) {
            Util.logger.error(`${this.definition.type} '${name}' not found on server.`);
            Util.logger.info('Downloaded: dataExtension (0)');
            return { metadata: {}, type: 'dataExtension' };
        }
        const customerKey = Object.keys(metadata)[0];
        await this._retrieveFieldsForSingleDe(metadata, customerKey);

        for (const key in metadata) {
            try {
                // API returns field unsorted
                metadata[key].Fields.sort((a, b) => a.Ordinal - b.Ordinal);

                const originalKey = key;
                const metadataCleaned = JSON.parse(
                    JSON.stringify(await this.postRetrieveTasks(metadata[key]))
                );

                this.keepTemplateFields(metadataCleaned);
                const metadataTemplated = JSON.parse(
                    Util.replaceByObject(JSON.stringify(metadataCleaned), templateVariables)
                );
                await File.writeJSONToFile(
                    [templateDir, this.definition.type].join('/'),
                    originalKey + '.' + this.definition.type + '-meta',
                    metadataTemplated
                );
            } catch (ex) {
                Util.metadataLogger('error', this.definition.type, 'retrieve', ex, key);
            }
        }
        Util.logger.info(`- templated ${this.definition.type}: ${customerKey}`);

        return { metadata: metadata[customerKey], type: 'dataExtension' };
    }
    /**
     * dataExtension logic that retrieves the folder path from cache and updates the given metadata with it after retrieve
     * it also sets the content type which is basically the subtype
     *
     * @param {TYPE.MetadataTypeItem} metadata a single script activity definition
     */
    static setFolderPath(metadata) {
        let error = false;
        let verbose = false;
        // data extension type (from folder)
        try {
            metadata.r__folder_ContentType = cache.searchForField(
                'folder',
                metadata[this.definition.folderIdField],
                'ID',
                'ContentType'
            );
        } catch (ex) {
            if (/(_Salesforce)(_\d\d?\d?)?$/.test(metadata.Name)) {
                verbose = true;
                metadata.r__folder_ContentType = 'synchronizeddataextension';
            } else {
                error = true;
                Util.logger.warn(
                    ` - ${this.definition.type} '${metadata[this.definition.nameField]}' (${
                        metadata[this.definition.keyField]
                    }): Could not find folder (${ex.message})`
                );
            }
        }
        // folder
        try {
            metadata.r__folder_Path = cache.searchForField(
                'folder',
                metadata[this.definition.folderIdField],
                'ID',
                'Path'
            );
            delete metadata[this.definition.folderIdField];
        } catch (ex) {
            if (/(_Salesforce)(_\d\d?\d?)?$/.test(metadata.Name)) {
                metadata.r__folder_Path = 'Synchronized Data Extensions';
                delete metadata[this.definition.folderIdField];

                if (!verbose) {
                    Util.logger.verbose(
                        `Synchronized Data Extension of other BU found: '${metadata.Name}'. Setting folder to 'Synchronized Data Extensions'`
                    );
                }
            } else if (!error) {
                Util.logger.warn(
                    ` - ${this.definition.type} '${metadata[this.definition.nameField]}' (${
                        metadata[this.definition.keyField]
                    }): ${ex.message}`
                );
            }
        }
    }

    /**
     * Retrieves dataExtension metadata and cleans it
     *
     * @private
     * @param {string[]} [additionalFields] Returns specified fields even if their retrieve definition is not set to true
     * @param {TYPE.SoapRequestParams} [options] e.g. filter
     * @returns {Promise.<TYPE.DataExtensionMap>} keyField => metadata map
     */
    static async _retrieveAll(additionalFields, options) {
        const { metadata } = await super.retrieveSOAP(null, options, null, additionalFields);
        for (const key in metadata) {
            // some system data extensions do not have CategoryID which throws errors in other places. These do not need to be parsed
            if (metadata[key].CategoryID) {
                metadata[key].Fields = [];
            } else {
                delete metadata[key];
            }
        }
        return metadata;
    }
    /**
     * should return only the json for all but asset, query and script that are saved as multiple files
     * additionally, the documentation for dataExtension and automation should be returned
     *
     * @param {string[]} keyArr customerkey of the metadata
     * @returns {string[]} list of all files that need to be committed in a flat array ['path/file1.ext', 'path/file2.ext']
     */
    static getFilesToCommit(keyArr) {
        if (this.properties.metaDataTypes.documentOnRetrieve.includes(this.definition.type)) {
            // document dataExtension is active. assume we want to commit the MD file as well
            const path = File.normalizePath([
                this.properties.directories.retrieve,
                this.buObject.credential,
                this.buObject.businessUnit,
                this.definition.type,
            ]);

            const fileList = keyArr.flatMap((key) => [
                File.normalizePath([path, `${key}.${this.definition.type}-meta.json`]),
                File.normalizePath([path, `${key}.${this.definition.type}-doc.md`]),
            ]);
            return fileList;
        } else {
            // document dataExtension is not active upon retrieve, run default method instead
            return super.getFilesToCommit(keyArr);
        }
    }
}

// Assign definition to static attributes
DataExtension.definition = require('../MetadataTypeDefinitions').dataExtension;

module.exports = DataExtension;
