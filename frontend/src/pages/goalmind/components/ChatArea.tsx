import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Brain, Calendar, Table2, Menu } from 'lucide-react';
import { ChatMessage, QuickAction } from '../types';
import { QUICK_ACTIONS } from '../data';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onQuickAction: (action: QuickAction) => void;
  onMenuClick: () => void;
}

const QuickActionBtn: React.FC<{ action: QuickAction; onClick: () => void }> = ({ action, onClick }) => {
  const iconMap: Record<string, React.ReactNode> = {
    zap: <Zap size={14} />,
    brain: <Brain size={14} />,
    calendar: <Calendar size={14} />,
    table: <Table2 size={14} />,
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-[#f5a623]/10 hover:border-[#f5a623]/30 hover:text-[#f5a623] transition-all duration-200"
    >
      {iconMap[action.icon] || <Zap size={14} />}
      {action.label}
    </button>
  );
};

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-[#f5a623] text-[#0a1f3f]'
            : 'bg-white/5 border border-white/10 text-gray-200'
          }
        `}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f5a623] to-[#f7c948] flex items-center justify-center">
              <Brain size={12} className="text-[#0a1f3f]" />
            </div>
            <span className="text-xs font-semibold text-[#f5a623]">GoalMind AI</span>
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
        <div className={`text-[10px] mt-2 ${isUser ? 'text-[#0a1f3f]/60' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  onQuickAction,
  onMenuClick,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d1b2a] min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0a1f3f]/80 backdrop-blur-sm">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-gray-400"
        >
          <Menu size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-white">Chat Piala Dunia</h2>
          <p className="text-xs text-gray-400">AI-powered football insights</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-medium text-green-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f5a623] to-[#f7c948] flex items-center justify-center mb-4 shadow-lg shadow-[#f5a623]/25">
              <Brain size={32} className="text-[#0a1f3f]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Selamat datang di GoalMind AI!</h3>
            <p className="text-gray-400 max-w-md text-sm">
              Tanyakan apa saja tentang Piala Dunia 2026. Prediksi, skor, jadwal, formasi, dan analisis mendalam.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-white/5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionBtn
              key={action.id}
              action={action}
              onClick={() => onQuickAction(action)}
            />
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-[#0a1f3f]/50">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan tentang Piala Dunia..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#f5a623]/50 focus:ring-1 focus:ring-[#f5a623]/25 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-3 rounded-xl bg-[#f5a623] text-[#0a1f3f] font-semibold hover:bg-[#f7c948] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
