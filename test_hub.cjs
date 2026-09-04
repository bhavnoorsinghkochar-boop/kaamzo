const fs = require('fs');
const content = fs.readFileSync('src/components/admin/AdminSupportChatHub.tsx', 'utf-8');
console.log(content.substring(0, 1000));
