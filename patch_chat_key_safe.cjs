const fs = require('fs');
const file = 'src/components/common/QuickChatModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\[currentUserPhone, otherPersonPhone\]\.map\(p => p\.replace\(\/\[\^0-9\]\/g, ''\)\)/g,
  `[currentUserPhone || '', otherPersonPhone || ''].map(p => p.replace(/[^0-9]/g, ''))`
);

fs.writeFileSync(file, content);
console.log('Patched QuickChatModal.tsx safe replace');
