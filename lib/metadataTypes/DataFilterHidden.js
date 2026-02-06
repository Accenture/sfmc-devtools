'use strict';

// const TYPE = require('../../types/mcdev.d');
import DataFilter from './DataFilter.js';

/**
 * DataFilterHidden (FilterDefinitionHidden) MetadataType
 *
 * @augments DataFilter
 */
class DataFilterHidden extends DataFilter {
    static hidden = true;
}
// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
DataFilterHidden.definition = MetadataTypeDefinitions.dataFilterHidden;

export default DataFilterHidden;
