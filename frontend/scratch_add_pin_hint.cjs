const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');
content = content.replace(
  'OFFICER ACCESS PIN</span>',
  'OFFICER ACCESS PIN</span>\n                    <div className="bg-blue-900/40 border border-blue-500/30 px-3 py-1.5 rounded mb-4 text-center"><span className="text-[10px] text-blue-300 font-mono">PROTOTYPE ACCESS CODE: </span><span className="text-[12px] font-bold text-white tracking-widest">1234</span></div>'
);
fs.writeFileSync('src/components/Dashboard.jsx', content, 'utf8');
console.log('Added PIN hint to UI');
