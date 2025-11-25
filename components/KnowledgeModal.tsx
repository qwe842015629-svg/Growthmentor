
import React, { useRef, useState, useEffect } from 'react';
import { X, Upload, FileText, Save, Loader2, FileSpreadsheet, Image as ImageIcon, Presentation, File, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { UI_STRINGS } from '../constants';
import * as XLSX from 'xlsx';
import { extractInformationFromImage } from '../services/geminiService';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentContent: string;
  onSave: (content: string) => void;
}

const KnowledgeModal: React.FC<KnowledgeModalProps> = ({ 
  isOpen, 
  onClose, 
  language, 
  currentContent, 
  onSave 
}) => {
  const [content, setContent] = useState(currentContent);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const strings = UI_STRINGS[language];

  useEffect(() => {
    setContent(currentContent);
    // Reset state when opening
    if (isOpen) {
      setError(null);
      setStatus(null);
    }
  }, [currentContent, isOpen]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setStatus(`${strings.processing} ${file.name}...`);
    setError(null);
    
    try {
      const fileName = file.name.toLowerCase();

      // Excel Files
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            
            let allText = `\n--- File: ${file.name} ---\n`;
            
            workbook.SheetNames.forEach(sheetName => {
              const worksheet = workbook.Sheets[sheetName];
              const csv = XLSX.utils.sheet_to_csv(worksheet);
              allText += `\n[Sheet: ${sheetName}]\n${csv}\n`;
            });

            setContent(prev => prev + allText);
            setStatus(null);
          } catch (err) {
            console.error("Excel parse error:", err);
            setError(`${strings.uploadError} ${file.name}`);
            setStatus(null);
          }
        };
        reader.readAsBinaryString(file);
      } 
      // Image Files
      else if (['.png', '.jpg', '.jpeg', '.webp', '.heic'].some(ext => fileName.endsWith(ext))) {
         const reader = new FileReader();
         reader.onload = async (event) => {
             const base64String = event.target?.result as string;
             // Remove data URL prefix
             const base64Data = base64String.split(',')[1];
             const mimeType = file.type;

             try {
                 setStatus(`${strings.processing} ${file.name} (AI analysis)...`);
                 const description = await extractInformationFromImage(base64Data, mimeType);
                 setContent(prev => prev + `\n\n--- Image Analysis (${file.name}) ---\n${description}\n`);
             } catch (err) {
                 console.error("Image analysis error", err);
                 setError(`${strings.uploadError} ${file.name}`);
             } finally {
                 setStatus(null);
             }
         };
         reader.readAsDataURL(file);
      }
      // PDF Files
      else if (fileName.endsWith('.pdf')) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          
          let fullText = `\n\n--- PDF: ${file.name} ---\n`;
          const numPages = pdf.numPages;

          for (let i = 1; i <= numPages; i++) {
            setStatus(`${strings.processing} ${file.name} (${strings.processingPage} ${i}/${numPages})...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `[Page ${i}]\n${pageText}\n\n`;
          }
          
          setContent(prev => prev + fullText);
        } catch (err) {
          console.error("PDF parse error:", err);
          setError(`${strings.uploadError} ${file.name}`);
        } finally {
          setStatus(null);
        }
      }
      // PPTX Files
      else if (fileName.endsWith('.pptx')) {
        try {
            const zip = new JSZip();
            const content = await zip.loadAsync(file);
            
            // Filter and sort slide XML files
            const slideFiles = Object.keys(content.files)
                .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
                .sort((a, b) => {
                    const numA = parseInt(a.match(/slide(\d+)\.xml/)![1]);
                    const numB = parseInt(b.match(/slide(\d+)\.xml/)![1]);
                    return numA - numB;
                });

            let fullText = `\n\n--- Presentation: ${file.name} ---\n`;
            
            const totalSlides = slideFiles.length;
            let processedCount = 0;

            for (const slideFile of slideFiles) {
                processedCount++;
                setStatus(`${strings.processing} ${file.name} (${strings.processingPage} ${processedCount}/${totalSlides})...`);
                
                const slideXml = await content.files[slideFile].async('string');
                const matches = slideXml.match(/<a:t>(.*?)<\/a:t>/g);
                if (matches) {
                    const slideText = matches.map(t => t.replace(/<\/?a:t>/g, '')).join(' ');
                    fullText += `[Slide ${slideFile.replace('ppt/slides/slide', '').replace('.xml', '')}]\n${slideText}\n\n`;
                }
            }
            setContent(prev => prev + fullText);
        } catch (err) {
            console.error("PPTX parse error:", err);
            setError(`${strings.uploadError} ${file.name}`);
        } finally {
            setStatus(null);
        }
      }
      // Text/Markdown Files
      else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text) {
            setContent(prev => prev + `\n\n--- File: ${file.name} ---\n` + text);
          }
          setStatus(null);
        };
        reader.readAsText(file);
      }

    } catch (error) {
      console.error("Upload error", error);
      setError(`${strings.uploadError} ${file.name}`);
      setStatus(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{strings.knowledgeBaseTitle}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{strings.knowledgeBaseDesc}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden relative">
           
           {/* Error Message */}
           {error && (
             <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 animate-in fade-in slide-in-from-top-2">
               <div className="flex items-center gap-2">
                 <AlertCircle className="w-4 h-4 flex-shrink-0" />
                 <span className="text-sm font-medium">{error}</span>
               </div>
               <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded">
                 <X className="w-3 h-3" />
               </button>
             </div>
           )}

           {/* Processing Overlay */}
           {status && (
             <div className="absolute inset-0 z-20 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center flex-col gap-4 animate-in fade-in duration-200">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <div className="text-center">
                  <span className="text-lg font-medium text-white block mb-1">{strings.processing}</span>
                  <span className="text-sm text-indigo-300">{status}</span>
                </div>
             </div>
           )}

           <div className="flex justify-end gap-2 flex-wrap">
             <input 
               type="file" 
               accept=".txt,.md,.csv,.json,.xlsx,.xls,.png,.jpg,.jpeg,.webp,.pdf,.pptx" 
               ref={fileInputRef} 
               className="hidden" 
               onChange={handleInputChange} 
             />
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={!!status}
               className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-medium text-slate-300 transition-colors disabled:opacity-50"
             >
               <Upload className="w-4 h-4" />
               <FileSpreadsheet className="w-3 h-3 text-green-500/70" />
               <Presentation className="w-3 h-3 text-orange-500/70" />
               <File className="w-3 h-3 text-red-500/70" />
               <ImageIcon className="w-3 h-3 text-blue-500/70" />
               {strings.uploadFile}
             </button>
           </div>

           <div 
             className="flex-1 relative group"
             onDragEnter={handleDrag}
           >
             <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder={strings.placeholderKB}
               className="w-full h-full min-h-[300px] bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none font-mono leading-relaxed relative z-10"
             />
             
             {/* Drag Overlay */}
             {dragActive && (
               <div 
                 className="absolute inset-0 z-30 bg-indigo-500/20 border-2 border-dashed border-indigo-500 rounded-xl flex items-center justify-center backdrop-blur-sm"
                 onDragEnter={handleDrag}
                 onDragLeave={handleDrag}
                 onDragOver={handleDrag}
                 onDrop={handleDrop}
               >
                 <div className="pointer-events-none text-center p-6 bg-slate-900/80 rounded-xl shadow-xl">
                   <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                   <p className="text-lg font-bold text-white">{strings.dragActive}</p>
                 </div>
               </div>
             )}
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

export default KnowledgeModal;
