const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// 1. Identity Overview
content = content.replace(
  /className=\{\`bg-\[\#F3F5F7\]  border border-\[\#B7CAD8\] rounded-xl p-6 shadow-sm flex-1 flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all/g,
  'className={`surface-tech tech-panel p-6 flex-1 flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all'
);

// 2. Identity Subject Status
content = content.replace(
  /font-bold text-\[\#60798C\] mb-1 border-b border-\[\#B7CAD8\] pb-2 flex items-center\">\n\s*<span className=\"w-2 h-2 bg-slate-600/g,
  'font-black text-cyan-400 mb-1 border-b border-[#213F66] pb-2 flex items-center\">\n                        <span className=\"w-2 h-2 bg-cyan-500'
);

// 3. Criminal Intelligence Assessment
content = content.replace(
  /ref=\{criminalRef\} className=\{\`bg-\[\#F3F5F7\]  border border-\[\#B7CAD8\] rounded-xl p-6 flex flex-col shadow-sm/g,
  'ref={criminalRef} className={`surface-tech tech-panel p-6 flex flex-col'
);

// 4. Criminal Intelligence Assessment Header
content = content.replace(
  /border-b border-\[\#B7CAD8\] pb-5 mb-6 transition-all duration-700 ease-out \$\{criminalInView \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'\}\`} style=\{\{ transitionDelay: '100ms' \}\}>\n\s*<h2 className=\"uppercase tracking-widest text-lg font-black text-\[\#183047\]/g,
  'border-b border-[#213F66] pb-5 mb-6 transition-all duration-700 ease-out ${criminalInView ? \'opacity-100 translate-y-0\' : \'opacity-0 translate-y-2\'}`} style={{ transitionDelay: \'100ms\' }}>\n                        <h2 className=\"uppercase tracking-widest text-lg font-black text-cyan-400'
);

fs.writeFileSync('src/components/Dashboard.jsx', content, 'utf8');
console.log('Replacements executed');
