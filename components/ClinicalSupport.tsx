import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/ai';
import { Patient } from '../types';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const ClinicalSupport: React.FC<{ patient?: Patient }> = ({ patient }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'ai',
      text: patient 
        ? `Hello. I have analyzed **${patient.firstName} ${patient.lastName}'s** records. I am ready to assist with clinical decision support, differential diagnosis, or interaction checks. What would you like to know?`
        : "Hello. I am the Nexus Clinical AI. How can I assist with hospital administration or general medical queries today?",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      let responseText = '';
      if (patient) {
        responseText = await aiService.analyzePatient(patient, userMsg.text);
      } else {
        responseText = await aiService.generalConsult(userMsg.text);
      }

      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', sender: 'ai', text: "System connection error. Please try again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center gap-3 shadow-sm">
        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
           <Sparkles className="text-white" size={20} />
        </div>
        <div>
           <h3 className="text-white font-bold text-sm">Nexus Clinical AI</h3>
           <p className="text-purple-100 text-xs">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-slate-200' : 'bg-purple-100 text-purple-600'}`}>
               {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tr-none' 
                : 'bg-white border border-purple-100 text-slate-800 shadow-sm rounded-tl-none'
            }`}>
              <ReactMarkdown 
                className="prose prose-sm max-w-none"
                components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <span className="font-bold text-slate-900" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />
                }}
              >
                  {msg.text}
              </ReactMarkdown>
              <div className="text-[10px] text-slate-400 mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
             </div>
             <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-purple-600" size={16} />
                <span className="text-xs text-slate-500 font-medium">Analyzing records...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
          <textarea
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 p-2 text-sm text-slate-800 placeholder-slate-400"
            rows={1}
            placeholder={patient ? `Ask about ${patient.lastName}'s condition...` : "Ask a medical question..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button 
            onClick={handleSend}
            disabled={!query.trim() || loading}
            className={`p-2 rounded-lg transition-colors ${query.trim() && !loading ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
           AI responses are for support only and must be verified by a physician.
        </p>
      </div>
    </div>
  );
};
