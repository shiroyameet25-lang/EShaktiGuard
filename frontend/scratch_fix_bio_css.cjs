const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// Fix Biometric Verification container
content = content.replace(
  /\$\{biometricInView \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
  'opacity-100 translate-y-0'
);
content = content.replace(
  /\$\{biometricInView \? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'\}/g,
  'opacity-100 translate-x-0'
);
content = content.replace(
  /\$\{biometricInView \? 'opacity-100 scale-100' : 'opacity-0 scale-90'\}/g,
  'opacity-100 scale-100'
);
content = content.replace(
  /\$\{biometricInView \? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'\}/g,
  'opacity-100 translate-x-0'
);

// Enforce flex-row instead of flex-col md:flex-row for the biometric layout
content = content.replace(
  /className="flex flex-col md:flex-row items-center justify-center gap-8 py-4"/g,
  'className="flex flex-row items-center justify-center gap-4 md:gap-8 py-4 w-full"'
);

fs.writeFileSync('src/components/Dashboard.jsx', content, 'utf8');
console.log('Fixed Biometric Verification UI');
