const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
/\(wClean && cleanPhone && wClean === cleanPhone\) \|\|\s*w\.name\.trim\(\)\.toLowerCase\(\) === data\.workerName\.trim\(\)\.toLowerCase\(\)/g,
'(wClean && cleanPhone && wClean === cleanPhone)'
);

content = content.replace(
/\(vClean && cleanPhone && vClean === cleanPhone\) \|\|\s*v\.workerName\.trim\(\)\.toLowerCase\(\) ===\s*data\.workerName\.trim\(\)\.toLowerCase\(\)/g,
'(vClean && cleanPhone && vClean === cleanPhone)'
);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Patched AppContext.tsx successfully.');
