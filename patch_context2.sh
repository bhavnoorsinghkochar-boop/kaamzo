sed -i '/acceptJobByWorker: (jobId: string/a \  approveAndFundEscrow: (jobId: string) => void;' src/context/AppContext.tsx
sed -i '/acceptJobByWorker,/a \        approveAndFundEscrow,' src/context/AppContext.tsx
