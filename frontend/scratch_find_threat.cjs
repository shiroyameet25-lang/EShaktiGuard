const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('THREAT NETWORK') && !l.includes('THREAT NETWORK ANALYSIS') && !l.includes('const '));
console.log('Threat Network UI at: ' + idx);
if (idx > -1) {
    console.log(lines.slice(idx - 5, idx + 45).join('\n'));
}
