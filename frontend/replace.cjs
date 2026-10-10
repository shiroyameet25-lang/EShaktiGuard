const fs = require('fs');
const lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const newContent = fs.readFileSync('tab2_new.jsx', 'utf8').replace(/\r\n/g, '\n').split('\n');

let start = -1;
let end = -1;

for(let i=0; i<lines.length; i++) {
  if (lines[i].indexOf("activeTab === 'profile' && (") !== -1 && i > 300 && start === -1) { 
      start = i; 
  }
  if (lines[i].indexOf(") : (") !== -1 && start !== -1 && i > start + 200) { 
      end = i; 
      break; 
  }
}

if(start !== -1 && end !== -1) {
  console.log('Replacing from', start, 'to', end);
  lines.splice(start, end - start + 1, ...newContent);
  fs.writeFileSync('src/components/Dashboard.jsx', lines.join('\n'));
  console.log('Replacement successful.');
} else {
  console.log('Could not find start or end bounds. Start:', start, 'End:', end);
}
