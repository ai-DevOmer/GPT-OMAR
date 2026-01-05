
import React, { useState } from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';
  const [showThinking, setShowThinking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processText = (text: string) => {
    return text
      .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
      .replace(/\$([\s\S]*?)\$/g, '$1')
      .replace(/\\mathbf\{([\s\S]*?)\}/g, '$1')
      .replace(/\\text\{([\s\S]*?)\}/g, '$1')
      .replace(/\\mathrm\{([\s\S]*?)\}/g, '$1');
  };

  const renderTable = (tableContent: string) => {
    const rows = tableContent.trim().split('\n');
    const headers = rows[0].split('|').filter(cell => cell.trim() !== '');
    const dataRows = rows.slice(2).map(row => row.split('|').filter(cell => cell.trim() !== ''));

    return (
      <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm text-right">
          <thead className="bg-white/5 text-blue-400 font-bold">
            <tr>
              {headers.map((h, i) => <th key={i} className="px-3 py-2 border-b border-white/5">{h.trim()}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {dataRows.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.03]">
                {row.map((cell, j) => <td key={j} className="px-3 py-2 text-gray-300">{cell.trim()}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const formatContent = (content: string) => {
    const cleaned = processText(content);
    const parts = cleaned.split(/(^\|[\s\S]*?\|\n)/m);

    return parts.map((part, i) => {
      if (part.startsWith('|')) return renderTable(part);
      
      if (part.includes('```')) {
        const codeParts = part.split(/(```[\s\S]*?```)/g);
        return codeParts.map((cp, j) => {
           if (cp.startsWith('```')) {
              const fullCode = cp.slice(3, -3);
              const lines = fullCode.split('\n');
              const lang = lines[0].trim();
              const code = lines.slice(1).join('\n') || fullCode.slice(3);
              return (
                <div key={j} className="my-4 relative rounded-xl bg-[#0d0d0d] border border-white/10 overflow-hidden font-mono text-xs" dir="ltr">
                  <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase">{lang || 'CODE'}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(code);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[10px] text-blue-400 hover:text-white"
                    >
                      {copied ? 'تم النسخ!' : 'نسخ الكود'}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-blue-300/90 custom-scrollbar"><code>{code}</code></pre>
                </div>
              );
           }
           return <p key={j} className="mb-3 text-gray-200" dangerouslySetInnerHTML={{ __html: formatInline(cp) }} />;
        });
      }

      return <div key={i} dangerouslySetInnerHTML={{ __html: formatInline(part) }} />;
    });
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/^- (.*)/gm, '<div class="flex items-start gap-2 my-1"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span><span>$1</span></div>');
  };

  return (
    <div className={`flex gap-3 md:gap-4 ${isAssistant ? '' : 'flex-row-reverse animate-in fade-in slide-in-from-left-4'}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
        isAssistant ? 'bg-blue-600 text-white border-blue-400/20 shadow-lg' : 'bg-white/5 text-gray-400 border-white/10'
      }`}>
        <span className="text-sm font-black">{isAssistant ? 'O' : 'U'}</span>
      </div>

      <div className={`flex-1 min-w-0 max-w-3xl ${isAssistant ? '' : 'text-right'}`}>
        <div className={`flex items-center gap-2 mb-1.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
            {isAssistant ? 'OMAR AI' : 'أنت'}
          </span>
        </div>

        {/* Display Message Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={`flex flex-wrap gap-2 mb-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
            {message.attachments.map((att, idx) => (
              <div key={idx} className="relative group w-32 h-32 rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-xl">
                {att.mimeType.startsWith('image/') ? (
                  <img src={att.data} className="w-full h-full object-cover" alt="attachment" />
                ) : att.mimeType.startsWith('video/') ? (
                   <video src={att.data} className="w-full h-full object-cover" controls />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-blue-600/5">
                    <svg className="w-8 h-8 text-blue-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span className="text-[8px] text-gray-400 font-bold truncate w-full px-1">{att.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={`relative p-5 rounded-[1.5rem] transition-all group ${
          isAssistant ? 'bg-white/[0.03] border border-white/5 text-right' : 'bg-blue-600/10 border border-blue-500/20 text-right'
        }`}>
          {isAssistant && (
            <button 
              onClick={handleCopyMessage}
              className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all"
              title="نسخ الرسالة"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              )}
            </button>
          )}

          {isAssistant && message.thinking && (
            <div className="mb-4">
              <button onClick={() => setShowThinking(!showThinking)} className="text-[10px] bg-blue-500/10 px-3 py-1 rounded-full text-blue-400 hover:bg-blue-500/20 transition-all font-bold">
                {showThinking ? 'إغلاق التحليل' : 'عرض تحليل الذكاء...'}
              </button>
              {showThinking && <div className="mt-3 p-4 rounded-xl bg-black/20 border border-white/5 text-[11px] text-gray-500 italic leading-relaxed">{message.thinking}</div>}
            </div>
          )}

          <div className="text-sm leading-relaxed space-y-2">
            {formatContent(message.content)}
          </div>

          {isAssistant && message.groundingUrls && message.groundingUrls.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-gray-600 mb-2">المصادر:</p>
              <div className="flex flex-wrap gap-2">
                {message.groundingUrls.map((url, idx) => (
                  <a key={idx} href={url.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/5 text-blue-400 hover:bg-white/10 transition-all">
                    {url.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
