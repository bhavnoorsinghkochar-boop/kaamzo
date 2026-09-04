const fs = require('fs');
const file = 'src/components/common/QuickChatModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const conversationId = job\?\.id \? `job_\$\{job\.id\}` : `direct_\$\{otherPersonName\.replace\(\/\\s\+\/g, '_'\)\.toLowerCase\(\)\}`;/g,
  `const conversationId = job?.id 
    ? \`job_\${job.id}\` 
    : \`direct_\${[currentUserPhone, otherPersonPhone].map(p => p.replace(/[^0-9]/g, '')).sort().join('_')}\`;`
);

fs.writeFileSync(file, content);
console.log('Patched QuickChatModal.tsx');
