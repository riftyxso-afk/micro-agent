import React from 'react';
import {
  MessageSquare,
  Brain,
  Swords,
  Calendar,
  Trophy,
  Newspaper,
  Radio,
  ChevronLeft,
  X,
} from 'lucide-react';
import { MenuId } from '../types';

interface SidebarProps {
  activeMenu: MenuId;
  onMenuChange: (menu: MenuId) => void;
  liveMatchCount: number;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: { id: MenuId; label: string; icon: React.ReactNode }[] = [
  { id: 'chat', label: 'Chat Piala Dunia', icon: <MessageSquare size={20} /> },
  { id: 'predictions', label: 'Prediksi', icon: <Brain size={20} /> },
  { id: 'fantasy', label: 'Fantasy Assistant', icon: <Swords size={20} /> },
  { id: 'schedule', label: 'Jadwal & Hasil', icon: <Calendar size={20} /> },
  { id: 'standings', label: 'Klasemen', icon: <Trophy size={20} /> },
  { id: 'news', label: 'Berita', icon: <Newspaper size={20} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  onMenuChange,
  liveMatchCount,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#0a1f3f] border-r border-white/10
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f5a623] to-[#f7c948] flex items-center justify-center">
                <Trophy size={22} className="text-[#0a1f3f]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">GoalMind</h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">AI Football</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-gray-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onMenuChange(item.id);
                onClose();
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-200
                ${activeMenu === item.id
                  ? 'bg-[#f5a623]/20 text-[#f5a623]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className={activeMenu === item.id ? 'text-[#f5a623]' : 'text-gray-500'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Live Match Button */}
        <div className="p-3 border-t border-white/10">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm hover:from-red-500 hover:to-red-400 transition-all duration-200 shadow-lg shadow-red-600/25">
            <Radio size={18} className={liveMatchCount > 0 ? 'animate-pulse' : ''} />
            Pertandingan Live
            {liveMatchCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-white text-red-600 rounded-full">
                {liveMatchCount}
              </span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f5a623] to-[#f7c948] flex items-center justify-center text-sm font-bold text-[#0a1f3f]">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">User</p>
              <p className="text-xs text-gray-400 truncate">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
