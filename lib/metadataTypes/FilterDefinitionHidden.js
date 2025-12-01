'use strict';

// const TYPE = require('../../types/mcdev.d');
import FilterDefinition from './FilterDefinition.js';

/**
 * FilterDefinitionHidden MetadataType
 *
 * @augments FilterDefinition
 */
class FilterDefinitionHidden extends FilterDefinition {
    /**
     * helper for {@link FilterDefinition.retrieve}
     *
     * @returns {Promise.<number[]>} Array of folder IDs
     */
    static async getFilterFolderIds() {
        return super._getFilterFolderIds(true);
    }
}
// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
FilterDefinitionHidden.definition = MetadataTypeDefinitions.filterDefinitionHidden;

export default FilterDefinitionHidden;
