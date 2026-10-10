{activeTab === 'profile' && (
          <div className="w-full max-w-[1400px] animate-fade-in flex flex-col space-y-4 pb-10">
            {analysisResult ? (
              <>
                {/* 1. SUBJECT INTELLIGENCE HEADER */}
                <div className="flex flex-col xl:flex-row gap-4">
                  {/* Left: Identity Overview */}
                  <div ref={identityRef} className={`surface-tech tech-panel p-6 flex-1 flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all duration-700 ease-out ${identityInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <svg className="w-40 h-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    {/* Thumbnail */}
                    <div className={`w-32 md:w-40 shrink-0 flex flex-col transition-all duration-700 ease-out ${identityInView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{ transitionDelay: '100ms' }}>
                      <div className="aspect-[3/4] relative bg-[#0A1422] border border-[#213F66] shadow-inner group overflow-hidden flex items-center justify-center p-2 text-center">
                        <div className={`absolute inset-0 bg-[#0A1422] z-0  transition-opacity duration-700 ease-out ${identityInView ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '300ms' }}></div>
                        {finalSubjectPortrait?.imageData ? (
                          <>
                            <img src={finalSubjectPortrait.imageData} alt="Subject Portrait" className="absolute inset-0 w-full h-full object-cover object-top grayscale sepia-[.1] z-10" />
                            {finalSubjectPortrait.confidence !== 'HIGH' && (
                              <div className="absolute bottom-0 left-0 w-full bg-[#0A1422]/70 text-orange-400 text-[8px] font-bold text-center py-1 z-20  border-t border-orange-500/50">
                                CONFIDENCE: {finalSubjectPortrait.confidence}
                              </div>
                            )}
                          </>
                        ) : finalSubjectPortrait === null ? (
                          <div className="text-red-500 font-bold text-[10px] uppercase z-10 tracking-widest break-words leading-tight flex flex-col items-center">
                            <svg className="w-6 h-6 mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Subject Portrait Not Confidently Detected
                          </div>
                        ) : (
                          <div className="text-cyan-400 text-xs z-10 uppercase tracking-widest">Processing...</div>
                        )}
                        <div className="absolute top-0 w-full h-0.5 bg-slate-600 shadow-sm  z-20 pointer-events-none"></div>
                      </div>
                      <div className={`mt-2 text-center bg-[#0F1E2C] border border-[#213F66] text-cyan-400 text-[10px] font-mono py-1 tracking-widest uppercase transition-opacity duration-700 ease-out ${identityInView ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                        SCANNED IMG
                    
                      </div>
                    </div>
                    {/* Identity Data */}
                    <div className={`flex-1 flex flex-col justify-center z-10 transition-all duration-700 ease-out ${identityInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: '200ms' }}>
                      <h2 className="uppercase tracking-widest text-[10px] font-bold text-cyan-400 mb-1 border-b border-[#213F66] pb-2 flex items-center">
                        <span className="w-2 h-2 bg-slate-600 rounded-full mr-2 "></span>
                        Subject Identity Status
                      </h2>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 mt-4">
                        <div className={`transition-all duration-500 ease-out ${identityInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '300ms' }}>
                          <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest">Document Type</p>
                          <p className="text-xs font-bold text-white font-mono mt-0.5">{analysisResult.documentType}</p>
                        </div>
                        <div className={`transition-all duration-500 ease-out ${identityInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '350ms' }}>
                          <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest">Primary Identity</p>
                          <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5 truncate">{analysisResult.nameDB}</p>
                        </div>
                        <div className={`transition-all duration-500 ease-out ${identityInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '400ms' }}>
                          <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest">Detected Alias</p>
                          <p className="text-xs font-bold text-red-400 font-mono mt-0.5 truncate">{analysisResult.nameExtracted}</p>
                        </div>
                        <div className={`transition-all duration-500 ease-out ${identityInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '450ms' }}>
                          <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest">Document Number</p>
                          <p className="text-xs font-bold text-white font-mono mt-0.5">{analysisResult.documentNumber}</p>
                        </div>
                        <div className={`transition-all duration-500 ease-out ${identityInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '500ms' }}>
                          <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest">Nationality</p>
                          <p className="text-xs font-bold text-white mt-0.5">{analysisResult.nationality}</p>
                        </div>
                        <div className={`transition-all duration-500 ease-out ${identityInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '550ms' }}>
                          <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest">Sex / DOB</p>
                          <p className="text-xs font-bold text-white mt-0.5">{analysisResult.sex} / {analysisResult.dateOfBirth}</p>

                        </div>
                        <div className="transition-all duration-500 ease-out">
                          <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest">Document Status</p>
                          <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">VERIFIED AUTHENTIC</p>
                        </div>
                        <div className="transition-all duration-500 ease-out">
                          <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest">Verification Status</p>
                          <p className="text-xs font-bold text-amber-400 font-mono mt-0.5">PENDING MATCH</p>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* BIOMETRIC VERIFICATION */}
                <div ref={biometricRef} className={`surface-tech tech-panel p-5 mb-4 flex flex-col transition-all duration-700 ease-out ${biometricInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h2 className="uppercase tracking-widest text-[10px] font-black text-cyan-400 mb-4 border-b border-[#213F66] pb-2 flex items-center">
                    <svg className="w-4 h-4 text-cyan-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    BIOMETRIC VERIFICATION
                  </h2>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                    <div className={`flex flex-col items-center transition-all duration-700 ease-out ${biometricInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '100ms' }}>
                      <div className="w-32 h-40 bg-[#0A1422] rounded-lg border border-[#213F66] overflow-hidden mb-2">
                        {finalSubjectPortrait?.imageData ? (
                          <img src={finalSubjectPortrait.imageData} alt="Document Portrait" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-blue-400 text-xs">NO FACE</div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">DOCUMENT PORTRAIT</span>
                    
                    </div>
                    <div className={`flex flex-col items-center justify-center transition-all duration-700 ease-out ${biometricInView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{ transitionDelay: '300ms' }}>
                      <div className="flex flex-col items-center justify-center relative w-48 h-48">
                        {/* Circular Scanner Background */}
                        <div className="absolute inset-0 rounded-full border-4 border-[#213F66] opacity-30"></div>
                        <div className={`absolute inset-0 rounded-full border-t-4 animate-spin ${faceVerificationResult?.verified ? 'border-emerald-400' : faceVerificationResult?.status === 'IDENTITY_MISMATCH' ? 'border-red-500' : 'border-cyan-400'}`}></div>
                        
                        <div className={`flex flex-col items-center justify-center rounded-full w-40 h-40 bg-[#0F1E2C] border-2 z-10 ${faceVerificationResult?.verified ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : faceVerificationResult?.status === 'IDENTITY_MISMATCH' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-cyan-500/50'}`}>
                        {faceVerificationResult?.verified ? (
                          <>
                            <svg className="w-10 h-10 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-black text-emerald-500 text-sm uppercase tracking-widest mb-1">✓ MATCH VERIFIED</span>
                            <span className="text-[10px] text-emerald-400/80 uppercase">SIMILARITY: {faceVerificationResult?.similarityScore}%</span>
                          </>
                        ) : faceVerificationResult?.status === 'IDENTITY_MISMATCH' ? (
                          <>
                            <svg className="w-10 h-10 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="font-black text-red-500 text-sm uppercase tracking-widest mb-1">✕ IDENTITY MISMATCH</span>
                            <span className="text-[10px] text-red-400/80 uppercase">SIMILARITY: {faceVerificationResult?.similarityScore || 0}%</span>
                          </>
                        ) : (
                           <>
                            <svg className="w-10 h-10 text-cyan-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="font-black text-cyan-400 text-sm uppercase tracking-widest mb-1">NO COMPARISON</span>
                            <span className="text-[10px] text-cyan-400/80 uppercase">{faceVerificationResult?.status}</span>
                          </>
                        )}

                      </div>
                    </div>
                    <div className={`flex flex-col items-center transition-all duration-700 ease-out ${biometricInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: '200ms' }}>
                      <div className="w-32 h-40 bg-[#0A1422] rounded-lg border border-[#213F66] overflow-hidden mb-2">
                        {liveWebcamFaceData ? (
                          <img src={liveWebcamFaceData} alt="Live Webcam Capture" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-blue-400 text-xs text-center p-2">NO VALID FACE DETECTED</div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">LIVE WEBCAM CAPTURE</span>

                    </div>
                  </div>
                </div>
                {/* 2. AI INVESTIGATION TIMELINE */}
                <div ref={timelineRef} className={`surface-tech tech-panel p-5 relative overflow-x-auto transition-all duration-700 ease-out ${timelineInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="min-w-[800px] flex justify-between items-center relative py-2">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-8 right-8 h-[1px] bg-cyan-900 -translate-y-1/2 z-0"></div>
                    <div className="absolute top-1/2 left-8 right-1/2 h-[1px] bg-cyan-500 -translate-y-1/2 z-0"></div>
                    <div className="absolute top-1/2 left-1/2 right-8 h-[1px] bg-cyan-500 -translate-y-1/2 z-0 "></div>

                    {/* Timeline Nodes */}
                    {[
                      { label: "DOC SCANNED", icon: "camera", status: "ok", conf: "100%" },
                      { label: "OCR VERIFIED", icon: "text", status: "ok", conf: "98%" },
                      { label: "ID CONFLICT", icon: "alert", status: "warn", conf: "94%" },
                      { label: "BIO MISMATCH", icon: "face", status: "danger", conf: "88%" },
                      { label: "CRIMINAL MATCH", icon: "shield", status: "danger", conf: "96%" },
                      { label: "SYNDICATE LINK", icon: "network", status: "danger", conf: "87%" }
                    ].map((step, i) => (
                      <div key={i} className={`relative z-10 flex flex-col items-center group transition-all duration-700 ease-out ${timelineInView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{ transitionDelay: `${i * 150 + 100}ms` }}>
                        <div className={`w-10 h-10 border border-[#213F66] flex items-center justify-center bg-[#0F1E2C] shadow-lg transition-all group-hover:scale-110 rotate-45
                          ${step.status === 'ok' ? 'border-blue-300 text-blue-700 shadow-sm' : 
                            step.status === 'warn' ? 'border-orange-500 text-orange-400 shadow-sm' : 
                            'border-red-300 text-red-500 shadow-sm'}`}
                        >
                          <div className="-rotate-45">
                            {step.icon === 'camera' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>}
                            {step.icon === 'text' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            {step.icon === 'alert' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                            {step.icon === 'face' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            {step.icon === 'shield' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                            {step.icon === 'network' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                          </div>
                        </div>
                        <span className={`mt-3 text-[9px] font-bold tracking-widest uppercase text-center w-24 leading-tight
                          ${step.status === 'ok' ? 'text-blue-600' : step.status === 'warn' ? 'text-orange-400' : 'text-red-500'}`}>
                          {step.label}
                        </span>
                        <span className="mt-1 text-[9px] font-mono text-cyan-400 bg-[#0A1422] px-1.5 py-0.5 rounded border border-[#213F66]">
                          CF: {step.conf}
                        </span>
                      </div>
                  ))}

                  </div>
                </div>
                {/* SECURITY FINDINGS & INVESTIGATION INSIGHTS */}
                <div id="security-findings" ref={findingsRef} className={`surface-security tech-panel border-t-2 border-t-red-500 p-6 mb-4 flex flex-col scroll-mt-24 transition-all duration-700 ease-out ${findingsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#213F66] pb-4 mb-6">
                    <div>
                      <h2 className="uppercase tracking-widest text-lg font-black text-red-500 flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        SECURITY FINDINGS & INVESTIGATION INSIGHTS
                      </h2>
                      <p className="text-xs font-bold text-red-300 mt-1 uppercase tracking-widest">AI-generated findings requiring officer attention.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-6 text-[10px] font-black uppercase tracking-widest bg-[#0F1E2C]/50 py-2 px-4 rounded border border-[#213F66]">
                      <div className="flex flex-col items-center">
                        <span className="text-red-500 text-xl leading-none">2</span>
                        <span className="text-cyan-400 mt-1">HIGH PRIORITY</span>
                      </div>
                      <div className="flex flex-col items-center border-l border-[#213F66] pl-6">
                        <span className="text-amber-500 text-xl leading-none">1</span>
                        <span className="text-cyan-400 mt-1">MEDIUM PRIORITY</span>
                      </div>
                      <div className="flex flex-col items-center border-l border-[#213F66] pl-6 opacity-50">
                        <span className="text-cyan-400 text-xl leading-none">0</span>
                        <span className="text-blue-400 mt-1">CRITICAL</span>

                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {/* FINDING 1 */}
                    <div className={`bg-[#0F1E2C]/60 border border-[#213F66] rounded-lg p-5 flex flex-col md:flex-row gap-6 hover:border-red-300 transition-all group shadow-sm duration-700 ease-out ${findingsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-red-50 text-red-400 border border-red-300 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase shadow-sm">HIGH</span>
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center"><span className="w-1.5 h-1.5 bg-[#0F1E2C]0 rounded-full mr-1.5"></span>IDENTITY VERIFICATION</span>
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 group-hover:text-red-400 transition-colors">LIVE IDENTITY DOES NOT MATCH DOCUMENT PORTRAIT</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-5">
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">WHAT WAS DETECTED</h4>
                            <p className="text-xs text-white leading-relaxed font-mono">The face captured through the live webcam does not sufficiently match the identity portrait extracted from the uploaded document.</p>
                          </div>
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">WHERE IT WAS FOUND</h4>
                            <p className="text-xs text-white leading-relaxed font-mono">Biometric Face Verification</p>
                          </div>
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">WHY THIS MATTERS</h4>
                            <p className="text-xs text-white leading-relaxed font-mono">The person presenting the document may not be the same individual shown in the identity document.</p>
                          </div>
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">SECURITY IMPACT</h4>
                            <p className="text-xs font-black text-red-500 tracking-widest">HIGH</p>
                        
                          </div>
                        </div>
                        <div className="bg-[#0A1422] border-l-2 border-l-cyan-500 border border-[#213F66] rounded p-3">
                          <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5">RECOMMENDED OFFICER ACTION</h4>
                          <p className="text-[11px] font-bold text-white">Verify the traveller's identity manually and request an additional identity document before making a final decision.</p>
                      
                        </div>
                      </div>
                      <div className="w-full md:w-56 shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#213F66] pt-4 md:pt-0 md:pl-6">
                        <button onClick={() => { 
                          setSelectedEvidenceFinding({
                            id: 'EVID-7389-ID',
                            type: 'IDENTITY_MISMATCH',
                            title: 'LIVE IDENTITY DOES NOT MATCH DOCUMENT PORTRAIT',
                            priority: 'HIGH',
                            timestamp: new Date().toISOString()
                          }); 
                          setShowEvidenceInvestigation(true); 
                        }} className="w-full bg-[#0A1422] hover:bg-[#14263D] text-white hover:text-white border border-[#213F66] font-bold text-[10px] py-3 px-4 rounded uppercase tracking-widest transition-colors flex items-center justify-between group-hover:border-slate-500">
                          <span>View Evidence &rarr;</span>
                        </button>

                      </div>
                    </div>
                    {/* FINDING 2 */}
                    <div className={`bg-[#0F1E2C]/60 border border-[#213F66] rounded-lg p-5 flex flex-col md:flex-row gap-6 hover:border-red-300 transition-all group shadow-sm duration-700 ease-out ${findingsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '250ms' }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-red-50 text-red-400 border border-red-300 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase shadow-sm">HIGH</span>
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center"><span className="w-1.5 h-1.5 bg-[#0F1E2C]0 rounded-full mr-1.5"></span>DOCUMENT FORENSICS</span>
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 group-hover:text-red-400 transition-colors">POSSIBLE DOCUMENT MODIFICATION DETECTED</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-5">
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">WHAT WAS DETECTED</h4>
                            <p className="text-xs text-white leading-relaxed font-mono">The document analysis found visual inconsistencies in one or more regions that differ from surrounding document patterns.</p>
                          </div>
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">WHERE IT WAS FOUND</h4>
                            <p className="text-xs text-white leading-relaxed font-mono">Document image forensic analysis.</p>
                          </div>
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">WHY THIS MATTERS</h4>
                            <p className="text-xs text-white leading-relaxed font-mono">These inconsistencies may indicate that part of the document has been altered or digitally modified.</p>
                          </div>
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">SECURITY IMPACT</h4>
                            <p className="text-xs font-black text-red-500 tracking-widest">HIGH</p>
                        
                          </div>
                        </div>
                        <div className="bg-[#0A1422] border-l-2 border-l-cyan-500 border border-[#213F66] rounded p-3">
                          <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5">RECOMMENDED OFFICER ACTION</h4>
                          <p className="text-[11px] font-bold text-white">Inspect the original physical document and verify the affected information using official verification methods.</p>
                      
                        </div>
                      </div>
                      <div className="w-full md:w-56 shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#213F66] pt-4 md:pt-0 md:pl-6">
                        <button onClick={() => { 
                          setSelectedEvidenceFinding({
                            id: 'EVID-9921-MOD',
                            type: 'DOCUMENT_MODIFICATION',
                            title: 'POSSIBLE DOCUMENT MODIFICATION DETECTED',
                            priority: 'HIGH',
                            timestamp: new Date().toISOString()
                          }); 
                          setShowEvidenceInvestigation(true); 
                        }} className="w-full bg-[#0A1422] hover:bg-[#14263D] text-white hover:text-white border border-[#213F66] font-bold text-[10px] py-3 px-4 rounded uppercase tracking-widest transition-colors flex items-center justify-between group-hover:border-slate-500">
                          <span>View Evidence &rarr;</span>
                        </button>

                      </div>
                    </div>
                    {/* FINDING 3 */}
                    <div className={`bg-[#0F1E2C]/60 border border-[#213F66] rounded-lg p-5 flex flex-col md:flex-row gap-6 hover:border-red-300 transition-all group shadow-sm duration-700 ease-out ${findingsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-red-50 text-red-400 border border-red-300 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase shadow-sm">CRITICAL</span>
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center"><span className="w-1.5 h-1.5 bg-[#0F1E2C]0 rounded-full mr-1.5"></span>INTELLIGENCE MATCH</span>
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 group-hover:text-red-400 transition-colors">KNOWN CRIMINAL SYNDICATE CONNECTION DETECTED</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-5">
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">WHAT WAS DETECTED</h4>
                            <p className="text-xs text-white leading-relaxed font-mono">The subject's biometric data cross-referenced positively with an international criminal intelligence database.</p>
                          </div>
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">WHERE IT WAS FOUND</h4>
                            <p className="text-xs text-white leading-relaxed font-mono">Global Law Enforcement & Syndicate Watchlist.</p>
                          </div>
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">WHY THIS MATTERS</h4>
                            <p className="text-xs text-white leading-relaxed font-mono">Subject is flagged for potential involvement in high-risk illicit operations requiring immediate apprehension.</p>
                          </div>
                          <div>
                            <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5 border-b border-[#213F66] pb-1">SECURITY IMPACT</h4>
                            <p className="text-xs font-black text-red-500 tracking-widest">CRITICAL</p>
                        
                          </div>
                        </div>
                        <div className="bg-[#0A1422] border-l-2 border-l-cyan-500 border border-[#213F66] rounded p-3">
                          <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5">RECOMMENDED OFFICER ACTION</h4>
                          <p className="text-[11px] font-bold text-white">Do not alert the subject. Signal secondary border patrol units and detain for questioning immediately.</p>
                      
                        </div>
                      </div>
                      <div className="w-full md:w-56 shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#213F66] pt-4 md:pt-0 md:pl-6">
                        <button onClick={() => { 
                          setSelectedEvidenceFinding({
                            id: 'INTEL-8492-X',
                            type: 'CRIMINAL_INTELLIGENCE',
                            title: 'KNOWN CRIMINAL SYNDICATE CONNECTION DETECTED',
                            priority: 'CRITICAL',
                            timestamp: new Date().toISOString()
                          }); 
                          setShowEvidenceInvestigation(true); 
                        }} className="w-full bg-[#0A1422] hover:bg-[#14263D] text-white hover:text-white border border-[#213F66] font-bold text-[10px] py-3 px-4 rounded uppercase tracking-widest transition-colors flex items-center justify-between group-hover:border-slate-500">
                          <span>View Evidence &rarr;</span>
                        </button>


                      </div>
                    </div>
                  </div>
                </div>
                {/* 3. MAIN GRID (3 Columns Left/Center, 1 Column Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
                  
                  {/* LEFT/CENTER: Deep Dive Intelligence (3 Cols) */}
                  <div className="lg:col-span-3 flex flex-col gap-4">
                    
                    {/* Top row inside Left/Center: Threat Network */}
                    <div className="w-full">
                      
                    </div>
                    {/* Threat Network Intelligence */}
                    <div className="bg-[#0A1422]  border border-[#213F66] rounded-xl p-5 md:p-6 flex flex-col shadow-sm w-full relative overflow-hidden">
                      
                      {/* Header */}
                      <div ref={networkHeaderRef} className={`flex flex-col mb-6 border-b border-[#213F66] pb-4 transition-all duration-700 ease-out ${networkHeaderInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <h2 className="uppercase tracking-widest text-lg font-black text-white flex items-center">
                          <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                          THREAT NETWORK INTELLIGENCE
                        </h2>
                        <p className={`text-[10px] font-bold text-cyan-400 mt-1 uppercase tracking-widest transition-opacity duration-700 delay-200 ease-out ${networkHeaderInView ? 'opacity-100' : 'opacity-0'}`}>RELATIONSHIP & SECURITY CONNECTION ANALYSIS</p>
                      
                      </div>
                      {/* Network Visualization & Assessment */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        
                        {/* Main Graph Area */}
                        <div ref={networkGraphRef} className="lg:col-span-2 bg-[#0F1E2C]/80 border border-[#213F66] rounded-lg relative min-h-[400px] flex items-center justify-center overflow-hidden">
                          {/* Technical Grid Background */}
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMGwwIDIwTTIwIDFMMCAxIiBzdHJva2U9InJnYmEoMzAsIDQxLCA1OSwgMC4yKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] z-0 pointer-events-none"></div>
                          
                          {/* Scanning radar sweep animation effect */}
                          <div className="absolute inset-0 z-0 opacity-20 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(6,182,212,0.8)_360deg)] rounded-full animate-spin [animation-duration:8s]"></div>
                          
                          {/* Connection Lines SVG */}
                          <svg className={`absolute inset-0 w-full h-full z-10 pointer-events-none transition-opacity duration-1000 delay-300 ease-out ${networkGraphInView ? 'opacity-100' : 'opacity-0'}`}>
                            {/* Central (50, 50) to Alias A (25, 25) */}
                            <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
                            {/* Central to Person B (75, 30) */}
                            <line x1="50%" y1="50%" x2="75%" y2="30%" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
                            {/* Central to Org X (50, 80) */}
                            <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
                            {/* Person B to Person C (90, 60) */}
                            <line x1="75%" y1="30%" x2="90%" y2="60%" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
                            {/* Person B to Org X (50, 80) */}
                            <line x1="75%" y1="30%" x2="50%" y2="80%" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
                          </svg>

                          {/* Node: ALIAS A */}
                          <button 
                            onClick={() => setSelectedNetworkNode('ALIAS_A')}
                            className={`absolute top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer transition-all duration-700 ease-out hover:scale-105 ${selectedNetworkNode === 'ALIAS_A' ? 'ring-2 ring-cyan-500 rounded-lg p-2 bg-[#0A1422]' : 'p-2'}`}
                          >
                            <div className="w-8 h-8 bg-[#0A1422] rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.5)] mb-1">
                              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div className="bg-[#0F1E2C]/80 border border-[#213F66] px-2 py-1 rounded text-center">
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">ALIAS A</p>
                              <p className="text-[7px] font-mono text-white">KNOWN ALIAS</p>
                            </div>
                          </button>

                          {/* Node: PERSON B */}
                          <button 
                            onClick={() => setSelectedNetworkNode('PERSON_B')}
                            className={`absolute top-[30%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer transition-all duration-700 ease-out hover:scale-105 ${selectedNetworkNode === 'PERSON_B' ? 'ring-2 ring-amber-500 rounded-lg p-2 bg-[#0A1422]' : 'p-2'}`}
                          >
                            <div className="w-10 h-10 bg-[#0A1422] rounded-full border-2 border-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] mb-1">
                              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <div className="bg-[#0F1E2C]/80 border border-amber-500/50 px-2 py-1 rounded text-center">
                              <p className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">PERSON B</p>
                              <p className="text-[7px] font-mono text-white">ASSOCIATE</p>
                            </div>
                          </button>

                          {/* Node: ORG X */}
                          <button 
                            onClick={() => setSelectedNetworkNode('ORG_X')}
                            className={`absolute top-[80%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer transition-all duration-700 ease-out hover:scale-105 ${selectedNetworkNode === 'ORG_X' ? 'ring-2 ring-red-500 rounded-lg p-2 bg-[#0A1422]' : 'p-2'}`}
                          >
                            <div className="w-10 h-10 bg-[#0A1422] rounded-md border-2 border-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)] mb-1 rotate-45 group-hover:rotate-0 transition-all">
                              <svg className="w-5 h-5 text-red-500 -rotate-45 group-hover:rotate-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <div className="bg-[#0F1E2C]/80 border border-red-500/50 px-2 py-1 rounded text-center mt-2">
                              <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">ORGANIZATION X</p>
                              <p className="text-[7px] font-mono text-white">KNOWN SYNDICATE</p>
                            </div>
                          </button>

                          {/* Node: PERSON C */}
                          <button 
                            onClick={() => setSelectedNetworkNode('PERSON_C')}
                            className={`absolute top-[60%] left-[90%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer transition-all duration-700 ease-out hover:scale-105 ${selectedNetworkNode === 'PERSON_C' ? 'ring-2 ring-red-500 rounded-lg p-2 bg-[#0A1422]' : 'p-2'}`}
                          >
                            <div className="w-8 h-8 bg-[#0A1422] rounded-full border-2 border-red-500 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)] mb-1">
                              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div className="bg-[#0F1E2C]/80 border border-red-500/50 px-2 py-1 rounded text-center">
                              <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">PERSON C</p>
                              <p className="text-[7px] font-mono text-white">SYNDICATE MEMBER</p>
                            </div>
                          </button>

                          {/* Central Node: Subject */}
                          <button 
                            onClick={() => setSelectedNetworkNode('SUBJECT')}
                            className={`absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center cursor-pointer transition-all duration-700 ease-out hover:scale-105 ${selectedNetworkNode === 'SUBJECT' ? 'ring-4 ring-blue-500 rounded-full p-2 bg-[#0A1422]' : 'p-2'}`}
                          >
                            <div className="w-14 h-14 bg-[#0F1E2C] rounded-full border-4 border-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.8)] relative overflow-hidden">
                               {finalSubjectPortrait?.imageData ? (
                                  <img src={finalSubjectPortrait.imageData} className="w-full h-full object-cover" />
                               ) : (
                                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                               )}
                            </div>
                            <div className="bg-blue-600 border border-blue-400 px-3 py-1 rounded mt-2 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                              <p className="text-[10px] font-black text-white uppercase tracking-widest">SUBJECT</p>
                            </div>
                          </button>
                        </div>
                        
                        {/* Detail / Assessment Panel */}
                        <div ref={networkSummaryRef} className="bg-[#0F1E2C] border border-[#213F66] rounded-lg p-5 flex flex-col relative overflow-hidden">
                          {!selectedNetworkNode ? (
                            <div className={`flex flex-col h-full transition-all duration-700 ease-out ${networkSummaryInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                              {/* Global Assessment State */}
                              <h3 className="text-[10px] uppercase tracking-widest font-bold text-cyan-400 mb-4 border-b border-[#213F66] pb-2 flex items-center">
                                <svg className="w-3.5 h-3.5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                NETWORK INTELLIGENCE SUMMARY
                              </h3>
                              
                              <div className="space-y-4 mb-6">
                                <div className={`flex justify-between items-center bg-[#0A1422] border border-[#213F66] p-2 rounded transition-all duration-500 ease-out ${networkSummaryInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '100ms' }}>
                                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">TOTAL REFERENCES</span>
                                  <span className="text-xs font-mono font-black text-white">3</span>
                                </div>
                                <div className={`flex justify-between items-center bg-[#0A1422] border border-[#213F66] p-2 rounded transition-all duration-500 ease-out ${networkSummaryInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '200ms' }}>
                                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">VERIFIED THREATS</span>
                                  <span className="text-xs font-mono font-black text-emerald-500">0</span>
                                </div>
                                <div className={`flex justify-between items-center bg-[#0A1422] border border-[#213F66] p-2 rounded transition-all duration-500 ease-out ${networkSummaryInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '300ms' }}>
                                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">UNDER REVIEW</span>
                                  <span className="text-xs font-mono font-black text-amber-500">2</span>
                                </div>
                                <div className={`flex justify-between items-center bg-[#0A1422] border border-[#213F66] p-2 rounded transition-all duration-500 ease-out ${networkSummaryInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '400ms' }}>
                                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">HIGH PRIORITY LINKS</span>
                                  <span className="text-xs font-mono font-black text-cyan-400">0</span>
                                </div>
                                <div className={`flex justify-between items-center bg-[#0A1422] border border-[#213F66] p-2 rounded transition-all duration-500 ease-out ${networkSummaryInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '500ms' }}>
                                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">CLEARED REFERENCES</span>
                                  <span className="text-xs font-mono font-black text-cyan-400">0</span>
                              
                                </div>
                              </div>
                              <div className={`mt-auto transition-opacity duration-700 ease-out ${networkSummaryInView ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '600ms' }}>
                                <h4 className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-2">NETWORK SECURITY ASSESSMENT</h4>
                                <div className="bg-[#0A1422] border-l-2 border-amber-500 p-3 rounded-r text-[10px] text-white font-mono leading-relaxed">
                                  No verified threat network association was identified. However, two security references require additional officer review to clear.
                                
                                </div>
                                <div className="mt-4 flex flex-col items-center justify-center p-4 bg-[#0A1422] border border-[#213F66] rounded">
                                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest text-center mb-1">NO VERIFIED THREAT NETWORK ASSOCIATION</p>
                                  <p className="text-[8px] font-mono text-emerald-500 uppercase text-center">NETWORK CROSS-REFERENCE COMPLETE</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col h-full animate-fade-in-right">
                              {/* Connection Detail Panel State */}
                              <div className="flex items-center justify-between mb-4 border-b border-[#213F66] pb-2">
                                <h3 className="text-[10px] uppercase tracking-widest font-bold text-blue-700 flex items-center">
                                  <svg className="w-3.5 h-3.5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  TACTICAL CONNECTION DETAIL
                                </h3>
                                <button onClick={() => setSelectedNetworkNode(null)} className="text-[9px] font-bold text-cyan-400 hover:text-white uppercase tracking-widest bg-[#0A1422] px-2 py-1 rounded">CLOSE</button>

                              </div>
                              {selectedNetworkNode === 'IDENTITY_REF' && (
                                <div className="flex-1 flex flex-col">
                                  <div className="mb-4">
                                    <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">CONNECTION TYPE</p>
                                    <p className="text-sm font-black text-blue-700 uppercase tracking-widest">IDENTITY REFERENCE</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">RELATIONSHIP STATUS</p>
                                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">UNDER REVIEW</p>
                                    </div>
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">CONFIDENCE LEVEL</p>
                                      <p className="text-[9px] font-black text-white uppercase tracking-widest">82%</p>
                                    </div>
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">FIRST OBSERVED</p>
                                      <p className="text-[9px] font-mono text-white">2024-06-12</p>
                                    </div>
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">DATA SOURCE</p>
                                      <p className="text-[9px] font-mono text-white">INTERPOL DB</p>

                                    </div>
                                  </div>
                                  <div className="mb-4">
                                    <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">WHY THIS CONNECTION WAS FLAGGED</p>
                                    <p className="text-[10px] text-white font-mono leading-relaxed bg-[#0A1422] p-2 rounded">
                                      This identity was referenced in a historical border screening record associated with another investigation.
                                    </p>

                                  </div>
                                  <div className="mb-4">
                                    <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">RECOMMENDED OFFICER ACTION</p>
                                    <p className="text-[10px] font-bold text-blue-600 leading-relaxed bg-[#0A1422] border-l-2 border-blue-300 p-2 rounded">
                                      Review supporting records before treating this reference as a confirmed security threat.
                                    </p>
                                  
                                  </div>
                                  <div className="mt-auto">
                                    <button 
                                      onClick={() => {
                                        setSelectedEvidenceFinding({
                                          id: 'NET-ID-8291',
                                          type: 'CRIMINAL_INTELLIGENCE',
                                          title: 'IDENTITY REFERENCE INQUIRY',
                                          priority: 'MEDIUM',
                                          timestamp: new Date().toISOString()
                                        });
                                        setShowEvidenceInvestigation(true);
                                      }}
                                      className="w-full bg-[#0A1422] hover:bg-[#14263D] text-white hover:text-white border border-[#213F66] font-bold text-[10px] py-3 px-4 rounded uppercase tracking-widest transition-colors flex items-center justify-center group-hover:border-slate-500"
                                    >
                                      <span>VIEW CONNECTION EVIDENCE &rarr;</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {selectedNetworkNode === 'INVESTIGATION_REF' && (
                                <div className="flex-1 flex flex-col">
                                  <div className="mb-4">
                                    <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">CONNECTION TYPE</p>
                                    <p className="text-sm font-black text-purple-400 uppercase tracking-widest">INVESTIGATION REFERENCE</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">RELATIONSHIP STATUS</p>
                                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">UNDER REVIEW</p>
                                    </div>
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">CONFIDENCE LEVEL</p>
                                      <p className="text-[9px] font-black text-white uppercase tracking-widest">75%</p>
                                    </div>
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">FIRST OBSERVED</p>
                                      <p className="text-[9px] font-mono text-white">2023-11-22</p>
                                    </div>
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">DATA SOURCE</p>
                                      <p className="text-[9px] font-mono text-white">REGIONAL TASKFORCE</p>

                                    </div>
                                  </div>
                                  <div className="mb-4">
                                    <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">WHY THIS CONNECTION WAS FLAGGED</p>
                                    <p className="text-[10px] text-white font-mono leading-relaxed bg-[#0A1422] p-2 rounded">
                                      Subject details appeared in secondary documentation seized during a prior regional security operation.
                                    </p>

                                  </div>
                                  <div className="mb-4">
                                    <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">RECOMMENDED OFFICER ACTION</p>
                                    <p className="text-[10px] font-bold text-blue-600 leading-relaxed bg-[#0A1422] border-l-2 border-blue-300 p-2 rounded">
                                      Verify if current travel intent aligns with historically noted operational profiles.
                                    </p>
                                  
                                  </div>
                                  <div className="mt-auto">
                                    <button 
                                      onClick={() => {
                                        setSelectedEvidenceFinding({
                                          id: 'NET-INV-4412',
                                          type: 'CRIMINAL_INTELLIGENCE',
                                          title: 'INVESTIGATION REFERENCE LOG',
                                          priority: 'LOW',
                                          timestamp: new Date().toISOString()
                                        });
                                        setShowEvidenceInvestigation(true);
                                      }}
                                      className="w-full bg-[#0A1422] hover:bg-[#14263D] text-white hover:text-white border border-[#213F66] font-bold text-[10px] py-3 px-4 rounded uppercase tracking-widest transition-colors flex items-center justify-center group-hover:border-slate-500"
                                    >
                                      <span>VIEW CONNECTION EVIDENCE &rarr;</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {selectedNetworkNode === 'TRAVEL_ASSOC' && (
                                <div className="flex-1 flex flex-col">
                                  <div className="mb-4">
                                    <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">CONNECTION TYPE</p>
                                    <p className="text-sm font-black text-cyan-400 uppercase tracking-widest">TRAVEL ASSOCIATION</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">RELATIONSHIP STATUS</p>
                                      <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">UNCONFIRMED</p>
                                    </div>
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">CONFIDENCE LEVEL</p>
                                      <p className="text-[9px] font-black text-white uppercase tracking-widest">42%</p>
                                    </div>
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">FIRST OBSERVED</p>
                                      <p className="text-[9px] font-mono text-white">2026-02-14</p>
                                    </div>
                                    <div className="bg-[#0A1422] p-2 rounded border border-[#213F66]">
                                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">DATA SOURCE</p>
                                      <p className="text-[9px] font-mono text-white">PASSENGER MANIFEST</p>

                                    </div>
                                  </div>
                                  <div className="mb-4">
                                    <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">WHY THIS CONNECTION WAS FLAGGED</p>
                                    <p className="text-[10px] text-white font-mono leading-relaxed bg-[#0A1422] p-2 rounded">
                                      Low-confidence co-traveler algorithmic match based on seating proximity on international flight.
                                    </p>

                                  </div>
                                  <div className="mb-4">
                                    <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">RECOMMENDED OFFICER ACTION</p>
                                    <p className="text-[10px] font-bold text-cyan-400 leading-relaxed bg-[#0A1422] border-l-2 border-[#213F66] p-2 rounded">
                                      No immediate action required. Routine association logging only.
                                    </p>
                                  
                                  </div>
                                  <div className="mt-auto">
                                    <button className="w-full bg-[#0A1422] text-cyan-400 border border-[#213F66] font-bold text-[10px] py-3 px-4 rounded uppercase tracking-widest cursor-not-allowed">
                                      <span>NO EVIDENCE AVAILABLE</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                      {/* Intelligence Association Timeline */}
                      <div ref={networkTimelineRef} className="border-t border-[#213F66] pt-5">
                        <h3 className={`text-[10px] uppercase tracking-widest font-bold text-cyan-400 mb-4 flex items-center transition-all duration-700 ease-out ${networkTimelineInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                          <svg className="w-3.5 h-3.5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          INTELLIGENCE ASSOCIATION TIMELINE
                        </h3>
                        
                        <div className="space-y-3">
                          <div className={`bg-[#0F1E2C]/80 border-l-2 border-blue-300 p-3 rounded flex flex-col md:flex-row md:items-start gap-4 hover:bg-[#0A1422] transition-all duration-700 ease-out cursor-pointer group ${networkTimelineInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
                            <div className="shrink-0 w-24">
                              <span className="text-[9px] font-mono text-cyan-400 bg-[#0A1422] px-2 py-1 rounded border border-[#213F66] group-hover:border-[#213F66]">2024-06-12</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                                <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">IDENTITY REFERENCE DETECTED</h4>
                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded self-start">UNDER REVIEW</span>
                              </div>
                              <div className="flex gap-4 mb-2">
                                <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">SOURCE: <span className="font-mono text-cyan-400">INTERPOL DB</span></p>
                              </div>
                              <p className="text-[9px] font-mono text-white bg-[#0A1422] p-2 rounded">
                                A reference associated with the current identity requires verification. Historical record check pending.
                              </p>

                            </div>
                          </div>
                          <div className={`bg-[#0F1E2C]/80 border-l-2 border-purple-500 p-3 rounded flex flex-col md:flex-row md:items-start gap-4 hover:bg-[#0A1422] transition-all duration-700 ease-out cursor-pointer group ${networkTimelineInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
                            <div className="shrink-0 w-24">
                              <span className="text-[9px] font-mono text-cyan-400 bg-[#0A1422] px-2 py-1 rounded border border-[#213F66] group-hover:border-[#213F66]">2023-11-22</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                                <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">INVESTIGATION DATA LOGGED</h4>
                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded self-start">UNDER REVIEW</span>
                              </div>
                              <div className="flex gap-4 mb-2">
                                <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">SOURCE: <span className="font-mono text-cyan-400">REGIONAL TASKFORCE</span></p>
                              </div>
                              <p className="text-[9px] font-mono text-white bg-[#0A1422] p-2 rounded">
                                Subject identity metrics logged in peripheral documentation during a secondary inspection event.
                              </p>


                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* =========================================================================
                        SECTION: MULTI-FACTOR SECURITY RISK ASSESSMENT
                    ========================================================================= */}
                    <div ref={riskRef} className={`bg-[#0A1422]  border-t-4 border-t-red-600 border border-[#213F66] rounded-xl p-6 flex flex-col shadow-sm mt-4 mb-4 transition-all duration-700 ease-out relative overflow-hidden ${riskInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      {/* Background scanning effect */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(239,68,68,0.05)_50%,transparent_100%)] bg-[length:100%_4px] opacity-20 pointer-events-none"></div>
                      
                      <div className={`border-b border-[#213F66] pb-4 mb-6 transition-all duration-700 ease-out ${riskInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '100ms' }}>
                        <h2 className="uppercase tracking-widest text-lg font-black text-white flex items-center">
                          <svg className="w-5 h-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          MULTI-FACTOR SECURITY RISK ASSESSMENT
                        </h2>
                        <p className="text-[10px] font-bold text-cyan-400 mt-1 uppercase tracking-widest">AI-GENERATED THREAT MODEL AND INTELLIGENCE FACTOR ANALYSIS</p>

                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Overall Risk Command Panel */}
                        <div className={`xl:col-span-1 bg-[#0A1422]/40 border border-[#213F66] rounded-lg p-6 flex flex-col justify-center items-center text-center relative overflow-hidden transition-all duration-700 ease-out ${riskInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '200ms' }}>
                          <div className={`absolute top-0 w-full h-1 ${riskAssessment.overallRiskLevel === 'CRITICAL' || riskAssessment.overallRiskLevel === 'HIGH' ? 'bg-red-600' : riskAssessment.overallRiskLevel === 'MEDIUM' ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                          <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-2">OVERALL SECURITY RISK</p>
                          <h3 className={`text-3xl font-black uppercase tracking-widest mb-4 ${riskAssessment.overallRiskLevel === 'CRITICAL' ? 'text-red-600 ' : riskAssessment.overallRiskLevel === 'HIGH' ? 'text-red-500' : riskAssessment.overallRiskLevel === 'MEDIUM' ? 'text-orange-500' : 'text-emerald-500'}`}>
                            {riskAssessment.overallRiskLevel}
                          </h3>
                          
                          <div className="flex items-end justify-center mb-6">
                            <span className="text-[10px] text-cyan-400 uppercase tracking-widest mr-3 mb-2 font-bold">RISK SCORE</span>
                            <span className="text-5xl font-black text-white font-mono tracking-tighter leading-none">{riskAssessment.overallRiskScore}</span>
                            <span className="text-xl font-bold text-blue-400 font-mono leading-none ml-1">/100</span>

                          </div>
                          <div className="w-full grid grid-cols-2 gap-4 border-t border-[#213F66] pt-4">
                            <div>
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">ASSESSMENT CONFIDENCE</p>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${riskAssessment.confidence === 'HIGH' ? 'text-emerald-400' : 'text-orange-400'}`}>
                                {riskAssessment.confidence}
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">ANALYSIS STATUS</p>
                              <p className="text-[10px] font-black text-white uppercase tracking-widest">
                                {riskAssessment.overallRiskLevel === 'LOW' ? 'COMPLETE' : 'REQUIRES REVIEW'}
                              </p>

                            </div>
                          </div>
                        </div>
                        {/* Visual Risk Matrix */}
                        <div className={`xl:col-span-2 flex flex-col transition-all duration-700 ease-out ${riskInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: '300ms' }}>
                          <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3">VISUAL RISK MATRIX</h3>
                          <div className="bg-[#0F1E2C]/50 rounded-lg border border-[#213F66] overflow-hidden flex-1">
                            <div className="grid grid-cols-12 bg-[#0A1422] border-b border-[#213F66] p-3">
                              <div className="col-span-6 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">FACTOR</div>
                              <div className="col-span-3 text-[9px] font-bold text-cyan-400 uppercase tracking-widest text-center">STATUS</div>
                              <div className="col-span-3 text-[9px] font-bold text-cyan-400 uppercase tracking-widest text-right">IMPACT</div>
                            </div>
                            <div className="divide-y divide-slate-800/50">
                              {riskAssessment.factors.map((factor, idx) => (
                                <div key={idx} className="grid grid-cols-12 p-3 items-center hover:bg-[#0A1422] transition-colors">
                                  <div className="col-span-6 text-xs font-bold text-white uppercase tracking-widest truncate pr-2">{factor.name}</div>
                                  <div className="col-span-3 text-center">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${factor.status === 'VERIFIED' || factor.status === 'CLEAR' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-300' : factor.status === 'REVIEW' || factor.status === 'SUSPICIOUS' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-red-500/10 text-red-400 border border-red-300'}`}>
                                      {factor.status}
                                    </span>
                                  </div>
                                  <div className="col-span-3 text-right">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${factor.impact === 'LOW' ? 'text-emerald-500' : factor.impact === 'MEDIUM' ? 'text-orange-500' : 'text-red-500'}`}>
                                      {factor.impact}
                                    </span>
                                  </div>
                                </div>
                              ))}

                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Risk Explanation */}
                        <div className={`bg-[#0A1422]/30 border border-[#213F66] rounded-lg p-5 flex flex-col transition-all duration-700 ease-out ${riskInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
                          <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center">
                            <svg className="w-3.5 h-3.5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            WHY THIS RISK LEVEL WAS ASSIGNED
                          </h3>
                          <p className="text-xs text-white font-mono leading-relaxed bg-[#0A1422] p-4 rounded border border-[#213F66]/80 flex-1">
                            {riskAssessment.overallRiskLevel === 'CRITICAL' || riskAssessment.overallRiskLevel === 'HIGH' ? (
                              <>The overall risk assessment was elevated primarily because <span className="text-red-400 font-bold">{riskAssessment.topContributors[0]?.contributionDesc.toLowerCase()}</span><br/><br/>Additional risk multipliers identified: <span className="text-orange-400 font-bold">{riskAssessment.topContributors[1]?.contributionDesc.toLowerCase()}</span></>
                            ) : riskAssessment.overallRiskLevel === 'MEDIUM' ? (
                              <>The overall risk assessment indicates a moderate threat. The primary concern is that <span className="text-orange-400 font-bold">{riskAssessment.topContributors[0]?.contributionDesc.toLowerCase()}</span><br/><br/>Other document and intelligence checks did not independently confirm a high-priority security threat.</>
                            ) : (
                              <>The overall risk assessment is low. All primary security checkpoints, including biometric verification and document integrity analysis, passed successfully with no significant anomalies detected.</>
                            )}
                          </p>

                          {riskAssessment.confidence === 'LIMITED' && (
                            <div className="mt-4 bg-orange-950/30 border border-orange-500/30 rounded p-3 flex items-start">
                              <svg className="w-4 h-4 text-orange-500 mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              <div>
                                <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-1">LIMITED RELIABILITY</p>
                                <p className="text-[10px] text-white">{riskAssessment.confidenceReason}</p>
                              </div>
                            </div>
                          )}

                        </div>
                        {/* Top Contributing Factors */}
                        <div className={`flex flex-col transition-all duration-700 ease-out ${riskInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
                          <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3">TOP CONTRIBUTING FACTORS</h3>
                          <div className="space-y-3 flex-1 flex flex-col justify-center">
                            {riskAssessment.topContributors.map((factor, idx) => (
                              <button 
                                key={idx}
                                onClick={() => {
                                  let type = 'DOCUMENT_TAMPERING';
                                  if (factor.id.includes('biometric')) type = 'BIOMETRIC_MISMATCH';
                                  if (factor.id.includes('criminal')) type = 'CRIMINAL_INTELLIGENCE';
                                  setSelectedEvidenceFinding({
                                    id: factor.id,
                                    type: type,
                                    title: factor.name,
                                    priority: factor.riskLevel,
                                    timestamp: new Date().toISOString()
                                  });
                                  setShowEvidenceInvestigation(true);
                                }}
                                className={`w-full bg-[#0A1422] border border-[#213F66] rounded p-4 text-left transition-all hover:bg-[#0A1422] flex items-center justify-between group ${factor.riskLevel === 'CRITICAL' ? 'hover:border-red-300' : factor.riskLevel === 'HIGH' ? 'hover:border-red-300' : factor.riskLevel === 'MEDIUM' ? 'hover:border-orange-500/50' : 'hover:border-emerald-300'}`}
                              >
                                <div className="flex items-center">
                                  <span className={`text-2xl font-black font-mono mr-4 opacity-30 ${factor.riskLevel === 'CRITICAL' || factor.riskLevel === 'HIGH' ? 'text-red-500' : factor.riskLevel === 'MEDIUM' ? 'text-orange-500' : 'text-cyan-400'}`}>0{idx + 1}</span>
                                  <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{factor.name}</p>
                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${factor.riskLevel === 'CRITICAL' || factor.riskLevel === 'HIGH' ? 'text-red-500' : factor.riskLevel === 'MEDIUM' ? 'text-orange-500' : 'text-cyan-400'}`}>{factor.impact} IMPACT</p>
                                  </div>
                                </div>
                                <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                  <span className="text-[9px] font-bold uppercase tracking-widest mr-2">VIEW EVIDENCE</span>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </div>
                              </button>
                            ))}

                          </div>
                        </div>
                      </div>
                      {/* Human Review Notice */}
                      <div className={`mt-6 pt-4 border-t border-[#213F66] flex items-start transition-all duration-700 ease-out ${riskInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '600ms' }}>
                        <svg className="w-5 h-5 text-cyan-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <div>
                          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">OFFICER REVIEW REQUIRED</p>
                          <p className="text-[10px] text-cyan-400 font-mono">The risk score is an AI-assisted assessment based on the available evidence. It is intended to support officer review and does not independently determine the final border decision.</p>

                        </div>
                      </div>
                    </div>
                    {/* Criminal Intelligence Assessment */}
                    <div ref={criminalRef} className={`surface-tech tech-panel p-6 flex flex-col mt-4 transition-all duration-700 ease-out ${criminalInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      {/* HEADER */}
                      <div className={`border-b border-[#213F66] pb-5 mb-6 transition-all duration-700 ease-out ${criminalInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '100ms' }}>
                        <h2 className="uppercase tracking-widest text-lg font-black text-white flex items-center">
                          <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                          CRIMINAL INTELLIGENCE ASSESSMENT
                        </h2>
                        <p className="text-[10px] font-bold text-cyan-400 mt-1 uppercase tracking-widest">MULTI-SOURCE SECURITY DATABASE CROSS-REFERENCE</p>
                        
                        <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 "></span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">DATABASE SCAN STATUS: COMPLETE</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {['CRIMINAL DATABASE', 'BORDER SECURITY RECORDS', 'WATCHLIST INTELLIGENCE', 'SECURITY INCIDENT DATABASE'].map(src => (
                              <span key={src} className="bg-[#0A1422] border border-[#213F66]/50 text-cyan-400 text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest flex items-center">
                                <svg className="w-2.5 h-2.5 text-emerald-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                {src}
                              </span>
                            ))}

                          </div>
                        </div>
                      </div>
                      {/* PRIMARY INTELLIGENCE SUMMARY */}
                      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 transition-all duration-700 ease-out ${criminalInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '200ms' }}>
                        <div className="bg-[#0F1E2C]/60 border border-[#213F66] rounded-lg p-4 flex flex-col justify-center items-center text-center">
                          <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">MATCH STATUS</p>
                          <p className="text-sm font-black text-amber-500 uppercase tracking-widest">POTENTIAL MATCH</p>
                        </div>
                        <div className="bg-[#0F1E2C]/60 border border-[#213F66] rounded-lg p-4 flex flex-col justify-center items-center text-center">
                          <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">RECORD RISK LEVEL</p>
                          <p className="text-sm font-black text-amber-500 uppercase tracking-widest">MEDIUM</p>
                        </div>
                        <div className="bg-[#0F1E2C]/60 border border-[#213F66] rounded-lg p-4 flex flex-col justify-center items-center text-center">
                          <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">MATCH CONFIDENCE</p>
                          <div className="flex items-center w-full max-w-[120px] mt-1">
                            <div className="flex-1 bg-[#0A1422] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full w-[65%]"></div>
                            </div>
                            <span className="text-[10px] font-mono text-white ml-3">65%</span>

                          </div>
                        </div>
                      </div>
                      {/* SUBJECT CROSS-REFERENCE PANEL */}
                      <div className={`bg-[#0F1E2C]/40 border border-[#213F66] rounded-lg p-5 flex flex-col md:flex-row gap-6 mb-6 transition-all duration-700 ease-out ${criminalInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '300ms' }}>
                        <div className="w-24 shrink-0 flex flex-col items-center relative">
                          <div className="w-24 h-32 bg-[#0A1422] border border-blue-300 rounded overflow-hidden relative group">
                             {/* Scanning animation overlay */}
                             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMGwwIDIwTTIwIDFMMCAxIiBzdHJva2U9InJnYmEoMzAsIDQxLCA1OSwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] z-10 pointer-events-none"></div>
                             <div className="absolute top-0 w-full h-0.5 bg-cyan-500/50 shadow-sm  z-20 pointer-events-none"></div>
                             {finalSubjectPortrait?.imageData ? (
                               <img src={finalSubjectPortrait.imageData} alt="Subject" className="w-full h-full object-cover grayscale opacity-80" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-[8px] text-blue-400">NO IMG</div>
                             )}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3 border-b border-[#213F66] pb-1">IDENTITY CROSS-REFERENCE</h3>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4 mb-4">
                            <div>
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">FULL NAME</p>
                              <p className="text-[10px] font-mono text-white truncate">{analysisResult?.nameExtracted}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">DOCUMENT ID</p>
                              <p className="text-[10px] font-mono text-white">{analysisResult?.documentNumber}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">NATIONALITY</p>
                              <p className="text-[10px] font-mono text-white">{analysisResult?.nationality}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">DATE OF BIRTH</p>
                              <p className="text-[10px] font-mono text-white">{analysisResult?.dateOfBirth}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">DOCUMENT TYPE</p>
                              <p className="text-[10px] font-mono text-white truncate">{analysisResult?.documentType}</p>
                            </div>
                          </div>
                          <div className="bg-amber-950/30 border-l-2 border-amber-500 p-2 rounded-r">
                            <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">DATABASE MATCH STATUS</p>
                            <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest">POTENTIAL INTELLIGENCE REFERENCE - VERIFICATION REQUIRED</p>

                          </div>
                        </div>
                      </div>
                      {/* INTELLIGENCE FINDINGS */}
                      <div className={`mb-6 transition-all duration-700 ease-out ${criminalInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '400ms' }}>
                        <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center">
                          <svg className="w-3 h-3 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          INTELLIGENCE FINDINGS
                        </h3>
                        <div className="bg-[#0F1E2C]/60 border border-[#213F66] rounded-lg p-5 shadow-sm">
                          <div className="flex justify-between items-start border-b border-[#213F66] pb-3 mb-4">
                            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">IDENTITY REFERENCE REQUIRES REVIEW</h4>
                            <span className="bg-amber-50 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">UNCONFIRMED</span>
                          
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div>
                              <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">WHAT WAS FOUND</p>
                              <p className="text-[10px] text-white leading-relaxed font-mono">A potential identity reference was detected during the security database cross-reference.</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">SOURCE</p>
                              <p className="text-[10px] text-white font-mono">Border Security Records</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">WHY IT MATTERS</p>
                              <p className="text-[10px] text-white leading-relaxed font-mono">The available information is not sufficient to confirm whether the reference belongs to the current subject. This reference has not been confirmed as belonging to the current subject.</p>
                          
                            </div>
                          </div>
                          <div className="bg-[#0A1422] border-l-2 border-blue-300 p-3 rounded-r">
                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">RECOMMENDED OFFICER ACTION</p>
                            <p className="text-[10px] font-bold text-white">Review supporting identity information before treating the reference as a confirmed criminal record.</p>

                          </div>
                        </div>
                      </div>
                      {/* INTELLIGENCE TIMELINE & TACTICAL ASSESSMENT GRID */}
                      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 ease-out ${criminalInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '500ms' }}>
                        {/* Left: Timeline */}
                        <div>
                          <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center">
                            <svg className="w-3 h-3 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            INTELLIGENCE TIMELINE
                          </h3>
                          <div className="relative border-l border-[#213F66] ml-2 space-y-6">
                            {/* Timeline Item 1 */}
                            <div className="relative pl-6 group">
                              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></div>
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">TODAY - 08:42:15Z</p>
                              <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">DATABASE CROSS-REFERENCE COMPLETED</p>
                              <p className="text-[9px] text-cyan-400 font-mono mb-2">SOURCE: Security Intelligence Database</p>
                              <div className="bg-[#0F1E2C]/50 border border-[#213F66] p-2 rounded text-[9px] text-white font-mono">
                                No confirmed criminal intelligence record was identified for the current subject.
                            
                              </div>
                            </div>
                            {/* Timeline Item 2 */}
                            <div className="relative pl-6 group">
                              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-amber-500 shadow-sm"></div>
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">TODAY - 08:42:16Z</p>
                              <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">POTENTIAL ALIAS FLAG GENERATED</p>
                              <p className="text-[9px] text-cyan-400 font-mono mb-2">SOURCE: Border Security Records</p>
                              <div className="bg-[#0F1E2C]/50 border border-[#213F66] p-2 rounded text-[9px] text-white font-mono">
                                Historical matching algorithm detected partial phonetic overlap with an unconfirmed record. Review required.

                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Right: Tactical Assessment */}
                        <div>
                          <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center">
                            <svg className="w-3 h-3 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            CRIMINAL RISK BREAKDOWN
                          </h3>
                          <div className="bg-[#0F1E2C]/60 border border-[#213F66] rounded-lg p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center border-b border-[#213F66] pb-2">
                              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">IDENTITY RECORD RISK</span>
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">MEDIUM</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#213F66] pb-2">
                              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">DOCUMENT ASSOCIATION RISK</span>
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">LOW</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#213F66] pb-2">
                              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">WATCHLIST REFERENCE RISK</span>
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">LOW</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#213F66] pb-2">
                              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">BIOMETRIC DISCREPANCY IMPACT</span>
                              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">HIGH</span>
                            
                            </div>
                            <div className="mt-2 bg-[#0A1422] border-l-2 border-slate-500 p-2">
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">OVERALL INTELLIGENCE ASSESSMENT</p>
                              <p className="text-[9px] text-white font-mono">No verified criminal intelligence record was identified. However, biometric verification requires additional review before clearance.</p>


                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* =========================================================================
                      RIGHT COLUMN: AI SECURITY RECOMMENDATION
                  ========================================================================= */}
                  <div ref={recommendationRef} className={`bg-[#0A1422]  border border-[#213F66] rounded-xl p-5 flex flex-col shadow-sm sticky top-4 h-fit transition-all duration-700 ease-out ${recommendationInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    
                    {/* Header */}
                    <div className={`border-b border-[#213F66] pb-3 mb-5 transition-all duration-700 ease-out ${recommendationInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: '100ms' }}>
                      <h2 className="uppercase tracking-widest text-[10px] font-black text-white flex items-center">
                        <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        AI SECURITY RECOMMENDATION
                      </h2>

                    </div>
                    {/* Final Recommendation Result */}
                    <div className={`mb-5 text-center p-4 rounded-lg border bg-[#0A1422]/40 ${riskAssessment.overallRiskLevel === 'CRITICAL' || riskAssessment.overallRiskLevel === 'HIGH' ? 'border-red-300' : riskAssessment.overallRiskLevel === 'MEDIUM' ? 'border-orange-500/50' : 'border-emerald-300'} transition-all duration-700 ease-out ${recommendationInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '200ms' }}>
                      <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2">COMPUTED ACTION</p>
                      <h3 className={`text-sm font-black uppercase tracking-widest ${riskAssessment.overallRiskLevel === 'CRITICAL' || riskAssessment.overallRiskLevel === 'HIGH' ? 'text-red-500' : riskAssessment.overallRiskLevel === 'MEDIUM' ? 'text-orange-500' : 'text-emerald-500'}`}>
                        {riskAssessment.aiRecTitle}
                      </h3>

                    </div>
                    {/* Reasoning Breakdown */}
                    <div className={`space-y-4 mb-6 transition-all duration-700 ease-out ${recommendationInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '300ms' }}>
                      <div>
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">PRIMARY DRIVER</p>
                        <p className={`text-[10px] font-mono p-2 rounded bg-[#0A1422] border-l-2 ${riskAssessment.overallRiskLevel === 'CRITICAL' || riskAssessment.overallRiskLevel === 'HIGH' ? 'border-red-300 text-white' : riskAssessment.overallRiskLevel === 'MEDIUM' ? 'border-orange-500 text-white' : 'border-emerald-300 text-white'}`}>
                          {riskAssessment.primaryFactor}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">SECONDARY FACTOR</p>
                        <p className="text-[10px] text-cyan-400 font-mono p-2 rounded bg-[#0A1422] border-l-2 border-[#213F66]">
                          {riskAssessment.secondaryFactor}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">MITIGATING EVIDENCE</p>
                        <p className="text-[10px] text-cyan-400 font-mono p-2 rounded bg-[#0A1422] border-l-2 border-[#213F66]">
                          {riskAssessment.mitigatingFactor}
                        </p>

                      </div>
                    </div>
                    {/* Recommended Next Steps */}
                    <div className={`mb-6 flex-1 transition-all duration-700 ease-out ${recommendationInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '400ms' }}>
                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-2 border-b border-[#213F66] pb-1">TACTICAL ACTION STEPS</p>
                      <ul className="space-y-2">
                        {(riskAssessment.overallRiskLevel === 'CRITICAL' || riskAssessment.overallRiskLevel === 'HIGH') ? (
                          <>
                            <li className="flex items-start">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-1 shrink-0"></span>
                              <span className="text-[10px] text-white">Escalate subject for secondary physical inspection immediately.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-1 shrink-0"></span>
                              <span className="text-[10px] text-white">Restrict border clearance logic until cleared by supervisor.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-1 shrink-0"></span>
                              <span className="text-[10px] text-white">Notify connected international law enforcement agencies regarding Alias identification.</span>
                            </li>
                          </>
                        ) : riskAssessment.overallRiskLevel === 'MEDIUM' ? (
                          <>
                            <li className="flex items-start">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 mt-1 shrink-0"></span>
                              <span className="text-[10px] text-white">Request secondary identification from subject to verify alias.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 mt-1 shrink-0"></span>
                              <span className="text-[10px] text-white">Cross-reference verbal testimony with document findings.</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 mt-1 shrink-0"></span>
                              <span className="text-[10px] text-white">Standard entry clearance protocols may proceed.</span>
                            </li>
                          </>
                        )}
                      </ul>

                    </div>
                    {/* AI vs Human Decision Flow */}
                    <div className={`mt-auto bg-[#0F1E2C]/50 border border-[#213F66] rounded p-3 transition-all duration-700 ease-out ${recommendationInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '500ms' }}>
                      <div className="flex items-center justify-between text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-2">
                        <span>AI ANALYSIS</span>
                        <span>HUMAN DECISION</span>
                      </div>
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#0A1422] -translate-y-1/2 z-0"></div>
                        <div className="w-4 h-4 rounded-full bg-cyan-500 border-2 border-slate-900 z-10 flex items-center justify-center shadow-sm">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-slate-900 z-10  border border-slate-500"></div>
                      </div>
                      <div className="text-center mt-3">
                        <p className="text-[9px] text-cyan-400 font-mono">Proceed to Final Decision Panel to record officer judgement.</p>
                      
                      </div>
                      <div className="mt-3">
                        <button 
                          onClick={() => {
                            document.getElementById('final-decision-panel')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold text-[9px] py-2 rounded uppercase tracking-widest transition-colors border border-blue-500/30 flex items-center justify-center"
                        >
                          PROCEED TO FINAL DECISION &rarr;
                        </button>

                      </div>
                    </div>
                  </div>
                </div>
                {/* =========================================================================
                    FINAL ENTRY DECISION PANEL (MOVED TO TAB 2)
                ========================================================================= */}
                <div ref={decisionRef} className={`bg-[#0A1422] border-2 border-[#213F66] rounded-lg p-6 shadow-sm mt-4 w-full shrink-0 transition-all duration-700 ease-out ${decisionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} id="final-decision-panel">
                  <div className={`flex flex-col mb-6 transition-all duration-700 ease-out ${decisionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
                    <h2 className="text-xl font-black text-cyan-100 uppercase tracking-widest border-b-4 border-slate-900 pb-2 mb-2">Final Border Entry Decision</h2>
                    <p className="text-sm font-bold text-cyan-400 mb-4">Review complete intelligence and security analysis before confirming a decision.</p>

                  </div>
                  {caseStatus === 'AWAITING_DECISION' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Clear */}
                      <button onClick={() => { setPendingDecision('CLEARED'); setShowDecisionModal(true); }} className={`flex flex-col items-center justify-center border-2 border-emerald-300 hover:bg-emerald-50 bg-[#0A1422] p-6 rounded-lg shadow-sm group transition-all duration-700 ease-out ${decisionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                        <svg className="w-10 h-10 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-black text-emerald-700 text-lg uppercase tracking-wider mb-1">âœ“ CLEAR ENTRY</span>
                        <span className="text-xs text-cyan-400 font-bold text-center">Subject cleared.<br/>Border entry approved.</span>
                      </button>
                      {/* Pending */}
                      <button onClick={() => { setPendingDecision('PENDING_REVIEW'); setShowDecisionModal(true); }} className={`flex flex-col items-center justify-center border-2 border-amber-500 hover:bg-amber-50 bg-[#0A1422] p-6 rounded-lg shadow-sm group transition-all duration-700 ease-out ${decisionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '350ms' }}>
                        <svg className="w-10 h-10 text-amber-500 mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-black text-amber-700 text-lg uppercase tracking-wider mb-1">â³ PENDING REVIEW</span>
                        <span className="text-xs text-cyan-400 font-bold text-center">Additional investigation required.<br/>Decision remains under review.</span>
                      </button>
                      {/* Reject */}
                      <button onClick={() => { setPendingDecision('REJECTED'); setShowDecisionModal(true); }} className={`flex flex-col items-center justify-center border-2 border-red-600 hover:bg-red-50 bg-[#0A1422] p-6 rounded-lg shadow-sm group transition-all duration-700 ease-out ${decisionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '500ms' }}>
                        <svg className="w-10 h-10 text-red-600 mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-black text-red-700 text-lg uppercase tracking-wider mb-1">âœ• REJECT ENTRY</span>
                        <span className="text-xs text-cyan-400 font-bold text-center">Security risk confirmed.<br/>Border entry denied.</span>
                      </button>
                    </div>
                  ) : (
                    <div className={`p-6 border-l-8 flex flex-col md:flex-row items-center justify-between rounded bg-[#0F1E2C] shadow-sm
                      ${caseStatus === 'CLEARED' ? 'border-emerald-300' : caseStatus === 'PENDING_REVIEW' ? 'border-amber-500' : 'border-red-600'}`}>
                      <div>
                        <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Final Status</h3>
                        {caseStatus === 'CLEARED' && <p className="text-2xl font-black text-emerald-700 uppercase tracking-widest">âœ“ CLEARED â€” ENTRY APPROVED</p>}
                        {caseStatus === 'PENDING_REVIEW' && <p className="text-2xl font-black text-amber-700 uppercase tracking-widest">â³ PENDING REVIEW â€” ADDITIONAL INVESTIGATION REQUIRED</p>}
                        {caseStatus === 'REJECTED' && <p className="text-2xl font-black text-red-700 uppercase tracking-widest">âœ• REJECTED â€” ENTRY DENIED</p>}
                      </div>
                      <div className="text-right mt-4 md:mt-0 flex flex-col items-end">
                        <button 
                          onClick={() => {
                            if (IS_DEV_MODE && finalSubjectPortrait) {
                              console.log(`\nPDF PORTRAIT SOURCE:\n[exact selectedCandidateId: ${finalSubjectPortrait.method}]\n`);
                            }
                            setShowReportModal(true);
                          }}
                          className="bg-blue-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-800 transition shadow-md flex items-center uppercase tracking-widest text-xs"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          GENERATE FINAL BORDER SECURITY REPORT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 bg-[#0A1422]  rounded-xl border border-[#213F66] text-center shadow-xl mt-10 max-w-3xl mx-auto flex-1">
                <svg className="w-16 h-16 text-blue-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-widest mb-4">No Active Intelligence Profile</h2>
                <p className="text-cyan-400 mb-8 font-mono text-xs max-w-md mx-auto leading-relaxed">Please return to the live scanner and execute a biometric document analysis to populate this intelligence dossier.</p>
                <button onClick={() => setActiveTab('scanner')} className="px-8 py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs rounded border border-blue-300 shadow-lg shadow-cyan-500/20 uppercase tracking-widest transition-all">INITIALIZE SCANNER</button>
              </div>
            )}
          </div>
        )}

        