const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes("activeTab === 'database' && ("));
console.log('Database at: ' + idx);
if (idx > -1) {
    console.log(lines.slice(idx, idx + 40).join('\n'));
}
