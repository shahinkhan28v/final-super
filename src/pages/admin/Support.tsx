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
  ChevronRight,
  RefreshCw
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
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } else {
      setMessages([]);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat?.id || !profile) return;

    // Simple validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File too large (max 2MB)');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await sendChatMessage(selectedChat.id!, {
          senderId: profile.uid,
          senderRole: 'admin',
          text: '',
          imageUrl: base64
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4 md:gap-6">
      {/* Chat List Sidebar */}
      <div className={cn(
        "w-full md:w-96 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden transition-all",
        selectedChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 md:p-6 border-b border-slate-50">
          <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-4">Support Tickets</h2>
          <div className="flex bg-slate-50 p-1 rounded-2xl mb-4">
            <button 
              onClick={() => setTab('open')}
              className={cn(
                "flex-1 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all",
                tab === 'open' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"
              )}
            >
              Open
            </button>
            <button 
              onClick={() => setTab('closed')}
              className={cn(
                "flex-1 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all",
                tab === 'closed' ? "bg-white shadow-sm text-slate-600" : "text-slate-400"
              )}
            >
              Closed
            </button>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-transparent focus-within:border-indigo-100">
             <Search className="w-4 h-4 text-slate-300" />
             <input 
               type="text" 
               placeholder="Search tickets..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="bg-transparent border-none outline-none text-xs font-bold placeholder:text-slate-300 w-full"
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredChats.map((chat) => (
            <button 
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={cn(
                "w-full p-4 md:p-6 text-left hover:bg-slate-50 transition-colors flex gap-4",
                selectedChat?.id === chat.id && "bg-indigo-50/50 md:border-r-4 md:border-indigo-600"
              )}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <User className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900 truncate pr-2 text-xs md:text-sm">{chat.userName}</h3>
                  <span className="text-[8px] md:text-[9px] font-medium text-slate-400 shrink-0">
                    {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate mb-2">{chat.lastMessage}</p>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      <Hash className="w-2.5 h-2.5" />
                      {chat.accountNumber}
                   </div>
                   {chat.unreadCount ? (
                     <span className="bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                       {chat.unreadCount}
                     </span>
                   ) : null}
                </div>
              </div>
            </button>
          ))}
          {filteredChats.length === 0 && (
            <div className="p-12 md:p-20 text-center text-slate-300">
               <MessageSquare className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 opacity-10" />
               <p className="text-[10px] font-bold uppercase tracking-widest">No tickets here</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden relative transition-all",
        !selectedChat && "hidden md:flex"
      )}>
        {selectedChat ? (
          <>
            {/* Active chat header */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
               <div className="flex items-center gap-3 md:gap-4">
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-2 -ml-2 text-slate-400 hover:text-indigo-600"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                     <User className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 text-sm md:text-lg leading-none tracking-tight truncate">{selectedChat.userName}</h3>
                    <p className="text-[10px] md:text-xs font-medium text-slate-400 mt-1 truncate">{selectedChat.userEmail}</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 md:gap-3">
                  <button 
                    onClick={() => handleToggleStatus(selectedChat)}
                    className={cn(
                      "px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 transition-all",
                      selectedChat.status === 'open' 
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{selectedChat.status === 'open' ? 'Resolve' : 'Reopen'}</span>
                  </button>
                  <button className="p-1.5 md:p-2 hover:bg-slate-50 rounded-lg md:rounded-xl text-slate-400">
                    <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
               </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/20"
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
                     "max-w-[85%] md:max-w-[70%] rounded-2xl p-3 md:p-4 shadow-sm",
                     msg.senderRole === 'admin' 
                       ? "bg-slate-900 text-white rounded-tr-none" 
                       : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                   )}>
                      {msg.text && <p className="text-xs md:text-sm font-bold leading-relaxed">{msg.text}</p>}
                      {msg.imageUrl && (
                        <img 
                          src={msg.imageUrl} 
                          alt="Attachment" 
                          className="max-w-full rounded-lg mt-2 cursor-pointer transition-transform hover:scale-[1.02]" 
                          onClick={() => window.open(msg.imageUrl, '_blank')}
                        />
                      )}
                      <div className={cn(
                        "text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-2 opacity-40",
                        msg.senderRole === 'admin' ? "text-right" : "text-left"
                      )}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                   </div>
                 </div>
               ))}
            </div>

            {/* Reply Input */}
            <div className="p-4 md:p-6 bg-white border-t border-slate-50">
               <form onSubmit={handleSendMessage} className="flex gap-3 md:gap-4">
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
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 md:py-4 text-xs md:text-sm font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none pr-12"
                    />
                    <input 
                       type="file"
                       hidden
                       ref={fileInputRef}
                       accept="image/*"
                       onChange={handleFileChange}
                    />
                    <button 
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                    >
                      {isUploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 md:p-20 text-center">
             <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl md:rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-200 mb-6 group hover:scale-110 transition-transform cursor-pointer">
                <MessageSquare className="w-10 h-10 md:w-12 md:h-12" />
             </div>
             <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Agent Workspace</h3>
             <p className="text-[11px] md:text-sm font-medium text-slate-500 mt-2 max-w-sm">Select a ticket from the left to start responding to user inquiries in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
