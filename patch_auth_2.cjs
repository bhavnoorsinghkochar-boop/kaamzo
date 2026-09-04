const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
/return \(\s*\(\w+ && cleanPhone && \w+ === cleanPhone\) \|\|\s*\w+\.\w+\.trim\(\)\.toLowerCase\(\) === cleanName\s*\);/g,
'return (wCleanPhone && cleanPhone && wCleanPhone === cleanPhone);'
);

content = content.replace(
/return \(\s*\(\w+ && cleanPhone && \w+ === cleanPhone\) \|\|\s*v\.workerName\.trim\(\)\.toLowerCase\(\) === cleanName\s*\);/g,
'return (vCleanPhone && cleanPhone && vCleanPhone === cleanPhone);'
);

content = content.replace(
/return \(\s*\(\w+ && cleanPhone && \w+ === cleanPhone\) \|\|\s*w\.name\.trim\(\)\.toLowerCase\(\) === data\.workerName\.trim\(\)\.toLowerCase\(\)\s*\);/g,
'return (wClean && cleanPhone && wClean === cleanPhone);'
);

content = content.replace(
/return \(\s*\(\w+ && cleanPhone && \w+ === cleanPhone\) \|\|\s*v\.workerName\.trim\(\)\.toLowerCase\(\) ===\s*data\.workerName\.trim\(\)\.toLowerCase\(\)\s*\);/g,
'return (vClean && cleanPhone && vClean === cleanPhone);'
);


fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Patched AppContext.tsx successfully.');
