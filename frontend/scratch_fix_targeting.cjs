const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('{/* Targeting Frame */}'));
const newLogic = `
                          {/* Targeting Frame */}
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                            <div className="relative w-full max-w-[200px] aspect-[3/4] flex items-center justify-center">
                              <div className={\`w-full h-full transition-all duration-500 \${isAnalyzing ? 'tech-face-frame border-transparent' : 'border-2 border-dashed border-white/20'}\`}>
                                {isAnalyzing && (
                                  <>
                                    <div className="tech-face-frame-inner"></div>
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-scan-vertical z-10 overflow-hidden"></div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
`;
lines.splice(start, 13, ...newLogic.trim().split('\n'));
fs.writeFileSync('src/components/Dashboard.jsx', lines.join('\n'), 'utf8');
console.log('Fixed Targeting Frame');
