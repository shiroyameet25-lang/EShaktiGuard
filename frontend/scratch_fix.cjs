const fs = require('fs');

// Fix index.css
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/border-t-2/g, '@apply border-t-2').replace(/border-b-2/g, '@apply border-b-2');
fs.writeFileSync('src/index.css', css, 'utf8');

// Fix Dashboard.jsx
let jsx = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');
const searchStr = `            {isSidebarExpanded && (
              dbUnlocked ? (
                <Unlock className="w-3.5 h-3.5 opacity-50 shrink-0 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 opacity-50 shrink-0 text-red-400" />
              )
              <span className="h-2 w-2 bg-emerald-500 rounded-full shadow-sm"></span>
              <span className="hidden md:inline text-[9px] font-bold text-slate-300 uppercase tracking-wider">SYSTEM SECURE</span>
            </div>
          </div>
        </header>`;
        
const replaceStr = `            {isSidebarExpanded && (
              dbUnlocked ? (
                <Unlock className="w-3.5 h-3.5 opacity-50 shrink-0 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 opacity-50 shrink-0 text-red-400" />
              )
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-[#162A3D] border-b border-[#2A3B54] flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-[#0F1E2C] px-3 py-1.5 rounded border border-[#2A3B54]">
              <span className="h-2 w-2 bg-emerald-500 rounded-full shadow-sm"></span>
              <span className="hidden md:inline text-[9px] font-bold text-slate-300 uppercase tracking-wider">SYSTEM SECURE</span>
            </div>
          </div>
        </header>`;

jsx = jsx.replace(searchStr, replaceStr);
fs.writeFileSync('src/components/Dashboard.jsx', jsx, 'utf8');
console.log('Fixed');
