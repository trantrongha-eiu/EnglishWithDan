// Print an anchored title regex for the passages of a batch file (for pw_*.js filters).
// Usage: node titles_re.js ../data/miniIeltsReading/batch12.json
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
console.log(`^(${require(require('path').resolve(process.argv[2])).map(x => esc(x.doc.title.trim())).join('|')})$`);
