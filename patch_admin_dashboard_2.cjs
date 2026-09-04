const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

content = content.replace(
  /\{adminTab === "jobs" && \((.*?)\)\}\s*\{"\s*"\}/s,
  `{adminTab === "jobs" && ($1)}
        {adminTab === "support" && (
          <AdminSupportChatHub />
        )}
        {" "}`
);

fs.writeFileSync('src/components/admin/AdminDashboard.tsx', content);
console.log('Patched AdminDashboard.tsx part 2');
