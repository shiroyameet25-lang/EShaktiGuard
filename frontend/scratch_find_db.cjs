const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes("activeTab === 'database'"));
console.log('Database view is at line ' + idx);
if (idx > -1) {
    console.log(lines.slice(idx - 2, idx + 10).join('\n'));
}
