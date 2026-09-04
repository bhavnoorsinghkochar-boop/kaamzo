const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

content = content.replace(
  /useState<"treasury" \| "kyc" \| "workers" \| "jobs">/g,
  `useState<"treasury" | "kyc" | "workers" | "jobs" | "support">`
);

content = content.replace(
  /<button\s+onClick=\{\(\) => setAdminTab\("jobs"\)\}/g,
  `<button
          onClick={() => setAdminTab("support")}
          className={\`flex-1 min-w-[90px] py-2.5 px-3 rounded-t-xl text-center transition flex items-center justify-center gap-1.5 \${adminTab === "support" ? "bg-slate-800 text-amber-400 border-t-2 border-amber-500 shadow-xs" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}\`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Support Chats</span>
        </button>
        <button
          onClick={() => setAdminTab("jobs")}`
);

fs.writeFileSync('src/components/admin/AdminDashboard.tsx', content);
console.log('Patched AdminDashboard.tsx part 1');
