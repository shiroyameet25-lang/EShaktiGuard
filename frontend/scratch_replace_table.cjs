const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('{/* PERSON RECORD LIST */}'));
const end = lines.findIndex((l, i) => i > start && l.includes('{/* Selected Record Details (Slide-over or Modal) */}'));

if (start > -1 && end > -1) {
  const newLogic = `
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
              <table className="w-full text-left border-collapse">
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
                      className="group hover:bg-[#0F1E2C] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-mono text-cyan-300">{record.caseId}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white">{record.date}</span>
                          <span className="text-[9px] font-mono text-[#71899A]">{record.time}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0A1422] border border-[#213F66] overflow-hidden flex-shrink-0">
                            {record.portrait ? (
                              <img src={record.portrait} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-4 h-4 text-cyan-600 mx-auto mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            )}
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-cyan-400 transition-colors">{record.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-[#A9B8C5] uppercase tracking-widest">{record.nationality}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{record.documentType}</span>
                          <span className="text-[9px] font-mono text-[#71899A]">{record.docNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span className={\`inline-block px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded border
                          \${record.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-500 border-red-500/50' :
                             record.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                             record.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                             'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'}\`}>
                          {record.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <span className={\`text-[9px] font-black uppercase tracking-widest flex items-center justify-end
                          \${record.status === 'CLEARED' ? 'text-emerald-400' :
                             record.status === 'REJECTED' ? 'text-red-500' :
                             'text-amber-400'}\`}>
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
`;
  lines.splice(start, end - start, ...newLogic.trim().split('\n'));
  fs.writeFileSync('src/components/Dashboard.jsx', lines.join('\n'), 'utf8');
  console.log('Fixed Data Table');
} else {
  console.log('Could not find boundaries. start:', start, 'end:', end);
}
