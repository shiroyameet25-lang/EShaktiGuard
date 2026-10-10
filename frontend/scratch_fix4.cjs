const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');
content = content.replace(
  /\{isSidebarExpanded && \(\s*dbUnlocked \? \(\s*<Unlock.*?\/>\s*\) : \(\s*\)\}/g,
  `{isSidebarExpanded && (
              dbUnlocked ? (
                <Unlock className="w-3.5 h-3.5 opacity-50 shrink-0 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 opacity-50 shrink-0 text-red-400" />
              )
            )}`
);
fs.writeFileSync('src/components/Dashboard.jsx', content, 'utf8');
console.log('Fixed missing Lock');
