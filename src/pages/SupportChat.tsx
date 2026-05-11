import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import { 
  Send, 
  Image as ImageIcon, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  User, 
  ShieldCheck,
  Smartphone,
  AlertCircle,
  Hash,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getOrCreateSupportChat, sendChatMessage } from '../lib/dataService';
import { SupportChat, ChatMessage } from '../types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function SupportChatPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'verify' | 'chat'>('verify');
  const [accountNumber, setAccountNumber] = useState('');
  const [chat, setChat] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (chat?.id) {
      const q = query(
        collection(db, 'support_chats', chat.id, 'messages'),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
        setMessages(msgs);
      });

      return () => unsubscribe();
    }
  }, [chat?.id]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !accountNumber) return;
    
    setLoading(true);
    const activeChat = await getOrCreateSupportChat(profile, accountNumber);
    if (activeChat) {
      setChat(activeChat);
      setStep('chat');
    }
    setLoading(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !chat?.id || !profile) return;

    const text = inputText;
    setInputText('');
    
    await sendChatMessage(chat.id, {
      senderId: profile.uid,
      senderRole: 'user',
      text: text
    });
  };

  const handleSendImage = async () => {
    const url = prompt('Enter image URL:');
    if (!url || !chat?.id || !profile) return;
    
    await sendChatMessage(chat.id, {
      senderId: profile.uid,
      senderRole: 'user',
      text: '',
      imageUrl: url
    });
  };

  const PRESET_MESSAGES = [
    "I haven't received my points yet.",
    "My withdrawal is still pending.",
    "I'm having trouble with a specific task.",
    "My referral isn't showing up.",
    "How do I change my payment method?"
  ];

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-4xl mx-auto shadow-2xl relative">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Support Center</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Support Online</span>
            </div>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
           <MessageSquare className="w-5 h-5" />
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4">
        {step === 'verify' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto w-full mt-10 space-y-6"
          >
            <div className="text-center">
               <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 shadow-xl shadow-indigo-100 mx-auto flex items-center justify-center mb-6">
                  <ShieldCheck className="w-10 h-10 text-white" />
               </div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity Check</h2>
               <p className="text-slate-500 text-sm font-medium mt-2">Please confirm your account details to start the secure live chat session.</p>
            </div>

            <form onSubmit={handleStartChat} className="space-y-4">
               <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Account Number / Link Details</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 017XXXXXXXX"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all"
                    />
                  </div>
                  <div className="flex items-start gap-2 mt-4 text-slate-400 p-2 bg-slate-50 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold leading-tight">This helps our agents look up your transaction history instantly.</p>
                  </div>
               </div>

               <button 
                 type="submit"
                 disabled={loading}
                 className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-95 transition-all"
               >
                 {loading ? 'Initializing...' : <><Smartphone className="w-4 h-4" /> Start Live Support</>}
               </button>
            </form>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-4 pb-6 pr-2 -mr-2"
            >
               <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                     <Clock className="w-3.5 h-3.5 text-slate-400" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Session Started at {new Date(chat?.createdAt || '').toLocaleTimeString()}</span>
                  </div>
               </div>

               {messages.map((msg, i) => (
                 <div 
                   key={msg.id || i}
                   className={cn(
                     "flex w-full mb-4",
                     msg.senderRole === 'user' ? "justify-end" : "justify-start"
                   )}
                 >
                   <div className={cn(
                     "max-w-[85%] rounded-3xl p-4 shadow-sm",
                     msg.senderRole === 'user' 
                       ? "bg-indigo-600 text-white rounded-tr-none" 
                       : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                   )}>
                      {msg.text && <p className="text-sm font-bold leading-relaxed">{msg.text}</p>}
                      {msg.imageUrl && (
                        <img 
                          src={msg.imageUrl} 
                          alt="Attachment" 
                          referrerPolicy="no-referrer"
                          className="max-w-full rounded-xl mt-2 border border-black/5" 
                        />
                      )}
                      <div className={cn(
                        "text-[9px] font-black uppercase tracking-widest mt-2 opacity-50",
                        msg.senderRole === 'user' ? "text-right" : "text-left"
                      )}>
                        {msg.senderRole === 'admin' ? 'Support Agent' : 'You'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                   </div>
                 </div>
               ))}

               {messages.length < 3 && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   className="space-y-3 pt-4"
                 >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Common Questions</p>
                    <div className="flex flex-wrap gap-2">
                       {PRESET_MESSAGES.map((msg, i) => (
                         <button 
                           key={i}
                           onClick={() => { setInputText(msg); }}
                           className="px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm active:scale-95 text-left"
                         >
                           {msg}
                         </button>
                       ))}
                    </div>
                 </motion.div>
               )}
            </div>

            {/* Input Area */}
            <div className="bg-white border border-slate-200 p-3 rounded-3xl shadow-lg mt-4">
               <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex-1 bg-slate-50 rounded-2xl p-2 flex flex-col gap-2 border border-slate-100 focus-within:border-indigo-200 transition-colors">
                     <textarea 
                        rows={1}
                        placeholder="Type your message here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="bg-transparent border-none outline-none text-sm font-bold p-2 resize-none placeholder:text-slate-300 w-full"
                     />
                  </div>
                  <div className="flex gap-1.5 pb-1">
                     <button 
                       type="button"
                       onClick={handleSendImage}
                       className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors"
                     >
                       <ImageIcon className="w-5 h-5" />
                     </button>
                     <button 
                       type="submit"
                       disabled={!inputText.trim()}
                       className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:shadow-none"
                     >
                       <Send className="w-5 h-5" />
                     </button>
                  </div>
               </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
