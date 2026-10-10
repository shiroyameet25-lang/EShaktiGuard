const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const getLine = (str) => lines.findIndex(l => l.includes(str));
console.log('Tab 1 - Scanner:', getLine("activeTab === 'scanner' && ("));
console.log('Tab 2 - Profile:', getLine("activeTab === 'profile' && ("));
console.log('Tab 3 - Database:', getLine("activeTab === 'database' && ("));
