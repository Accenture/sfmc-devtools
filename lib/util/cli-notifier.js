'use strict';

import { Util } from './util.js';

let notificationStarted = false;

/**
 * Start the CLI update notification check once without delaying command execution.
 *
 * @returns {Promise.<void>} resolves after notification setup finishes or is safely skipped
 */
export async function notifyAboutUpdates() {
    if (notificationStarted) {
        return;
    }
    notificationStarted = true;

    try {
        const { default: updateNotifier } = await import('update-notifier');
        updateNotifier({
            pkg: Util.packageJsonMcdev,
            updateCheckInterval: 1000 * 3600 * 24,
        }).notify();
    } catch (ex) {
        Util.logger.debug(`Update notification check failed: ${ex.message}`);
    }
}
