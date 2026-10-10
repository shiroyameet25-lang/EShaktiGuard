const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes("border-red-300 text-red-500 shadow-sm'}`}"));
lines.splice(idx + 1, 0, "                        >");
fs.writeFileSync('src/components/Dashboard.jsx', lines.join('\n'), 'utf8');
console.log('Restored >');
