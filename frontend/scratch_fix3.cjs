const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('MASTER DATABASE') && l.includes('isSidebarExpanded'));

// Remove the faulty lines and insert the correct ones
lines.splice(idx + 1, 16, 
  '            {isSidebarExpanded && (',
  '              dbUnlocked ? (',
  '                <Unlock className="w-3.5 h-3.5 opacity-50 shrink-0 text-emerald-400" />',
  '              ) : (',
  '                <Lock className="w-3.5 h-3.5 opacity-50 shrink-0 text-red-400" />',
  '              )',
  '            )}',
  '          </button>',
  '        </div>',
  '      </aside>',
  '',
  '      {/* Main Content Area */}',
  '      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">',
  '        {/* Top Header */}',
  '        <header className="h-16 surface-security border-b border-[#213F66] flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-sm">',
  '          <div className="flex items-center space-x-4">',
  '            <div className="flex items-center space-x-2 bg-[#0A1422] px-3 py-1.5 rounded border border-[#213F66]">',
  '              <span className="h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_8px_currentColor] animate-pulse"></span>',
  '              <span className="hidden md:inline text-[9px] font-black text-cyan-400 uppercase tracking-widest">SYSTEM SECURE</span>',
  '            </div>',
  '          </div>',
  '        </header>'
);
fs.writeFileSync('src/components/Dashboard.jsx', lines.join('\n'), 'utf8');
console.log('Fixed syntax error');
