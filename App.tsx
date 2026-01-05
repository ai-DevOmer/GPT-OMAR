
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession, AppState, AIMode, Attachment } from './types';
import { sendMessage } from './geminiService';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { APP_NAME } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentSessionId: null,
    sessions: [],
    isLoading: false,
    isDeepThinking: true,
    isWebSearch: true,
    activeMode: 'general',
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('omar_ai_sessions');
    if (saved) {
      try {
        const sessions = JSON.parse(saved);
        if (sessions.length > 0) {
          setState(prev => ({ 
            ...prev, 
            sessions, 
            currentSessionId: sessions[0].id 
          }));
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('omar_ai_sessions', JSON.stringify(state.sessions));
  }, [state.sessions]);

  const currentSession = state.sessions.find(s => s.id === state.currentSessionId);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'محادثة جديدة',
      messages: [],
      createdAt: Date.now(),
    };
    setState(prev => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      currentSessionId: newSession.id,
    }));
    setIsSidebarOpen(false); // Close sidebar on mobile/desktop after selection
  };

  const handleSendMessage = async (text: string) => {
    if ((!text.trim() && pendingAttachments.length === 0) || state.isLoading) return;

    let targetSessionId = state.currentSessionId;
    let currentSessions = [...state.sessions];

    if (!targetSessionId) {
      const newSession: ChatSession = {
        id: uuidv4(),
        title: text.slice(0, 30) || "تحليل ملف",
        messages: [],
        createdAt: Date.now(),
      };
      currentSessions = [newSession, ...currentSessions];
      targetSessionId = newSession.id;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: [...pendingAttachments]
    };

    setPendingAttachments([]);

    setState(prev => ({
      ...prev,
      isLoading: true,
      sessions: prev.sessions.length === 0 && !prev.currentSessionId 
        ? [{ ...currentSessions[0], messages: [userMessage] }]
        : prev.sessions.map(s => 
            s.id === targetSessionId 
              ? { ...s, messages: [...s.messages, userMessage], title: s.messages.length === 0 ? (text.slice(0, 30) || "تحليل ملف") : s.title }
              : s
          ),
      currentSessionId: targetSessionId
    }));

    try {
      const history = (currentSessions.find(s => s.id === targetSessionId)?.messages || [])
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model' as const,
          parts: [
            ...(m.attachments || []).map(a => ({ inlineData: { data: a.data.split(',')[1], mimeType: a.mimeType } })),
            { text: m.content }
          ]
        }));

      const response = await sendMessage(text, history, {
        deepThinking: state.isDeepThinking,
        webSearch: state.isWebSearch,
        mode: state.activeMode,
        attachments: userMessage.attachments
      });

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        thinking: response.thinking,
        groundingUrls: response.urls,
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        sessions: prev.sessions.map(s => 
          s.id === targetSessionId 
            ? { ...s, messages: [...s.messages, assistantMessage] }
            : s
        ),
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const setMode = (mode: AIMode) => {
    setState(prev => ({ ...prev, activeMode: mode }));
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden text-gray-200" dir="rtl">
      <Sidebar 
        sessions={state.sessions} 
        currentId={state.currentSessionId}
        isOpen={isSidebarOpen}
        onSelect={id => {
          setState(prev => ({ ...prev, currentSessionId: id }));
          setIsSidebarOpen(false);
        }}
        onNew={createNewSession}
        onDelete={id => setState(prev => {
          const newSessions = prev.sessions.filter(s => s.id !== id);
          return { ...prev, sessions: newSessions, currentSessionId: prev.currentSessionId === id ? (newSessions[0]?.id || null) : prev.currentSessionId };
        })}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col relative min-w-0" dir="rtl">
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 glass-effect sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
              title="واجهة الدردشات"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg border border-white/10">
                O
              </div>
              <h1 className="font-bold text-lg tracking-tight hidden sm:block">{APP_NAME} <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full mr-1 border border-blue-500/30">PREVIEW</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <ModeButton 
                label="تفكير عميق" 
                active={state.isDeepThinking} 
                onClick={() => setState(p => ({ ...p, isDeepThinking: !p.isDeepThinking }))}
                color="blue"
             />
             <ModeButton 
                label="بحث الويب" 
                active={state.isWebSearch} 
                onClick={() => setState(p => ({ ...p, isWebSearch: !p.isWebSearch }))}
                color="purple"
             />
          </div>
        </header>

        <ChatArea 
          messages={currentSession?.messages || []} 
          isLoading={state.isLoading}
          onSend={handleSendMessage}
          activeMode={state.activeMode}
          onModeChange={setMode}
          pendingAttachments={pendingAttachments}
          setPendingAttachments={setPendingAttachments}
        />

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

const ModeButton = ({ label, active, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold border transition-all ${
      active 
      ? `bg-${color}-600/20 border-${color}-500/50 text-${color}-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]` 
      : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-400'
    }`}
  >
    {label}
  </button>
);

export default App;
