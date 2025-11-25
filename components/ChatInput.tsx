import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BrainCircuit, Globe, Zap, Loader2, Database } from 'lucide-react';
import { ModelType, Language } from '../types';
import { MODEL_CONFIGS, UI_STRINGS } from '../constants';

interface ChatInputProps {
  onSendMessage: (content: string, modelType: ModelType) => void;
  disabled: boolean;
  language: Language;
  isKbActive?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, language, isKbActive }) => {
  const [content, setContent] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.DEEP_THINKING);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const strings = UI_STRINGS[language];

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (content.trim() && !disabled) {
      onSendMessage(content, selectedModel);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [content]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6">
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl p-2 relative overflow-visible">
        
        {/* Model Selector Tabs */}
        <div className="absolute -top-12 left-0 flex space-x-2 px-2">
          {(Object.keys(MODEL_CONFIGS) as ModelType[]).map((type) => {
             // const config = MODEL_CONFIGS[type]; 
             const modelString = strings.models[type];
             const isSelected = selectedModel === type;
             const Icon = type === ModelType.DEEP_THINKING ? BrainCircuit : type === ModelType.WEB_SEARCH ? Globe : Zap;
             
             return (
               <button
                key={type}
                onClick={() => setSelectedModel(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition-all duration-200 border-t border-x border-b-0 ${
                  isSelected 
                    ? 'bg-slate-900 border-slate-700 text-brand-400 translate-y-1 z-10' 
                    : 'bg-slate-950/50 border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                }`}
               >
                 <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-500'}`} />
                 {modelString.name}
               </button>
             );
          })}
        </div>

        <form onSubmit={handleSubmit} className="relative flex flex-col">
           {/* Context Hint */}
           <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-800/50 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Sparkles className="w-3 h-3 text-brand-500" />
               <span>{strings.contextHint} <strong>{strings.models[selectedModel].name}</strong> - {strings.models[selectedModel].desc}</span>
             </div>
             {isKbActive && (
               <div className="flex items-center gap-1 text-indigo-400 font-medium">
                 <Database className="w-3 h-3" />
                 <span>{strings.kbActive}</span>
               </div>
             )}
           </div>

          <div className="flex items-end gap-2 p-2">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={strings.inputPlaceholder}
              className="flex-1 bg-transparent border-0 text-slate-200 placeholder-slate-500 focus:ring-0 resize-none py-3 px-3 max-h-[200px] min-h-[50px] leading-relaxed"
              rows={1}
              disabled={disabled}
            />
            
            <button
              type="submit"
              disabled={!content.trim() || disabled}
              className={`p-3 rounded-xl flex-shrink-0 transition-all duration-200 ${
                !content.trim() || disabled
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg hover:shadow-brand-500/20 active:scale-95'
              }`}
            >
              {disabled ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
      <p className="text-center text-[10px] text-slate-600 mt-2">
        {strings.disclaimer}
      </p>
    </div>
  );
};

export default ChatInput;