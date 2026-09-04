const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

content = content.replace(
  /\)\}\s*\{adminTab === "support" && \(\s*<AdminSupportChatHub \/>\s*\)\}\s*\{" "\}/g,
  ')}'
);

content = content.replace(
  /\{adminTab === "jobs" && \((.*?)\)\}\s*\{" "\}/gs,
  `{adminTab === "jobs" && ($1)}
        {adminTab === "support" && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-0 h-[600px] shadow-xl">
             <AdminSupportChatHub />
          </div>
        )}
        {" "}`
);

fs.writeFileSync('src/components/admin/AdminDashboard.tsx', content);
console.log('Fixed tabs');
