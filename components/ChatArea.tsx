
import React, { useState, useRef, useEffect } from 'react';
import { Message, AIMode, Attachment } from '../types';
import MessageItem from './MessageItem';
import { FEATURES_LIST } from '../constants';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (text: string) => void;
  activeMode: AIMode;
  onModeChange: (mode: AIMode) => void;
  pendingAttachments: Attachment[];
  setPendingAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  isLoading, 
  onSend, 
  activeMode, 
  onModeChange,
  pendingAttachments,
  setPendingAttachments
}) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (customText?: string) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && pendingAttachments.length === 0) || isLoading) return;
    onSend(textToSend);
    setInput('');
    setError(null);
  };

  const handleFeatureClick = (feature: typeof FEATURES_LIST[0]) => {
    if (feature.id === 'summary') {
      // يضع النص ويفتح اختيار الملفات دون إرسال
      setInput('الرجاء تلخيص هذه الحصة/الملف بشكل مفصل ومنظم: ');
      fileInputRef.current?.click();
    } else {
      // يكتفي بكتابة النص في الصندوق وينتظر المستخدم
      setInput(`أريد ${feature.label}: `);
    }
    
    // التركيز على منطقة النص بعد الضغط
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.focus();
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setError(null);
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain', 'audio/mpeg', 'video/mp4'];
    
    for (const file of Array.from(files) as File[]) {
      if (!supportedTypes.includes(file.type) && !file.type.startsWith('image/')) {
        setError(`الملف "${file.name}" غير مدعوم حالياً.`);
        continue;
      }

      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        setError(`الملف "${file.name}" كبير جداً. الحد الأقصى 20 ميجابايت.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPendingAttachments(prev => [...prev, {
          data: event.target?.result as string,
          mimeType: file.type,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#050505]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-0 py-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          {messages.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-[1.8rem] bg-blue-600 flex items-center justify-center shadow-2xl border border-white/10 animate-pulse">
                <span className="text-5xl font-black text-white">O</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white mb-2">أهلاً بك في OMAR AI PRO</h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  منصتك المتقدمة للتحليل، التلخيص، وحل المشكلات الهيكلية المنظمة.
                </p>
              </div>
            </div>
          ) : (
            messages.map(m => <MessageItem key={m.id} message={m} />)
          )}
          {isLoading && <div className="animate-pulse flex gap-4 pr-4"><div className="w-10 h-10 rounded-xl bg-white/5" /><div className="flex-1 space-y-2"><div className="h-4 bg-white/5 rounded w-3/4" /><div className="h-4 bg-white/5 rounded w-1/2" /></div></div>}
        </div>
      </div>

      <div className="px-6 pb-8 pt-2">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Pre-send Previews */}
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
              {pendingAttachments.map((att, idx) => (
                <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-black shadow-lg">
                  {att.mimeType.startsWith('image/') ? (
                    <img src={att.data} className="w-full h-full object-cover opacity-80" alt="preview" />
                  ) : att.mimeType.startsWith('video/') ? (
                    <div className="w-full h-full flex items-center justify-center bg-blue-900/20">
                      <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm11.293 3.293a1 1 0 00-1.414 1.414L12.586 11H8.414l.707-.707a1 1 0 00-1.414-1.414l-2.414 2.414a1 1 0 000 1.414l2.414 2.414a1 1 0 001.414-1.414L8.414 13h4.172l-.707.707a1 1 0 001.414 1.414l2.414-2.414a1 1 0 000-1.414l-2.414-2.414z" /></svg>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[8px] p-1 text-center font-bold text-gray-500">
                      <svg className="w-6 h-6 mb-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                      {att.name.slice(-10)}
                    </div>
                  )}
                  <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute top-1 left-1 bg-red-500/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 animate-in fade-in">
              ⚠️ {error}
            </div>
          )}
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {FEATURES_LIST.map(f => (
              <button
                key={f.id}
                onClick={() => handleFeatureClick(f)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-gray-400 hover:text-white transition-all whitespace-nowrap ${f.id === 'summary' ? 'hover:bg-blue-600/40 hover:border-blue-400/50 text-blue-300' : 'hover:bg-blue-600/20 hover:border-blue-500/30'}`}
              >
                <span>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                placeholder="اسألني عن أي شيء..."
                className="w-full bg-transparent px-6 py-5 text-gray-100 placeholder-gray-600 resize-none outline-none text-base min-h-[60px] max-h-40 custom-scrollbar text-right leading-relaxed"
                dir="auto"
              />
              <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-t border-white/5">
                <div className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-500 hover:text-blue-400 transition-all" title="إرفاق ملفات">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
                <button 
                  onClick={() => handleSubmit()}
                  disabled={(!input.trim() && pendingAttachments.length === 0) || isLoading}
                  className="bg-white text-black hover:bg-blue-500 hover:text-white disabled:bg-white/5 disabled:text-gray-600 px-6 py-2 rounded-xl text-sm font-black transition-all active:scale-95 shadow-lg"
                >
                  {isLoading ? 'جاري التحليل...' : 'إرسال'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
