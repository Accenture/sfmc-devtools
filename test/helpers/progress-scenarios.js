const UNICODE_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const ASCII_FRAMES = ['-', '\\', '|', '/'];

/** Canonical platform used by the committed dependency-provenance fixture. */
export const PROGRESS_FIXTURE_PLATFORM = 'win32';

/**
 * Returns the dependency's platform-correct default spinner configuration.
 *
 * @param {'win32'|'unicode'} platform normalized fixture platform
 * @returns {{frames: string[], interval: number}} explicit spinner configuration
 */
export function getScenarioSpinner(platform) {
    return {
        frames: [...(platform === 'win32' ? ASCII_FRAMES : UNICODE_FRAMES)],
        interval: 80,
    };
}

/**
 * Defines the spinner scenarios shared by the exact dependency verifier and replacement tests.
 *
 * @param {'win32'|'unicode'} [platform] normalized fixture platform
 * @returns {Record<string, object>} scenario options keyed by fixture name
 */
export function getSpinnerScenarios(platform = PROGRESS_FIXTURE_PLATFORM) {
    const scenario = (options = {}) => ({
        ...options,
        spinner: getScenarioSpinner(platform),
    });
    return {
        spinnerDefault: scenario(),
        spinnerCyan: scenario({ color: 'cyan' }),
        spinnerAscii: { spinner: getScenarioSpinner('win32') },
        spinnerPartial: scenario({ partial: true }),
        spinnerSuccess: scenario({ finish: 'success' }),
        spinnerError: scenario({ finish: 'error' }),
        nonTtySpinner: scenario({ tty: false }),
    };
}
