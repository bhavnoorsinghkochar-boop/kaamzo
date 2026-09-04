const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

// Remove the wrongly placed support block
content = content.replace(
  /        \{adminTab === "support" && \(\n          <AdminSupportChatHub \/>\n        \)\}\n        \{" "\}/,
  ''
);

// Add it correctly after the jobs block closing brace
content = content.replace(
  /            <\/div>\{" "\}\n          <\/div>\n        \)\}\{" "\}/,
  `            </div>{" "}
          </div>
        )}{" "}
        {adminTab === "support" && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
             <AdminSupportChatHub />
          </div>
        )}`
);

fs.writeFileSync('src/components/admin/AdminDashboard.tsx', content);
