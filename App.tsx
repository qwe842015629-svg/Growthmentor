
import React, { useState, useEffect, useRef } from 'react';
import { Message, ModelType, MARKETING_TOPICS, Language, UserSettings } from './types';
import { generateGeminiResponse } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import KnowledgeModal from './components/KnowledgeModal';
import SettingsModal from './components/SettingsModal';
import { Layout, TrendingUp, BookOpen, Trash2, Languages, Database, Settings } from 'lucide-react';
import { UI_STRINGS } from './constants';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Knowledge Base State
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);

  // User Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when app loads or language changes, but only if chat is empty or has only welcome message
  useEffect(() => {
    if (messages.length === 0) {
        setMessages([{
            id: 'welcome',
            role: 'model',
            content: UI_STRINGS[language].welcome,
            timestamp: Date.now(),
            modelType: ModelType.DEEP_THINKING
        }]);
    }
  }, []); // Only on mount

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string, modelType: ModelType) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
      modelType
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Pass the current language and knowledge base to the service
      const response = await generateGeminiResponse(
          [...messages, userMessage], 
          modelType, 
          language,
          knowledgeBase
      );
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text,
        timestamp: Date.now(),
        modelType: modelType,
        groundingMetadata: response.groundingMetadata
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to generate response", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: UI_STRINGS[language].error,
        timestamp: Date.now(),
        modelType: modelType
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTopicClick = (prompt: string) => {
    handleSendMessage(prompt, ModelType.DEEP_THINKING);
  };

  const clearHistory = () => {
    if(window.confirm(language === 'zh' ? "清除对话历史？" : "Clear chat history?")) {
        setMessages([{
            id: 'welcome-' + Date.now(),
            role: 'model',
            content: UI_STRINGS[language].welcome,
            timestamp: Date.now(),
            modelType: ModelType.DEEP_THINKING
        }]);
    }
  }

  const toggleLanguage = () => {
      setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  }

  const strings = UI_STRINGS[language];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-brand-500/30 selection:text-brand-200">
      
      <KnowledgeModal 
        isOpen={isKbModalOpen}
        onClose={() => setIsKbModalOpen(false)}
        language={language}
        currentContent={knowledgeBase}
        onSave={setKnowledgeBase}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        settings={userSettings}
        onSave={setUserSettings}
      />

      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">Growth<span className="text-brand-400">Mentor</span></h1>
        </div>

        <nav className="flex-1 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">{strings.quickStarters}</h3>
            <div className="space-y-2">
              {MARKETING_TOPICS[language].map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic.prompt)}
                  disabled={isTyping}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-900 transition-colors group flex items-start gap-3 border border-transparent hover:border-slate-800"
                >
                  <div className="mt-0.5 p-1.5 rounded-md bg-slate-900 text-slate-400 group-hover:text-brand-400 group-hover:bg-slate-800 transition-colors">
                     {topic.id === 'system' && <Layout className="w-4 h-4" />}
                     {topic.id === 'case' && <BookOpen className="w-4 h-4" />}
                     {topic.id === 'execution' && <TrendingUp className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-300 group-hover:text-white">{topic.title}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{topic.prompt}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Knowledge Base Button */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">{strings.knowledgeBase}</h3>
            <button
               onClick={() => setIsKbModalOpen(true)}
               className={`w-full text-left p-3 rounded-lg border transition-all group flex items-center gap-3 ${
                   knowledgeBase.trim().length > 0 
                   ? 'bg-indigo-500/10 border-indigo-500/50 hover:bg-indigo-500/20' 
                   : 'bg-slate-900 border-transparent hover:border-slate-800 hover:bg-slate-800'
               }`}
            >
                <div className={`p-1.5 rounded-md transition-colors ${
                    knowledgeBase.trim().length > 0 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400'
                }`}>
                    <Database className="w-4 h-4" />
                </div>
                <div>
                   <div className={`text-sm font-medium ${knowledgeBase.trim().length > 0 ? 'text-indigo-300' : 'text-slate-300'}`}>{strings.knowledgeBase}</div>
                   {knowledgeBase.trim().length > 0 && <div className="text-[10px] text-indigo-400/80">{strings.kbActive}</div>}
                </div>
            </button>
          </div>

        </nav>

        <div className="pt-4 border-t border-slate-800 space-y-2">
            <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors px-2 py-2 w-full rounded hover:bg-slate-900">
                <Settings className="w-3 h-3" />
                <span>{strings.settings}</span>
            </button>
            <button onClick={toggleLanguage} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors px-2 py-2 w-full rounded hover:bg-slate-900">
                <Languages className="w-3 h-3" />
                <span>{language === 'zh' ? 'English' : '简体中文'}</span>
            </button>
            <button onClick={clearHistory} className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-2 w-full rounded hover:bg-slate-900">
                <Trash2 className="w-3 h-3" />
                {strings.clearChat}
            </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main 
        className="flex-1 flex flex-col relative"
        style={{
          backgroundImage: userSettings.backgroundImage ? `url(${userSettings.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for better text readability if background is set */}
        {userSettings.backgroundImage && (
           <div className="absolute inset-0 bg-slate-950/80 pointer-events-none z-0"></div>
        )}
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 relative">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-brand-500 to-cyan-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">{language === 'zh' ? '增长营销导师' : 'GrowthMentor'}</span>
           </div>
           <div className="flex items-center gap-2">
             <button 
               onClick={() => setIsKbModalOpen(true)} 
               className={`p-2 rounded-full ${knowledgeBase.trim().length > 0 ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'}`}
             >
                <Database className="w-4 h-4" />
             </button>
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400"><Settings className="w-4 h-4"/></button>
             <button onClick={toggleLanguage} className="p-2 text-slate-400"><Languages className="w-4 h-4"/></button>
             <button onClick={clearHistory} className="p-2 text-slate-500"><Trash2 className="w-4 h-4"/></button>
           </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth relative z-10">
          <div className="max-w-4xl mx-auto min-h-full pb-20">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} language={language} userAvatar={userSettings.avatar} />
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex items-center gap-3 bg-slate-900 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-800">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-brand-300 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{language === 'zh' ? '正在分析数据并制定策略...' : 'Analyzing data & formulating strategy...'}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 z-20">
           {/* Gradient fade above input */}
           <div className={`h-12 pointer-events-none -mb-12 relative z-10 ${userSettings.backgroundImage ? 'bg-gradient-to-t from-slate-950/90 to-transparent' : 'bg-gradient-to-t from-slate-950 to-transparent'}`}></div>
           <ChatInput 
             onSendMessage={handleSendMessage} 
             disabled={isTyping} 
             language={language}
             isKbActive={knowledgeBase.trim().length > 0} 
           />
        </div>

      </main>
    </div>
  );
};

export default App;
