const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');

const start = lines.findIndex(l => l.includes('{/* 2. AI INVESTIGATION TIMELINE */}'));
const end = lines.findIndex((l, i) => i > start && l.includes('{/* SECURITY FINDINGS & INVESTIGATION INSIGHTS */}'));

if (start > -1 && end > -1) {
const newLogic = `
                {/* 2. SECURITY ANALYSIS MATRIX */}
                <div ref={timelineRef} className={\`surface-tech tech-panel p-6 relative overflow-x-auto transition-all duration-700 ease-out \${timelineInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
                  <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-[10px] mb-6 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    SECURITY ANALYSIS MATRIX
                  </h3>
                  <div className="min-w-[800px] flex justify-between items-center relative py-2">
                    {/* Active Connecting Pipeline */}
                    <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-[#162B43] -translate-y-1/2 z-0"></div>
                    <div className="absolute top-1/2 left-10 w-1/2 h-[2px] bg-cyan-500 shadow-[0_0_8px_#22d3ee] -translate-y-1/2 z-0 opacity-50"></div>

                    {/* Timeline Cards */}
                    {[
                      { label: "DOCUMENT SCAN", icon: "camera", status: "ok", conf: "100%", msg: "COMPLETE" },
                      { label: "OCR / EXTRACTION", icon: "text", status: "ok", conf: "98%", msg: "VERIFIED" },
                      { label: "IDENTITY CHECK", icon: "alert", status: "warn", conf: "94%", msg: "PENDING REVIEW" },
                      { label: "BIOMETRIC MATCH", icon: "face", status: "danger", conf: "22%", msg: "MISMATCH ALERT" },
                      { label: "WATCHLIST", icon: "shield", status: "danger", conf: "96%", msg: "HIT DETECTED" },
                      { label: "RISK ASSESSMENT", icon: "network", status: "danger", conf: "87%", msg: "HIGH RISK" }
                    ].map((step, i) => (
                      <div key={i} className={\`relative z-10 flex flex-col items-center group transition-all duration-700 ease-out \${timelineInView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}\`} style={{ transitionDelay: \`\${i * 150 + 100}ms\` }}>
                        <div className={\`w-36 bg-[#0E1B2E] border-2 rounded p-3 flex flex-col items-center justify-center shadow-lg transition-transform hover:-translate-y-1
                          \${step.status === 'ok' ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 
                            step.status === 'warn' ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 
                            'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]'}\`}
                        >
                          <div className={\`w-8 h-8 rounded-full flex items-center justify-center mb-2 \${step.status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' : step.status === 'warn' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}\`}>
                             {step.icon === 'camera' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>}
                             {step.icon === 'text' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                             {step.icon === 'alert' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                             {step.icon === 'face' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                             {step.icon === 'shield' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                             {step.icon === 'network' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                          </div>
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest text-center leading-tight mb-1">{step.label}</span>
                          <span className={\`text-[8px] font-bold uppercase tracking-widest mb-2 \${step.status === 'ok' ? 'text-emerald-400' : step.status === 'warn' ? 'text-amber-400' : 'text-red-400'}\`}>{step.msg}</span>
                          <span className="text-[9px] font-mono text-cyan-200 bg-[#12243A] px-2 py-0.5 rounded border border-[#213F66]">
                            CF: {step.conf}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
`;

lines.splice(start, end - start, ...newLogic.trim().split('\n'));
fs.writeFileSync('src/components/Dashboard.jsx', lines.join('\n'), 'utf8');
console.log('Fixed Security Analysis Pipeline');
}
