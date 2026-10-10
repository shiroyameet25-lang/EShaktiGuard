const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes("step.status === 'warn'"));
lines.splice(idx + 1, 0, "                            'border-red-300 text-red-500 shadow-sm'}`}");
fs.writeFileSync('src/components/Dashboard.jsx', lines.join('\n'), 'utf8');
console.log('Restored line');
