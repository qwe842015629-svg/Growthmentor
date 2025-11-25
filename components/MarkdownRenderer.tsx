import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ChartRenderer from './ChartRenderer';
import { ChartData } from '../types';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Pre-process content to extract JSON charts
  const parts = content.split(/(```json-chart[\s\S]*?```)/g);

  return (
    <div className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('```json-chart')) {
          try {
            const jsonStr = part.replace(/^```json-chart\s*/, '').replace(/```$/, '');
            const chartData = JSON.parse(jsonStr) as ChartData;
            return <ChartRenderer key={index} data={chartData} />;
          } catch (e) {
            console.error("Failed to parse chart data", e);
            return <div key={index} className="text-red-400 text-xs p-2 border border-red-900 bg-red-950/30 rounded">Error rendering chart</div>;
          }
        }

        return (
          <ReactMarkdown 
            key={index} 
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              table: ({node, ...props}) => (
                <div className="overflow-x-auto my-4 rounded-lg border border-slate-700">
                  <table className="min-w-full divide-y divide-slate-700 bg-slate-900" {...props} />
                </div>
              ),
              thead: ({node, ...props}) => <thead className="bg-slate-800" {...props} />,
              th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider" {...props} />,
              td: ({node, ...props}) => <td className="px-4 py-2 text-sm text-slate-400 whitespace-nowrap" {...props} />,
              code: ({node, inline, className, children, ...props}: any) => {
                const match = /language-(\w+)/.exec(className || '')
                return !inline ? (
                  <div className="relative group my-4 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                    <div className="absolute top-0 right-0 px-2 py-1 text-xs text-slate-500 bg-slate-800 rounded-bl-lg font-mono">
                      {match ? match[1] : 'code'}
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm text-slate-300">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code className="bg-slate-800 text-brand-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                )
              },
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-8 mb-4 border-b border-slate-800 pb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-white mt-6 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-brand-300 mt-4 mb-2" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-1 mb-4" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 space-y-1 mb-4" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-brand-500 pl-4 italic text-slate-400 my-4" {...props} />,
              a: ({node, ...props}) => <a className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors" {...props} />
            }}
          >
            {part}
          </ReactMarkdown>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;