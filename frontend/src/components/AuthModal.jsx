import React, { useState, useRef, useEffect } from 'react';
import { Shield, Lock, Fingerprint, Activity, CheckCircle, XCircle } from 'lucide-react';

const MASTER_DATABASE_PIN = "1234";

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [authStatus, setAuthStatus] = useState('IDLE'); // IDLE, VERIFYING, GRANTED, DENIED
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setPinDigits(['', '', '', '']);
      setAuthStatus('IDLE');
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setAuthStatus('IDLE'); // clear error state
      if (pinDigits[index] !== '') {
        const newPin = [...pinDigits];
        newPin[index] = '';
        setPinDigits(newPin);
      } else if (index > 0) {
        inputRefs.current[index - 1].focus();
        const newPin = [...pinDigits];
        newPin[index - 1] = '';
        setPinDigits(newPin);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData) {
      const newPin = [...pinDigits];
      for (let i = 0; i < pastedData.length; i++) {
        newPin[i] = pastedData[i];
      }
      setPinDigits(newPin);
      setAuthStatus('IDLE');
      if (pastedData.length < 4) {
        inputRefs.current[pastedData.length].focus();
      } else {
        inputRefs.current[3].focus();
      }
    }
  };

  const handleChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value) {
      const newPin = [...pinDigits];
      newPin[index] = value[value.length - 1]; // take last char if they quickly typed
      setPinDigits(newPin);
      setAuthStatus('IDLE');
      if (index < 3) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleVerify = () => {
    const enteredPin = pinDigits.join('');
    if (enteredPin.length < 4) return;

    setAuthStatus('VERIFYING');
    
    setTimeout(() => {
      if (enteredPin === MASTER_DATABASE_PIN) {
        setAuthStatus('GRANTED');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setAuthStatus('DENIED');
        setTimeout(() => {
          setPinDigits(['', '', '', '']);
          setAuthStatus('IDLE');
          inputRefs.current[0].focus();
        }, 1500);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`bg-[#162A3D] border border-[#2A3B54] rounded-lg shadow-2xl p-8 max-w-md w-full relative overflow-hidden transition-all duration-300 ${authStatus === 'DENIED' ? 'animate-shake border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : ''} ${authStatus === 'GRANTED' ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : ''}`}>
        
        {/* Animated Top Border */}
        <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-300 ${authStatus === 'IDLE' ? 'bg-[#2A3B54]' : authStatus === 'VERIFYING' ? 'bg-blue-500 animate-pulse' : authStatus === 'GRANTED' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#0F1E2C] border border-[#2A3B54] flex items-center justify-center mb-6 relative">
             {authStatus === 'VERIFYING' ? (
               <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
             ) : authStatus === 'GRANTED' ? (
               <CheckCircle className="w-8 h-8 text-emerald-400" />
             ) : authStatus === 'DENIED' ? (
               <XCircle className="w-8 h-8 text-red-400" />
             ) : (
               <Shield className="w-8 h-8 text-[#7FC0E8]" />
             )}
          </div>

          <h2 className="text-xl font-black text-[#EAF3F8] uppercase tracking-widest text-center mb-2">
            RESTRICTED DATABASE ACCESS
          </h2>
          <p className="text-sm text-[#71899A] text-center mb-8 px-4 leading-relaxed">
            Authorized personnel verification required before accessing protected screening records.
          </p>

          <div className="bg-[#0F1E2C] w-full border border-[#2A3B54] rounded-md p-4 mb-8 flex flex-col space-y-3">
            <div className="flex items-center text-xs">
              <Lock className="w-3.5 h-3.5 text-blue-400 mr-3" />
              <span className="text-[#AABBC8] tracking-widest font-bold">SECURITY CLEARANCE REQUIRED</span>
            </div>
            <div className="flex items-center text-xs">
              <Activity className="w-3.5 h-3.5 text-blue-400 mr-3" />
              <span className="text-[#AABBC8] tracking-widest font-bold">ENCRYPTED ACCESS CHANNEL</span>
            </div>
            <div className="flex items-center text-xs">
              <Fingerprint className="w-3.5 h-3.5 text-blue-400 mr-3" />
              <span className="text-[#AABBC8] tracking-widest font-bold">OFFICER AUTHORIZATION</span>
            </div>
          </div>

          {/* PIN Input Area */}
          <div className="flex space-x-4 mb-6">
            {pinDigits.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="password"
                maxLength={1}
                value={digit ? '•' : ''}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={authStatus === 'VERIFYING' || authStatus === 'GRANTED'}
                className={`w-14 h-16 bg-[#0F1E2C] border-2 rounded text-center text-2xl font-bold text-[#EAF3F8] focus:outline-none focus:border-blue-500 transition-colors ${authStatus === 'DENIED' ? 'border-red-500 text-red-500' : authStatus === 'GRANTED' ? 'border-emerald-500 text-emerald-500' : 'border-[#2A3B54]'}`}
              />
            ))}
          </div>

          {/* Status Messages */}
          <div className="h-6 mb-6 w-full flex items-center justify-center">
             {authStatus === 'VERIFYING' && (
               <span className="text-blue-400 text-xs font-bold tracking-widest uppercase animate-pulse">
                 VERIFYING SECURITY CREDENTIALS...
               </span>
             )}
             {authStatus === 'GRANTED' && (
               <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase animate-pulse">
                 ACCESS GRANTED — AUTHORIZED PERSONNEL
               </span>
             )}
             {authStatus === 'DENIED' && (
               <span className="text-red-400 text-xs font-bold tracking-widest uppercase">
                 ACCESS DENIED — INVALID AUTHORIZATION PIN
               </span>
             )}
          </div>

          {/* Actions */}
          <div className="flex w-full space-x-4">
             <button
               onClick={onClose}
               disabled={authStatus === 'VERIFYING' || authStatus === 'GRANTED'}
               className="flex-1 px-4 py-3 bg-[#0F1E2C] border border-[#2A3B54] text-[#AABBC8] font-bold text-xs uppercase tracking-widest rounded hover:bg-[#182E42] transition-colors disabled:opacity-50"
             >
               CANCEL
             </button>
             <button
               onClick={handleVerify}
               disabled={pinDigits.join('').length < 4 || authStatus === 'VERIFYING' || authStatus === 'GRANTED'}
               className="flex-1 px-4 py-3 bg-blue-600 border border-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:bg-[#182E42] disabled:border-[#2A3B54] disabled:shadow-none"
             >
               VERIFY ACCESS
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
