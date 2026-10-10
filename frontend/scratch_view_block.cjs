const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const idx = content.findIndex(l => l.includes("step.icon === 'network'"));
console.log(content.slice(idx - 2, idx + 5).join('\n'));
