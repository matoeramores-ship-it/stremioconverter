"use client";
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CodeBlock({ filename, code, language }: { filename: string, code: string, language: string }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-[#222] bg-[#121214] my-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0A0A0B] border-b border-[#222]">
                <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">{filename}</span>
                <button 
                    onClick={copyToClipboard} 
                    className="p-1.5 hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-medium"
                >
                    {copied ? (
                        <>
                            <Check size={14} className="text-green-400" />
                            <span className="text-green-400">Copiado</span>
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                            <span>Copiar</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-6 overflow-x-auto text-sm text-gray-400 font-mono">
                <code>{code}</code>
            </pre>
        </div>
    );
}
