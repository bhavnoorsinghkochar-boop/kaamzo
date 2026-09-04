const storageKey = 'dihadi_chat_v7_direct_919592221100_919999999999';
const msgs = [
  {
    id: 'msg-1',
    jobId: 'direct_919592221100_919999999999',
    senderRole: 'customer',
    senderName: 'Test User',
    senderPhone: '+91 99999 99999',
    text: 'Hello Kaamzo Helpline',
    timestamp: '10:00 AM',
    createdAt: Date.now(),
    status: 'delivered'
  }
];
console.log('Key:', storageKey);
console.log('Includes adminPhone?', storageKey.includes('919592221100'));
