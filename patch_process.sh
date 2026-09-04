cat << 'INNER_EOF' > process_replacement.txt
  const processPrepaidBooking = () => {
    if (!prepayBooking || !currentCustomer) return;
    
    if (prepayBooking.type === 'approve_escrow' && prepayBooking.jobId) {
      approveAndFundEscrow(prepayBooking.jobId);
    }
    
    setPrepayBooking(null);
  };
INNER_EOF
sed -i '/const processPrepaidBooking = () => {/,/};/c\
  const processPrepaidBooking = () => {\
    if (!prepayBooking || !currentCustomer) return;\
    if (prepayBooking.type === '\''approve_escrow'\'' && prepayBooking.jobId) {\
      approveAndFundEscrow(prepayBooking.jobId);\
    }\
    setPrepayBooking(null);\
  };\
' src/components/customer/CustomerApp.tsx
