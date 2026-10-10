const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("doc.scanStatus === 'processing' && ("));
if (start > -1) {
    console.log(lines.slice(start - 5, start + 5).join('\n'));
}
