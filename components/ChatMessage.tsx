
import React from 'react';
import { Message, ModelType, Language } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { User, Bot, BrainCircuit, Globe, Zap, ExternalLink } from 'lucide-react';
import { UI_STRINGS } from '../constants';

interface ChatMessageProps {
  message: Message;
  language: Language;
  userAvatar?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, language, userAvatar }) => {
  const isUser = message.role === 'user';
  const strings = UI_STRINGS[language];
  
  const getModelIcon = () => {
    switch(message.modelType) {
      case ModelType.DEEP_THINKING: return <BrainCircuit className="w-4 h-4 text-purple-400" />;
      case ModelType.WEB_SEARCH: return <Globe className="w-4 h-4 text-green-400" />;
      case ModelType.FAST: return <Zap className="w-4 h-4 text-yellow-400" />;
      default: return <Bot className="w-5 h-5 text-brand-400" />;
    }
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-4xl w-full gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-lg overflow-hidden ${
          isUser 
            ? 'bg-slate-700 border-slate-600' 
            : 'bg-slate-900 border-brand-900/50'
        }`}>
          {isUser ? (
             userAvatar ? (
               <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
             ) : (
               <User className="w-6 h-6 text-slate-300" />
             )
          ) : getModelIcon()}
        </div>

        {/* Content */}
        <div className={`flex-1 min-w-0 flex flex-col items-start ${isUser ? 'items-end' : ''}`}>
          
          {/* Metadata Header */}
          <div className={`flex items-center gap-2 mb-1.5 text-xs text-slate-500 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="font-semibold text-slate-400">
              {isUser ? strings.userRole : strings.modelRole}
            </span>
            <span>•</span>
            <span>{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>

          {/* Bubble */}
          <div className={`w-full relative group rounded-2xl px-6 py-5 shadow-sm border ${
            isUser 
              ? 'bg-gradient-to-br from-brand-600 to-brand-700 border-brand-500 text-white rounded-tr-none' 
              : 'bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-tl-none'
          }`}>
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            ) : (
              <>
                 <MarkdownRenderer content={message.content} />
                 {message.groundingMetadata?.web && message.groundingMetadata.web.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-slate-700/50">
                     <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">{strings.sources}</p>
                     <div className="flex flex-wrap gap-2">
                       {message.groundingMetadata.web.map((source, idx) => (
                         <a 
                           key={idx}
                           href={source.uri}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-brand-500/50 rounded-md text-xs text-brand-400 hover:text-brand-300 transition-all truncate max-w-[200px]"
                         >
                           <Globe className="w-3 h-3 flex-shrink-0" />
                           <span className="truncate">{source.title || source.uri}</span>
                           <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />
                         </a>
                       ))}
                     </div>
                   </div>
                 )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
