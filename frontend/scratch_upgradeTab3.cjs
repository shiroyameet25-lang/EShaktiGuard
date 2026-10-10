const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// Statistics boxes
content = content.replace(
  /className=\"bg-\[\#F3F5F7\] border border-\[\#B7CAD8\] p-4 rounded shadow-sm flex flex-col justify-center items-center relative overflow-hidden\"/g,
  'className="surface-tech tech-panel p-4 flex flex-col justify-center items-center relative overflow-hidden"'
);

// Search Filters container
content = content.replace(
  /className=\"bg-\[\#E4E9EF\] border border-\[\#B7CAD8\] p-4 rounded shadow-sm flex flex-col space-y-4\"/g,
  'className="surface-tech tech-panel p-4 flex flex-col space-y-4"'
);

// Records List container
content = content.replace(
  /className=\"bg-\[\#F3F5F7\] border border-\[\#B7CAD8\] rounded shadow-sm overflow-hidden flex flex-col\"/g,
  'className="surface-tech tech-panel flex flex-col"'
);

// Records List header
content = content.replace(
  /className=\"bg-\[\#E4E9EF\] border-b border-\[\#B7CAD8\] px-6 py-3 flex items-center justify-between\"/g,
  'className="surface-tech-header px-6 py-3 flex items-center justify-between border-b border-[#213F66]"'
);

// Individual Record items
content = content.replace(
  /className=\"bg-\[\#DCE7EE\] border border-\[\#B7CAD8\] rounded flex flex-col md:flex-row items-center p-3 gap-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group\"/g,
  'className="surface-tech border border-[#213F66] rounded flex flex-col md:flex-row items-center p-3 gap-4 cursor-pointer hover:border-cyan-400 hover:shadow-md transition-all group"'
);

// Locked State login box
content = content.replace(
  /className=\"bg-\[\#162A3D\] border-2 border-\[\#2A3B54\] rounded-lg shadow-2xl p-8 max-w-md w-full flex flex-col items-center relative overflow-hidden\"/g,
  'className="surface-tech tech-panel border-2 border-cyan-800 p-8 max-w-md w-full flex flex-col items-center relative overflow-hidden"'
);

// Restricted Access Header
content = content.replace(
  /className=\"bg-\[\#14263D\] border border-\[\#1A2639\] rounded shadow-sm p-4 flex flex-col md:flex-row justify-between items-center\"/g,
  'className="surface-tech-header rounded p-4 flex flex-col md:flex-row justify-between items-center border border-[#213F66]"'
);

fs.writeFileSync('src/components/Dashboard.jsx', content, 'utf8');
console.log('Tab 3 Replacements executed');
