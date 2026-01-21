import React, { Fragment } from 'react';

// A simple markdown-to-React component that supports headings, lists, and bold text.
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    
    const renderLine = (line: string) => {
        const parts = line.split(/(\*\*.*?\*\*)/g); // Split by bold tags, keeping the tags
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-emerald-400">{part.slice(2, -2)}</strong>;
            }
            return <Fragment key={i}>{part}</Fragment>;
        });
    };

    const elements = lines.map((line, index) => {
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-bold text-emerald-500 mt-8 mb-4 uppercase tracking-widest border-b border-emerald-500/20 pb-2">{renderLine(line.substring(4))}</h3>;
        }
        if (line.startsWith('## ')) {
            return <h2 key={index} className="text-2xl font-black text-white mt-10 mb-5 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                {renderLine(line.substring(3))}
            </h2>;
        }
        if (line.startsWith('# ')) {
            return <h1 key={index} className="text-3xl font-black text-white mb-8 bg-neutral-900/50 p-6 border-l-4 border-emerald-500 rounded-r-2xl shadow-xl">{renderLine(line.substring(2))}</h1>;
        }
        if (line.startsWith('- ')) {
            return <li key={index} className="ml-6 list-none relative text-neutral-300 my-4 leading-relaxed pl-2">
                <span className="absolute left-[-20px] top-[10px] w-2 h-2 rounded-full bg-emerald-500/40"></span>
                {renderLine(line.substring(2))}
            </li>;
        }
        if (line.trim() === '') {
            return null;
        }
        return <p key={index} className="text-neutral-400 mb-5 leading-relaxed text-base">{renderLine(line)}</p>;
    });
    return <>{elements}</>;
};

interface HealthReportProps {
  report: string;
}

const HealthReport: React.FC<HealthReportProps> = ({ report }) => {
  return (
    <section className="relative bg-neutral-900/40 border border-neutral-800 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* Decorative accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-transparent opacity-60"></div>
        
        <div className="p-8 md:p-14">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-neutral-800 pb-8 gap-4">
                 <div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] block mb-2">Wellness Analysis</span>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
                        Your Report
                    </h2>
                 </div>
                 <div className="font-mono text-[9px] text-neutral-600 uppercase tracking-widest space-y-1 text-right">
                    <p>USER_REF: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                    <p>GENERATED: {new Date().toLocaleDateString()}</p>
                 </div>
            </div>
           
            <div className="max-w-none">
                <SimpleMarkdown text={report} />
            </div>
            
            <div className="mt-16 pt-8 border-t border-neutral-800 flex justify-between items-center text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
                <span>VORA Health Engine</span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Results Verified</span>
                </div>
            </div>
        </div>
    </section>
  );
};

export default HealthReport;