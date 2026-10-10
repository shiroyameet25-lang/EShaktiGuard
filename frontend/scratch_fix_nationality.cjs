const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.jsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes("let finalNationality = 'UNKNOWN';"));
const end = lines.findIndex((l, i) => i > start && l.includes("// Retain original isCanadaPR"));

if (start > -1 && end > -1) {
  const newLogic = `
      let finalNationality = 'UNKNOWN';
      let docTypeDisplay = 'UNKNOWN';
      let docCountry = 'UNKNOWN';
      let isCanadaPR = false;

      if (primaryDoc) {
        docTypeDisplay = primaryDoc.documentType || 'UNKNOWN';
        if (primaryDoc.analysis) {
          const rawUpper = (primaryDoc.analysis.rawText || '').toUpperCase();
          const code = primaryDoc.analysis.mrzNationality || '';
          docCountry = primaryDoc.analysis.documentCountry || '';
          
          if (code.toUpperCase() === 'CAN' || docCountry.toUpperCase() === 'CANADA' || rawUpper.includes('CANADIAN') || rawUpper.includes('CANADA')) {
            finalNationality = 'CANADIAN';
          } else if (code) {
            const codeMap = { 'IND': 'INDIAN', 'USA': 'AMERICAN', 'GBR': 'BRITISH', 'MEX': 'MEXICAN' };
            finalNationality = codeMap[code.toUpperCase()] || code.toUpperCase();
          } else if (docCountry) {
            const countryMap = { 'INDIA': 'INDIAN', 'USA': 'AMERICAN', 'UNITED STATES': 'AMERICAN' };
            finalNationality = countryMap[docCountry.toUpperCase()] || docCountry.toUpperCase();
          }
        }
        `;
  lines.splice(start, end - start, ...newLogic.split('\n'));
  fs.writeFileSync('src/components/Dashboard.jsx', lines.join('\n'), 'utf8');
  console.log('Fixed Nationality Logic');
} else {
  console.log('Could not find nationality block. Start: ' + start + ' End: ' + end);
}
