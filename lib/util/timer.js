'use strict';
const Util = require('./util');
/**
 *
 */
const Timer = {
    /**
     * calculates the runtime for a function
     *
     * @returns {number} - actual time in ms
     */
    startTimer() {
        return performance.now();
    },

    /**
     * stops the timer and print the ms needed for the command
     *
     * @param {number} initTime ms from starttimer
     * @param {string} command command that is being currently timed
     */
    stopTimer(initTime, command) {
        const totalTime = performance.now() - initTime;
        Util.logger.info(`:::  The ${command} command runtime was ${totalTime.toFixed(2)} ms`);
    }
};
module.exports = Timer;
