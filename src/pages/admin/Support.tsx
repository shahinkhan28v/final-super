import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  MoreVertical,
  User,
  ShieldAlert,
  Hash,
  Paperclip,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getSupportChats, sendChatMessage } from '../../lib/dataService';
import { SupportChat, ChatMessage } from '../../types';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';

export default function AdminSupport() {
  const { profile } = useAuth();
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'open' | 'closed'>('open');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'support_chats'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportChat));
      setChats(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedChat?.id) {
      const q = query(
        collection(db, 'support_chats', selectedChat.id, 'messages'),
        orderBy('timestamp', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
      });
      return () => unsubscribe();
    }
  }, [selectedChat?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedChat?.id || !profile) return;

    const text = inputText;
    setInputText('');
    
    await sendChatMessage(selectedChat.id, {
      senderId: profile.uid,
      senderRole: 'admin',
      text: text
    });
  };

  const handleSendImage = async () => {
    const url = prompt('Enter image URL:');
    if (!url || !selectedChat?.id || !profile) return;
    
    await sendChatMessage(selectedChat.id, {
      senderId: profile.uid,
      senderRole: 'admin',
      text: '',
      imageUrl: url
    });
  };

  const handleToggleStatus = async (chat: SupportChat) => {
    const newStatus = chat.status === 'open' ? 'closed' : 'open';
    const ref = doc(db, 'support_chats', chat.id!);
    await updateDoc(ref, { status: newStatus, updatedAt: new Date().toISOString() });
    if (selectedChat?.id === chat.id) {
        setSelectedChat({ ...selectedChat, status: newStatus });
    }
  };

  const filteredChats = chats.filter(c => 
    c.status === tab && 
    (c.userName.toLowerCase().includes(search.toLowerCase()) || 
     c.userEmail.toLowerCase().includes(search.toLowerCase()) ||
     c.accountNumber.includes(search))
  );

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      {/* Chat List Sidebar */}
      <div className="w-96 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">Support Tickets</h2>
          <div className="flex bg-slate-50 p-1 rounded-2xl mb-4">
            <button 
              onClick={() => setTab('open')}
              className={cn(
                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                tab === 'open' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"
              )}
            >
              Open
            </button>
            <button 
              onClick={() => setTab('closed')}
              className={cn(
                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                tab === 'closed' ? "bg-white shadow-sm text-slate-600" : "text-slate-400"
              )}
            >
              Closed
            </button>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex items-center gap-3">
             <Search className="w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search by name, email or number..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-300 w-full"
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredChats.map((chat) => (
            <button 
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={cn(
                "w-full p-6 text-left hover:bg-slate-50 transition-colors flex gap-4",
                selectedChat?.id === chat.id && "bg-indigo-50/50 border-r-4 border-indigo-600"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900 truncate pr-2">{chat.userName}</h3>
                  <span className="text-[9px] font-medium text-slate-400 shrink-0">
                    {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate mb-2">{chat.lastMessage}</p>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      <Hash className="w-3 h-3" />
                      {chat.accountNumber}
                   </div>
                   {chat.unreadCount ? (
                     <span className="bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                       {chat.unreadCount}
                     </span>
                   ) : null}
                </div>
              </div>
            </button>
          ))}
          {filteredChats.length === 0 && (
            <div className="p-20 text-center text-slate-300">
               <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-10" />
               <p className="text-xs font-bold uppercase tracking-widest">No tickets here</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden relative">
        {selectedChat ? (
          <>
            {/* Active chat header */}
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                     <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-none tracking-tight">{selectedChat.userName}</h3>
                    <p className="text-xs font-medium text-slate-400 mt-1">{selectedChat.userEmail}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleToggleStatus(selectedChat)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                      selectedChat.status === 'open' 
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedChat.status === 'open' ? 'Resolve' : 'Reopen'}
                  </button>
                  <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                    <MoreVertical className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30"
            >
               {messages.map((msg, i) => (
                 <div 
                   key={msg.id || i}
                   className={cn(
                     "flex w-full",
                     msg.senderRole === 'admin' ? "justify-end" : "justify-start"
                   )}
                 >
                   <div className={cn(
                     "max-w-[70%] rounded-2xl p-4 shadow-sm",
                     msg.senderRole === 'admin' 
                       ? "bg-slate-900 text-white rounded-tr-none" 
                       : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                   )}>
                      <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="Attachment" className="max-w-full rounded-lg mt-2" />
                      )}
                      <div className={cn(
                        "text-[9px] font-black uppercase tracking-widest mt-2 opacity-40",
                        msg.senderRole === 'admin' ? "text-right" : "text-left"
                      )}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                   </div>
                 </div>
               ))}
            </div>

            {/* Reply Input */}
            <div className="p-6 bg-white border-t border-slate-50">
               <form onSubmit={handleSendMessage} className="flex gap-4">
                  <div className="flex-1 relative">
                    <textarea 
                      rows={1}
                      placeholder="Type your response..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none pr-12"
                    />
                    <button 
                      type="button"
                      onClick={handleSendImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                  >
                    <Send className="w-6 h-6" />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-20 text-center">
             <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-200 mb-6 group hover:scale-110 transition-transform cursor-pointer">
                <MessageSquare className="w-12 h-12" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Agent Workspace</h3>
             <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">Select a ticket from the left to start responding to user inquiries in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
