const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('animate-') && l.includes('absolute')) {
        console.log(i + ': ' + l.trim());
    }
});
