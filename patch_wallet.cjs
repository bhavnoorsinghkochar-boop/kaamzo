const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
/setWorkers\(\(prev\) =>\s*prev\.map\(\(w\) => \(w\.id === currentWorker\.id \? updated : w\)\),\s*\);\s*playSound\("cash"\);/g,
`setWorkers((prev) =>
      prev.map((w) => (w.id === currentWorker.id ? updated : w)),
    );
    syncWorkerToFirestore(updated);
    playSound("cash");`
);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Patched AppContext.tsx successfully.');
