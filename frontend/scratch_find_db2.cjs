const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
for (let i = 0; i < content.length; i++) {
    if (content[i].includes("activeTab === 'database'") && i > 800) {
        console.log('Database view is at line ' + i);
        console.log(content.slice(i, i + 5).join('\n'));
        break;
    }
}
