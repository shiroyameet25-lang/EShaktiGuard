const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('{/* Connection Lines SVG */}'));
const end = lines.findIndex((l, i) => i > start && l.includes('{/* Selected Node Details Side Panel */}'));

if (start > -1 && end > -1) {
const newLogic = `
                          {/* Connection Lines SVG */}
                          <svg className=\`absolute inset-0 w-full h-full z-10 pointer-events-none transition-opacity duration-1000 delay-300 ease-out \${networkGraphInView ? 'opacity-100' : 'opacity-0'}\`>
                            {/* Central (50, 50) to Alias (25, 25) */}
                            <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
                            {/* Central to Associate (75, 25) */}
                            <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
                            {/* Central to Watchlist (50, 80) */}
                            <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
                            {/* Associate to Watchlist (75,25 to 50,80) */}
                            <line x1="75%" y1="25%" x2="50%" y2="80%" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
                            {/* Central to Document (20, 65) */}
                            <line x1="50%" y1="50%" x2="20%" y2="65%" stroke="#22c55e" strokeWidth="1.5" opacity="0.7" />
                          </svg>

                          {/* Node: ALIAS */}
                          <div className="absolute top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group">
                            <div className="w-10 h-10 bg-[#0A1422] rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] mb-1">
                              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div className="bg-[#0F1E2C]/90 border border-[#213F66] px-2 py-1 rounded text-center backdrop-blur">
                              <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">ALIAS DETECTED</p>
                              <p className="text-[8px] font-mono text-white">ALEXSANDER N.</p>
                            </div>
                          </div>

                          {/* Node: ASSOCIATED PERSON */}
                          <div className="absolute top-[25%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group">
                            <div className="w-10 h-10 bg-[#0A1422] rounded-full border-2 border-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] mb-1">
                              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <div className="bg-[#0F1E2C]/90 border border-amber-500/30 px-2 py-1 rounded text-center backdrop-blur">
                              <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">ASSOCIATED PERSON</p>
                              <p className="text-[8px] font-mono text-white">KNOWN SYNDICATE MEMBER</p>
                            </div>
                          </div>

                          {/* Node: WATCHLIST RECORD */}
                          <div className="absolute top-[80%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group">
                            <div className="w-10 h-10 bg-[#0A1422] rounded-full border-2 border-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)] mb-1">
                              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div className="bg-[#0F1E2C]/90 border border-red-500/50 px-2 py-1 rounded text-center backdrop-blur">
                              <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">WATCHLIST RECORD</p>
                              <p className="text-[8px] font-mono text-white">INTERPOL RED NOTICE</p>
                            </div>
                          </div>

                          {/* Node: DOCUMENT */}
                          <div className="absolute top-[65%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group">
                            <div className="w-10 h-10 bg-[#0A1422] rounded-full border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)] mb-1">
                              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                            </div>
                            <div className="bg-[#0F1E2C]/90 border border-emerald-500/30 px-2 py-1 rounded text-center backdrop-blur">
                              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">DOCUMENT MATCH</p>
                              <p className="text-[8px] font-mono text-white">PREVIOUS BORDER ENTRY</p>
                            </div>
                          </div>

                          {/* Node: CENTRAL SUBJECT */}
                          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
                            <div className="w-14 h-14 bg-[#12243A] rounded-full border-[3px] border-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.6)] mb-2 relative">
                              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-20"></div>
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div className="bg-[#0F1E2C]/90 border border-cyan-500 px-3 py-1.5 rounded text-center shadow-lg backdrop-blur">
                              <p className="text-[11px] font-black text-cyan-400 uppercase tracking-widest">PRIMARY SUBJECT</p>
                              <p className="text-[9px] font-mono text-white uppercase">{analysisResult?.nameExtracted || 'UNKNOWN'}</p>
                            </div>
                          </div>
                        </div>
`;
lines.splice(start, end - start, ...newLogic.trim().split('\n'));
fs.writeFileSync('src/components/Dashboard.jsx', lines.join('\n'), 'utf8');
console.log('Fixed Threat Network UI');
}
