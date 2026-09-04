const storageKey = 'dihadi_chat_v7_direct_919592221100_919910088221';
const msgs = [
  {
    id: 'msg-1',
    jobId: 'direct_919592221100_919910088221',
    senderRole: 'customer',
    senderName: 'Employer',
    senderPhone: '+91 99100 88221',
    text: 'Hello, need help',
    timestamp: '10:00 AM',
    createdAt: Date.now(),
    status: 'delivered'
  }
];

let convos = [];
const adminPhone = "919592221100";

if (msgs.length > 0) {
  const hasAdminMsg = msgs.some(m => m.senderRole === 'admin' || m.senderName.toLowerCase().includes('kaamzo'));
  const isHelplineKey = storageKey.includes(adminPhone) || storageKey.includes('helpline') || storageKey.includes('admin');
  
  if (isHelplineKey || hasAdminMsg || msgs[0]?.text?.toLowerCase().includes('help')) {
    const userMsg = msgs.find(m => m.senderRole !== 'admin' && !m.senderName.toLowerCase().includes('kaamzo'));
    const userName = userMsg ? userMsg.senderName : 'Unknown User';
    const userPhone = userMsg && userMsg.senderPhone ? userMsg.senderPhone : 'Unknown Phone';
    
    const lastMsg = msgs[msgs.length - 1];
    const unreadCount = msgs.filter(m => m.senderRole !== 'admin' && m.status !== 'read').length;
    
    if (!convos.find(c => c.id === storageKey)) {
      convos.push({
        id: storageKey,
        userPhone,
        userName,
        lastMessage: lastMsg.text,
        lastTimestamp: lastMsg.createdAt || Date.now(),
        unreadCount
      });
    }
  }
}
console.log(convos);
