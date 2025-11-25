
import React, { useRef, useState, useEffect } from 'react';
import { X, Upload, User, Image as ImageIcon, Save, Trash2 } from 'lucide-react';
import { Language, UserSettings } from '../types';
import { UI_STRINGS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  settings,
  onSave
}) => {
  const [currentSettings, setCurrentSettings] = useState<UserSettings>(settings);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const strings = UI_STRINGS[language];

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'bg') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCurrentSettings(prev => ({
          ...prev,
          [type === 'avatar' ? 'avatar' : 'backgroundImage']: result
        }));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <div>
            <h2 className="text-lg font-bold text-white">{strings.settingsTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{strings.settingsDesc}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col gap-8">
          
          {/* Avatar Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-300 block">{strings.avatar}</label>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex-shrink-0 overflow-hidden relative group">
                {currentSettings.avatar ? (
                  <img src={currentSettings.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-slate-500" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, 'avatar')}
                />
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  {strings.uploadAvatar}
                </button>
                {currentSettings.avatar && (
                  <button 
                    onClick={() => setCurrentSettings(prev => ({ ...prev, avatar: undefined }))}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 hover:bg-red-900/30 border border-red-900/30 rounded-lg text-xs font-medium text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    {strings.remove}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Background Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-300 block">{strings.chatBackground}</label>
            <div className="flex flex-col gap-4">
              <div className="w-full h-32 rounded-lg bg-slate-800 border-2 border-slate-700 overflow-hidden relative">
                 {currentSettings.backgroundImage ? (
                   <img src={currentSettings.backgroundImage} alt="Background" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center flex-col gap-2 text-slate-500">
                     <ImageIcon className="w-8 h-8" />
                     <span className="text-xs">No background set</span>
                   </div>
                 )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={bgInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, 'bg')}
                />
                <button 
                   onClick={() => bgInputRef.current?.click()}
                   className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  {strings.uploadBackground}
                </button>
                {currentSettings.backgroundImage && (
                  <button 
                    onClick={() => setCurrentSettings(prev => ({ ...prev, backgroundImage: undefined }))}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 hover:bg-red-900/30 border border-red-900/30 rounded-lg text-xs font-medium text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    {strings.remove}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            {strings.cancel}
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Save className="w-4 h-4" />
            {strings.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
