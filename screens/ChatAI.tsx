import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, Bot, Sparkles, RefreshCw, ChevronLeft, MoreVertical, Paperclip } from 'lucide-react';
import { ChatMessage } from '../types';
import { QUICK_PROMPTS } from '../constants';

interface ChatScreenProps {
  user?: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    /* Empty initial state to show the Welcome Hero */
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async (text: string = inputText) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId: user?.id || 1
        })
      });

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.reply || "Maaf, saya tidak dapat menjawab saat ini.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error(error);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Gagal terhubung ke server. Pastikan backend berjalan.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
  }

  return (
    <div className="flex flex-col h-full bg-[#F3F6F8] relative font-sans">
      {/* Heavy Neon Header */}
      <div className="relative bg-slate-900 pt-6 pb-6 px-6 rounded-b-[40px] shadow-2xl z-20 overflow-hidden shrink-0">
        {/* Background Effects */}
        <div className="absolute top-[-50%] left-[-20%] w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[200px] h-[200px] bg-blue-500/20 rounded-full blur-[60px]" />
        <div className="absolute inset-0 bg-[url('/neon-bg.png')] bg-cover bg-center opacity-30 mix-blend-overlay" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-white/10">
                <Bot size={24} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-slate-900 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="font-bold text-white text-xl leading-tight tracking-tight">ERT AI Assistant</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <p className="text-xs text-emerald-100/70 font-medium">Online & Ready</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10"
            title="Reset Chat"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-6">

        {/* Welcome State (If no messages) */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[70%] animate-fade-in">
            <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-float mb-6 relative">
              <div className="absolute inset-0 bg-blue-500/10 rounded-[32px] blur-xl"></div>
              <Sparkles size={32} className="text-indigo-500 relative z-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Halo, Chief! 👋</h2>
            <p className="text-slate-500 text-center max-w-[260px] text-sm leading-relaxed mb-8">
              Saya asisten AI pintar Anda. Tanyakan tentang prosedur safety, inspeksi unit, atau regulasi APD.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {QUICK_PROMPTS.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full px-4 py-3 bg-white rounded-xl text-xs font-bold text-slate-600 shadow-sm border border-slate-100 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all text-left flex items-center gap-3 group"
                >
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px] font-bold group-hover:bg-indigo-500 group-hover:text-white transition-colors">{idx + 1}</span>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Bubbles */}
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start items-end gap-3'} animate-fade-in`}>

              {/* Bot Avatar (only show for bot) */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <Bot size={14} />
                </div>
              )}

              <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 text-sm font-medium leading-relaxed shadow-sm transition-all relative group ${isUser
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-[24px] rounded-tr-[4px] shadow-blue-500/20'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-[24px] rounded-tl-[4px] shadow-card'
                  }`}>
                  {msg.text}
                  {/* Timestamp for User */}
                  {isUser && (
                    <span className="text-[9px] text-blue-100/70 absolute bottom-1 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                {/* Timestamp for Bot */}
                {!isUser && (
                  <span className="text-[10px] text-slate-400 mt-1 ml-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex justify-start items-end gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Bot size={14} />
            </div>
            <div className="bg-white border border-slate-100 rounded-[24px] rounded-tl-[4px] px-5 py-4 shadow-card flex items-center gap-1.5 w-fit">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Modern Input */}
      <div className="absolute bottom-[90px] left-0 w-full px-4 z-30">
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-2 pr-2 border border-white/60 shadow-2xl flex items-end gap-2">
          <button className="w-10 h-10 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center flex-shrink-0">
            <Paperclip size={20} />
          </button>

          <div className="flex-1 py-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ketik pesan..."
              className="w-full bg-transparent text-slate-800 text-sm focus:outline-none placeholder-slate-400 font-medium resize-none max-h-[80px]"
              rows={1}
              style={{ minHeight: '24px' }}
            />
          </div>

          {inputText ? (
            <button
              onClick={() => handleSend()}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform active:scale-95"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          ) : (
            <button className="w-10 h-10 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center flex-shrink-0 shadow-lg">
              <Mic size={20} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};