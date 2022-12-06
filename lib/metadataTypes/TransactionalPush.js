'use strict';

const TransactionalMessage = require('./TransactionalMessage');

/**
 * TransactionalPush TransactionalMessage
 *
 * @augments TransactionalMessage
 */
class TransactionalPush extends TransactionalMessage {
    static subType = 'push';
}

// Assign definition to static attributes
TransactionalPush.definition = require('../MetadataTypeDefinitions').transactionalPush;

module.exports = TransactionalPush;
