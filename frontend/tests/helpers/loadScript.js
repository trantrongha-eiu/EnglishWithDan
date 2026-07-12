/**
 * tests/helpers/loadScript.js
 *
 * The files under frontend/js/shared/*.js are plain IIFEs loaded via
 * <script src="..."> tags in the real app — no module.exports, no
 * bundler. To exercise them under Jest without modifying the source
 * files, we read the file's source text and run it with an *indirect*
 * eval (`window.eval(code)` instead of a bare `eval(code)`).
 *
 * Why indirect eval specifically: a bare `eval(code)` call runs in the
 * *local* scope of whatever function called it, which works for reading
 * `window.foo` assignments but is fragile. An indirect eval (any eval
 * reference that isn't the literal identifier `eval` in call position,
 * e.g. `window.eval(...)`) is spec-guaranteed to run in *global* scope,
 * exactly like a real <script> tag. In Jest's jsdom test environment,
 * `window` is the same jsdom Window instance used as the environment's
 * global object, so `window.eval` executes the IIFE against that global,
 * and any `window.X = ...` assignment inside the script lands on the
 * same `window` object this test file sees.
 *
 * Do NOT convert the source files to CommonJS / add module.exports —
 * that would be a source-file change, out of scope for this test suite.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SHARED_DIR = path.join(__dirname, '..', '..', 'js', 'shared');

/**
 * Loads one or more shared/*.js files (by bare filename, e.g. 'utils.js')
 * into the current test's jsdom `window`, in the order given (matters for
 * files like auth-service.js that expect safe-redirect.js loaded first).
 *
 * @param {...string} filenames
 */
function loadScript(...filenames) {
  for (const filename of filenames) {
    const filePath = path.join(SHARED_DIR, filename);
    const code = fs.readFileSync(filePath, 'utf8');
    // Indirect eval — see file header for why this specific form matters.
    // eslint-disable-next-line no-eval
    window.eval(code);
  }
}

module.exports = { loadScript };
