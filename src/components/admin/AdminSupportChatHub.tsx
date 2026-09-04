import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Clock, Send, ShieldAlert, Phone, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { useTranslation } from "react-i18next";

interface SupportConversation {
  id: string; // e.g., 'direct_919592221100_919810155678'
  userPhone: string;
  userName: string;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
}

export const AdminSupportChatHub: React.FC = () => {
    const { t } = useTranslation();
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const adminPhone = "919592221100";

  // Load conversations from localStorage
  const loadConversations = () => {
    const chatKeys = Object.keys(localStorage).filter(k => 
      k.startsWith('dihadi_chat_')
    );
    
    const convos: SupportConversation[] = [];
    
    chatKeys.forEach(key => {
      try {
        const msgs: ChatMessage[] = JSON.parse(localStorage.getItem(key) || '[]');
        if (msgs.length > 0) {
          // Check if it's a conversation with admin (919592221100) OR has an admin message OR is a direct chat that looks like support
          const hasAdminMsg = msgs.some(m => m.senderRole === 'admin' || m.senderName.toLowerCase().includes('kaamzo'));
          const isHelplineKey = key.includes(adminPhone) || key.includes('helpline') || key.includes('admin');
          
          // To be safe, if a user specifically requests help, show it.
          // For now, let's just show ANY direct chat that involves the helpline OR if no other filter matches, we assume it's a support chat if the admin opened it.
          if (isHelplineKey || hasAdminMsg || msgs[0]?.text?.toLowerCase().includes('help')) {
            // Find user details (first person who is not admin)
            const userMsg = msgs.find(m => m.senderRole !== 'admin' && !m.senderName.toLowerCase().includes('kaamzo'));
            const userName = userMsg ? userMsg.senderName : 'Unknown User';
            const userPhone = userMsg && userMsg.senderPhone ? userMsg.senderPhone : 'Unknown Phone';
            
            const lastMsg = msgs[msgs.length - 1];
            
            const unreadCount = msgs.filter(m => m.senderRole !== 'admin' && m.status !== 'read').length;
            
            // Avoid duplicates
            if (!convos.find(c => c.id === key)) {
              convos.push({
                id: key,
                userPhone,
                userName,
                lastMessage: lastMsg.text,
                lastTimestamp: lastMsg.createdAt || Date.now(),
                unreadCount
              });
            }
          }
        }
      } catch (e) {
        console.error("Error parsing chat", e);
      }
    });
    
    // Sort by most recent first
    convos.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
    setConversations(convos);
  };

  useEffect(() => {
    loadConversations();
    
    // Listen for chat updates
    const handleStorage = () => loadConversations();
    const handleSync = () => loadConversations();
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('dihadi_chat_sync', handleSync as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dihadi_chat_sync', handleSync as EventListener);
    };
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    
    const loadSelectedMsgs = () => {
      try {
        const msgs = JSON.parse(localStorage.getItem(selectedConversation) || '[]');
        setMessages(msgs);
        
        // Mark as read
        let updated = false;
        const readMsgs = msgs.map((m: ChatMessage) => {
          if (m.senderRole !== 'admin' && m.status !== 'read') {
            updated = true;
            return { ...m, status: 'read' };
          }
          return m;
        });
        
        if (updated) {
          localStorage.setItem(selectedConversation, JSON.stringify(readMsgs));
          window.dispatchEvent(new CustomEvent('dihadi_chat_sync', { detail: { key: selectedConversation } }));
          loadConversations();
        }
      } catch (e) {
        console.error("Error parsing messages", e);
      }
    };
    
    loadSelectedMsgs();
    
    const handleStorage = () => loadSelectedMsgs();
    const handleSync = (e: any) => {
      if (e.detail?.key === selectedConversation) {
        loadSelectedMsgs();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('dihadi_chat_sync', handleSync as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dihadi_chat_sync', handleSync as EventListener);
    };
  }, [selectedConversation]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) return;
    
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-admin`,
      jobId: selectedConversation,
      senderRole: 'admin',
      senderName: 'Kaamzo Support',
      senderPhone: '+91 95922 21100',
      text: replyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      status: 'sent'
    };
    
    try {
      const existing = JSON.parse(localStorage.getItem(selectedConversation) || '[]');
      const updatedMsgs = [...existing, newMsg];
      localStorage.setItem(selectedConversation, JSON.stringify(updatedMsgs));
      setMessages(updatedMsgs);
      setReplyText("");
      window.dispatchEvent(new CustomEvent('dihadi_chat_sync', { detail: { key: selectedConversation } }));
      
      // Also dispatch a global chat notification event
      window.dispatchEvent(
        new CustomEvent('dihadi_chat_message_event', {
          detail: {
            id: `notif-${newMsg.id}`,
            senderRole: 'admin',
            senderName: 'Kaamzo Support',
            senderPhone: '+91 95922 21100',
            text: newMsg.text,
          }
        })
      );
    } catch (e) {
      console.error("Error saving message", e);
    }
  };

  const selectedConvoData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden h-[600px] flex flex-col md:flex-row w-full">
      {/* Sidebar: Conversation List */}
      <div className={`w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col bg-slate-900/50 h-full ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-700">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-amber-400" />
             {t("Support Hub (")} {conversations.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
               {t("No support messages yet.")} </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full text-left p-4 border-b border-slate-800/50 transition flex items-start gap-3 hover:bg-slate-800 ${selectedConversation === conv.id ? 'bg-slate-800 border-l-2 border-l-amber-500' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <span className="text-amber-500 font-bold text-sm">
                    {conv.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-200 text-xs truncate">{conv.userName}</span>
                    <span className="text-[10px] text-slate-500">{new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-[10px] font-black shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Main Area: Chat View */}
      <div className={`w-full md:w-2/3 flex flex-col bg-slate-950 h-full ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation && selectedConvoData ? (
          <>
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 transition"
                  title="Back to conversation list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold shrink-0">
                  {selectedConvoData.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedConvoData.userName}</h4>
                  <p className="text-xs text-amber-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedConvoData.userPhone}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isAdmin = msg.senderRole === 'admin';
                return (
                  <div key={msg.id} className={`flex \${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-3 \${isAdmin ? 'bg-amber-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                      <span className="text-[9px] mt-1.5 block opacity-70 text-right">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <form onSubmit={handleSendReply} className="p-4 border-t border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-700 focus-within:border-amber-500/50">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t("Type a reply...")}
                  className="flex-1 bg-transparent border-none text-white text-sm px-3 py-2 focus:ring-0 focus:outline-none placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="p-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:bg-slate-700 text-white rounded-lg transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
            <ShieldAlert className="w-12 h-12 text-slate-700" />
            <p className="text-sm font-medium"> {t("Select a conversation to view and reply.")} </p>
          </div>
        )}
      </div>
    </div>
  );
};
