sed -i '/const handleConfirmDirectBooking/,/};/c\
  const handleConfirmDirectBooking = (e: React.FormEvent) => {\
    e.preventDefault();\
    if (!currentCustomer || !bookingWorker) return;\
\
    const workerTrade = bookingWorker.primaryTrade;\
    const workerDailyWage = bookingWorker.dailyRate;\
    const jobTitle = directJobTitle.trim() || `Hired ${bookingWorker.name} for ${workerTrade}`;\
\
    const createdJob = postJob({\
      title: jobTitle,\
      trade: workerTrade,\
      description: directJobDescription || `Direct booking for ${bookingWorker.name} (${workerTrade}).`,\
      customerName: currentCustomer.name,\
      customerPhone: currentCustomer.phone,\
      locationAddress: currentCustomer.address,\
      area: currentCustomer.area,\
      dailyWage: Number(workerDailyWage) || 850,\
      durationDays: Number(directJobDuration) || 1,\
    });\
\
    if (createdJob) {\
      acceptJobByWorker(createdJob.id, bookingWorker);\
      playSound("success");\
      showNotification(`Booked ${bookingWorker.name}! Proceed to approve and pay.`);\
    }\
    setBookingWorker(null);\
    setDirectJobTitle("");\
    setDirectJobDescription("");\
    setActiveTab("my_bookings");\
  };' src/components/customer/CustomerApp.tsx
