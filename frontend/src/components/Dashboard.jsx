import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Shield, Lock, Unlock } from 'lucide-react';
import AuthModal from './AuthModal';
import { extractFacePortrait } from '../utils/faceExtraction';
import { loadVerificationModels, getFaceDescriptor, verifyIdentity, createHtmlImageFromDataUrl } from '../utils/faceVerification';

const getSoundex = (s) => {
    if (!s) return '';
    let a = s.toLowerCase().split(''),
        f = a.shift(),
        r = '',
        codes = { a: '', e: '', i: '', o: '', u: '', y: '', h: '', w: '', b: 1, f: 1, p: 1, v: 1, c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2, d: 3, t: 3, l: 4, m: 5, n: 5, r: 6 };
    
    r = f + a.map(v => codes[v]).filter((v, i, arr) => ((i === 0) ? v !== codes[f] : v !== arr[i - 1])).filter(v => v).join('');
    return (r + '000').slice(0, 4).toUpperCase();
};

const getPhoneticSimilarity = (name1, name2) => {
    if (!name1 || !name2) return 0;
    const parts1 = name1.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean);
    const parts2 = name2.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean);
    
    let matchCount = 0;
    for (const p1 of parts1) {
        const s1 = getSoundex(p1);
        for (const p2 of parts2) {
            if (s1 === getSoundex(p2)) {
                matchCount++;
                break;
            }
        }
    }
    
    const maxWords = Math.max(parts1.length, parts2.length);
    if (maxWords === 0) return 0;
    
    let baseScore = (matchCount / maxWords) * 100;
    if (Math.min(parts1.length, parts2.length) === 1 && matchCount === 1) {
       baseScore = Math.max(baseScore, 80); 
    }
    return Math.round(baseScore);
};

const useInView = (threshold = 0.1, triggerOnce = true) => {
  const [inView, setInView] = useState(false);
  const observerRef = useRef(null);

  const ref = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    if (node) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      }, { threshold });
      
      observer.observe(node);
      observerRef.current = observer;
    } else {
      setInView(false);
    }
  }, [threshold, triggerOnce]);

  return [ref, inView];
};

const Dashboard = () => {
  // Global State
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'profile', 'database'
  const [dbUnlocked, setDbUnlocked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStatus, setAuthStatus] = useState('LOCKED'); // LOCKED, VERIFYING, GRANTED, DENIED
  const [pin, setPin] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState(null); // For slide-over
  const [isOverviewOpen, setIsOverviewOpen] = useState(false); // For Subject Overview Drawer
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Compact command-center default

  // Scanner State
  const [files, setFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [phoneticMatch, setPhoneticMatch] = useState(null);
  const [finalSubjectPortrait, setfinalSubjectPortrait] = useState(undefined);
  const [faceVerificationResult, setFaceVerificationResult] = useState(null);
  const [liveWebcamFaceData, setLiveWebcamFaceData] = useState(null);

  useEffect(() => {
    loadVerificationModels();
  }, []);
  
  const IS_DEV_MODE = false; // Temporary debug flag for portrait extraction
  const [cameraError, setCameraError] = useState(false);
  const [logs, setLogs] = useState([]);

  // Operations State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const generatePDF = async () => {
    const reportElement = document.getElementById('report-content');
    if (!reportElement) return;
    
    try {
      const canvas = await html2canvas(reportElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('SECURITY_REPORT.pdf');
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };
  const [animateBars, setAnimateBars] = useState(false);
  
  // Final Decision State
  const [caseStatus, setCaseStatus] = useState('AWAITING_DECISION');
  const [finalDecision, setFinalDecision] = useState(null);
  const [decisionTimestamp, setDecisionTimestamp] = useState(null);
  const [pendingDecision, setPendingDecision] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showEvidenceInvestigation, setShowEvidenceInvestigation] = useState(false);
  const [selectedEvidenceFinding, setSelectedEvidenceFinding] = useState(null);
  const [selectedNetworkNode, setSelectedNetworkNode] = useState(null);
  
  // Threat Network Animation Refs
  const [networkHeaderRef, networkHeaderInView] = useInView(0.1, true);
  const [networkGraphRef, networkGraphInView] = useInView(0.2, true);
  const [networkSummaryRef, networkSummaryInView] = useInView(0.2, true);
  const [networkTimelineRef, networkTimelineInView] = useInView(0.1, true);

  // Global Tab 2 Scroll Animation Refs
  const [identityRef, identityInView] = useInView(0.1, true);
  const [riskRef, riskInView] = useInView(0.1, true);
  const [biometricRef, biometricInView] = useInView(0.1, true);
  const [timelineRef, timelineInView] = useInView(0.1, true);
  const [findingsRef, findingsInView] = useInView(0.1, true);
  const [criminalRef, criminalInView] = useInView(0.1, true);
  const [recommendationRef, recommendationInView] = useInView(0.1, true);
  const [decisionRef, decisionInView] = useInView(0.1, true);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'profile' && analysisResult) {
      const timer = setTimeout(() => setAnimateBars(true), 200);
      return () => { clearTimeout(timer); setAnimateBars(false); };
    } else {
      setAnimateBars(false);
    }
  }, [activeTab, analysisResult]);

  const renderOperationsActionBar = (className = "") => (
    <div className={`flex flex-col sm:flex-row items-center justify-between bg-[#0A1422] border border-[#213F66] rounded-sm p-4 shadow-none ${className}`}>
      <div className="flex items-center space-x-3 mb-4 sm:mb-0">
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <h2 className="uppercase tracking-widest text-xs font-bold text-cyan-100">Active Operations</h2>
      </div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        <button 
          onClick={() => {
            setToastMessage('Alert Escalated to Border Patrol Units');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
          }}
          className="bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-sm shadow-none hover:bg-red-800 transition flex items-center justify-center w-full sm:w-auto uppercase tracking-wider"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Escalate to Interpol
        </button>
        <button 
          disabled={!analysisResult}
          onClick={() => {
            if (IS_DEV_MODE && finalSubjectPortrait) {
              console.log(`\nPDF PORTRAIT SOURCE:\n[exact selectedCandidateId: ${finalSubjectPortrait.method}]\n`);
            }
            setShowReportModal(true);
          }}
          className={`border font-bold text-xs px-4 py-2 rounded-sm shadow-none transition flex items-center justify-center w-full sm:w-auto uppercase tracking-wider
            ${!analysisResult ? 'bg-[#0F1E2C] text-cyan-400 border-[#213F66] cursor-not-allowed' : 
              caseStatus === 'AWAITING_DECISION' ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' : 
              'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'}`}
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {!analysisResult ? 'Report Disabled' : caseStatus === 'AWAITING_DECISION' ? 'Preliminary Report â€” Pending Decision' : 'Generate Final Border Report'}
        </button>
      </div>
    </div>
  );

  // Passenger Mock Data for Tab 3 -> Migrated to Dynamic State
  const [databaseRecords, setDatabaseRecords] = useState([
    { 
      caseId: 'BSS-2026-1042', time: '08:14 AM', date: '01 SEP 2026', name: 'DANIEL MERCER', nationality: '🇨🇦 CANADIAN', 
      documentType: 'CANADA PASSPORT', docCount: 1, riskScore: 12, riskLevel: 'LOW', threatLevel: 'NO ACTIVE ALERT',
      aiRecommendation: 'CLEARANCE RECOMMENDED', finalDecision: 'CLEARED', status: 'CLEARED',
      portrait: 'https://i.pravatar.cc/150?u=daniel', liveportrait: 'https://i.pravatar.cc/150?u=sofia', biometricScore: 98.4, biometricMatch: true, docNumber: 'P8923471X',
      securityFindings: []
    },
    { 
      caseId: 'BSS-2026-1087', time: '09:22 AM', date: '01 SEP 2026', name: 'SOFIA ALVAREZ', nationality: '🇪🇸 SPANISH', 
      documentType: 'VISA', docCount: 2, riskScore: 45, riskLevel: 'MEDIUM', threatLevel: 'PREVIOUS VISA OVERSTAY',
      aiRecommendation: 'MANUAL REVIEW', finalDecision: 'PENDING_REVIEW', status: 'PENDING OFFICER REVIEW',
      portrait: 'https://i.pravatar.cc/150?u=marcus', livePortrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", biometricScore: 82.1, biometricMatch: true, docNumber: 'V7381944M',
      securityFindings: ["INTERPOL WATCHLIST: SECONDARY NAME MATCH", "VISA ISSUANCE VERIFICATION PENDING"]
    },
    { 
      caseId: 'BSS-2026-1124', time: '10:05 AM', date: '01 SEP 2026', name: 'MARCUS HALE', nationality: '🇬🇧 BRITISH', 
      documentType: 'UK PASSPORT', docCount: 1, riskScore: 94, riskLevel: 'CRITICAL', threatLevel: 'BIOMETRIC MISMATCH',
      aiRecommendation: 'IMMEDIATE REJECTION', finalDecision: 'REJECTED', status: 'REJECTED',
      portrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", livePortrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", biometricScore: 21.5, biometricMatch: false, docNumber: 'J9284751K',
      securityFindings: ["CRITICAL: FACIAL BIOMETRIC MISMATCH DETECTED", "MRZ CHECKSUM INVALID"]
    },
    { 
      caseId: 'BSS-2026-1130', time: '10:45 AM', date: '01 SEP 2026', name: 'YUKI TANAKA', nationality: 'JAPANESE', 
      documentType: 'JAPAN PASSPORT', docCount: 1, riskScore: 8, riskLevel: 'LOW', threatLevel: 'NO ACTIVE ALERT',
      aiRecommendation: 'CLEARANCE RECOMMENDED', finalDecision: 'CLEARED', status: 'CLEARED',
      portrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", livePortrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", biometricScore: 99.2, biometricMatch: true, docNumber: 'T4402918L',
      securityFindings: []
    },
    { 
      caseId: 'BSS-2026-1142', time: '11:15 AM', date: '01 SEP 2026', name: 'OMAR AL-FASSI', nationality: 'MOROCCAN', 
      documentType: 'MOROCCO PASSPORT', docCount: 1, riskScore: 18, riskLevel: 'LOW', threatLevel: 'NO ACTIVE ALERT',
      aiRecommendation: 'CLEARANCE RECOMMENDED', finalDecision: 'CLEARED', status: 'CLEARED',
      portrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", livePortrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", biometricScore: 95.6, biometricMatch: true, docNumber: 'U2283990A',
      securityFindings: []
    },
    { 
      caseId: 'BSS-2026-1158', time: '12:30 PM', date: '01 SEP 2026', name: 'ELENA ROSTOVA', nationality: 'RUSSIAN', 
      documentType: 'VISA', docCount: 2, riskScore: 88, riskLevel: 'HIGH', threatLevel: 'SUSPECTED FORGERY',
      aiRecommendation: 'REJECTION RECOMMENDED', finalDecision: 'REJECTED', status: 'REJECTED',
      portrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", livePortrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", biometricScore: 65.4, biometricMatch: true, docNumber: 'R5529184B',
      securityFindings: ["HOLOGRAM AUTHENTICATION FAILED", "INCONSISTENT FONT KERNING IN MRZ"]
    },
    { 
      caseId: 'BSS-2026-1165', time: '01:10 PM', date: '01 SEP 2026', name: 'DAVID CHEN', nationality: 'SINGAPOREAN', 
      documentType: 'SINGAPORE PASSPORT', docCount: 1, riskScore: 15, riskLevel: 'LOW', threatLevel: 'NO ACTIVE ALERT',
      aiRecommendation: 'CLEARANCE RECOMMENDED', finalDecision: 'CLEARED', status: 'CLEARED',
      portrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", livePortrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", biometricScore: 97.8, biometricMatch: true, docNumber: 'S8293741C',
      securityFindings: []
    },
    { 
      caseId: 'BSS-2026-1172', time: '02:05 PM', date: '01 SEP 2026', name: 'AMINA DIOP', nationality: 'SENEGALESE', 
      documentType: 'VISA', docCount: 2, riskScore: 35, riskLevel: 'MEDIUM', threatLevel: 'TRAVEL HISTORY INCONSISTENCY',
      aiRecommendation: 'MANUAL REVIEW', finalDecision: 'PENDING_REVIEW', status: 'PENDING OFFICER REVIEW',
      portrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", livePortrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", biometricScore: 88.9, biometricMatch: true, docNumber: 'D1129384E',
      securityFindings: ["RECENT TRAVEL TO HIGH-RISK JURISDICTION", "INCOMPLETE DECLARATION FORM"]
    },
    { 
      caseId: 'BSS-2026-1189', time: '03:40 PM', date: '01 SEP 2026', name: 'LUKAS WEBER', nationality: 'GERMAN', 
      documentType: 'GERMAN PASSPORT', docCount: 1, riskScore: 50, riskLevel: 'MEDIUM', threatLevel: 'SYSTEM OUTAGE DURING SCAN',
      aiRecommendation: 'MANUAL REVIEW', finalDecision: 'PENDING_REVIEW', status: 'PENDING OFFICER REVIEW',
      portrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", livePortrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", biometricScore: 91.2, biometricMatch: true, docNumber: 'G9928374F',
      securityFindings: ["DATABASE CONNECTION TIMEOUT DURING BACKGROUND CHECK"]
    },
    { 
      caseId: 'BSS-2026-1204', time: '04:15 PM', date: '01 SEP 2026', name: 'VICTOR KOWALSKI', nationality: 'POLISH', 
      documentType: 'IDENTITY CARD', docCount: 1, riskScore: 95, riskLevel: 'CRITICAL', threatLevel: 'KNOWN THREAT ACTOR',
      aiRecommendation: 'IMMEDIATE REJECTION', finalDecision: 'REJECTED', status: 'REJECTED',
      portrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", livePortrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", biometricScore: 99.5, biometricMatch: true, docNumber: 'K4429381G',
      securityFindings: ["CRITICAL: POSITIVE MATCH ON EUROPOL DATABASE", "CRITICAL: OUTSTANDING WARRANT"]
    },
    { 
      caseId: 'BSS-2026-1912', time: '05:22 PM', date: '01 SEP 2026', name: 'MUHAMMAD REHMAN', nationality: 'PAKISTANI', 
      documentType: 'PASSPORT', docCount: 1, riskScore: 89, riskLevel: 'HIGH', threatLevel: 'WATCHLIST MATCH',
      aiRecommendation: 'MANUAL REVIEW', finalDecision: 'PENDING_REVIEW', status: 'PENDING OFFICER REVIEW',
      portrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", livePortrait: null, biometricScore: 0, biometricMatch: false, docNumber: 'PK882910',
      securityFindings: ["INTERPOL WATCHLIST: PRIMARY NAME MATCH"]
    },
    { 
      caseId: 'BSS-2026-2005', time: '06:10 PM', date: '01 SEP 2026', name: 'STEPHEN SMITH', nationality: 'AMERICAN', 
      documentType: 'PASSPORT', docCount: 1, riskScore: 75, riskLevel: 'MEDIUM', threatLevel: 'PREVIOUS VISA OVERSTAY',
      aiRecommendation: 'MANUAL REVIEW', finalDecision: 'PENDING_REVIEW', status: 'PENDING OFFICER REVIEW',
      portrait: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%238fa3b5'><rect width='100' height='100' fill='%23E8EDF2'/><circle cx='50' cy='35' r='20'/><path d='M20 100c0-25 15-40 30-40s30 15 30 40H20z'/></svg>", livePortrait: null, biometricScore: 0, biometricMatch: false, docNumber: 'US991823',
      securityFindings: ["VISA ISSUANCE VERIFICATION PENDING"]
    }
  ]);
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbFilterRisk, setDbFilterRisk] = useState('ALL');
  const [dbFilterStatus, setDbFilterStatus] = useState('ALL');
  const [dbFilterDocType, setDbFilterDocType] = useState('ALL');
  const [dbFilterNationality, setDbFilterNationality] = useState('ALL');

  const MASTER_DATABASE_PIN = "1234";

  const handlePinSubmit = (e) => {
    if (e) e.preventDefault();
    if (pin === MASTER_DATABASE_PIN) {
      setAuthStatus('VERIFYING');
      setTimeout(() => {
        setDbUnlocked(true);
        setAuthStatus('GRANTED');
        setPin('');
      }, 1500);
    } else {
      setAuthStatus('DENIED');
      setTimeout(() => {
        setAuthStatus('LOCKED');
        setPin('');
      }, 2000);
    }
  };

  const [viewingRecord, setViewingRecord] = useState(null);

  // Initialize webcam
  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setCameraError(true);
      }
    };
    if (activeTab === 'scanner') {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeTab]);

  const handleFileClick = () => {
    if (fileInputRef.current && !isAnalyzing) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      const newFiles = selectedFiles.map(f => {
        let url = null;
        if (f.type.startsWith('image/')) {
          url = URL.createObjectURL(f);
        }
        return { 
          id: Math.random().toString(36).substr(2, 9),
          file: f, 
          previewUrl: url,
          uploadStatus: 'complete',
          scanStatus: 'pending',
          documentType: 'UNKNOWN',
          portrait: null,
          analysis: null
        };
      });
      setFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id, e) => {
    e.stopPropagation(); 
    if (isAnalyzing) return;
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== id);
      const removedFile = prev.find(f => f.id === id);
      if (removedFile && removedFile.previewUrl) {
        URL.revokeObjectURL(removedFile.previewUrl);
      }
      return updatedFiles;
    });
  };

  const handleAnalyze = () => {
    // If analysisResult already exists, we might want to clear it or just re-run for pending documents
    if (analysisResult && files.every(f => f.scanStatus === 'completed')) {
      // Clear all and reset (acting as the old reset button)
      setFiles(prev => {
        prev.forEach(f => {
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        });
        return [];
      });
      setAnalysisResult(null);
      setfinalSubjectPortrait(undefined);
      setFaceVerificationResult(null);
      setLiveWebcamFaceData(null);
      setLogs([]);
      setCaseStatus('AWAITING_DECISION');
      setFinalDecision(null);
      setDecisionTimestamp(null);
      setPendingDecision(null);
      setAiRecommendation(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setLogs(["[SYSTEM] Initializing Risk Engine v4.2..."]);

    // Yield main thread to allow React to render loading states
    const runAnalysis = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      let globalPortraitResult = null;
      let globalVerification = null;
      let webcamDataUrl = null;

      try {
        // Process each document independently
        const updatedFiles = [...files];
        
        for (let i = 0; i < updatedFiles.length; i++) {
          const doc = updatedFiles[i];
          if (doc.scanStatus === 'completed') continue; // skip already analyzed

          // Update individual status
          setFiles(prev => prev.map(f => f.id === doc.id ? { ...f, scanStatus: 'processing' } : f));
          setLogs(prev => [...prev, `[INFO] Extracting Facial Biometrics & PAD Checks for ${doc.file.name}...`]);
          
          const scanStartTime = Date.now();
          await new Promise(resolve => setTimeout(resolve, 50)); // Yield to main thread for UI render
          
          const portraitResult = await extractFacePortrait(doc.file);
          
          // Ensure scan animation completes at least one full cycle (2 seconds)
          const elapsed = Date.now() - scanStartTime;
          if (elapsed < 2000) {
            await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
          }
          
          if (!globalPortraitResult && portraitResult && portraitResult.imageData) {
             globalPortraitResult = portraitResult;
          }

          doc.portrait = portraitResult;
          doc.scanStatus = 'completed';
          
          const fnameLower = doc.file.name.toLowerCase();
          let docCountry = null;
          let mrzNat = null;
          
          if (fnameLower.includes('canad') || fnameLower.includes('can')) {
            docCountry = 'CANADA';
            mrzNat = 'CAN';
          } else if (fnameLower.includes('india') || fnameLower.includes('ind')) {
            docCountry = 'INDIA';
            mrzNat = 'IND';
          } else if (fnameLower.includes('usa') || fnameLower.includes('america')) {
            docCountry = 'USA';
            mrzNat = 'USA';
          }
          
          let docTypeStr = 'PASSPORT';
          if (fnameLower.includes('pr') || fnameLower.includes('resident')) {
            docTypeStr = 'PERMANENT RESIDENT CARD';
          } else if (fnameLower.includes('visa')) {
            docTypeStr = 'VISA';
          }
          
          doc.documentType = docCountry ? `${docCountry} ${docTypeStr}` : docTypeStr;
          doc.analysis = {
            nameExtracted: doc.file.name.split('.')[0].toUpperCase() || '[EXTRACTED_SUBJECT]',
            documentNumber: Math.random().toString().substring(2, 10).toUpperCase(),
            mrzNationality: mrzNat,
            documentCountry: docCountry
          };
          
          // Update state after each document to show progress
          setFiles(prev => prev.map(f => f.id === doc.id ? doc : f));
        }

        setfinalSubjectPortrait(globalPortraitResult || null);
        
        if (globalPortraitResult && globalPortraitResult.imageData && videoRef.current) {
           setLogs(prev => [...prev, "[INFO] Generating Document Face Embeddings..."]);
           await new Promise(resolve => setTimeout(resolve, 50)); // Yield
           const docImg = await createHtmlImageFromDataUrl(globalPortraitResult.imageData);
           const docDescriptor = await getFaceDescriptor(docImg);
           
           setLogs(prev => [...prev, "[INFO] Capturing Live Webcam Feed..."]);
           await new Promise(resolve => setTimeout(resolve, 50)); // Yield
           const canvas = document.createElement('canvas');
           canvas.width = videoRef.current.videoWidth || 640;
           canvas.height = videoRef.current.videoHeight || 480;
           canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
           webcamDataUrl = canvas.toDataURL('image/jpeg');
           
           setLogs(prev => [...prev, "[INFO] Generating Live Face Embeddings..."]);
           await new Promise(resolve => setTimeout(resolve, 50)); // Yield
           const liveImg = await createHtmlImageFromDataUrl(webcamDataUrl);
           const liveDescriptor = await getFaceDescriptor(liveImg);
           
           if (docDescriptor && liveDescriptor) {
             setLogs(prev => [...prev, "[INFO] Comparing Biometric Descriptors..."]);
             globalVerification = verifyIdentity(docDescriptor, liveDescriptor);
             setFaceVerificationResult(globalVerification);
             setLiveWebcamFaceData(webcamDataUrl);
             
             if (globalVerification.verified) {
               setLogs(prev => [...prev, "[INFO] Identity Match: VERIFIED"]);
             } else {
               setLogs(prev => [...prev, "[CRITICAL] IDENTITY MISMATCH DETECTED"]);
             }
           } else {
             setFaceVerificationResult({ verified: false, status: 'LIVE FACE NOT DETECTED' });
             setLogs(prev => [...prev, "[WARN] Could not detect valid faces for verification."]);
           }
        } else {
           setFaceVerificationResult({ verified: false, status: 'DOCUMENT PORTRAIT UNAVAILABLE' });
        }
      } catch (err) {
        console.error("Face extraction/verification failed:", err);
        setfinalSubjectPortrait(null);
        setFaceVerificationResult({ verified: false, status: 'VERIFICATION ERROR' });
        // Ensure any stuck processing state is cleared
        setFiles(prev => prev.map(f => f.scanStatus === 'processing' ? { ...f, scanStatus: 'completed' } : f));
      }

      setLogs(prev => [...prev, "[INFO] Starting OCR Extraction & Text Parsing..."]);
      setLogs(prev => [...prev, "[INFO] Running Cross-Reference & Phonetic Engine..."]);
      
      setIsAnalyzing(false);
      
      // Calculate risk score based on verification
      let mockRiskScore = 65; 
      let threatLevelStr = 'MEDIUM RISK - FORGERY SUSPECTED';
      
      if (globalVerification && !globalVerification.verified) {
        mockRiskScore = 92;
        threatLevelStr = 'HIGH RISK - IDENTITY MISMATCH';
      } else if (globalVerification && globalVerification.verified) {
        mockRiskScore = 35;
        threatLevelStr = 'LOW RISK - VERIFIED';
      }
      
      const primaryDoc = files.length > 0 ? files[0] : null;
      

      let finalNationality = 'UNKNOWN';
      let docTypeDisplay = 'UNKNOWN';
      let docCountry = 'UNKNOWN';
      let isCanadaPR = false;

      if (primaryDoc) {
        docTypeDisplay = primaryDoc.documentType || 'UNKNOWN';
        
        const fnameLower = primaryDoc.file.name.toLowerCase();
        isCanadaPR = (fnameLower.includes('canada') || fnameLower.includes('canad')) && (fnameLower.includes('pr') || fnameLower.includes('resident'));
        const isCanadaStr = fnameLower.includes('canada') || fnameLower.includes('canadian') || fnameLower.includes('canad');

        if (primaryDoc.analysis) {
          const rawUpper = (primaryDoc.analysis.rawText || '').toUpperCase();
          const code = primaryDoc.analysis.mrzNationality || '';
          docCountry = primaryDoc.analysis.documentCountry || '';
          
          if (code.toUpperCase() === 'CAN' || docCountry.toUpperCase() === 'CANADA' || rawUpper.includes('CANADIAN') || rawUpper.includes('CANADA') || isCanadaPR || isCanadaStr) {
            finalNationality = 'CANADIAN';
          } else if (code) {
            const codeMap = { 'IND': 'INDIAN', 'USA': 'AMERICAN', 'GBR': 'BRITISH', 'MEX': 'MEXICAN' };
            finalNationality = codeMap[code.toUpperCase()] || code.toUpperCase();
          } else if (docCountry) {
            const countryMap = { 'INDIA': 'INDIAN', 'USA': 'AMERICAN', 'UNITED STATES': 'AMERICAN' };
            finalNationality = countryMap[docCountry.toUpperCase()] || docCountry.toUpperCase();
          }
        } else if (isCanadaPR || isCanadaStr) {
          finalNationality = 'CANADIAN';
        }
      }

      // HACKATHON VIDEO DEMO OVERRIDE: Default UNKNOWN to CANADIAN
      if (finalNationality === 'UNKNOWN') {
        finalNationality = 'CANADIAN';
      }

      const extractedName = primaryDoc ? (isCanadaPR ? 'ALEXSANDER NAVARRO' : (primaryDoc.analysis?.nameExtracted || '[EXTRACTED_SUBJECT]')) : '[EXTRACTED_NAME]';
      
      // Demo Override: Force a specific phonetic match for the demo scenario
      setPhoneticMatch({
        isMatch: true,
        documentName: 'Mohammed Rahman',
        matchedName: 'Muhammad Rehman',
        similarity: 92,
        caseId: 'BSS-2026-1912',
        threatLevel: 'HIGH PRIORITY',
        matchType: 'Phonetic / Alternate Spelling',
        status: 'REVIEW REQUIRED',
        riskLevel: 'HIGH'
      });

      setAnalysisResult({
        threatLevel: threatLevelStr,
        riskScore: mockRiskScore.toString(),
        documentType: docTypeDisplay,
        nameExtracted: extractedName,
        nameDB: primaryDoc ? (isCanadaPR ? 'ALEXANDER NOVARO (ALIAS)' : ((primaryDoc.analysis?.nameExtracted || '[EXTRACTED_SUBJECT]') + ' (ALIAS)')) : '[DATABASE_RECORD]',
        documentNumber: primaryDoc ? (isCanadaPR ? 'P8923471X' : primaryDoc.analysis?.documentNumber) : 'UNKNOWN',
        sex: finalNationality.includes('CANADIAN') ? 'M' : 'U',
        nationality: finalNationality,
        dateOfBirth: finalNationality.includes('CANADIAN') ? '1985-04-12' : '1980-01-01',
        expiryDate: finalNationality.includes('CANADIAN') ? '2028-11-20' : '2030-01-01',
        docCount: files.length.toString(),
        expiryStatus: 'VALID'
      });
      setCaseStatus('AWAITING_DECISION');
      
      // AI RECOMMENDATION LOGIC
      if (globalVerification && !globalVerification.verified) {
        setAiRecommendation('PENDING_REVIEW');
      } else if (mockRiskScore > 40) {
        setAiRecommendation('MANUAL_REVIEW');
      } else {
        setAiRecommendation('CLEAR');
      }
    };
    runAnalysis();
  };


  // DYNAMIC RISK AND RECOMMENDATION LOGIC
  const riskAssessment = React.useMemo(() => {
    let factors = [];
    let overallRiskScore = 0;
    
    if (analysisResult) {
       // Identity Verification
       const identityStatus = analysisResult.nameExtracted.includes('ALIAS') ? 'REVIEW' : 'VERIFIED';
       factors.push({
         id: 'identity_fraud_01',
         name: 'IDENTITY VERIFICATION',
         riskLevel: identityStatus === 'REVIEW' ? 'MEDIUM' : 'LOW',
         status: identityStatus,
         impact: identityStatus === 'REVIEW' ? 'MEDIUM' : 'LOW',
         contributionDesc: identityStatus === 'REVIEW' ? 'Alias detected in subject name mapping.' : 'Identity details align with basic formatting.'
       });
       
       // Biometric Verification
       const isBioMatch = faceVerificationResult?.verified;
       const bioStatus = faceVerificationResult?.status;
       let bioRisk = 'LOW';
       let bioImpact = 'LOW';
       let bioDesc = 'Biometric features verified successfully.';
       if (bioStatus === 'IDENTITY_MISMATCH') {
         bioRisk = 'CRITICAL';
         bioImpact = 'HIGH';
         bioDesc = 'Live identity verification did not meet the required similarity threshold.';
       } else if (bioStatus === 'LIVE FACE NOT DETECTED' || bioStatus === 'DOCUMENT PORTRAIT UNAVAILABLE') {
         bioRisk = 'HIGH';
         bioImpact = 'MEDIUM';
         bioDesc = 'Missing critical biometric data to perform 1:1 match.';
       }
       factors.push({
         id: 'biometric_mismatch_01',
         name: 'BIOMETRIC VERIFICATION',
         riskLevel: bioRisk,
         status: isBioMatch ? 'VERIFIED' : 'MISMATCH',
         impact: bioImpact,
         contributionDesc: bioDesc
       });
       
       // Document Integrity
       const docAnomaly = analysisResult.threatLevel.includes('FORGERY');
       factors.push({
         id: 'doc_integrity_01',
         name: 'DOCUMENT INTEGRITY',
         riskLevel: docAnomaly ? 'HIGH' : 'LOW',
         status: docAnomaly ? 'ANOMALY' : 'CLEAR',
         impact: docAnomaly ? 'HIGH' : 'LOW',
         contributionDesc: docAnomaly ? 'ELA detected potential tampering in signature zone.' : 'No major anomalies detected in document structure.'
       });
       
       // Threat Network
       factors.push({
         id: 'criminal_net_01',
         name: 'THREAT NETWORK ANALYSIS',
         riskLevel: 'MEDIUM',
         status: 'SUSPICIOUS',
         impact: 'MEDIUM',
         contributionDesc: 'Indirect connections mapped to identified high-risk nodes.'
       });
    }

    // Calculate overall score
    let criticalCount = factors.filter(f => f.riskLevel === 'CRITICAL').length;
    let highCount = factors.filter(f => f.riskLevel === 'HIGH').length;
    let medCount = factors.filter(f => f.riskLevel === 'MEDIUM').length;
    
    if (criticalCount > 0) overallRiskScore = 92;
    else if (highCount > 0) overallRiskScore = 78;
    else if (medCount > 0) overallRiskScore = 45;
    else overallRiskScore = 12;
    
    let overallRiskLevel = 'LOW';
    if (overallRiskScore >= 90) overallRiskLevel = 'CRITICAL';
    else if (overallRiskScore >= 70) overallRiskLevel = 'HIGH';
    else if (overallRiskScore >= 40) overallRiskLevel = 'MEDIUM';
    
    const sortedFactors = [...factors].sort((a,b) => {
      const w = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return w[b.riskLevel] - w[a.riskLevel];
    });
    const topContributors = sortedFactors.slice(0, 3);
    
    let confidence = 'HIGH';
    let confidenceReason = 'All required document, biometric and intelligence analysis steps completed successfully.';
    if (!faceVerificationResult || faceVerificationResult.status === 'LIVE FACE NOT DETECTED' || faceVerificationResult.status === 'DOCUMENT PORTRAIT UNAVAILABLE') {
      confidence = 'LIMITED';
      confidenceReason = 'One or more required evidence sources were unavailable or had low-quality input.';
    }
    
    // AI Recommendation
    let aiRecTitle = 'PROCEED â€” LOW SECURITY RISK';
    let primaryFactor = 'No significant risk factors identified.';
    if (overallRiskLevel === 'CRITICAL' || overallRiskLevel === 'HIGH') {
      aiRecTitle = 'ENTRY NOT RECOMMENDED â€” HIGH RISK';
      primaryFactor = topContributors[0]?.contributionDesc || 'High risk factors identified.';
    } else if (overallRiskLevel === 'MEDIUM') {
      aiRecTitle = 'MANUAL REVIEW RECOMMENDED';
      primaryFactor = topContributors[0]?.contributionDesc || 'Medium risk factors identified.';
    }
    
    let secondaryFactor = topContributors[1]?.contributionDesc || 'No secondary factors.';
    let mitigatingFactor = 'No verified direct criminal watchlist match was identified.';

    return {
      factors,
      overallRiskScore,
      overallRiskLevel,
      topContributors,
      confidence,
      confidenceReason,
      aiRecTitle,
      primaryFactor,
      secondaryFactor,
      mitigatingFactor
    };
  }, [analysisResult, faceVerificationResult]);

  return (
    <div className="bg-[#0F1E2C] bg-military-grid text-cyan-50 flex font-sans relative h-screen overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`surface-security border-r border-[#213F66] flex flex-col flex-shrink-0 z-50 transition-all duration-300 relative ${isSidebarExpanded ? 'w-64' : 'w-16'}`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-5 bg-[#0F1C2E] border border-[#3182CE] text-[#4B80AD] hover:text-cyan-400 hover:border-cyan-400 rounded-full p-1 z-50 transition-all shadow-[0_0_10px_rgba(49,130,206,0.3)]"
        >
          <svg className={`w-3 h-3 transition-transform duration-300 ${isSidebarExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="h-16 flex items-center justify-center border-b border-[#213F66] shrink-0 overflow-hidden px-2 relative">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cyan-500/20"></div>
          <Shield className="w-6 h-6 text-cyan-500 shrink-0 filter drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
          <span className={`ml-3 text-[10px] font-black text-cyan-50 uppercase tracking-widest leading-tight whitespace-nowrap transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>BORDER SECURITY<br/>COMMAND</span>
        </div>
        
        <div className="flex-1 py-6 flex flex-col space-y-2 px-3 overflow-y-auto overflow-x-hidden">
          <button 
            onClick={() => setActiveTab('scanner')}
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors group relative ${activeTab === 'scanner' ? 'bg-[#1D2B42] border-l-4 border-blue-500 text-white' : 'text-blue-400 hover:bg-[#1D2B42] hover:text-white border-l-4 border-transparent'}`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className={`ml-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>LIVE SCREENING</span>
            
            {/* Tooltip */}
            {!isSidebarExpanded && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-[#1D2B42] text-white text-[10px] font-bold tracking-widest rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-[#1D2B42] shadow-lg">
                LIVE SCREENING
              </div>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors group relative ${activeTab === 'profile' ? 'bg-[#1D2B42] border-l-4 border-blue-500 text-white' : 'text-blue-400 hover:bg-[#1D2B42] hover:text-white border-l-4 border-transparent'}`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`ml-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>INTELLIGENCE REVIEW</span>
            
            {/* Tooltip */}
            {!isSidebarExpanded && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-[#1D2B42] text-white text-[10px] font-bold tracking-widest rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-[#1D2B42] shadow-lg">
                INTELLIGENCE REVIEW
              </div>
            )}
          </button>

          <button 
            onClick={() => {
            if (dbUnlocked) {
              setActiveTab('database');
            } else {
              setShowAuthModal(true);
            }
          }}
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors group relative ${activeTab === 'database' ? 'bg-[#1D2B42] border-l-4 border-blue-500 text-white' : 'text-blue-400 hover:bg-[#1D2B42] hover:text-white border-l-4 border-transparent'}`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span className={`ml-3 text-[10px] font-bold uppercase tracking-widest flex-1 text-left truncate whitespace-nowrap transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>MASTER DATABASE</span>
            {isSidebarExpanded && (
              dbUnlocked ? (
                <Unlock className="w-3.5 h-3.5 opacity-50 shrink-0 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 opacity-50 shrink-0 text-red-400" />
              )
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 surface-security border-b border-[#213F66] flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-[#0A1422] px-3 py-1.5 rounded border border-[#213F66]">
              <span className="h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_8px_currentColor] animate-pulse"></span>
              <span className="hidden md:inline text-[9px] font-black text-cyan-400 uppercase tracking-widest">SYSTEM SECURE</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0F1E2C] p-4 md:p-6 flex flex-col items-center">
        
        {/* =========================================================================
            TAB 1: LIVE SCANNER
        ========================================================================= */}
        {activeTab === 'scanner' && (
          <div className="w-full max-w-[1400px] animate-fade-in flex flex-col space-y-6 pb-10">
            
            {/* 1. SCREENING WORKFLOW STATUS */}
            <div className="flex items-center justify-between surface-info rounded-xl p-4">
               <div className={`flex flex-col items-center flex-1 ${files.length === 0 && !isAnalyzing && !analysisResult ? 'opacity-100' : 'opacity-40'}`}>
                 <span className="text-[10px] font-black text-cyan-500 tracking-widest mb-1">01</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-center">DOCUMENT INTAKE</span>
               </div>
               <svg className="w-5 h-5 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               <div className={`flex flex-col items-center flex-1 ${files.length > 0 && !isAnalyzing && !analysisResult ? 'opacity-100' : 'opacity-40'}`}>
                 <span className="text-[10px] font-black text-cyan-500 tracking-widest mb-1">02</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-center">LIVE IDENTITY CAPTURE</span>
               </div>
               <svg className="w-5 h-5 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               <div className={`flex flex-col items-center flex-1 ${isAnalyzing ? 'opacity-100 animate-pulse' : 'opacity-40'}`}>
                 <span className="text-[10px] font-black text-cyan-500 tracking-widest mb-1">03</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-center">AI SECURITY ANALYSIS</span>
               </div>
               <svg className="w-5 h-5 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               <div className={`flex flex-col items-center flex-1 ${analysisResult ? 'opacity-100' : 'opacity-40'}`}>
                 <span className="text-[10px] font-black text-emerald-400 tracking-widest mb-1">04</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-center">OFFICER REVIEW READY</span>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SECTION 1: DOCUMENT INTAKE */}
              <div className="surface-tech tech-panel flex flex-col min-h-[420px]">
                <div className="surface-tech-header p-4 flex justify-between items-center relative">
                  <h2 className="uppercase tracking-widest text-xs font-black flex items-center">
                    <svg className="w-4 h-4 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    DOCUMENT INTAKE
                  </h2>
                  <p className="text-[9px] font-bold text-cyan-200/50 mt-1 uppercase tracking-widest">UPLOAD TRAVEL OR IDENTITY DOCUMENT FOR SECURITY SCREENING</p>
                  {isAnalyzing && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cyan-400 animate-pulse"></div>}
                
                </div>
                <div className="p-5 flex-1 flex flex-col relative">
                  {/* Format chips */}
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {['PASSPORT', 'VISA', 'NATIONAL ID', 'IDENTITY CARD', 'PDF', 'IMAGE'].map(format => (
                      <span key={format} className="text-[8px] font-bold px-2 py-0.5 rounded border border-[#213F66] bg-[#0A1422] text-cyan-400">{format}</span>
                    ))}

                  </div>
                  {files.length === 0 ? (
                    <div 
                      onClick={handleFileClick}
                      className="border-2 border-dashed border-[#213F66] rounded-lg p-8 flex flex-col items-center justify-center flex-1 transition-all cursor-pointer bg-[#0A1422] hover:bg-[#0F1E2C] hover:border-blue-300 group relative overflow-hidden min-h-[250px] shadow-inner"
                    >
                       <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.05)_50%,transparent_100%)] bg-[length:100%_4px] opacity-20 pointer-events-none group-hover:opacity-100"></div>
                       <svg className="h-12 w-12 text-cyan-400 mb-3 group-hover:text-blue-700 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-white font-bold tracking-widest uppercase mb-1 z-10 text-center">DRAG & DROP DOCUMENT</p>
                        <p className="text-[10px] text-cyan-400 font-mono z-10 text-center">or click to browse secure file system</p>
                    </div>
                  ) : (
                    <div className="flex flex-col flex-1 animate-fade-in relative z-10 h-full">
                      <div className="overflow-y-auto max-h-[300px] custom-scrollbar space-y-4 pr-1">
                        {files.map((doc, index) => (
                          <div key={doc.id} className="flex flex-col animate-fade-in relative z-10 bg-[#0F1E2C]/50 border border-[#213F66] rounded-lg p-3">
                            <div className="flex gap-4 mb-3 items-stretch h-20">
                              {/* Preview */}
                              <div className="relative group rounded-md bg-[#0A1422] border border-[#213F66] flex items-center justify-center overflow-hidden shadow-sm flex-1">
                                {doc.previewUrl ? (
                                  <>
                                    <img src={doc.previewUrl} alt={doc.file.name} className={`h-full w-full object-cover transition-all ${(doc.scanStatus === 'processing' || isAnalyzing) ? 'opacity-40 grayscale sepia-[.2]' : 'opacity-90'}`} />
                                    {doc.scanStatus === 'processing' && (
                                      <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_8px_1px_rgba(34,211,238,0.5),0_-10px_20px_rgba(34,211,238,0.1)] animate-scan-vertical z-20 pointer-events-none"></div>
                                    )}
                                  </>
                                ) : (
                                  <svg className="h-10 w-10 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                )}
                                {!isAnalyzing && !analysisResult && (
                                  <button 
                                    onClick={(e) => removeFile(doc.id, e)}
                                    className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all z-40 border border-red-400"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                )}
                              
                              </div>
                              {/* Extracted Portrait */}
                              {doc.portrait?.imageData ? (
                                <div className="w-24 shrink-0 border border-[#213F66] rounded-md bg-[#0A1422] relative flex items-center justify-center overflow-hidden">
                                   <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.1)_50%,transparent_100%)] bg-[length:100%_4px] opacity-30 pointer-events-none z-10"></div>
                                   <img src={doc.portrait.imageData} alt="Extracted" className="w-full h-full object-cover object-top grayscale sepia-[.1]" />
                                   <div className="absolute bottom-0 w-full bg-[#0A1422]/80  border-t border-[#213F66] p-1 text-center z-20">
                                     <p className="text-[6px] text-blue-700 font-bold uppercase tracking-widest">PORTRAIT</p>
                                   </div>
                                </div>
                              ) : doc.scanStatus === 'processing' ? (
                                <div className="w-24 shrink-0 border border-[#213F66] rounded-md bg-[#0A1422] flex flex-col items-center justify-center ">
                                  <svg className="w-6 h-6 text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                  <p className="text-[6px] text-cyan-400 font-bold uppercase tracking-widest text-center px-1">EXTRACTING...</p>
                                </div>
                              ) : null}

                            </div>
                            {/* Document Intelligence */}
                            <div className="bg-[#0A1422] border border-[#213F66] rounded p-2 text-sm">
                              <div className="flex justify-between items-center mb-1 border-b border-[#213F66] pb-1">
                                 <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">DOCUMENT {String(index + 1).padStart(2, '0')}</span>
                                 {doc.scanStatus === 'completed' ? (
                                   <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                      SCAN COMPLETE
                                   </span>
                                 ) : doc.scanStatus === 'processing' ? (
                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest  flex items-center">
                                      <svg className="animate-spin w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                      SCANNING...
                                    </span>
                                 ) : (
                                   <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">READY FOR SCAN</span>
                                 )}
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                   {doc.file.name.toLowerCase().includes('passport') ? 'PASSPORT' : 
                                    doc.file.name.toLowerCase().includes('visa') ? 'VISA' : 
                                    doc.file.name.toLowerCase().includes('pr') ? 'PERMANENT RESIDENT CARD' : 'NATIONAL ID FORMAT'}
                                 </span>
                                 {doc.scanStatus === 'completed' && (
                                   <span className="text-[8px] font-bold bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded border border-emerald-300">FORMAT VERIFIED</span>
                                 )}
                              </div>
                              <div className="flex justify-between items-center mt-1 pt-1 border-t border-[#213F66]">
                                <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">FILE</span>
                                <span className="text-[9px] font-mono text-cyan-400 truncate max-w-[150px]">{doc.file.name} ({(doc.file.size / 1024).toFixed(1)} KB)</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      
                      </div>
                      {!isAnalyzing && !analysisResult && (
                        <button 
                          onClick={handleFileClick}
                          className="mt-4 w-full py-3 border border-dashed border-blue-300 bg-cyan-900/20 hover:bg-cyan-900/40 text-blue-700 font-bold text-[10px] rounded uppercase tracking-widest transition-colors flex justify-center items-center group"
                        >
                          <svg className="w-3.5 h-3.5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                          + ADD DOCUMENT
                        </button>
                      )}
                    </div>
                  )}
                  <input type="file" multiple accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                </div>
              </div>

              {/* SECTION 2: LIVE IDENTITY CAPTURE */}
              <div className="surface-tech tech-panel flex flex-col min-h-[420px]">
                <div className="surface-tech-header p-4 flex justify-between items-center relative">
                  <div>
                    <h2 className="uppercase tracking-widest text-xs font-black flex items-center">
                      <svg className="w-4 h-4 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      LIVE IDENTITY VERIFICATION
                    </h2>
                    <p className="text-[9px] font-bold text-cyan-200/50 mt-1 uppercase tracking-widest">CAPTURE A LIVE SUBJECT IMAGE FOR BIOMETRIC COMPARISON</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 bg-[#0A1422]/50 px-2 py-1 rounded border border-[#213F66]">
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${cameraError ? 'bg-red-500 text-red-500' : 'bg-emerald-400 text-emerald-400 animate-pulse'} `}></div>
                    <span className="text-[9px] font-bold tracking-widest uppercase text-cyan-100">{cameraError ? 'OFFLINE' : 'ONLINE'}</span>
                  </div>
                  {isAnalyzing && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cyan-400 animate-pulse"></div>}
                
                </div>
                <div className="flex-1 bg-[#0A1422] relative overflow-hidden p-4 flex flex-col">
                   <div className="flex-1 relative rounded-lg border border-[#213F66] overflow-hidden bg-[#0F1E2C] flex items-center justify-center shadow-inner">
                     {cameraError ? (
                        <div className="text-center z-10 p-4">
                          <svg className="mx-auto h-12 w-12 text-red-500/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p className="text-cyan-400 font-bold uppercase tracking-widest text-[10px] text-center">CAMERA SIGNAL DISCONNECTED</p>
                        </div>
                      ) : (
                        <>
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isAnalyzing ? 'brightness-50 sepia-[.3] hue-rotate-15' : 'brightness-90'}`}
                          ></video>
                          
{/* Targeting Frame */}
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                            <div className="relative w-full max-w-[200px] aspect-[3/4] flex items-center justify-center">
                              <div className={`w-full h-full transition-all duration-500 ${isAnalyzing ? 'tech-face-frame border-transparent' : 'border-2 border-dashed border-white/20'}`}>
                                {isAnalyzing && (
                                  <>
                                    <div className="tech-face-frame-inner"></div>
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-scan-vertical z-10 overflow-hidden"></div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-4 left-4 bg-[#0A1422]/80 border border-cyan-500/30 px-3 py-1.5 rounded backdrop-blur shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                             <p className={`text-[8px] font-bold uppercase tracking-widest flex items-center ${isAnalyzing ? 'text-cyan-400' : 'text-emerald-400'}`}>
                               <span className={`w-1.5 h-1.5 rounded-full mr-2 shadow-[0_0_5px_currentColor] ${isAnalyzing ? 'bg-cyan-400' : 'bg-emerald-400'} `}></span>
                               {isAnalyzing ? 'BIOMETRIC SCAN IN PROGRESS' : 'READY FOR CAPTURE'}
                             </p>
                          
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 text-center">
                            {isAnalyzing ? (
                               <p className="text-[10px] font-mono text-cyan-100 bg-cyan-900/60 px-4 py-2 rounded inline-block border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur animate-pulse">
                                 EXTRACTING 128-POINT FACIAL VECTOR...
                               </p>
                            ) : (
                               <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded inline-block backdrop-blur">
                                 POSITION SUBJECT INSIDE THE FRAME
                               </p>
                            )}
                          
                          </div>
                          {/* Scan Line effect when analyzing */}
                          {isAnalyzing && <div className="tech-scan-line-overlay"></div>}
                        </>
                      )}
                   </div>
                </div>
              </div>
            </div>

            {/* SCREENING COMMAND CENTER & ANALYSIS PIPELINE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left/Middle: Command Control */}
              <div className="lg:col-span-1 surface-tech tech-panel flex flex-col min-h-[300px]">
                <div className="surface-tech-header p-4 flex justify-between items-center relative">
                  <h2 className="uppercase tracking-widest text-xs font-black flex items-center">
                    <svg className="w-4 h-4 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    AI SCREENING CONTROL
                  </h2>
                  {isAnalyzing && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cyan-400 animate-pulse"></div>}
                
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center bg-[#0F1E2C] p-2 rounded border border-[#213F66]">
                      <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">DOCUMENT INTAKE</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${files.length > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-300' : 'bg-[#0A1422] text-cyan-400 border border-[#213F66]'}`}>
                        {files.length > 0 ? 'READY' : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-[#0F1E2C] p-2 rounded border border-[#213F66]">
                      <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">LIVE IDENTITY</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${!cameraError ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-300' : 'bg-red-500/20 text-red-400 border border-red-300'}`}>
                        {!cameraError ? 'READY' : 'ERROR'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-[#0F1E2C] p-2 rounded border border-[#213F66]">
                      <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">AI ENGINE STATUS</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isAnalyzing ? 'bg-cyan-500/20 text-blue-700 border border-blue-300 ' : 'bg-[#0A1422] text-cyan-400 border border-[#213F66]'}`}>
                        {isAnalyzing ? 'PROCESSING' : 'STANDBY'}
                      </span>

                    </div>
                  </div>
                  {!analysisResult ? (
                    <button
                      onClick={handleAnalyze}
                      disabled={files.length === 0 || isAnalyzing || cameraError}
                      className={`w-full py-4 rounded font-black text-sm uppercase tracking-widest transition-all shadow-sm flex items-center justify-center shrink-0 border relative overflow-hidden group
                        ${(files.length === 0 || isAnalyzing || cameraError) 
                          ? 'bg-[#0A1422] text-cyan-400 cursor-not-allowed border-[#213F66]' 
                          : 'bg-blue-600 text-white hover:bg-blue-500 border-blue-400 hover:shadow-sm hover:-translate-y-0.5'}`}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] w-[200%] animate-[shimmer_1.5s_infinite] -translate-x-full"></div>
                          <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          EXECUTING PROTOCOL...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          START SECURITY ANALYSIS
                        </>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setFiles([]);
                        setAnalysisResult(null);
                        setFaceVerificationResult(null);
                        setfinalSubjectPortrait(null);
                        setLogs([]);
                        if(fileInputRef.current) fileInputRef.current.value = '';
                      }} 
                      className="w-full py-3 border border-[#213F66] bg-[#0A1422] hover:bg-[#14263D] text-white font-bold text-[10px] rounded uppercase tracking-widest transition-colors flex justify-center items-center"
                    >
                      <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      CLEAR & RESET SCANNER
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Security Processing Log */}
              <div className="lg:col-span-2 surface-tech tech-panel flex flex-col min-h-[300px]">
                <div className="surface-tech-header p-3 flex justify-between items-center relative">
                  <h2 className="uppercase tracking-widest text-[10px] font-black flex items-center">
                    <svg className="w-3.5 h-3.5 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    SECURITY PROCESSING LOG
                  </h2>
                  <div className="flex space-x-1 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-cyan-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-500/50"></div>
                  </div>
                  {isAnalyzing && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cyan-400 animate-pulse"></div>}
                
                </div>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-[#2A3B54] bg-[#0F1E2C] text-[8px] font-bold text-blue-400 uppercase tracking-widest">

                  <div className="col-span-2">TIME</div>
                  <div className="col-span-3">PROCESS</div>
                  <div className="col-span-2 text-center">STATUS</div>
                  <div className="col-span-5">MESSAGE</div>

                </div>
                {/* Log Content - Hide Scrollbar with utility class */}
                <div className="p-2 flex-1 overflow-y-auto w-full box-border font-mono text-[10px] space-y-0.5 custom-scrollbar pb-4 max-h-[250px]">
                  {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-blue-400 italic">SYSTEM STANDBY. WAITING FOR ANALYSIS INITIATION...</div>
                  ) : (
                    logs.map((log, index) => {
                      const isCritical = log.includes('[CRITICAL]');
                      const isWarn = log.includes('[WARN]');
                      const isInfo = log.includes('[INFO]');
                      const statusColor = isCritical ? 'text-red-400 bg-red-500/10 border-red-300' : isWarn ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-300';
                      const statusText = isCritical ? 'CRITICAL' : isWarn ? 'WARNING' : 'OK';
                      const msgColor = isCritical ? 'text-red-400' : isWarn ? 'text-orange-400' : 'text-slate-300';
                      
                      // Extract message
                      let msg = log;
                      if(msg.startsWith('[')) {
                        msg = msg.split(']').slice(1).join(']').trim();
                      }
                      
                      // Guess Process Name
                      let process = "SYSTEM KERNEL";
                      if(msg.toLowerCase().includes('face') || msg.toLowerCase().includes('biometric')) process = "BIOMETRIC ENGINE";
                      else if(msg.toLowerCase().includes('document') || msg.toLowerCase().includes('ocr')) process = "FORENSIC PARSER";
                      else if(msg.toLowerCase().includes('tampering')) process = "SECURITY AUDIT";
                      else if(msg.toLowerCase().includes('phonetic')) process = "DATABASE SYNC";
                      else if(msg.toLowerCase().includes('risk')) process = "RISK ASSESSOR";

                      return (
                        <div key={index} className="grid grid-cols-12 gap-2 px-2 py-1.5 items-center even:bg-[#162A3D] odd:bg-[#14263D] text-slate-300 border-[#2A3B54] hover:bg-[#0A1422] rounded transition-colors animate-fade-in border-b border-[#213F66]/30 last:border-0">
                          <div className="col-span-2 text-cyan-400">{new Date().toISOString().split('T')[1].slice(0, 8)}</div>
                          <div className="col-span-3 text-blue-600/70 truncate pr-2">{process}</div>
                          <div className="col-span-2 text-center">
                            <span className={`px-1.5 py-[1px] rounded border ${statusColor} text-[8px]`}>{statusText}</span>
                          </div>
                          <div className={`col-span-5 truncate ${msgColor}`} title={msg}>{msg}</div>
                        </div>
                      )
                    })
                  )}
                  {isAnalyzing && (
                    <div className="grid grid-cols-12 gap-2 px-2 py-1.5 items-center ">
                      <div className="col-span-2 text-blue-400">{new Date().toISOString().split('T')[1].slice(0, 8)}</div>
                      <div className="col-span-3 text-cyan-700/50">ACTIVE PROCESS</div>
                      <div className="col-span-2 text-center"><span className="text-blue-400 text-[8px]">...</span></div>
                      <div className="col-span-5 text-cyan-400">_</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ANALYSIS RESULTS SUMMARY */}
            {analysisResult && (
              <div className="bg-[#0A1422]  border border-blue-300 rounded-xl shadow-sm flex flex-col overflow-hidden animate-fade-in mt-4 border-t-4 border-t-cyan-500 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none"></div>
                
                {/* Temporary Dev Debug Panel for Extraction Pipeline */}
                {IS_DEV_MODE && finalSubjectPortrait?.debugCandidates && (
                  <div className="absolute top-2 right-2 bg-[#0A1422]/80 text-green-400 font-mono text-[9px] p-2 rounded border border-green-500 z-50 max-w-xs text-left shadow-lg overflow-y-auto max-h-32">
                    <div className="font-bold border-b border-green-800 pb-1 mb-1">PORTRAIT CANDIDATES FOUND: {finalSubjectPortrait.debugCandidates.length}</div>
                    {finalSubjectPortrait.debugCandidates.map((c, i) => (
                      <div key={i} className="mb-1">
                        <div>CANDIDATE {i + 1}:</div>
                        <div className="pl-2">Method: {c.method}</div>
                        <div className="pl-2">Face confidence: {Math.round(c.score * 100)}%</div>
                      </div>
                    ))}
                    <div className="mt-1 pt-1 border-t border-green-800 text-blue-700">
                      SELECTED PORTRAIT: {finalSubjectPortrait.method} ({finalSubjectPortrait.score}%)
                    </div>
                  </div>
                )}

                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="shrink-0 relative">
                    <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-300 flex items-center justify-center rounded-full shadow-sm">
                      <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    {/* Ring animation */}
                    <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping opacity-20"></div>
                  
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-1 shadow-sm">SCREENING COMPLETE</h2>
                    <p className="text-cyan-400 font-mono text-xs mb-4">Initial automated security assessment finished. Officer review is now required.</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                       <div className="bg-[#0F1E2C] border border-[#213F66] px-3 py-1.5 rounded flex items-center shadow-inner">
                         <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mr-2">DOCUMENT</span>
                         <span className="text-[9px] font-black text-emerald-400">SCANNED</span>
                       </div>
                       <div className="bg-[#0F1E2C] border border-[#213F66] px-3 py-1.5 rounded flex items-center shadow-inner">
                         <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mr-2">PORTRAIT</span>
                         <span className={`text-[9px] font-black ${finalSubjectPortrait?.imageData ? 'text-emerald-400' : 'text-red-400'}`}>{finalSubjectPortrait?.imageData ? 'EXTRACTED' : 'FAILED'}</span>
                       </div>
                       <div className="bg-[#0F1E2C] border border-[#213F66] px-3 py-1.5 rounded flex items-center shadow-inner">
                         <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mr-2">BIOMETRIC 1:1</span>
                         <span className={`text-[9px] font-black ${faceVerificationResult?.verified ? 'text-emerald-400' : 'text-red-400'}`}>{faceVerificationResult?.verified ? 'MATCH' : 'MISMATCH'}</span>

                       </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-full md:w-auto mt-4 md:mt-0">
                    <button 
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setActiveTab('profile');
                      }} 
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs py-4 px-8 rounded-lg uppercase tracking-widest transition-all shadow-sm flex items-center w-full md:w-auto justify-center group hover:scale-105"
                    >
                      CONTINUE TO SECURITY REVIEW
                      <svg className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: ACTIVE PROFILE (Deep-Dive)
        ========================================================================= */}
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
                <div ref={biometricRef} className={`surface-tech tech-panel p-5 mb-4 flex flex-col transition-all duration-700 ease-out opacity-100 translate-y-0`}>
                  <h2 className="uppercase tracking-widest text-[10px] font-black text-cyan-400 mb-4 border-b border-[#213F66] pb-2 flex items-center">
                    <svg className="w-4 h-4 text-cyan-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    BIOMETRIC VERIFICATION
                  </h2>
                  <div className="flex flex-row items-center justify-center gap-4 md:gap-12 py-8 w-full flex-nowrap">
                    
                    {/* 1. DOCUMENT PORTRAIT */}
                    <div className="flex flex-col items-center justify-center w-28 md:w-36 shrink-0">
                      <div className="w-28 md:w-32 h-36 md:h-40 bg-[#0A1422] rounded-lg border border-[#213F66] overflow-hidden mb-3 shadow-md flex items-center justify-center">
                        {finalSubjectPortrait?.imageData ? (
                          <img src={finalSubjectPortrait.imageData} alt="Document Portrait" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-blue-400 text-xs">NO FACE</div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest text-center">DOCUMENT PORTRAIT</span>
                    </div>

                    {/* 2. IDENTITY MISMATCH / SIMILARITY */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
                        {/* Circular Scanner Background */}
                        <div className="absolute inset-0 rounded-full border-4 border-[#213F66] opacity-30"></div>
                        <div className={`absolute inset-0 rounded-full border-t-4 animate-spin ${faceVerificationResult?.verified ? 'border-emerald-400' : faceVerificationResult?.status === 'IDENTITY_MISMATCH' ? 'border-red-500' : 'border-cyan-400'}`}></div>
                        
                        <div className={`flex flex-col items-center justify-center rounded-full w-32 h-32 md:w-40 md:h-40 bg-[#0F1E2C] border-2 z-10 p-2 ${faceVerificationResult?.verified ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : faceVerificationResult?.status === 'IDENTITY_MISMATCH' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-cyan-500/50'}`}>
                        {faceVerificationResult?.verified ? (
                          <>
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-emerald-500 mb-1 md:mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-black text-emerald-500 text-xs md:text-sm uppercase tracking-widest mb-1 text-center leading-tight">✓ MATCH VERIFIED</span>
                            <span className="text-[9px] md:text-[10px] text-emerald-400/80 uppercase text-center">SIMILARITY: {faceVerificationResult?.similarityScore}%</span>
                          </>
                        ) : faceVerificationResult?.status === 'IDENTITY_MISMATCH' ? (
                          <>
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-red-500 mb-1 md:mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="font-black text-red-500 text-xs md:text-sm uppercase tracking-widest mb-1 text-center leading-tight">✕ IDENTITY MISMATCH</span>
                            <span className="text-[9px] md:text-[10px] text-red-400/80 uppercase text-center">SIMILARITY: {faceVerificationResult?.similarityScore || 0}%</span>
                          </>
                        ) : (
                           <>
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-cyan-400 mb-1 md:mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="font-black text-cyan-400 text-xs md:text-sm uppercase tracking-widest mb-1 text-center leading-tight">NO COMPARISON</span>
                            <span className="text-[9px] md:text-[10px] text-cyan-400/80 uppercase text-center leading-tight">{faceVerificationResult?.status}</span>
                          </>
                        )}
                        </div>
                      </div>
                    </div>

                    {/* 3. LIVE WEBCAM CAPTURE */}
                    <div className="flex flex-col items-center justify-center w-28 md:w-36 shrink-0">
                      <div className="w-28 md:w-32 h-36 md:h-40 bg-[#0A1422] rounded-lg border border-[#213F66] overflow-hidden mb-3 shadow-md flex items-center justify-center">
                        {liveWebcamFaceData ? (
                          <img src={liveWebcamFaceData} alt="Live Webcam Capture" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-blue-400 text-xs text-center p-2">NO VALID FACE DETECTED</div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest text-center">LIVE WEBCAM CAPTURE</span>
                    </div>

                  </div>
                </div>

                {/* PHONETIC NAME MATCH */}
                {phoneticMatch && (
                  <div className={`surface-tech tech-panel p-5 mb-4 flex flex-col transition-all duration-700 ease-out border-2 ${phoneticMatch.isMatch ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-[#1A1814]' : 'border-[#213F66]'}`}>
                    <h2 className={`uppercase tracking-widest text-[10px] font-black mb-4 border-b pb-2 flex items-center ${phoneticMatch.isMatch ? 'text-amber-400 border-amber-500/50' : 'text-cyan-400 border-[#213F66]'}`}>
                      <svg className={`w-4 h-4 mr-2 ${phoneticMatch.isMatch ? 'text-amber-500' : 'text-cyan-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M17.657 6.343a8 8 0 010 11.314M12 10v4m-4-2h.01M5 12a7 7 0 1114 0 7 7 0 01-14 0z" />
                      </svg>
                      PHONETIC NAME MATCH ANALYSIS
                    </h2>
                    
                    {phoneticMatch.isMatch ? (
                      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex items-center mb-2">
                            <span className="px-2 py-1 bg-amber-500 text-[#0A1422] text-[9px] font-black uppercase tracking-widest rounded mr-3">ALERT</span>
                            <span className="text-sm font-bold text-amber-400 tracking-wide">Potential Identity Match Detected</span>
                          </div>
                          <p className="text-xs text-amber-200/80 mt-1 mb-4">A phonetically similar name was found in the watchlist/master database, suggesting an alternate spelling or known alias.</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[#0A1422] p-4 rounded border border-amber-500/20">
                            <div>
                              <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest mb-1">Document Name</p>
                              <p className="text-sm font-mono text-cyan-300 truncate">{phoneticMatch.documentName || analysisResult?.nameExtracted}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest mb-1">Matched Record Name</p>
                              <p className="text-sm font-mono text-amber-400 truncate">{phoneticMatch.matchedName}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest mb-1">Phonetic Similarity</p>
                              <p className="text-sm font-mono text-white">{phoneticMatch.similarity}%</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest mb-1">Match Type</p>
                              <p className="text-xs font-mono text-white truncate">{phoneticMatch.matchType}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest mb-1">Status</p>
                              <p className="text-xs font-mono text-amber-400 font-bold truncate">{phoneticMatch.status}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-[#71899A] uppercase tracking-widest mb-1">Record ID & Threat Level</p>
                              <p className="text-xs font-mono text-red-400 truncate">{phoneticMatch.caseId} — {phoneticMatch.threatLevel}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-6">
                        <svg className="w-6 h-6 text-emerald-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm font-bold text-emerald-400 tracking-widest uppercase">NO PHONETIC MATCH FOUND IN DATABASE</span>
                      </div>
                    )}
                  </div>
                )}

{/* 2. SECURITY ANALYSIS MATRIX */}
                <div ref={timelineRef} className={`surface-tech tech-panel p-6 relative overflow-x-auto transition-all duration-700 ease-out ${timelineInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
                      <div key={i} className={`relative z-10 flex flex-col items-center group transition-all duration-700 ease-out ${timelineInView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{ transitionDelay: `${i * 150 + 100}ms` }}>
                        <div className={`w-36 bg-[#0E1B2E] border-2 rounded p-3 flex flex-col items-center justify-center shadow-lg transition-transform hover:-translate-y-1
                          ${step.status === 'ok' ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 
                            step.status === 'warn' ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 
                            'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step.status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' : step.status === 'warn' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                             {step.icon === 'camera' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>}
                             {step.icon === 'text' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                             {step.icon === 'alert' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                             {step.icon === 'face' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                             {step.icon === 'shield' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                             {step.icon === 'network' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                          </div>
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest text-center leading-tight mb-1">{step.label}</span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest mb-2 ${step.status === 'ok' ? 'text-emerald-400' : step.status === 'warn' ? 'text-amber-400' : 'text-red-400'}`}>{step.msg}</span>
                          <span className="text-[9px] font-mono text-cyan-200 bg-[#12243A] px-2 py-0.5 rounded border border-[#213F66]">
                            CF: {step.conf}
                          </span>
                        </div>
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
                              <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">DETECTED ALIAS</p>
                              <p className="text-[7px] font-mono text-white">DOCUMENT FORGERY MATCH</p>
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
                              <p className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">ASSOCIATED PERSON</p>
                              <p className="text-[7px] font-mono text-white">SYNDICATE MEMBER</p>
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
                              <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">WATCHLIST RECORD</p>
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
                              <p className="text-[10px] font-mono text-white truncate">{phoneticMatch?.matchedName || 'Muhammad Rehman'}</p>
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

        {/* =========================================================================
            TAB 3: MASTER DATABASE
        ========================================================================= */}
              {activeTab === 'database' && (
        <div className="w-full max-w-7xl flex flex-col space-y-6 mt-4 pb-10 relative">
          {!dbUnlocked ? (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] animate-fade-in">
              <div className="surface-tech tech-panel border-2 border-cyan-800 p-8 max-w-md w-full flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-blue-500 to-blue-900"></div>
                
                <Shield className="w-16 h-16 text-blue-500 mb-4" />
                
                <h2 className="text-xl font-black text-white uppercase tracking-widest text-center mb-1">MASTER INTELLIGENCE DATABASE</h2>
                <div className="bg-red-500/20 border border-red-500/50 px-3 py-1 rounded text-[10px] font-bold text-red-400 uppercase tracking-widest mb-6">RESTRICTED ACCESS</div>
                
                <p className="text-xs text-blue-400 text-center mb-8 font-mono leading-relaxed">This database contains sensitive border security screening records. Authorized personnel only.</p>

                {authStatus === 'LOCKED' && (
                  <div className="w-full flex flex-col items-center animate-fade-in">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2">OFFICER ACCESS PIN</span>
                    <div className="bg-blue-900/40 border border-blue-500/30 px-3 py-1.5 rounded mb-4 text-center"><span className="text-[10px] text-blue-300 font-mono">PROTOTYPE ACCESS CODE: </span><span className="text-[12px] font-bold text-white tracking-widest">1234</span></div>
                    
                    <div className="flex items-center space-x-3 mb-6">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="w-12 h-14 bg-[#0F1E2C] border border-[#2A3B54] rounded shadow-inner flex items-center justify-center">
                          {pin.length > i ? <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span> : <span className="w-2 h-2 rounded-full bg-slate-700"></span>}
                        </div>
                      ))}

                    </div>
                    <div className="grid grid-cols-3 gap-3 w-full max-w-[200px] mb-6">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'CLEAR', 0, 'SUBMIT'].map((btn, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.preventDefault();
                            if (btn === 'CLEAR') setPin('');
                            else if (btn === 'SUBMIT') handlePinSubmit(e);
                            else if (pin.length < 4) setPin(prev => prev + btn);
                          }}
                          className={`h-12 rounded border text-xs font-bold transition-colors shadow-sm
                            ${btn === 'CLEAR' ? 'bg-[#1A2639] border-[#2A384F] text-blue-400 hover:text-white' : 
                              btn === 'SUBMIT' ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)] hover:bg-blue-500' : 
                              'bg-[#0F1E2C] border-[#2A3B54] text-white hover:bg-[#1A2639]'}`}
                        >
                          {btn === 'CLEAR' ? <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg> : 
                           btn === 'SUBMIT' ? <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : 
                           btn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {authStatus === 'VERIFYING' && (
                  <div className="w-full flex flex-col items-center justify-center py-10 animate-fade-in">
                    <svg className="animate-spin w-8 h-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest text-center">VERIFYING SECURITY CLEARANCE...<br/>VALIDATING OFFICER CREDENTIALS...</span>
                  </div>
                )}

                {authStatus === 'DENIED' && (
                  <div className="w-full flex flex-col items-center justify-center py-10 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border-2 border-red-500 animate-pulse">
                      <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <span className="text-lg font-black text-red-500 uppercase tracking-widest text-center mb-1">ACCESS DENIED</span>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest text-center">UNAUTHORIZED DATABASE ACCESS ATTEMPT</span>
                  </div>
                )}
                
                {authStatus === 'GRANTED' && (
                  <div className="w-full flex flex-col items-center justify-center py-10 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-lg font-black text-emerald-400 uppercase tracking-widest text-center mb-1">ACCESS GRANTED</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in w-full flex flex-col space-y-6">
              {/* RESTRICTED ACCESS HEADER */}
              <div className="surface-tech-header rounded p-4 flex flex-col md:flex-row justify-between items-center border border-[#213F66]">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-widest leading-tight">MASTER INTELLIGENCE DATABASE</h2>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-0.5">Restricted Government Access - Authorized Personnel Only</p>
                
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">ACCESS LEVEL: AUTHORIZED</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">SECURITY CLEARANCE: LEVEL 4</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">SESSION: ACTIVE</span>
                    <button 
                      onClick={() => { setDbUnlocked(false); setAuthStatus('LOCKED'); }}
                      className="ml-2 px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600 hover:text-white rounded text-[8px] font-black uppercase tracking-widest transition-colors flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      LOCK DATABASE
                    </button>
                  </div>
                </div>
              </div>

          {/* STATISTICS OVERVIEW */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="surface-tech tech-panel p-4 flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-[#14263D]"></div>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1 mt-1 text-center">TOTAL SCREENINGS</span>
              <span className="text-2xl font-mono text-white font-black">{databaseRecords.length}</span>
            </div>
            <div className="surface-tech tech-panel p-4 flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-emerald-500"></div>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1 mt-1 text-center">CLEARED</span>
              <span className="text-2xl font-mono text-emerald-600 font-black">{databaseRecords.filter(r => r.status === 'CLEARED').length}</span>
            </div>
            <div className="surface-tech tech-panel p-4 flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-amber-500"></div>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1 mt-1 text-center">PENDING REVIEW</span>
              <span className="text-2xl font-mono text-amber-600 font-black">{databaseRecords.filter(r => r.status.includes('PENDING')).length}</span>
            </div>
            <div className="surface-tech tech-panel p-4 flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-red-600"></div>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1 mt-1 text-center">REJECTED</span>
              <span className="text-2xl font-mono text-red-600 font-black">{databaseRecords.filter(r => r.status === 'REJECTED').length}</span>
            </div>
            <div className="surface-tech tech-panel p-4 flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-red-800"></div>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1 mt-1 text-center">HIGH RISK CASES</span>
              <span className="text-2xl font-mono text-red-800 font-black">{databaseRecords.filter(r => r.riskLevel === 'CRITICAL').length}</span>
            </div>
            <div className="surface-tech tech-panel p-4 flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-fuchsia-500"></div>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1 mt-1 text-center">WATCHLIST MATCHES</span>
              <span className="text-2xl font-mono text-fuchsia-600 font-black">{databaseRecords.filter(r => (r.securityFindings && r.securityFindings.some(f => f.toUpperCase().includes('WATCHLIST') || f.toUpperCase().includes('SYNDICATE'))) || (r.threatLevel && (r.threatLevel.toUpperCase().includes('WATCHLIST') || r.threatLevel.toUpperCase().includes('SYNDICATE')))).length}</span>
            </div>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="surface-tech tech-panel p-4 flex flex-col space-y-4">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">RECORD FILTRATION SYSTEM</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <svg className="w-5 h-5 absolute left-3 top-2.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="SEARCH NAME, CASE ID, DOC NUMBER, NATIONALITY..."
                  value={dbSearchQuery}
                  onChange={(e) => setDbSearchQuery(e.target.value)}
                  className="w-full bg-[#0A1422] border border-[#213F66] rounded py-2.5 pl-10 pr-4 text-xs font-mono text-white placeholder-[#60798C] focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">FINAL STATUS</span>
                  <select 
                    value={dbFilterStatus}
                    onChange={(e) => setDbFilterStatus(e.target.value)}
                    className="bg-[#0A1422] border border-[#213F66] text-xs font-bold text-white rounded py-2 px-3 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="ALL">ALL STATUSES</option>
                    <option value="CLEARED">CLEARED</option>
                    <option value="PENDING">PENDING REVIEW</option>
                    <option value="REJECTED">REJECTED / DENIED</option>
                  </select>
                
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">RISK LEVEL</span>
                  <select 
                    value={dbFilterRisk}
                    onChange={(e) => setDbFilterRisk(e.target.value)}
                    className="bg-[#0A1422] border border-[#213F66] text-xs font-bold text-white rounded py-2 px-3 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="ALL">ALL LEVELS</option>
                    <option value="LOW">LOW RISK</option>
                    <option value="MEDIUM">MEDIUM RISK</option>
                    <option value="CRITICAL">HIGH / CRITICAL</option>
                  </select>

                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">DOCUMENT TYPE</span>
                  <select 
                    value={dbFilterDocType}
                    onChange={(e) => setDbFilterDocType(e.target.value)}
                    className="bg-[#0A1422] border border-[#213F66] text-xs font-bold text-white rounded py-2 px-3 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="ALL">ALL TYPES</option>
                    <option value="CANADA PASSPORT">PASSPORT</option>
                    <option value="VISA">VISA</option>
                    <option value="NATIONAL ID">NATIONAL ID</option>
                    <option value="IDENTITY CARD">IDENTITY CARD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

{/* PERSON RECORD TABLE */}
          <div className="surface-tech tech-panel flex flex-col overflow-hidden">
            {/* List Header */}
            <div className="surface-tech-header px-6 py-4 flex items-center justify-between border-b border-[#213F66] bg-[#0A1422]">
              <span className="text-[11px] font-black text-cyan-400 uppercase tracking-widest flex items-center">
                <svg className="w-4 h-4 mr-2 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                INTELLIGENCE REGISTRY
              </span>
              <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-[#0F1E2C] px-3 py-1 rounded border border-[#213F66]">
                SHOWING {
                  databaseRecords.filter(record => {
                    const matchesSearch = dbSearchQuery === '' || 
                      record.name.toLowerCase().includes(dbSearchQuery.toLowerCase()) || 
                      record.caseId.toLowerCase().includes(dbSearchQuery.toLowerCase()) || 
                      record.docNumber?.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
                      record.nationality.toLowerCase().includes(dbSearchQuery.toLowerCase());
                    const matchesStatus = dbFilterStatus === 'ALL' || (dbFilterStatus === 'PENDING' && record.status.includes('PENDING')) || (dbFilterStatus === 'CLEARED' && record.status === 'CLEARED') || (dbFilterStatus === 'REJECTED' && record.status === 'REJECTED');
                    const matchesRisk = dbFilterRisk === 'ALL' || record.riskLevel === dbFilterRisk || (dbFilterRisk === 'CRITICAL' && record.riskLevel === 'HIGH');
                    const matchesDocType = dbFilterDocType === 'ALL' || record.documentType?.includes(dbFilterDocType);
                    return matchesSearch && matchesStatus && matchesRisk && matchesDocType;
                  }).length
                } RESULTS
              </span>
            </div>

            {/* Table Container */}
            <div className="w-full overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-[#0A1422] sticky top-0 z-10 shadow-md">
                  <tr>
                    <th className="py-3 px-4 text-[9px] font-black text-cyan-500/70 uppercase tracking-widest border-b border-[#213F66]">CASE ID</th>
                    <th className="py-3 px-4 text-[9px] font-black text-cyan-500/70 uppercase tracking-widest border-b border-[#213F66]">DATE / TIME</th>
                    <th className="py-3 px-4 text-[9px] font-black text-cyan-500/70 uppercase tracking-widest border-b border-[#213F66]">SUBJECT</th>
                    <th className="py-3 px-4 text-[9px] font-black text-cyan-500/70 uppercase tracking-widest border-b border-[#213F66]">NATIONALITY</th>
                    <th className="py-3 px-4 text-[9px] font-black text-cyan-500/70 uppercase tracking-widest border-b border-[#213F66]">DOCUMENT</th>
                    <th className="py-3 px-4 text-[9px] font-black text-cyan-500/70 uppercase tracking-widest border-b border-[#213F66] text-center">RISK</th>
                    <th className="py-3 px-4 text-[9px] font-black text-cyan-500/70 uppercase tracking-widest border-b border-[#213F66] text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2C42]">
                  {databaseRecords.filter(record => {
                        const matchesSearch = dbSearchQuery === '' || 
                          record.name.toLowerCase().includes(dbSearchQuery.toLowerCase()) || 
                          record.caseId.toLowerCase().includes(dbSearchQuery.toLowerCase()) || 
                          record.docNumber?.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
                          record.nationality.toLowerCase().includes(dbSearchQuery.toLowerCase());
                        const matchesStatus = dbFilterStatus === 'ALL' || (dbFilterStatus === 'PENDING' && record.status.includes('PENDING')) || (dbFilterStatus === 'CLEARED' && record.status === 'CLEARED') || (dbFilterStatus === 'REJECTED' && record.status === 'REJECTED');
                        const matchesRisk = dbFilterRisk === 'ALL' || record.riskLevel === dbFilterRisk || (dbFilterRisk === 'CRITICAL' && record.riskLevel === 'HIGH');
                        const matchesDocType = dbFilterDocType === 'ALL' || record.documentType?.includes(dbFilterDocType);
                        return matchesSearch && matchesStatus && matchesRisk && matchesDocType;
                  }).map((record, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => setViewingRecord(record)}
                      className="group hover:bg-[#12243A] cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-mono text-cyan-300 bg-[#0A1422] px-2 py-1 rounded border border-[#213F66]">{record.caseId}</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white">{record.date}</span>
                          <span className="text-[9px] font-mono text-[#71899A]">{record.time}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0A1422] border-2 border-[#213F66] overflow-hidden flex-shrink-0 group-hover:border-cyan-400 transition-colors">
                            {record.portrait ? (
                              <img src={record.portrait} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-5 h-5 text-cyan-600 mx-auto mt-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            )}
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-cyan-400 transition-colors">{record.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-[#A9B8C5] uppercase tracking-widest">{record.nationality}</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{record.documentType}</span>
                          <span className="text-[9px] font-mono text-[#71899A]">{record.docNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className={`inline-block px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded border shadow-sm
                          ${record.riskLevel === 'CRITICAL' ? 'bg-red-900/40 text-red-400 border-red-500/50' :
                             record.riskLevel === 'HIGH' ? 'bg-orange-900/40 text-orange-400 border-orange-500/50' :
                             record.riskLevel === 'MEDIUM' ? 'bg-amber-900/40 text-amber-400 border-amber-500/50' :
                             'bg-emerald-900/40 text-emerald-400 border-emerald-500/50'}`}>
                          {record.riskLevel}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <span className={`text-[9px] font-black uppercase tracking-widest flex items-center justify-end
                          ${record.status === 'CLEARED' ? 'text-emerald-400' :
                             record.status === 'REJECTED' ? 'text-red-500' :
                             'text-amber-400'}`}>
                          {record.status === 'CLEARED' && <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                          {record.status === 'REJECTED' && <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
                          {record.status.includes('PENDING') && <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* DETAILED RECORD DOSSIER MODAL */}
          {viewingRecord && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[#14263D]/80 backdrop-blur-sm transition-opacity" onClick={() => setViewingRecord(null)}></div>
              <div className="relative bg-[#0F1E2C] w-full max-w-5xl max-h-[90vh] rounded shadow-2xl flex flex-col overflow-hidden animate-fade-in border-2 border-[#213F66]">
                
                {/* Dossier Header */}
                <div className="bg-[#14263D] border-b border-[#1D2B42] p-4 flex justify-between items-center flex-shrink-0 shadow-md">
                  <div className="flex items-center">
                    <Shield className="w-6 h-6 text-blue-400 mr-3" />
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">OFFICIAL CASE DOSSIER: {viewingRecord.caseId}</h2>
                  </div>
                  <button onClick={() => setViewingRecord(null)} className="text-blue-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                </div>
                {/* Dossier Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Subject & Biometrics */}
                    <div className="lg:col-span-1 flex flex-col space-y-6">
                      {/* Identity Panel */}
                      <div className="bg-[#0A1422] border border-[#213F66] rounded shadow-sm overflow-hidden">
                        <div className="bg-[#0A1422] border-b border-[#213F66] p-3">
                          <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center">
                            <svg className="w-3.5 h-3.5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            SUBJECT IDENTITY
                          </h3>
                        </div>
                        <div className="p-4 flex flex-col items-center">
                          <div className="w-32 h-40 bg-slate-100 border border-[#213F66] rounded overflow-hidden shadow-inner mb-4 relative">
                            {viewingRecord.portrait ? (
                              <img src={viewingRecord.portrait} alt="Subject" className="w-full h-full object-cover object-top" />
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-blue-400 font-bold">NO PORTRAIT</span>
                            )}
                          </div>
                          <div className="w-full space-y-3">
                            <div>
                              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block mb-0.5">FULL NAME</span>
                              <span className="text-sm font-black text-white">{viewingRecord.name}</span>
                            </div>
                            {viewingRecord.alias && (
                              <div>
                                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest block mb-0.5">DETECTED ALIAS</span>
                                <span className="text-xs font-bold text-white">{viewingRecord.alias}</span>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block mb-0.5">NATIONALITY</span>
                                <span className="text-xs font-bold text-white">{viewingRecord.nationality}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block mb-0.5">DATE OF BIRTH</span>
                                <span className="text-xs font-bold text-white">{viewingRecord.dob || 'UNKNOWN'}</span>

                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Biometrics Panel */}
                      <div className="bg-[#0A1422] border border-[#213F66] rounded shadow-sm overflow-hidden">
                         <div className="bg-[#0A1422] border-b border-[#213F66] p-3">
                          <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center">
                            <svg className="w-3.5 h-3.5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            BIOMETRIC VERIFICATION
                          </h3>
                         </div>
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <div className="w-16 h-20 bg-slate-100 border border-[#213F66] rounded overflow-hidden shadow-inner">
                               {viewingRecord.portrait ? (
                                <img src={viewingRecord.portrait} alt="Doc" className="w-full h-full object-cover object-top" />
                              ) : null}
                            </div>
                            <div className="flex-1 flex flex-col items-center px-2">
                               <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1 text-center">COMPARISON</span>
                               <span className={`text-sm font-black ${viewingRecord.biometricMatch ? 'text-emerald-600' : 'text-red-600'}`}>{viewingRecord.biometricScore}%</span>
                               <svg className={`w-5 h-5 mt-1 ${viewingRecord.biometricMatch ? 'text-emerald-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={viewingRecord.biometricMatch ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
                            </div>
                            <div className="w-16 h-20 bg-slate-100 border border-[#213F66] rounded overflow-hidden shadow-inner">
                               {viewingRecord.livePortrait ? (
                                <img src={viewingRecord.livePortrait} alt="Live" className="w-full h-full object-cover" />
                              ) : (
                                <span className="w-full h-full flex items-center justify-center text-[8px] text-blue-400 font-bold text-center">NO LIVE CAMS</span>
                              )}
                            </div>
                          </div>
                          <div className={`w-full p-2 rounded text-center border shadow-sm ${viewingRecord.biometricMatch ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {viewingRecord.biometricMatch ? '✓ POSITIVE IDENTITY MATCH' : '✕ IDENTITY MISMATCH DETECTED'}
                            </span>

                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Right Column: Forensics, Findings, Decision */}
                    <div className="lg:col-span-2 flex flex-col space-y-6">
                       
                       {/* Final Decision Panel */}
                       <div className={`border-l-8 rounded shadow-sm bg-[#0F1E2C] overflow-hidden flex flex-col md:flex-row items-center justify-between p-5 border ${
                          viewingRecord.status === 'CLEARED' ? 'border-l-emerald-600 border-[#213F66]' : 
                          viewingRecord.status === 'REJECTED' ? 'border-l-red-600 border-[#213F66]' : 
                          'border-l-amber-500 border-[#213F66]'
                        }`}>
                         <div>
                            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">FINAL BORDER ENTRY DECISION</span>
                            <span className={`text-xl font-black uppercase tracking-widest ${
                               viewingRecord.status === 'CLEARED' ? 'text-emerald-600' : 
                               viewingRecord.status === 'REJECTED' ? 'text-red-600' : 
                               'text-amber-600'
                            }`}>{viewingRecord.status}</span>
                            <div className="mt-2 space-y-0.5">
                              <p className="text-[10px] font-mono text-cyan-400"><span className="font-bold">TIMESTAMP:</span> {viewingRecord.date} {viewingRecord.time}</p>
                              <p className="text-[10px] font-mono text-cyan-400"><span className="font-bold">OFFICER:</span> {viewingRecord.officer || 'INSPECTOR R. DESAI (OFF-8924)'}</p>
                              <p className="text-[10px] font-mono text-cyan-400"><span className="font-bold">REASON:</span> {viewingRecord.decisionReason || 'AUTOMATED SECURITY CLEARANCE / REVIEW'}</p>
                            </div>
                         </div>
                         <div className="mt-4 md:mt-0 flex-shrink-0">
                           <button 
                             onClick={() => {
                               // Make sure showReportModal will use the currently viewingRecord data!
                               setfinalSubjectPortrait({ imageData: viewingRecord.portrait });
                               setCaseStatus(viewingRecord.status === 'PENDING OFFICER REVIEW' ? 'PENDING_REVIEW' : viewingRecord.status);
                               setAnalysisResult({
                                  nameExtracted: viewingRecord.name,
                                  documentNumber: viewingRecord.docNumber,
                                  nationality: viewingRecord.nationality,
                                  documentType: viewingRecord.documentType,
                                  riskScore: viewingRecord.riskScore
                               });
                               setFaceVerificationResult({
                                  similarityScore: viewingRecord.biometricScore,
                                  verified: viewingRecord.biometricMatch
                               });
                               setShowReportModal(true);
                             }}
                             className="bg-[#1D2B42] text-white hover:bg-[#14263D] px-6 py-3 rounded font-bold uppercase tracking-widest text-[10px] shadow-md transition-colors flex items-center"
                           >
                             <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             GENERATE SECURITY REPORT
                           </button>

                         </div>
                       </div>
                       {/* Document Information */}
                       <div className="bg-[#0A1422] border border-[#213F66] rounded shadow-sm overflow-hidden">
                        <div className="bg-[#0A1422] border-b border-[#213F66] p-3 flex justify-between items-center">
                          <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center">
                            <svg className="w-3.5 h-3.5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                            DOCUMENT FORENSICS
                          </h3>
                        </div>
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">DOCUMENT TYPE</span>
                              <span className="text-xs font-black text-white">{viewingRecord.documentType}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">DOCUMENT NUMBER</span>
                              <span className="text-xs font-mono font-bold text-white">{viewingRecord.docNumber || 'UNKNOWN'}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">FILES SCANNED</span>
                              <span className="text-xs font-mono font-bold text-white">{viewingRecord.docCount || 1} DOCUMENTS</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">TAMPER DETECTION</span>
                              <span className="text-xs font-bold text-emerald-600">PASSED</span>

                           </div>
                        </div>
                       </div>
                      {/* Security Findings */}
                      <div className="bg-[#0A1422] border border-[#213F66] rounded shadow-sm overflow-hidden flex-1 flex flex-col">
                        <div className="bg-[#0A1422] border-b border-[#213F66] p-3 flex justify-between items-center flex-shrink-0">
                          <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center">
                            <svg className="w-3.5 h-3.5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            SECURITY FINDINGS LOG
                          </h3>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${viewingRecord.riskLevel === 'CRITICAL' || viewingRecord.riskLevel === 'HIGH' ? 'bg-red-50 text-red-600 border-red-300' : 'bg-slate-100 text-cyan-400 border-[#213F66]'}`}>RISK SCORE: {viewingRecord.riskScore}/100</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {viewingRecord.securityFindings && viewingRecord.securityFindings.length > 0 ? (
                            <div className="divide-y divide-[#D5DEE7]">
                              {viewingRecord.securityFindings.map((finding, idx) => (
                                <div key={idx} className="p-4 flex flex-start items-start space-x-3 hover:bg-[#14263D] transition-colors">
                                  <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                  <div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1 block">AUTOMATED FINDING #{idx + 1}</span>
                                    <p className="text-xs font-mono text-cyan-400">{finding}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full min-h-[150px] p-8 flex flex-col items-center justify-center text-center bg-[#0F1E2C]">
                               <svg className="w-8 h-8 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                               <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">NO ADVERSE SECURITY FINDINGS DETECTED</span>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

            </div>
          )}
        </div>
      )}


      {/* Final Decision Confirmation Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0A1422]  transition-opacity" onClick={() => setShowDecisionModal(false)}></div>
          <div className="relative bg-[#0A1422] w-full max-w-lg rounded shadow-2xl flex flex-col overflow-hidden border-2 border-slate-400 animate-fade-in-up">
            <div className="bg-[#0A1422] border-b-4 border-red-600 p-4">
               <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center">
                 <svg className="w-6 h-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 Confirm Final Border Decision
               </h3>
            </div>
            <div className="p-6">
              <p className="text-sm font-bold text-blue-400 mb-4 text-center">You are about to mark this subject as:</p>
              
              <div className={`p-4 border-2 rounded mb-6 flex flex-col items-center justify-center
                ${pendingDecision === 'CLEARED' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 
                  pendingDecision === 'PENDING_REVIEW' ? 'bg-amber-50 border-amber-500 text-amber-700' : 
                  'bg-red-50 border-red-600 text-red-700'}`}>
                <span className="text-xl font-black uppercase tracking-widest">
                  {pendingDecision === 'CLEARED' ? 'âœ“ CLEARED' : pendingDecision === 'PENDING_REVIEW' ? 'â³ PENDING REVIEW' : 'âœ• REJECTED'}
                </span>
              </div>

              <p className="text-sm font-bold text-blue-400 mb-6 text-center">This decision will be recorded in the case history and included in the final border security report.</p>
              
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowDecisionModal(false)}
                  className="flex-1 py-3 px-4 bg-[#0A1422] border-2 border-[#213F66] hover:bg-[#0F1E2C] text-cyan-100 font-bold uppercase tracking-wider rounded transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setCaseStatus(pendingDecision);
                    setFinalDecision(pendingDecision);
                    setDecisionTimestamp(new Date().toLocaleString());
                    
                    // Create or update database record
                    if (analysisResult) {
                      setDatabaseRecords(prev => {
                        const existingIdx = prev.findIndex(r => (r.docNumber === analysisResult.documentNumber && r.docNumber !== 'UNKNOWN') || (r.name === analysisResult.nameExtracted && r.name !== '[EXTRACTED_NAME]'));
                        const statusStr = pendingDecision === 'CLEARED' ? 'CLEARED' : pendingDecision === 'REJECTED' ? 'REJECTED' : 'PENDING OFFICER REVIEW';
                        
                        if (existingIdx >= 0) {
                          const updated = [...prev];
                          updated[existingIdx] = {
                            ...updated[existingIdx],
                            finalDecision: pendingDecision,
                            status: statusStr,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
                            name: analysisResult.nameExtracted,
                            alias: analysisResult.nameDB || null,
                            dob: analysisResult.dateOfBirth,
                            sex: analysisResult.sex || 'U',
                            nationality: analysisResult.nationality,
                            documentType: analysisResult.documentType,
                            docCount: files.length,
                            riskScore: parseInt(analysisResult.riskScore) || 0,
                            riskLevel: parseInt(analysisResult.riskScore) > 75 ? 'CRITICAL' : parseInt(analysisResult.riskScore) > 40 ? 'MEDIUM' : 'LOW',
                            threatLevel: analysisResult.threatLevel,
                            portrait: finalSubjectPortrait?.imageData || updated[existingIdx].portrait,
                            livePortrait: liveWebcamFaceData || updated[existingIdx].livePortrait,
                            biometricScore: faceVerificationResult?.similarityScore || 0,
                            biometricMatch: faceVerificationResult?.verified || false,
                            securityFindings: logs.filter(log => log.type === 'FINDING').map(log => log.message)
                          };
                          return updated;
                        } else {
                          const newRecord = {
                            caseId: `BSI-2026-${Math.floor(10000 + Math.random() * 90000)}`,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
                            name: analysisResult.nameExtracted,
                            alias: analysisResult.nameDB || null,
                            dob: analysisResult.dateOfBirth,
                            sex: analysisResult.sex || 'U',
                            nationality: analysisResult.nationality,
                            documentType: analysisResult.documentType,
                            docCount: files.length,
                            riskScore: parseInt(analysisResult.riskScore) || 0,
                            riskLevel: parseInt(analysisResult.riskScore) > 75 ? 'CRITICAL' : parseInt(analysisResult.riskScore) > 40 ? 'MEDIUM' : 'LOW',
                            threatLevel: analysisResult.threatLevel,
                            aiRecommendation: aiRecommendation,
                            finalDecision: pendingDecision,
                            status: statusStr,
                            portrait: finalSubjectPortrait?.imageData || null,
                            livePortrait: liveWebcamFaceData || null,
                            biometricScore: faceVerificationResult?.similarityScore || 0,
                            biometricMatch: faceVerificationResult?.verified || false,
                            docNumber: analysisResult.documentNumber,
                            securityFindings: logs.filter(log => log.type === 'FINDING').map(log => log.message),
                            officer: 'INSPECTOR R. DESAI (OFF-8924)',
                            decisionReason: 'OFFICER DISCRETION LOGGED'
                          };
                          return [newRecord, ...prev];
                        }
                      });
                    }

                    setShowDecisionModal(false);
                    setToastMessage('Final Border Decision Recorded');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 4000);
                  }}
                  className={`flex-1 py-3 px-4 font-bold uppercase tracking-wider text-white rounded transition shadow-md
                    ${pendingDecision === 'CLEARED' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                      pendingDecision === 'PENDING_REVIEW' ? 'bg-amber-600 hover:bg-amber-700' : 
                      'bg-red-600 hover:bg-red-700'}`}
                >
                  Confirm Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[70] animate-fade-in-up">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-lg shadow-xl flex items-center space-x-3 border border-gray-700">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* PDF Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/70  transition-opacity" onClick={() => setShowReportModal(false)}></div>
          <div className="relative bg-[#0A1422] w-full max-w-3xl max-h-[90vh] rounded shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-gray-300">
            
            {/* A4 Paper Styling Area */}
            <div id="report-content" className="flex-1 overflow-y-auto p-12 bg-[#0A1422] relative">
              {/* Document Header */}
              <div className="border-b-4 border-gray-900 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start">
                <div className="flex items-start">
                  <Shield className="w-12 h-12 text-cyan-100 mr-4 flex-shrink-0" />
                  <div>
                    <h1 className="text-3xl font-black text-cyan-100 tracking-tighter">DEPARTMENT OF BORDER SECURITY</h1>
                    <h2 className="text-xl font-bold text-gray-700 tracking-widest mt-1">INCIDENT REPORT & FORENSIC SUMMARY</h2>
                    <div className="mt-4 space-y-1">
                      <p className="text-sm font-mono text-gray-500 font-bold">CASE FILE: <span className="text-cyan-100">#BRD-2026-8924</span></p>
                      <p className="text-sm font-mono text-gray-500 font-bold">DATE: <span className="text-cyan-100">29-AUG-2026</span></p>
                      <p className="text-sm font-mono text-gray-500 font-bold">OFFICER: <span className="text-cyan-100">INSPECTOR R. DESAI (OFF-8924)</span></p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 mt-6 sm:mt-0 sm:ml-6 w-32 aspect-[3/4] relative bg-[#0A1422] border border-[#213F66] overflow-hidden shadow-sm flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-300 z-10"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-300 z-10"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-300 z-10"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-300 z-10"></div>
                  {finalSubjectPortrait?.imageData ? (
                    <img 
                      src={finalSubjectPortrait.imageData} 
                      alt="Mugshot" 
                      className="w-full h-full object-cover object-top grayscale sepia-[.1] relative z-0" 
                    />
                  ) : (
                    <div className="text-red-500 font-bold text-[10px] uppercase text-center p-2">PORTRAIT UNAVAILABLE</div>
                  )}
                </div>
              </div>
              
              {/* STAMP */}
              <div className="absolute top-1/3 right-1/4 transform rotate-12 opacity-80 pointer-events-none z-10 hidden sm:block">
                <div className="border-8 border-red-600 rounded-lg p-4 inline-block">
                  <p className="text-4xl font-black text-red-600 uppercase tracking-widest text-center leading-none">
                    HIGH RISK<br/>ARREST WARRANT<br/>ACTIVE
                  </p>
                </div>
              </div>

              {/* FINAL BORDER ENTRY STATUS BANNER */}
              <div className={`mt-8 mb-8 border-y-4 py-6 text-center
                ${caseStatus === 'CLEARED' ? 'border-emerald-600 bg-emerald-50' : 
                  caseStatus === 'PENDING_REVIEW' ? 'border-amber-500 bg-amber-50' : 
                  caseStatus === 'REJECTED' ? 'border-red-600 bg-red-50' : 'border-gray-400 bg-gray-50'}`}>
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-2">FINAL BORDER ENTRY STATUS</h3>
                <p className={`text-4xl font-black uppercase tracking-widest
                  ${caseStatus === 'CLEARED' ? 'text-emerald-700' : 
                    caseStatus === 'PENDING_REVIEW' ? 'text-amber-700' : 
                    caseStatus === 'REJECTED' ? 'text-red-700' : 'text-gray-500'}`}>
                  {caseStatus === 'CLEARED' ? 'CLEARED' : 
                   caseStatus === 'PENDING_REVIEW' ? 'PENDING REVIEW' : 
                   caseStatus === 'REJECTED' ? 'REJECTED' : 'AWAITING DECISION'}
                </p>
                <p className="text-lg font-bold text-gray-700 uppercase tracking-wider mt-1">
                  {caseStatus === 'CLEARED' ? 'ENTRY APPROVED' : 
                   caseStatus === 'PENDING_REVIEW' ? 'MANUAL INVESTIGATION REQUIRED' : 
                   caseStatus === 'REJECTED' ? 'ENTRY DENIED' : 'PENDING OFFICIAL REVIEW'}
                </p>
              </div>

              {/* DECISION SUMMARY */}
              <div className="grid grid-cols-2 gap-4 border-2 border-gray-900 p-4 mb-8 bg-[#0A1422] relative z-20 shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Decision Type</p>
                  <p className="text-sm font-black text-gray-800 uppercase">Officer Final Decision</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Decision Time</p>
                  <p className="text-sm font-black font-mono text-gray-800">{decisionTimestamp || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Recommendation</p>
                  <p className={`text-sm font-black uppercase
                    ${aiRecommendation === 'CLEAR' ? 'text-emerald-600' : 
                      aiRecommendation === 'MANUAL_REVIEW' ? 'text-amber-600' : 'text-red-600'}`}>
                    {aiRecommendation === 'CLEAR' ? 'CLEAR ENTRY' : 
                     aiRecommendation === 'MANUAL_REVIEW' ? 'MANUAL REVIEW' : 'REJECT ENTRY'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Final Decision</p>
                  <p className={`text-sm font-black uppercase
                    ${caseStatus === 'CLEARED' ? 'text-emerald-600' : 
                      caseStatus === 'PENDING_REVIEW' ? 'text-amber-600' : 
                      caseStatus === 'REJECTED' ? 'text-red-600' : 'text-gray-600'}`}>
                    {caseStatus === 'AWAITING_DECISION' ? 'PENDING' : caseStatus}
                  </p>
                </div>
              </div>

              {/* Body Content */}
              <div className="space-y-8 text-gray-800 relative z-20">
                <section>
                  <h3 className="text-lg font-black bg-gray-100 px-3 py-1 mb-4 uppercase tracking-wider border-l-4 border-gray-900">1. Subject Identity Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono px-3">
                    <p><span className="text-gray-500 font-bold">DOCUMENT TYPE:</span> <br/><span className="text-lg font-bold">{analysisResult?.documentType}</span></p>
                    <p><span className="text-gray-500 font-bold">CONFISCATED DOC ID:</span> <br/><span className="text-lg">{analysisResult?.documentNumber}</span></p>
                    <p><span className="text-gray-500 font-bold">EXTRACTED ALIAS:</span> <br/><span className="text-lg">{analysisResult?.nameExtracted}</span></p>
                    <p><span className="text-gray-500 font-bold">TRUE IDENTITY (DB):</span> <br/><span className="text-lg font-bold text-red-700">{analysisResult?.nameDB}</span></p>
                    <p><span className="text-gray-500 font-bold">DECLARED NATIONALITY:</span> <br/>{analysisResult?.nationality}</p>
                    <p><span className="text-gray-500 font-bold">SEX / DOB:</span> <br/>{analysisResult?.sex} / {analysisResult?.dateOfBirth}</p>
                  </div>
                </section>
                
                <section>
                  <h3 className="text-lg font-black bg-gray-100 px-3 py-1 mb-4 uppercase tracking-wider border-l-4 border-gray-900">2. Violation Summary</h3>
                  <div className="text-base leading-relaxed px-3">
                    Subject attempted unauthorized border crossing utilizing fraudulent identification. Automated forensic scanning (P8 System) detected multi-vector biometric and digital anomalies. 
                    <br/><br/>
                    <strong>Key Findings:</strong>
                    <ul className="list-disc pl-8 mt-2 space-y-1">
                      <li>Phonetic cross-reference confirms 98% match to known Interpol alias.</li>
                      <li>Face geometry delta exceeded threshold (12% verification match).</li>
                      <li>ELA (Error Level Analysis) detected tampering in document signature zone (84% probability).</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-black bg-gray-100 px-3 py-1 mb-4 uppercase tracking-wider border-l-4 border-gray-900">3. Action Taken</h3>
                  <p className="text-base leading-relaxed px-3 font-bold">
                    [X] SUBJECT DETAINED AT TERMINAL 4 HOLDING CELL.
                    <br/>[X] INTERPOL & LOCAL LAW ENFORCEMENT DISPATCHED.
                    <br/>[X] FRAUDULENT DOCUMENTS CONFISCATED FOR LAB ANALYSIS.
                  </p>
                </section>
                
                <div className="pt-12 mt-12 border-t-2 border-gray-300 flex justify-between items-end">
                  <div className="text-center">
                    <div className="border-b border-gray-900 w-48 mb-2"></div>
                    <p className="text-sm font-bold uppercase">Officer Signature</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-gray-900 w-48 mb-2"></div>
                    <p className="text-sm font-bold uppercase">Supervisor Approval</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer / Actions */}
            <div className="bg-gray-100 border-t border-gray-300 p-4 flex justify-end space-x-3 rounded-b">
              <button 
                onClick={() => setShowReportModal(false)}
                className="px-6 py-2.5 text-gray-700 font-bold hover:bg-gray-200 rounded transition"
              >
                Close Preview
              </button>
              <button 
                onClick={() => generatePDF()}
                className="px-6 py-2.5 bg-blue-700 text-white font-bold rounded shadow-md flex items-center hover:bg-blue-800 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Official PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EVIDENCE INVESTIGATION OVERLAY
      ========================================================================= */}
      {showEvidenceInvestigation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F1E2C]/95  p-4 md:p-8 overflow-y-auto no-scrollbar">
          {/* Main Modal Container */}
          <div className="bg-[#0A1422] border-2 border-[#213F66] shadow-sm rounded-xl w-full max-w-6xl my-auto flex flex-col relative animate-fade-in-up">
            
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0A1422]  border-b border-[#213F66] p-6 rounded-t-xl flex justify-between items-center">
              <div>
                <button 
                  onClick={() => setShowEvidenceInvestigation(false)}
                  className="text-cyan-400 hover:text-white text-[10px] font-black uppercase tracking-widest mb-3 flex items-center transition-colors"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  BACK TO FINDINGS
                </button>
                <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center">
                  <Shield className="w-6 h-6 text-blue-600 mr-3" />
                  EVIDENCE INVESTIGATION
                </h2>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setShowEvidenceInvestigation(false)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded transition-colors">
                   MARK AS REVIEWED
                 </button>
                 <button onClick={() => setShowEvidenceInvestigation(false)} className="bg-[#0A1422] hover:bg-[#14263D] text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded transition-colors border border-[#213F66]">
                   CLOSE
                 </button>
              </div>
            </div>

            {/* Case Information Bar */}
            <div className="bg-[#0F1E2C]/50 border-b border-[#213F66] px-6 py-3 flex flex-wrap gap-x-8 gap-y-2">
              <div className="flex flex-col">
                <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest">CASE ID</span>
                <span className="text-[10px] text-white font-mono">{selectedEvidenceFinding?.id || `SEC-${Math.floor(Date.now() / 1000).toString().slice(-6)}`}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest">SUBJECT</span>
                <span className="text-[10px] text-white font-mono uppercase">{analysisResult?.nameExtracted || 'UNKNOWN'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest">DOCUMENT</span>
                <span className="text-[10px] text-white font-mono uppercase">{analysisResult?.documentType || 'UNSPECIFIED'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest">ANALYSIS TIME</span>
                <span className="text-[10px] text-white font-mono uppercase">{selectedEvidenceFinding?.timestamp || new Date().toISOString()}</span>
              </div>
              <div className="flex flex-col border-l border-[#213F66] pl-8 ml-auto">
                <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest">FINDING STATUS</span>
                <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">ACTIVE / UNDER REVIEW</span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 space-y-10 overflow-y-auto max-h-[70vh] no-scrollbar">
              
              {!selectedEvidenceFinding || !['IDENTITY_MISMATCH', 'DOCUMENT_MODIFICATION', 'OCR_INCONSISTENCY', 'CRIMINAL_INTELLIGENCE'].includes(selectedEvidenceFinding.type) ? (
                <div className="flex flex-col items-center justify-center p-20 bg-[#0F1E2C] border border-[#213F66] rounded-xl h-[50vh]">
                   <svg className="w-16 h-16 mb-4 text-cyan-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   <h3 className="text-xl font-black text-cyan-400 uppercase tracking-widest mb-2">EVIDENCE RECORD NOT FOUND</h3>
                   <p className="text-sm text-blue-400 font-mono text-center">The requested evidence record ID could not be loaded or has been redacted from the active database.</p>
                </div>
              ) : (
                <>
              
              {selectedEvidenceFinding?.type === 'IDENTITY_MISMATCH' && (
                <>
                  {/* SECTION 1 â€” EXECUTIVE FINDING SUMMARY */}
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-black text-red-500 uppercase tracking-widest mb-1">LIVE IDENTITY DOES NOT MATCH DOCUMENT PORTRAIT</h3>
                      <span className="bg-red-50 border border-red-300 text-red-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded inline-block">HIGH PRIORITY REVIEW REQUIRED</span>
                    
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded-lg">
                        <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2 border-b border-[#213F66] pb-1">WHAT WAS DETECTED</h4>
                        <p className="text-xs text-white font-mono leading-relaxed">The face captured through the live webcam does not sufficiently match the identity portrait extracted from the uploaded document.</p>
                      </div>
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded-lg">
                        <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2 border-b border-[#213F66] pb-1">WHERE IT WAS FOUND</h4>
                        <p className="text-xs text-white font-mono leading-relaxed">Biometric Face Verification Module â€” Live Screening Checkpoint.</p>
                      </div>
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded-lg">
                        <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2 border-b border-[#213F66] pb-1">WHY IT MATTERS</h4>
                        <p className="text-xs text-white font-mono leading-relaxed">The person presenting the document is likely not the individual shown in the identity document.</p>

                      </div>
                    </div>
                  </div>
                  {/* SECTION 2 â€” PRIMARY VISUAL PROOF */}
                  <div>
                    <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-4 flex items-center border-b border-[#213F66] pb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      PRIMARY VISUAL PROOF
                    </h3>
                    
                    <div className="bg-[#0F1E2C] border border-[#213F66] rounded-xl p-6 flex flex-col items-center">
                      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full">
                        
                        {/* Left: Document Portrait */}
                        <div className="flex flex-col items-center">
                          <div className="w-48 h-64 bg-[#162A3D] border-2 border-[#213F66] rounded-lg overflow-hidden relative group">
                            {finalSubjectPortrait?.imageData ? (
                              <img src={finalSubjectPortrait.imageData} alt="Document Face" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-cyan-400">
                                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-[10px] uppercase font-bold">UNAVAILABLE</span>
                              </div>
                            )}
                            <div className="absolute inset-0 border-4 border-slate-500/20 rounded-lg pointer-events-none"></div>
                          </div>
                          <span className="mt-4 bg-[#0A1422] px-3 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest">DOCUMENT PORTRAIT</span>

                        </div>
                        {/* Center: AI Comparison Panel */}
                        <div className="flex flex-col items-center justify-center min-w-[200px]">
                          <div className="relative w-32 h-32 flex items-center justify-center">
                             <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite] opacity-50" viewBox="0 0 100 100">
                               <circle cx="50" cy="50" r="45" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="5 5" />
                               <circle cx="50" cy="50" r="35" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="10 10" opacity="0.5" />
                             </svg>
                             <div className="flex flex-col items-center justify-center z-10 bg-[#0A1422] rounded-full w-24 h-24 border border-red-300 shadow-sm">
                               <span className="text-2xl font-black text-red-500">{faceVerificationResult?.matchPercentage || '12'}%</span>
                               <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mt-1">MATCH SCORE</span>
                             </div>
                          </div>
                          <div className="mt-6 flex flex-col items-center bg-red-950/40 border border-red-300 px-4 py-2 rounded text-center">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">IDENTITY MISMATCH</span>
                            <span className="text-[8px] font-bold text-cyan-400 mt-1 uppercase tracking-widest">FACIAL FEATURE DELTA &gt; LIMIT</span>

                          </div>
                        </div>
                        {/* Right: Live Webcam Capture */}
                        <div className="flex flex-col items-center">
                          <div className="w-48 h-64 bg-[#162A3D] border-2 border-[#213F66] rounded-lg overflow-hidden relative group">
                            {liveWebcamFaceData ? (
                              <img src={liveWebcamFaceData} alt="Live Face" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-cyan-400">
                                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                <span className="text-[10px] uppercase font-bold">UNAVAILABLE</span>
                              </div>
                            )}
                            <div className="absolute inset-0 border-4 border-red-300 rounded-lg pointer-events-none"></div>
                          </div>
                          <span className="mt-4 bg-[#0A1422] px-3 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 "></span>
                            LIVE WEBCAM CAPTURE
                          </span>
                        
                      
                        </div>
                      </div>
                      <div className="mt-8 bg-[#0A1422] border border-[#213F66] p-4 rounded w-full max-w-3xl text-center">
                        <p className="text-xs font-mono text-white uppercase">
                          "Biometric comparison detected insufficient similarity between the document portrait and the live captured subject."
                        </p>

                      </div>
                    </div>
                  </div>
                  {/* SECTION 3 â€” DETAILED ANALYSIS */}
                  <div>
                    <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-4 flex items-center border-b border-[#213F66] pb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      DETAILED ANALYSIS
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">DOCUMENT PORTRAIT QUALITY</p>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">CLEAR</p>
                      </div>
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">LIVE CAPTURE QUALITY</p>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">CLEAR</p>
                      </div>
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">FACE DETECTION STATUS</p>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SUCCESS</p>
                      </div>
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">BIOMETRIC COMPARISON</p>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">MISMATCH</p>
                      </div>
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">MATCH CONFIDENCE</p>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest font-mono">{faceVerificationResult?.matchPercentage || '12'}%</p>
                      </div>
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">ANALYSIS RELIABILITY</p>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">HIGH</p>

                      </div>
                    </div>
                  </div>
                  {/* SECTION 4 â€” WHY THE SYSTEM FLAGGED THIS */}
                  <div>
                    <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-4 flex items-center border-b border-[#213F66] pb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      AI SECURITY EXPLANATION
                    </h3>
                    <div className="bg-[#0A1422] border border-[#213F66] p-6 rounded-lg">
                      <p className="text-xs text-white font-mono leading-relaxed mb-6 max-w-4xl">
                        The system compared facial information extracted from the uploaded identity document with the live subject captured during screening.<br/><br/>
                        The available biometric comparison did not reach the required verification threshold.
                      </p>
                      
                      <div className="flex flex-wrap gap-6 mb-6 bg-[#0F1E2C] p-4 rounded border border-[#213F66] inline-flex">
                        <div>
                          <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">VERIFICATION THRESHOLD</p>
                          <p className="text-xs font-mono font-bold text-white">60%</p>
                        </div>
                        <div className="border-l border-[#213F66] pl-6">
                          <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">OBSERVED MATCH LEVEL</p>
                          <p className="text-xs font-mono font-bold text-red-500">{faceVerificationResult?.matchPercentage || '12'}%</p>
                        </div>
                        <div className="border-l border-[#213F66] pl-6">
                          <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">RESULT</p>
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">FAILED</p>

                        </div>
                      </div>
                      <div className="border-t border-[#213F66] pt-4 mt-2">
                        <p className="text-[8px] font-bold text-amber-500 uppercase tracking-widest mb-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          IMPORTANT LIMITATION
                        </p>
                        <p className="text-[10px] text-cyan-400 font-mono">Image quality, face angle, lighting, or partial detection may affect reliability. Ensure the live capture environment is well-lit and the subject is facing directly.</p>

                      </div>
                    </div>
                  </div>
                  {/* SECTION 5 â€” EVIDENCE CHAIN */}
                  <div>
                    <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-4 flex items-center border-b border-[#213F66] pb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      EVIDENCE PROCESSING CHAIN
                    </h3>
                    <div className="flex flex-col space-y-2">
                      {[
                        { step: 'DOCUMENT UPLOADED', status: 'SUCCESS', time: '08:42:10Z' },
                        { step: 'DOCUMENT TYPE IDENTIFIED', status: 'SUCCESS', time: '08:42:11Z' },
                        { step: 'PORTRAIT DETECTED', status: 'SUCCESS', time: '08:42:12Z' },
                        { step: 'PORTRAIT EXTRACTED', status: 'SUCCESS', time: '08:42:12Z' },
                        { step: 'LIVE FACE CAPTURED', status: 'SUCCESS', time: '08:42:15Z' },
                        { step: 'BIOMETRIC COMPARISON COMPLETED', status: 'WARNING', time: '08:42:16Z' },
                        { step: 'SECURITY FINDING GENERATED', status: 'FAILED', time: '08:42:16Z' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center bg-[#0A1422] border border-[#213F66] px-4 py-2 rounded">
                          <span className="text-[10px] font-mono text-cyan-400 w-20 shrink-0">{item.time}</span>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest flex-1">{item.step}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded
                            ${item.status === 'SUCCESS' ? 'text-emerald-500 bg-emerald-500/10' : 
                              item.status === 'WARNING' ? 'text-amber-500 bg-amber-500/10' : 
                              'text-red-500 bg-red-500/10'}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}

                    </div>
                  </div>
                  {/* SECTION 6 â€” TECHNICAL EVIDENCE DETAILS */}
                  <details className="group bg-[#0A1422] border border-[#213F66] rounded-lg overflow-hidden">
                    <summary className="cursor-pointer p-4 text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center justify-between hover:bg-[#0A1422] transition-colors">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        TECHNICAL ANALYSIS DETAILS
                      </span>
                      <svg className="w-4 h-4 text-cyan-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div className="p-4 border-t border-[#213F66] bg-[#0F1E2C] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Doc Portrait Confidence</p>
                        <p className="text-[10px] font-mono text-white">0.9942</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Live Face Confidence</p>
                        <p className="text-[10px] font-mono text-white">0.9815</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Euclidean Distance</p>
                        <p className="text-[10px] font-mono text-white">{faceVerificationResult?.distance || '0.88'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Processing Status</p>
                        <p className="text-[10px] font-mono text-white">COMPLETED_WITH_FLAGS</p>
                      </div>
                    </div>
                  </details>
                </>
              )}

              {/* DOCUMENT FORENSIC EVIDENCE VERSION */}
              {(selectedEvidenceFinding?.type === 'DOCUMENT_MODIFICATION' || selectedEvidenceFinding?.type === 'OCR_INCONSISTENCY') && (
                <>
                  {/* SECTION 1 â€” EXECUTIVE FINDING SUMMARY */}
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-black text-amber-500 uppercase tracking-widest mb-1">
                        {selectedEvidenceFinding?.title || 'POSSIBLE DOCUMENT MODIFICATION DETECTED'}
                      </h3>
                      <span className="bg-amber-50 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded inline-block">MANUAL REVIEW REQUIRED</span>
                    
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded-lg">
                        <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2 border-b border-[#213F66] pb-1">WHAT WAS DETECTED</h4>
                        <p className="text-xs text-white font-mono leading-relaxed">
                          {selectedEvidenceFinding?.type === 'DOCUMENT_MODIFICATION' 
                            ? 'The document analysis found visual inconsistencies in one or more regions that differ from surrounding document patterns.'
                            : 'Extracted document information contains one or more fields that could not be validated consistently.'}
                        </p>
                      </div>
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded-lg">
                        <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2 border-b border-[#213F66] pb-1">WHERE IT WAS FOUND</h4>
                        <p className="text-xs text-white font-mono leading-relaxed">
                          {selectedEvidenceFinding?.type === 'DOCUMENT_MODIFICATION' ? 'Document image forensic analysis.' : 'OCR and Document Data Extraction.'}
                        </p>
                      </div>
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded-lg">
                        <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2 border-b border-[#213F66] pb-1">WHY IT MATTERS</h4>
                        <p className="text-xs text-white font-mono leading-relaxed">
                          {selectedEvidenceFinding?.type === 'DOCUMENT_MODIFICATION' 
                            ? 'These inconsistencies may indicate that part of the document has been altered or digitally modified.' 
                            : 'Incorrect or inconsistent identity information can occur because of poor document quality, OCR errors, or incorrect document data.'}
                        </p>

                      </div>
                    </div>
                  </div>
                  {/* SECTION 2 â€” PRIMARY VISUAL PROOF (FORENSICS) */}
                  <div>
                    <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-4 flex items-center border-b border-[#213F66] pb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      FORENSIC DOCUMENT VIEW
                    </h3>
                    
                    <div className="bg-[#0F1E2C] border border-[#213F66] rounded-xl p-6 flex flex-col items-center space-y-8">
                      {files && files.length > 0 ? files.map((doc, index) => (
                        <div key={doc.id} className="relative w-full max-w-4xl border-2 border-[#213F66] rounded-lg overflow-hidden group">
                          <div className="absolute top-0 left-0 bg-[#0A1422] border-b border-r border-[#213F66] px-3 py-1 z-30">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">DOCUMENT {String(index + 1).padStart(2, '0')}</span>
                          </div>
                          <div className="relative">
                            {doc.previewUrl ? (
                              <img src={doc.previewUrl} alt="Uploaded Document" className="w-full h-auto object-contain max-h-[500px]" />
                            ) : (
                               <div className="w-full h-[500px] flex flex-col items-center justify-center bg-[#0A1422] border border-[#213F66] rounded">
                                 <svg className="w-16 h-16 mb-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                 <span className="text-[12px] uppercase font-bold text-cyan-400">DOCUMENT PREVIEW NOT AVAILABLE</span>
                                 <span className="text-[10px] mt-2 font-mono text-cyan-400">{doc.file.name} (Requires specialized viewer)</span>
                               </div>
                            )}
                            {/* Fake forensic overlay box */}
                            {doc.previewUrl && selectedEvidenceFinding?.type === 'DOCUMENT_MODIFICATION' && (
                              <div className="absolute top-[40%] left-[30%] w-[30%] h-[15%] border-2 border-amber-500 bg-amber-500/20 z-10 flex items-start justify-end pointer-events-none shadow-sm">
                                <span className="bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest px-1">SUSPICIOUS REGION</span>
                              </div>
                            )}
                            {/* Grid overlay */}
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMGwwIDIwTTIwIDFMMCAxIiBzdHJva2U9InJnYmEoMzAsIDQxLCA1OSwgMC4yKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] z-0 pointer-events-none"></div>
                          </div>
                        </div>
                      )) : (
                        <div className="w-full h-64 flex flex-col items-center justify-center text-cyan-400">
                          <span className="text-[10px] uppercase font-bold">EVIDENCE CAPTURE UNAVAILABLE</span>
                          <span className="text-[8px] mt-2">Document upload step failed or no document provided.</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-4 mt-6">
                        <button className="bg-[#0A1422] hover:bg-[#14263D] text-white font-bold text-[10px] py-2 px-4 rounded uppercase tracking-widest transition-colors border border-[#213F66]">
                          ORIGINAL DOCUMENT VIEW
                        </button>
                        <button className="bg-amber-50 hover:bg-amber-50 text-amber-400 font-bold text-[10px] py-2 px-4 rounded uppercase tracking-widest transition-colors border border-amber-500/50">
                          SUSPICIOUS REGION VIEW
                        </button>
                        <button className="bg-[#0A1422] hover:bg-[#14263D] text-white font-bold text-[10px] py-2 px-4 rounded uppercase tracking-widest transition-colors border border-[#213F66]">
                          FORENSIC ANALYSIS VIEW
                        </button>

                      </div>
                    </div>
                  </div>
                  {/* FORENSIC DETAILED ANALYSIS */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">ANALYSIS CONFIDENCE</p>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">74%</p>
                    </div>
                    <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">VERIFICATION STATUS</p>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">REQUIRES MANUAL FORENSIC REVIEW</p>
                    </div>
                  </div>
                </>
              )}

              {/* CRIMINAL / INTELLIGENCE EVIDENCE VERSION */}
              {selectedEvidenceFinding?.type === 'CRIMINAL_INTELLIGENCE' && (
                <>
                  {/* SECTION 1 â€” EXECUTIVE FINDING SUMMARY */}
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-black text-red-500 uppercase tracking-widest mb-1">
                        {selectedEvidenceFinding?.title || 'KNOWN CRIMINAL SYNDICATE CONNECTION DETECTED'}
                      </h3>
                      <span className="bg-red-50 border border-red-300 text-red-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded inline-block">IMMEDIATE APPREHENSION REQUIRED</span>
                    
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded-lg">
                        <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2 border-b border-[#213F66] pb-1">INTELLIGENCE MATCH TYPE</h4>
                        <p className="text-xs text-white font-mono leading-relaxed">Level 4 Transnational Syndicate Connection (Biometric Hit)</p>
                      </div>
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded-lg">
                        <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2 border-b border-[#213F66] pb-1">DATABASE SOURCE</h4>
                        <p className="text-xs text-white font-mono leading-relaxed">Global Interpol Red Notice Database / Regional Narcotic Taskforce.</p>
                      </div>
                      <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded-lg">
                        <h4 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2 border-b border-[#213F66] pb-1">WHY THEY WERE FLAGGED</h4>
                        <p className="text-xs text-white font-mono leading-relaxed">Outstanding warrants for document forgery and illicit border trafficking across 3 jurisdictions.</p>

                      </div>
                    </div>
                  </div>
                  {/* SECTION 2 â€” PRIMARY VISUAL PROOF (INTELLIGENCE NETWORK) */}
                  <div>
                    <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-4 flex items-center border-b border-[#213F66] pb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                      THREAT NETWORK & ASSOCIATIONS
                    </h3>
                    
                    <div className="bg-[#0F1E2C] border border-[#213F66] rounded-xl p-6 flex flex-col md:flex-row gap-8 items-center md:items-start">
                      <div className="w-48 h-48 rounded-full border-4 border-red-300 bg-[#0A1422] flex items-center justify-center relative shadow-sm">
                        <svg className="w-24 h-24 text-red-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <div className="absolute -bottom-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded">KNOWN ALIAS: "EL FANTASMA"</div>
                      
                      </div>
                      <div className="flex-1 w-full bg-[#0A1422] border border-[#213F66] rounded-lg p-5 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMGwwIDIwTTIwIDFMMCAxIiBzdHJva2U9InJnYmEoMzAsIDQxLCA1OSwgMC4yKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')]"></div>
                        <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4 border-b border-[#213F66] pb-2">ASSOCIATED INCIDENT HISTORY</h4>
                        
                        <div className="space-y-4">
                          <div className="flex gap-4 items-start relative z-10">
                            <span className="text-[10px] font-mono text-red-400 mt-0.5">2025-11-14</span>
                            <div>
                              <p className="text-xs font-bold text-white uppercase">IDENTIFIED IN FORGERY RING OPERATION</p>
                              <p className="text-[10px] font-mono text-cyan-400 mt-1">Subject was tied to a raided facility producing high-grade fraudulent passports in Eastern Europe.</p>
                            </div>
                          </div>
                          <div className="flex gap-4 items-start relative z-10">
                            <span className="text-[10px] font-mono text-amber-400 mt-0.5">2024-03-22</span>
                            <div>
                              <p className="text-xs font-bold text-white uppercase">BORDER EVASION</p>
                              <p className="text-[10px] font-mono text-cyan-400 mt-1">Fled a secondary inspection checkpoint leaving behind a vehicle with undocumented individuals.</p>

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* SECTION 3 â€” TECHNICAL ANALYSIS */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">RECORD REFERENCE ID</p>
                      <p className="text-[10px] font-mono text-white">{selectedEvidenceFinding?.id}</p>
                    </div>
                    <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">MATCH CONFIDENCE</p>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">98.4% (BIOMETRIC)</p>
                    </div>
                    <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">RISK CLASSIFICATION</p>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">LEVEL 5 â€” EXTREME</p>
                    </div>
                    <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                      <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">LAST INTEL UPDATE</p>
                      <p className="text-[10px] font-mono text-white">48 HOURS AGO</p>
                    </div>
                  </div>
                </>
              )}

              {/* SECTION 7 â€” OFFICER RECOMMENDATION */}
              <div className="bg-[#0F1E2C] border border-[#213F66] rounded-xl p-6 mt-12 border-t-4 border-t-cyan-500">
                <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  RECOMMENDED NEXT ACTION
                </h3>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-white uppercase tracking-widest mb-2">
                      {selectedEvidenceFinding?.type === 'IDENTITY_MISMATCH' ? 'MANUAL IDENTITY VERIFICATION REQUIRED' : 
                       selectedEvidenceFinding?.type === 'CRIMINAL_INTELLIGENCE' ? 'IMMEDIATE TACTICAL APPREHENSION REQUIRED' : 
                       'MANUAL DOCUMENT INSPECTION REQUIRED'}
                    </h4>
                    <p className="text-sm text-cyan-400 font-mono leading-relaxed mb-6 max-w-3xl">
                      {selectedEvidenceFinding?.type === 'IDENTITY_MISMATCH' 
                        ? 'The biometric evidence does not currently provide sufficient confidence to verify that the live subject matches the identity portrait.'
                        : selectedEvidenceFinding?.type === 'CRIMINAL_INTELLIGENCE'
                        ? 'The subject has been positively identified as a high-risk individual. Execute standard apprehension procedures immediately.'
                        : 'The digital document forensic evidence indicates a high likelihood of tampering. Do not process without physical inspection.'}
                    </p>
                    <div className="bg-[#0A1422] border border-[#213F66] p-4 rounded">
                      <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-2">RECOMMENDED ACTIONS:</p>
                      <ul className="text-xs text-white space-y-2 font-mono">
                        {selectedEvidenceFinding?.type === 'CRIMINAL_INTELLIGENCE' ? (
                          <>
                            <li className="flex items-center"><span className="text-blue-600 mr-2">â€¢</span> Do NOT alert the subject to the intelligence match</li>
                            <li className="flex items-center"><span className="text-blue-600 mr-2">â€¢</span> Signal secondary border patrol units for immediate backup</li>
                            <li className="flex items-center"><span className="text-blue-600 mr-2">â€¢</span> Detain subject in secure holding area</li>
                            <li className="flex items-center"><span className="text-blue-600 mr-2">â€¢</span> Contact Interpol liaison office immediately</li>
                          </>
                        ) : selectedEvidenceFinding?.type === 'IDENTITY_MISMATCH' ? (
                          <>
                            <li className="flex items-center"><span className="text-blue-600 mr-2">â€¢</span> Request additional identification</li>
                            <li className="flex items-center"><span className="text-blue-600 mr-2">â€¢</span> Capture another live image under better lighting</li>
                            <li className="flex items-center"><span className="text-blue-600 mr-2">â€¢</span> Perform manual visual verification</li>
                            <li className="flex items-center"><span className="text-blue-600 mr-2">â€¢</span> Continue investigation in secondary screening</li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center"><span className="text-blue-600 mr-2">â€¢</span> Confiscate physical document immediately</li>
                            <li className="flex items-center"><span className="text-blue-600 mr-2">â€¢</span> Use physical forensic tools (UV/IR) to inspect the highlighted region</li>
                            <li className="flex items-center"><span className="text-blue-600 mr-2">â€¢</span> Verify data against physical MRZ</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              </>
              )}
              
              {/* Bottom Action Footer */}
              <div className="pt-6 border-t border-[#213F66] flex justify-end gap-4 mt-8 pb-4">
                 <button onClick={() => setShowEvidenceInvestigation(false)} className="bg-[#0A1422] hover:bg-[#14263D] text-white font-bold text-[10px] uppercase tracking-widest px-6 py-3 rounded transition-colors border border-[#213F66]">
                   RETURN TO SECURITY FINDINGS
                 </button>
                 <button onClick={() => setShowEvidenceInvestigation(false)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase tracking-widest px-8 py-3 rounded transition-colors shadow-sm">
                   MARK AS REVIEWED
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}
      </main>
      
      {/* SUBJECT OVERVIEW DRAWER */}
      {isOverviewOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#0A1422]/60  transition-opacity" onClick={() => setIsOverviewOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#0F1E2C] border-l border-[#213F66] shadow-2xl h-full flex flex-col animate-[fade-in-right_0.3s_ease-out]">
            <div className="flex items-center justify-between p-6 border-b border-[#213F66] bg-[#0A1422]">
              <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                SUBJECT OVERVIEW
              </h2>
              <button onClick={() => setIsOverviewOpen(false)} className="text-cyan-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {!analysisResult ? (
                <div className="text-center text-cyan-400 font-mono text-xs mt-10">NO ACTIVE SCREENING DATA AVAILABLE.</div>
              ) : (
                <>
                  {/* SUBJECT IDENTITY */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border-b border-[#213F66] pb-1">SUBJECT IDENTITY</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Full Name</p>
                        <p className="text-xs font-mono text-white truncate">{analysisResult.nameExtracted}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Nationality</p>
                        <p className="text-xs font-mono text-white truncate">{analysisResult.nationality}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Date of Birth</p>
                        <p className="text-xs font-mono text-white truncate">{analysisResult.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Gender</p>
                        <p className="text-xs font-mono text-white truncate">{analysisResult.sex}</p>
                  
                      </div>
                    </div>
                  </div>
                  {/* DOCUMENT INTELLIGENCE */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border-b border-[#213F66] pb-1">DOCUMENT INTELLIGENCE</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Uploaded Documents</p>
                        <p className="text-xs font-mono text-white">{analysisResult.docCount}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Document Types</p>
                        <p className="text-xs font-mono text-white truncate">{analysisResult.documentType}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Document Number</p>
                        <p className="text-xs font-mono text-white truncate">{analysisResult.documentNumber}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Extraction Status</p>
                        <p className="text-xs font-mono text-emerald-400">COMPLETED</p>
                  
                      </div>
                    </div>
                  </div>
                  {/* BIOMETRIC STATUS */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border-b border-[#213F66] pb-1">BIOMETRIC STATUS</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center bg-[#0A1422] p-2 border border-[#213F66] rounded">
                        <span className="text-[10px] text-cyan-400 uppercase tracking-widest">Document Portrait</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${finalSubjectPortrait ? 'text-emerald-400' : 'text-cyan-400'}`}>{finalSubjectPortrait ? 'EXTRACTED' : 'UNAVAILABLE'}</span>
                      </div>
                      <div className="flex justify-between items-center bg-[#0A1422] p-2 border border-[#213F66] rounded">
                        <span className="text-[10px] text-cyan-400 uppercase tracking-widest">Live Capture</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${liveWebcamFaceData ? 'text-emerald-400' : 'text-cyan-400'}`}>{liveWebcamFaceData ? 'CAPTURED' : 'UNAVAILABLE'}</span>
                      </div>
                      <div className="flex justify-between items-center bg-[#0A1422] p-2 border border-[#213F66] rounded">
                        <span className="text-[10px] text-cyan-400 uppercase tracking-widest">Biometric Match</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${faceVerificationResult?.verified ? 'text-emerald-400' : faceVerificationResult ? 'text-red-400' : 'text-cyan-400'}`}>{faceVerificationResult ? (faceVerificationResult.verified ? 'VERIFIED' : 'MISMATCH') : 'PENDING'}</span>
                  
                      </div>
                    </div>
                  </div>
                  {/* SECURITY STATUS */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border-b border-[#213F66] pb-1">SECURITY STATUS</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center bg-[#0A1422] p-2 border border-[#213F66] rounded">
                        <span className="text-[10px] text-cyan-400 uppercase tracking-widest">Risk Level</span>
                        <span className={`text-[10px] font-black tracking-widest uppercase ${analysisResult.riskScore > 75 ? 'text-red-500' : analysisResult.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {analysisResult.riskScore > 75 ? 'CRITICAL RISK' : analysisResult.riskScore > 40 ? 'MEDIUM RISK' : 'LOW RISK'} ({analysisResult.riskScore})
                        </span>
                      </div>
                      <div className="bg-[#0A1422] p-3 border border-[#213F66] rounded">
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Intelligence Alerts</p>
                        <p className={`text-xs font-mono ${analysisResult.threatLevel.includes('LOW') ? 'text-emerald-400' : 'text-red-400'}`}>{analysisResult.threatLevel}</p>
                  
                      </div>
                    </div>
                  </div>
                  {/* CASE STATUS */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border-b border-[#213F66] pb-1">CASE STATUS</h3>
                    <div className="bg-[#0A1422] p-4 border-l-2 border-blue-300 rounded-r">
                      <div className="mb-3">
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">AI Recommendation</p>
                        <p className="text-[11px] font-bold text-white tracking-wider uppercase">{aiRecommendation ? aiRecommendation.replace('_', ' ') : 'PENDING'}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Screening State</p>
                        <p className="text-[11px] font-bold text-white tracking-wider uppercase">{caseStatus ? caseStatus.replace('_', ' ') : 'INITIALIZING'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Officer Decision</p>
                        <p className={`text-[11px] font-black tracking-wider uppercase ${finalDecision === 'CLEARED' ? 'text-emerald-400' : finalDecision === 'PENDING_REVIEW' ? 'text-amber-400' : finalDecision ? 'text-red-400' : 'text-cyan-400'}`}>
                          {finalDecision ? finalDecision.replace('_', ' ') : 'AWAITING DECISION'}
                        </p>
                  
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={() => {
          setDbUnlocked(true);
          setShowAuthModal(false);
          setActiveTab('database');
        }} 
      />

    </div>
  );
};

export default Dashboard;