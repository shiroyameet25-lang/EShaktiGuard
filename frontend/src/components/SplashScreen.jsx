import React, { useEffect, useState } from 'react';
import { Shield, Target, Crosshair } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [stage, setStage] = useState('booting'); 
  // Stages: booting -> glitch -> zoom -> complete
  
  const [terminalText, setTerminalText] = useState('');
  const fullText = "> SYSTEM INITIALIZING...\n> SYNCING NEURAL NET...\n> BIOMETRICS ONLINE...\n> SECURE DATABASE LINKED...\n> THREAT ENGINE READY...\n> ACCESS GRANTED_";

  const [telemetry, setTelemetry] = useState({
    network: false,
    ai: false,
    biometric: false,
    database: false
  });

  useEffect(() => {
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      setTerminalText(fullText.slice(0, charIndex));
      charIndex++;
      if (charIndex > fullText.length) clearInterval(typeInterval);
    }, 20);

    const timers = [];
    timers.push(setTimeout(() => setTelemetry(prev => ({...prev, network: true})), 800));
    timers.push(setTimeout(() => setTelemetry(prev => ({...prev, ai: true})), 1600));
    timers.push(setTimeout(() => setTelemetry(prev => ({...prev, biometric: true})), 2200));
    timers.push(setTimeout(() => setTelemetry(prev => ({...prev, database: true})), 2800));
    
    timers.push(setTimeout(() => setStage('glitch'), 3200));
    timers.push(setTimeout(() => setStage('zoom'), 3600));
    timers.push(setTimeout(() => onComplete(), 4600));
    
    return () => {
      clearInterval(typeInterval);
      timers.forEach(clearTimeout);
    };
  }, [onComplete, fullText]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-opacity duration-[1000ms] ease-in-out pointer-events-none ${
        stage === 'zoom' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ perspective: '1000px' }}
    >
      {/* Background Animated Effects (Scanning Sweep & Data Pulses) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.02)_10%,transparent_20%)] animate-[scan-sweep_4s_linear_infinite]"></div>
        
        {/* Subtle Node Pulses */}
        <div className="absolute top-[35%] left-[25%] w-1 h-1 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee] opacity-40"></div>
        <div className="absolute bottom-[40%] right-[30%] w-1.5 h-1.5 bg-blue-400 rounded-full animate-[pulse_3s_ease-in-out_infinite] shadow-[0_0_6px_#60a5fa] opacity-30"></div>
        <div className="absolute top-[60%] left-[65%] w-1 h-1 bg-cyan-300 rounded-full animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_#67e8f9] opacity-20"></div>
        
        {/* Faint Moving Network Connection Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
           <path d="M 25% 35% L 65% 60%" fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="2 15" className="animate-[dash-travel_10s_linear_infinite]" />
           <path d="M 70% 25% L 30% 60%" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="3 20" className="animate-[dash-travel_8s_linear_infinite] reverse" />
        </svg>
      </div>

      {/* Edge Details: Security HUD */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-40">
        {/* Corner Indicators */}
        <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-cyan-500/40"></div>
        <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-cyan-500/40"></div>
        <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-cyan-500/40"></div>
        <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-cyan-500/40"></div>
        
        {/* Minimal Data Markers */}
        <div className="absolute top-8 left-20 text-[7px] font-mono text-cyan-500/50 tracking-[0.2em]">SYS.LOC: 42.98.N 77.21.W</div>
        <div className="absolute bottom-8 right-20 text-[7px] font-mono text-cyan-500/50 tracking-[0.2em]">OP_CODE: OMEGA_PROTOCOL</div>
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 flex flex-col space-y-1 opacity-30">
          <div className="w-1 h-4 bg-cyan-500"></div>
          <div className="w-1 h-2 bg-cyan-500"></div>
          <div className="w-1 h-6 bg-cyan-500"></div>
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col space-y-1 opacity-30">
          <div className="w-1 h-2 bg-blue-500"></div>
          <div className="w-1 h-8 bg-blue-500"></div>
          <div className="w-1 h-3 bg-blue-500"></div>
        </div>
      </div>

      {/* Top Center: System Classification */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20 opacity-40">
        <div className="text-[9px] font-black tracking-[0.4em] text-cyan-400 mb-1">NATIONAL BORDER SECURITY NETWORK</div>
        <div className="text-[7px] font-mono tracking-widest text-blue-300">SECURE COMMAND ENVIRONMENT</div>
      </div>

      {/* Bottom Right: Live System Telemetry */}
      <div className="absolute bottom-10 right-10 z-20 flex flex-col space-y-2 opacity-50">
        <div className="flex justify-between items-center w-48 text-[8px] font-mono tracking-widest transition-opacity duration-500" style={{ opacity: telemetry.network ? 1 : 0 }}>
          <span className="text-cyan-500/70">NETWORK STATUS</span>
          <span className="text-blue-400 font-bold">SECURE</span>
        </div>
        <div className="flex justify-between items-center w-48 text-[8px] font-mono tracking-widest transition-opacity duration-500" style={{ opacity: telemetry.ai ? 1 : 0 }}>
          <span className="text-cyan-500/70">AI CORE</span>
          <span className="text-blue-400 font-bold">ONLINE</span>
        </div>
        <div className="flex justify-between items-center w-48 text-[8px] font-mono tracking-widest transition-opacity duration-500" style={{ opacity: telemetry.biometric ? 1 : 0 }}>
          <span className="text-cyan-500/70">BIOMETRIC ENGINE</span>
          <span className="text-blue-400 font-bold">READY</span>
        </div>
        <div className="flex justify-between items-center w-48 text-[8px] font-mono tracking-widest transition-opacity duration-500" style={{ opacity: telemetry.database ? 1 : 0 }}>
          <span className="text-cyan-500/70">DATABASE</span>
          <span className="text-blue-400 font-bold">SYNCED</span>
        </div>
      </div>

      {/* Terminal HUD Overlay (Bottom Left) */}
      <div className="absolute bottom-10 left-10 w-96 text-cyan-400 font-mono text-[9px] tracking-[0.15em] leading-relaxed whitespace-pre-wrap drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] z-20 opacity-70">
        {terminalText}
        <span className="animate-pulse">_</span>
      </div>

      {/* Central Logo (Glitch & Zoom) */}
      <div 
        className="relative flex items-center justify-center transition-opacity duration-300 z-30"
        style={{ 
          transformStyle: 'preserve-3d',
          animation: stage === 'glitch' ? 'cyber-glitch 0.4s infinite' : stage === 'zoom' ? 'infinity-zoom 1s cubic-bezier(0.8, 0, 0.2, 1) forwards' : 'none'
        }}
      >
        <div className="relative flex items-center justify-center w-64 h-64" style={{ perspective: '1000px' }}>
          
          {/* LEVEL 1: MAIN ENERGY CORE GROUP */}
          <div className="relative flex items-center justify-center w-full h-full" style={{ transformStyle: 'preserve-3d', animation: stage === 'booting' ? 'core-float 12s ease-in-out infinite' : 'none' }}>
            
            {/* LEVEL 2: INDEPENDENT RINGS */}
            {/* Ring 1: Horizontal Tilt */}
            <div className={`absolute inset-8 border-2 border-dashed border-cyan-400/60 rounded-full transition-opacity duration-500 ${stage !== 'booting' ? 'opacity-0' : 'opacity-100'}`} style={{ animation: stage === 'booting' ? 'ring-1-spin 6s linear infinite' : 'none', transformStyle: 'preserve-3d' }}></div>
            
            {/* Ring 2: Diagonal Tilt */}
            <div className={`absolute inset-4 border-2 border-dashed border-cyan-500/40 rounded-full transition-opacity duration-500 ${stage !== 'booting' ? 'opacity-0' : 'opacity-100'}`} style={{ animation: stage === 'booting' ? 'ring-2-spin 8s linear infinite reverse' : 'none', transformStyle: 'preserve-3d' }}></div>
            
            {/* Ring 3: Vertical Tilt */}
            <div className={`absolute inset-0 border-2 border-dashed border-blue-400/30 rounded-full transition-opacity duration-500 ${stage !== 'booting' ? 'opacity-0' : 'opacity-100'}`} style={{ animation: stage === 'booting' ? 'ring-3-spin 10s linear infinite' : 'none', transformStyle: 'preserve-3d' }}></div>

            {/* Central Logo */}
            <div 
              className={`flex flex-col items-center justify-center transition-all duration-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] ${stage === 'glitch' ? 'scale-110 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'text-cyan-400'} ${stage === 'booting' ? 'animate-pulse' : ''}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Shield className="w-24 h-24" strokeWidth={1.2} />
              <span className="font-black tracking-[0.6em] mt-4 text-xl drop-shadow-lg">BMS</span>
              <span className="text-[7px] font-mono tracking-[0.4em] text-cyan-300/60 mt-2 whitespace-nowrap">BIOMETRIC MONITORING SYSTEM</span>
            </div>
            
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default SplashScreen;

