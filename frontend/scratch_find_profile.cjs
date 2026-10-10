const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const backup = lines.findIndex(l => l.includes("activeTab === 'profile'"));
if (backup > -1) {
    console.log(lines.slice(backup, backup + 40).join('\n'));
}
