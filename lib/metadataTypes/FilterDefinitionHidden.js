'use strict';

// const TYPE = require('../../types/mcdev.d');
import FilterDefinition from './FilterDefinition.js';

/**
 * FilterDefinitionHidden MetadataType
 *
 * @augments FilterDefinition
 */
class FilterDefinitionHidden extends FilterDefinition {
    static hidden = true;
}
// Assign definition to static attributes
import MetadataTypeDefinitions from '../MetadataTypeDefinitions.js';
FilterDefinitionHidden.definition = MetadataTypeDefinitions.filterDefinitionHidden;

export default FilterDefinitionHidden;
