sed -i '/const acceptJobByWorker/i \
  const approveAndFundEscrow = (jobId: string) => {\
    setJobs(prev => prev.map(job => {\
      if (job.id === jobId) {\
        const updated = {\
          ...job,\
          isEscrowPrepaid: true,\
          escrowStatus: "held_in_escrow" as const,\
          escrowPrepaidAt: new Date().toISOString()\
        };\
        syncJobToFirestore(updated);\
        return updated;\
      }\
      return job;\
    }));\
    playSound("success");\
    showNotification("Escrow Funded", "Worker approved! Start OTP generated.");\
  };\
' src/context/AppContext.tsx
