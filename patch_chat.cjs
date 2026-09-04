const fs = require('fs');
const content = fs.readFileSync('src/components/common/QuickChatModal.tsx', 'utf8');

const targetStr = `            isSender: true,
          },
        })
      );`;

const replacement = `            isSender: true,
          },
        })
      );
      
      if (recipientRoleType === 'admin') {
        setTimeout(() => {
          const autoMsg = {
            id: 'msg-' + Date.now() + '-admin',
            jobId: job?.id || conversationId,
            senderRole: 'admin' as const,
            senderName: 'Kaamzo Support',
            senderPhone: '+91 95922 21100',
            text: 'Thank you for reaching out. We have received your message. A human agent will connect with you via WhatsApp or phone call shortly. For immediate assistance, please use the WhatsApp button above.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: Date.now(),
            status: 'delivered' as const,
            isQuickReply: false,
          };
          const updatedWithAdmin = [...updated, autoMsg];
          saveAndBroadcastMessages(updatedWithAdmin);
          playSound('notification');
        }, 1500);
      }
`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/components/common/QuickChatModal.tsx', content.replace(targetStr, replacement));
  console.log('Patched QuickChatModal.tsx successfully.');
} else {
  console.log('Target string not found.');
}
