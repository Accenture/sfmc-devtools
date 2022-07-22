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
        const startTime = performance.now();
        return startTime;
    },

    /**
     * stops the timer and print the ms needed for the command
     *
     * @param {string} command command that is being currently timed
     */
    stopTimer(command) {
        const stopTime = performance.now();
        const totalTime = this.startTimer() - stopTime;
        Util.logger.info(`:::  The ${command} runtime was ${totalTime.toFixed(2)} ms`);
    }
};
module.exports = Timer;
