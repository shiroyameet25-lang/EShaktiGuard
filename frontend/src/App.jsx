import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import SplashScreen from './components/SplashScreen';
import { Shield, User, Lock, Globe, Key } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState('login'); // 'login', 'loading', 'dashboard'
  const [introDone, setIntroDone] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setAppState('loading');
    setTimeout(() => {
      setAppState('dashboard');
    }, 2000);
  };

  if (appState === 'dashboard') {
    return (
      <div className="animate-fade-in">
        <Dashboard />
      </div>
    );
  }

  return (
    <>
      {!introDone && <SplashScreen onComplete={() => setIntroDone(true)} />}
      <div className="relative w-full min-h-screen flex items-center justify-center bg-[#070b14] overflow-hidden font-sans z-0">
        
        {/* 1. Deep Atmospheric Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06)_0%,rgba(2,6,23,1)_75%)] z-0 pointer-events-none"></div>

        {/* 2. 3D Grid with Perspective */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ perspective: '800px' }}>
          <div className="absolute bottom-[-20%] left-[-50%] w-[200%] h-[120%] bg-grid-pattern opacity-[0.07] animate-[grid-move_20s_linear_infinite]" style={{ transform: 'rotateX(75deg)', transformOrigin: 'top' }}></div>
        </div>

        {/* 3. Distant World Map */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] blur-[2px] bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain scale-110 animate-[pulse_10s_ease-in-out_infinite]" style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.5)) sepia(1) hue-rotate(160deg) saturate(200%) brightness(0.6)' }}></div>

        {/* 4. Global Network Lines & Nodes */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-50" preserveAspectRatio="none">
           <defs>
             <linearGradient id="splash-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor="#22d3ee" stopOpacity="0"/>
               <stop offset="50%" stopColor="#22d3ee" stopOpacity="1"/>
               <stop offset="100%" stopColor="#22d3ee" stopOpacity="0"/>
             </linearGradient>
             <linearGradient id="splash-blue" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor="#60a5fa" stopOpacity="0"/>
               <stop offset="50%" stopColor="#60a5fa" stopOpacity="1"/>
               <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
             </linearGradient>
           </defs>
           
           {/* Ambient Global Lines */}
           <path d="M 10% 20% Q 25% 10% 40% 40%" fill="none" stroke="url(#splash-cyan)" strokeWidth="1" opacity="0.3"/>
           <path d="M 10% 20% Q 25% 10% 40% 40%" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 1000" className="animate-[dash-travel_6s_linear_infinite]"/>

           <path d="M 85% 80% Q 60% 90% 55% 60%" fill="none" stroke="url(#splash-blue)" strokeWidth="1" opacity="0.3"/>
           <path d="M 85% 80% Q 60% 90% 55% 60%" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 1000" className="animate-[dash-travel_8s_linear_infinite]" style={{ animationDelay: '1s' }}/>

           <path d="M 20% 80% Q 30% 60% 45% 55%" fill="none" stroke="url(#splash-cyan)" strokeWidth="1" opacity="0.3"/>
           <path d="M 20% 80% Q 30% 60% 45% 55%" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 1000" className="animate-[dash-travel_7s_linear_infinite]" style={{ animationDelay: '2s' }}/>

           <path d="M 80% 20% Q 65% 40% 55% 45%" fill="none" stroke="url(#splash-blue)" strokeWidth="1" opacity="0.3"/>
           <path d="M 80% 20% Q 65% 40% 55% 45%" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 1000" className="animate-[dash-travel_5s_linear_infinite]" style={{ animationDelay: '3s' }}/>
           
           {/* Data Streams Feeding into the Center Node (Logo / Login Panel) */}
           <path d="M 10% 10% L 35% 35% Q 40% 40% 45% 45%" fill="none" stroke="url(#splash-cyan)" strokeWidth="1.5" opacity="0.4"/>
           <path d="M 10% 10% L 35% 35% Q 40% 40% 45% 45%" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 1000" className="animate-[dash-travel_5s_linear_infinite]"/>
           
           <path d="M 15% 90% L 35% 65% Q 40% 60% 45% 55%" fill="none" stroke="url(#splash-blue)" strokeWidth="1.5" opacity="0.4"/>
           <path d="M 15% 90% L 35% 65% Q 40% 60% 45% 55%" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 1000" className="animate-[dash-travel_7s_linear_infinite]" style={{ animationDelay: '1s' }}/>

           <path d="M 90% 15% L 65% 35% Q 60% 40% 55% 45%" fill="none" stroke="url(#splash-cyan)" strokeWidth="1.5" opacity="0.4"/>
           <path d="M 90% 15% L 65% 35% Q 60% 40% 55% 45%" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 1000" className="animate-[dash-travel_6s_linear_infinite]" style={{ animationDelay: '2s' }}/>

           <path d="M 85% 85% L 65% 65% Q 60% 60% 55% 55%" fill="none" stroke="url(#splash-blue)" strokeWidth="1.5" opacity="0.4"/>
           <path d="M 85% 85% L 65% 65% Q 60% 60% 55% 55%" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 1000" className="animate-[dash-travel_8s_linear_infinite]" style={{ animationDelay: '0.5s' }}/>
        </svg>
        
        {/* Pulsing Nodes */}
        <div className="absolute top-[20%] left-[10%] w-1.5 h-1.5 z-0 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[15%] w-2 h-2 z-0 bg-blue-400 rounded-full animate-[pulse_3s_ease-in-out_infinite] shadow-[0_0_8px_#60a5fa] pointer-events-none"></div>
        <div className="absolute bottom-[20%] left-[20%] w-1.5 h-1.5 z-0 bg-cyan-300 rounded-full animate-pulse shadow-[0_0_12px_#67e8f9] pointer-events-none"></div>
        <div className="absolute top-[20%] right-[20%] w-1.5 h-1.5 z-0 bg-blue-500 rounded-full animate-[pulse_4s_ease-in-out_infinite] pointer-events-none"></div>

        {/* 5. Edge Data Streams */}
        <div className="absolute left-[2%] top-0 bottom-0 w-8 z-0 overflow-hidden opacity-[0.03] font-mono text-[8px] text-cyan-400 leading-tight pointer-events-none">
          <div className="animate-[data-scroll_25s_linear_infinite]">{Array.from({length: 100}).map((_, i) => <div key={i}>{Math.random() > 0.5 ? '1' : '0'}</div>)}</div>
        </div>
        <div className="absolute right-[2%] top-0 bottom-0 w-8 z-0 overflow-hidden opacity-[0.03] font-mono text-[8px] text-blue-400 leading-tight pointer-events-none">
          <div className="animate-[data-scroll_30s_linear_infinite]" style={{ animationDirection: 'reverse' }}>{Array.from({length: 100}).map((_, i) => <div key={i}>{Math.random() > 0.5 ? '1' : '0'}</div>)}</div>
        </div>

        {/* 6. Soft Holographic Aura */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-cyan-500/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite] mix-blend-screen z-0 pointer-events-none"></div>

        {/* Subtle Foreground Particles */}
        <div className="absolute top-1/4 left-1/3 w-1 h-1 z-[1] rounded-full bg-cyan-300 opacity-40 animate-[particle-float_5s_ease-in-out_infinite] pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 z-[1] rounded-full bg-blue-300 opacity-40 animate-[particle-float_7s_ease-in-out_infinite] pointer-events-none" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 z-[1] rounded-full bg-cyan-400 opacity-30 animate-[particle-float_6s_ease-in-out_infinite] pointer-events-none" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 z-[1] rounded-full bg-teal-400 opacity-30 animate-[particle-float_8s_ease-in-out_infinite] pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

        {appState === 'login' && introDone && (
          <div 
            className="animate-fade-in p-10 max-w-md w-full flex flex-col relative z-10 m-4 shadow-[0_15px_35px_rgba(0,0,0,0.5),0_0_40px_rgba(6,182,212,0.1)] overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-100/[0.08] before:to-transparent before:opacity-100"
            style={{
              background: 'rgba(5, 20, 30, 0.35)',
              backdropFilter: 'blur(26px) saturate(140%)',
              WebkitBackdropFilter: 'blur(26px) saturate(140%)',
              border: '1px solid rgba(120, 230, 255, 0.20)',
              borderTop: '1px solid rgba(180, 245, 255, 0.45)',
              borderLeft: '1px solid rgba(180, 245, 255, 0.35)',
              borderBottom: '1px solid rgba(120, 230, 255, 0.10)',
              borderRight: '1px solid rgba(120, 230, 255, 0.10)',
              borderRadius: '18px',
            }}
          >
            {/* Holographic Integration Brackets & Receptors */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-300/60 rounded-tl-[16px]"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-300/60 rounded-tr-[16px]"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400/40 rounded-bl-[16px]"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400/40 rounded-br-[16px]"></div>
            
            {/* Edge Glow Receptors connecting to background data streams */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-[1px] bg-cyan-300/80 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-[1px] bg-blue-400/60 shadow-[0_0_10px_rgba(96,165,250,0.6)]"></div>
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-[1px] h-24 bg-cyan-300/50 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-[1px] h-24 bg-cyan-300/50 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
            <div className="flex flex-col items-center mb-8 text-center relative z-10">
              <div className="relative mb-5 flex flex-col items-center">
                <Shield className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-[8px] font-black tracking-widest text-[#0a232d] bg-cyan-400 px-1 rounded-sm shadow-sm">BMS</span>
              </div>
              <h1 className="text-white text-xl font-bold tracking-[0.15em] mb-2 uppercase drop-shadow-md">Border Management System</h1>
              <p className="text-cyan-300/80 text-xs font-light tracking-wide">Secure access to the international document verification system</p>
            </div>
            
            <form onSubmit={handleLogin} className="w-full space-y-5 relative z-10">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-500/70 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  id="officerId" 
                  className="w-full bg-slate-900/30 border border-cyan-500/40 rounded-xl text-sm text-gray-200 px-12 py-3.5 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/60 transition-all placeholder-cyan-100/40 backdrop-blur-md"
                  placeholder="Officer ID (e.g. OFF-1234)"
                  required 
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-500/70 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="password" 
                  id="passcode" 
                  className="w-full bg-slate-900/30 border border-cyan-500/40 rounded-xl text-sm text-gray-200 px-12 py-3.5 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/60 transition-all placeholder-cyan-100/40 backdrop-blur-md"
                  placeholder="••••••••"
                  required 
                />
              </div>

              <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative w-4 h-4 border border-cyan-500/40 rounded bg-slate-900/40 group-hover:border-cyan-400 transition-colors flex items-center justify-center">
                    <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                    <svg className="w-3 h-3 text-transparent peer-checked:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-xs text-slate-300 group-hover:text-cyan-100 transition-colors font-light">Remember me</span>
                </label>
                <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-light">Forgot Password?</a>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-600/90 to-blue-600/90 border border-cyan-400/50 text-white font-bold tracking-[0.15em] rounded-xl py-3.5 mt-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] hover:border-cyan-300 hover:brightness-110 hover:-translate-y-0.5 transition-all flex justify-center items-center backdrop-blur-md"
              >
                AUTHORIZE LOGIN
              </button>
            </form>
            
            <p className="text-cyan-200/50 text-[10px] mt-8 tracking-widest text-center uppercase relative z-10">Access Restricted | Confidential System Version 5.2</p>
          </div>
        )}

        {appState === 'loading' && (
          <div className="animate-fade-in flex flex-col items-center justify-center space-y-8 m-4 relative z-10">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-slate-800/50"></div>
              <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-cyan-400 mb-3 tracking-[0.2em] uppercase drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">Establishing secure connection...</h2>
              <p className="text-xs text-cyan-600/80 font-mono tracking-widest uppercase">Verifying credentials and synchronizing databases</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
