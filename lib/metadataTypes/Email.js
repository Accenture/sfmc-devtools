'use strict';

import TYPE from '../../types/mcdev.d.js';
import MetadataType from './MetadataType.js';
import { Util } from '../util/util.js';

/**
 * Email MetadataType
 *
 * @augments MetadataType
 */
class Email extends MetadataType {
    /**
     * Retrieves SOAP based metadata of metadata type into local filesystem. executes callback with retrieved metadata
     *
     * @param {string} retrieveDir Directory where retrieved metadata directory will be saved
     * @param {void} [_] unused parameter
     * @param {void} [__] unused parameter
     * @param {string} [key] customer key of single item to retrieve
     * @returns {Promise.<TYPE.MetadataTypeMapObj>} Promise of metadata
     */
    static retrieve(retrieveDir, _, __, key) {
        /** @type {TYPE.SoapRequestParams} */
        let requestParams = null;
        if (key) {
            requestParams = {
                filter: {
                    leftOperand: 'CustomerKey',
                    operator: 'equals',
                    rightOperand: key,
                },
            };
        }
        // !dont activate `await File.initPrettier('html');` as we only want to retrieve for migration and formatting might mess with the outcome
        return super.retrieveSOAP(retrieveDir, requestParams, key);
    }
    /**
     * Helper for writing Metadata to disk, used for Retrieve and deploy
     *
     * @param {TYPE.MetadataTypeMap} results metadata results from deploy
     * @param {string} retrieveDir directory where metadata should be stored after deploy/retrieve
     * @param {string} [overrideType] for use when there is a subtype (such as folder-queries)
     * @param {TYPE.TemplateMap} [templateVariables] variables to be replaced in the metadata
     * @returns {Promise.<TYPE.MetadataTypeMap>} Promise of saved metadata
     */
    static async saveResults(results, retrieveDir, overrideType, templateVariables) {
        if (Object.keys(results).length) {
            // only execute the following if records were found
            Util.logger.warn(
                ' - Classic E-Mails are deprecated and will be discontinued by SFMC in the near future. Ensure that you migrate any existing E-Mails to Content Builder as soon as possible.'
            );
        }
        return super.saveResults(results, retrieveDir, overrideType, templateVariables);
    }
    /**
     * manages post retrieve steps
     *
     * @param {TYPE.MetadataTypeItem} metadata a single query
     * @returns {TYPE.MetadataTypeItem} Array with one metadata object and one query string
     */
    static postRetrieveTasks(metadata) {
        // folder
        super.setFolderPath(metadata);

        // extract code
        const codeArr = [
            {
                subFolder: null,
                fileName: metadata.CustomerKey,
                fileExt: 'html',
                content: metadata.HTMLBody,
            },
        ];
        delete metadata.HTMLBody;

        return { json: metadata, codeArr: codeArr, subFolder: null };
    }
}

// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
Email.definition = MetadataTypeDefinitions.email;

export default Email;
