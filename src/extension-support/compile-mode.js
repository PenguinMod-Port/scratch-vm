/**
 * Block compiler options
 * @enum {string}
 */
const CompileMode = {
    /**
     * Default extension block execution, executed in compatability layer
     */
    COMPAT: 'compat',

    /**
     * Executes generator function with arguments
     */
    GENERATOR: 'generator',

    /**
     * Raw compiler access
     */
    RAW: 'raw'
};

module.exports = CompileMode;
