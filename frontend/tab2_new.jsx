        {activeTab === 'profile' && (
          <div className="max-w-7xl w-full animate-fade-in">
            {analysisResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* TOP ROW: Identity Card (Full Width) */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:scale-[1.01] hover:shadow-md transition-all duration-300 animate-[fade-in-up_0.4s_ease-out_both] flex flex-col lg:flex-row">
                  {/* Mugshot Section */}
                  <div className="p-6 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col items-center justify-center shrink-0">
                    <div className="relative">
                      <img 
                        src="https://randomuser.me/api/portraits/men/32.jpg" 
                        alt="Suspect" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] grayscale sepia-[.1]"
                      />
                      {/* Pulsing Alert Badge */}
                      <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg border border-red-400 uppercase tracking-widest animate-pulse">
                        HIGH RISK
                      </div>
                    </div>
                  </div>
                  
                  {/* Demographics Section */}
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <h2 className="uppercase tracking-widest text-xs font-bold text-slate-500 mb-4 border-b border-gray-100 pb-2">Subject Demographics (Extracted)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Extracted Alias</p>
                        <p className="text-sm font-bold text-red-600">{analysisResult.nameExtracted}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">True Identity (DB)</p>
                        <p className="text-sm font-bold text-emerald-700">{analysisResult.nameDB}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Document No.</p>
                        <p className="text-sm font-mono text-gray-900">P8923471X</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nationality</p>
                        <p className="text-sm font-bold text-gray-900">CANADIAN</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="p-6 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col justify-center shrink-0 space-y-3">
                    <h2 className="uppercase tracking-widest text-xs font-bold text-slate-500 mb-1">Actions</h2>
                    <button 
                      onClick={() => {
                        setToastMessage('Alert Escalated to Border Patrol Units');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 4000);
                      }}
                      className="bg-red-700 text-white font-bold text-[10px] px-4 py-2 rounded shadow-none hover:bg-red-800 transition flex items-center w-full uppercase tracking-widest"
                    >
                      <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Escalate Alert
                    </button>
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="bg-white border border-gray-300 text-slate-700 font-bold text-[10px] px-4 py-2 rounded shadow-none hover:bg-gray-100 transition flex items-center w-full uppercase tracking-widest"
                    >
                      <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Gen PDF Report
                    </button>
                  </div>
                </div>

                {/* MIDDLE ROW */}
                {/* Card 1: Risk Engine Breakdown */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:scale-[1.01] hover:shadow-md transition-all duration-300 animate-[fade-in-up_0.4s_ease-out_both]" style={{ animationDelay: '0.1s' }}>
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
                    <h2 className="uppercase tracking-widest text-xs font-bold text-slate-600">Risk Engine Breakdown</h2>
                    <span className="text-red-700 font-black text-lg bg-red-100 px-3 py-0.5 rounded border border-red-200">{analysisResult.riskScore}/100</span>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide mb-2">
                        <span className="text-gray-500">OCR Confidence</span>
                        <span className="text-emerald-600">98%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: animateBars ? '98%' : '0%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide mb-2">
                        <span className="text-gray-500">Forensics (ELA) Tamper</span>
                        <span className="text-red-600">84%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: animateBars ? '84%' : '0%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide mb-2">
                        <span className="text-gray-500">Face Verification Match</span>
                        <span className="text-red-600">12%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: animateBars ? '12%' : '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: AI Diagnostics (PAD & Phonetic) */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:scale-[1.01] hover:shadow-md transition-all duration-300 flex flex-col animate-[fade-in-up_0.4s_ease-out_both]" style={{ animationDelay: '0.2s' }}>
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <h2 className="uppercase tracking-widest text-xs font-bold text-slate-600">AI Diagnostics</h2>
                  </div>
                  <div className="p-6 flex-1 flex flex-col space-y-6">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
                      <h3 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3 border-b border-emerald-200 pb-2">Liveness (PAD)</h3>
                      <div className="space-y-2 text-[10px] font-bold text-gray-600 uppercase">
                        <div className="flex justify-between"><span className="opacity-70">Depth Map</span><span className="text-emerald-600">PASS</span></div>
                        <div className="flex justify-between"><span className="opacity-70">Texture Check</span><span className="text-emerald-600">PASS</span></div>
                        <div className="flex justify-between"><span className="opacity-70">Micro-Expr</span><span className="text-emerald-600">PASS</span></div>
                      </div>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex-1">
                      <h3 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-2 border-b border-amber-200 pb-2 flex justify-between items-center">
                        Phonetic Module
                        <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[8px]">98% MATCH</span>
                      </h3>
                      <p className="text-[11px] text-amber-900/80 font-medium leading-relaxed mt-2">
                        Alias <span className="font-bold underline">ALEXSANDER NAVARRO</span> matches DB record <span className="font-bold underline">ALEXANDER NOVARO</span>. Identity spoofing detected.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BOTTOM ROW */}
                {/* Card 3: Law Enforcement Records & Trail */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:scale-[1.01] hover:shadow-md transition-all duration-300 flex flex-col animate-[fade-in-up_0.4s_ease-out_both]" style={{ animationDelay: '0.3s' }}>
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <h2 className="uppercase tracking-widest text-xs font-bold text-slate-600">Investigation Trail & Records</h2>
                  </div>
                  <div className="p-0 flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {/* Criminal DB */}
                    <div className="p-6 bg-red-50/30">
                      <h3 className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-4">Law Enforcement Alerts</h3>
                      <div className="space-y-3">
                        <div className="bg-white border-l-4 border-red-600 p-3 shadow-sm rounded flex flex-col">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">Critical Watchlist</span>
                            <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">FLAGGED</span>
                          </div>
                          <p className="text-xs font-bold text-gray-800">Interpol - Identity Fraud</p>
                        </div>
                        <div className="bg-white border-l-4 border-orange-500 p-3 shadow-sm rounded flex flex-col">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-black text-orange-500 uppercase tracking-wider">Record (2023)</span>
                            <span className="text-[9px] font-bold text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded">Case #892-B</span>
                          </div>
                          <p className="text-xs font-bold text-gray-800">Local Police - Arrest Warrant</p>
                        </div>
                      </div>
                    </div>
                    {/* Travel History */}
                    <div className="p-6 overflow-y-auto max-h-64">
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Border Crossings</h3>
                      <div className="relative border-l-2 border-gray-200 ml-2 space-y-6">
                        <div className="relative pl-5">
                          <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-red-600 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                          <div className="text-[10px] font-black text-red-600 mb-0.5 tracking-wider">CURRENT</div>
                          <div className="text-xs font-bold text-gray-900">Identity Impersonation Alert</div>
                        </div>
                        <div className="relative pl-5">
                          <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-500"></span>
                          <div className="text-[10px] font-black text-gray-500 mb-0.5 tracking-wider">08-NOV-2025</div>
                          <div className="text-xs font-bold text-gray-900">Visa Renewal - FLAGGED</div>
                        </div>
                        <div className="relative pl-5">
                          <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
                          <div className="text-[10px] font-black text-gray-500 mb-0.5 tracking-wider">12-MAY-2024</div>
                          <div className="text-xs font-bold text-gray-900">Border Crossing - CLEARED</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4: Threat Network Graph */}
                <div className="lg:col-span-1 bg-slate-900 rounded-xl shadow-sm border border-slate-700 overflow-hidden hover:scale-[1.01] hover:shadow-lg transition-all duration-300 flex flex-col animate-[fade-in-up_0.4s_ease-out_both]" style={{ animationDelay: '0.4s' }}>
                  <div className="border-b border-slate-700 bg-slate-800/80 px-6 py-4 flex justify-between items-center">
                    <h2 className="uppercase tracking-widest text-xs font-bold text-slate-300">Threat Network</h2>
                  </div>
                  <div className="p-6 relative flex-1 flex flex-col items-center justify-center min-h-[220px]">
                    <div className="relative w-full max-w-[200px] h-40">
                      {/* Lines */}
                      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                        <line x1="50%" y1="50%" x2="15%" y2="20%" stroke="#475569" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
                        <line x1="50%" y1="50%" x2="85%" y2="20%" stroke="#475569" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
                        <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="#475569" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
                      </svg>
                      {/* Center Node */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                        <div className="w-10 h-10 bg-red-600 rounded-full border-2 border-red-300 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                      </div>
                      {/* Sub nodes */}
                      <div className="absolute top-[10%] left-[5%] z-10 flex flex-col items-center">
                        <div className="w-8 h-8 bg-slate-800 rounded-full border-2 border-orange-500 shadow-sm"></div>
                        <span className="mt-1 text-orange-400 text-[8px] font-bold uppercase bg-slate-800 px-1 rounded whitespace-nowrap">Smuggling Ring</span>
                      </div>
                      <div className="absolute top-[10%] right-[5%] z-10 flex flex-col items-center">
                        <div className="w-8 h-8 bg-slate-800 rounded-full border-2 border-red-500 shadow-sm"></div>
                        <span className="mt-1 text-red-400 text-[8px] font-bold uppercase bg-slate-800 px-1 rounded whitespace-nowrap">Passport Syndicate</span>
                      </div>
                      <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
                        <div className="w-8 h-8 bg-slate-800 rounded-full border-2 border-yellow-500 shadow-sm"></div>
                        <span className="mt-1 text-yellow-400 text-[8px] font-bold uppercase bg-slate-800 px-1 rounded whitespace-nowrap">Vehicle #MH-12</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 bg-slate-900 rounded-xl border border-slate-700 text-center shadow-xl mt-10 max-w-3xl mx-auto">
                <svg className="w-16 h-16 text-slate-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-bold text-slate-300 uppercase tracking-widest mb-4">No Profile Data Found</h2>
                <p className="text-slate-500 mb-8 font-mono text-sm max-w-md mx-auto leading-relaxed">Please return to the dashboard and run a biometric analysis on a document to populate this profile.</p>
                <button onClick={() => setActiveTab('dashboard')} className="px-8 py-4 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 uppercase tracking-wider transition-all">RETURN TO SCANNER</button>
              </div>
            )}
          </div>
        )}
