'use strict';

// Every plain script the pages load must at least parse: one bad regex in a
// file of js/bundles/app-shell.js takes the nav, auth and every page with it.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const JS = path.join(__dirname, '..', 'js');
function scripts(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return scripts(p);
    return e.name.endsWith('.js') ? [p] : [];
  });
}

describe('frontend scripts parse', () => {
  it.each(scripts(JS).map((p) => [path.relative(JS, p).replace(/\\/g, '/'), p]))('%s', (_name, file) => {
    const code = fs.readFileSync(file, 'utf8');
    expect(() => new vm.Script(code, { filename: file })).not.toThrow();
  });
});
