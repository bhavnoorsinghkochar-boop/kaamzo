const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
/setWorkers\(\(prev\) =>\s*prev\.map\(\(w\) =>\s*w\.id === updatedWorker\.id \|\| w\.name === updatedWorker\.name\s*\? updatedWorker\s*: w,\s*\),\s*\);/g,
`setWorkers((prev) =>
        prev.map((w) =>
          w.id === updatedWorker.id || w.name === updatedWorker.name
            ? updatedWorker
            : w,
        ),
      );
      syncWorkerToFirestore(updatedWorker);`
);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log('Patched AppContext.tsx successfully.');
