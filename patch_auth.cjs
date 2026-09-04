const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// We want to replace name matching in registerWorkerWithAuth
content = content.replace(
/return \(\s*\(\w+ && \w+ === cleanPhone\) \|\|\s*w\.name\.trim\(\)\.toLowerCase\(\) === data\.name\.trim\(\)\.toLowerCase\(\)\s*\);/g,
'return (wClean && wClean === cleanPhone);'
);

content = content.replace(
/return \(\s*\(\w+ && \w+ === cleanPhone\) \|\|\s*v\.workerName\.trim\(\)\.toLowerCase\(\) === data\.name\.trim\(\)\.toLowerCase\(\)\s*\);/g,
'return (vClean && vClean === cleanPhone);'
);

content = content.replace(
/return \(\s*!\(\w+ && \w+ === cleanPhone\) &&\s*w\.name\.trim\(\)\.toLowerCase\(\) !== data\.name\.trim\(\)\.toLowerCase\(\)\s*\);/g,
'return !(wClean && wClean === cleanPhone);'
);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Patched AppContext.tsx successfully.');
