
import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentId: string | null;
  isOpen: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sessions, currentId, isOpen, onSelect, onNew, onDelete, onClose }) => {
  return (
    <aside className={`fixed md:relative top-0 right-0 h-full border-l md:border-l-0 md:border-r border-white/5 bg-[#0a0a0a] flex flex-col z-40 transition-all duration-300 shadow-2xl md:shadow-none ${
      isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-0 overflow-hidden'
    }`}>
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">واجهة الدردشات</h2>
        <button onClick={onClose} className="p-2 md:hidden text-gray-500 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 pt-0">
        <button 
          onClick={onNew}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 transition-all active:scale-95 font-bold text-sm text-blue-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          محادثة جديدة
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        <p className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">السجل الزمني</p>
        {sessions.map(session => (
          <div 
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
              currentId === session.id 
                ? 'bg-white/5 border border-white/10 text-white' 
                : 'hover:bg-white/5 text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            <svg className={`w-4 h-4 flex-shrink-0 ${currentId === session.id ? 'text-blue-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-sm font-medium truncate pr-6 text-right w-full">{session.title}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
              className="absolute left-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <p className="text-xs text-gray-700">لا توجد محادثات سابقة.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-[#080808]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 border border-white/10" />
          <div className="flex-1 text-right">
            <p className="text-xs font-bold text-gray-200">Omar Al-Majidi</p>
            <p className="text-[10px] text-gray-600">Free Tier Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
