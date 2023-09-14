'use strict';

// const TYPE = require('../../types/mcdev.d');
const FilterDefinition = require('./FilterDefinition');

/**
 * FilterDefinitionHidden MetadataType
 *
 * @augments FilterDefinitionHidden
 */
class FilterDefinitionHidden extends FilterDefinition {
    /**
     * helper for {@link FilterDefinition.retrieve}
     *
     * @returns {number[]} Array of folder IDs
     */
    static async getFilterFolderIds() {
        return super.getFilterFolderIds(true);
    }
}
// Assign definition to static attributes
FilterDefinitionHidden.definition = require('../MetadataTypeDefinitions').filterDefinitionHidden;

module.exports = FilterDefinitionHidden;
