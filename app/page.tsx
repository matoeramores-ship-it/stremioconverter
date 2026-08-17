'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Code } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [host, setHost] = useState('');
  const [resultLink, setResultLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  const handleGenerate = () => {
    if (!url) {
      setResultLink(`stremio://${host}/manifest.json`);
      return;
    }
    
    // Base64 encode the URL for testing
    const b64 = btoa(url.trim()).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const streamUrl = `${window.location.protocol}//${host}/stream/other/${b64}.json`;
    setResultLink(streamUrl);
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void = setCopied) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const reqs = `fastapi==0.111.0
uvicorn==0.29.0
yt-dlp==2024.4.9`;

  return (
    <div className="h-screen w-full bg-[#0A0A0B] text-[#E0E0E0] flex flex-col font-sans overflow-hidden">
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-[#222] bg-[#0A0A0B] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-serif italic tracking-wide font-medium">Stremio DL Bridge</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowCode(true)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors bg-[#121214] border border-[#222] px-3 py-1.5 rounded-md"
          >
            <Code size={14} /> View Render Files
          </button>
          <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-500 hidden sm:flex">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Server Active
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-500">v1.0.4 Production</span>
        </div>
      </nav>

      {showCode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#121214] border border-[#222] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#222] bg-[#0A0A0B]">
              <h2 className="text-sm uppercase tracking-widest text-white font-bold">requirements.txt</h2>
              <button onClick={() => setShowCode(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-auto">
              <p className="text-sm text-gray-400 mb-4">You can copy this file content directly to Render, or go to <strong>Settings &gt; Export to ZIP</strong> to get the entire project with the Python code included.</p>
              <div className="bg-[#0A0A0B] border border-[#222] rounded-xl p-4 relative group">
                <button 
                  onClick={() => copyToClipboard(reqs)}
                  className="absolute top-4 right-4 p-2 bg-[#121214] border border-[#222] hover:bg-[#222] hover:text-white rounded-lg transition-colors text-gray-400 flex items-center gap-2 text-xs"
                >
                  <Copy size={14} /> Copy
                </button>
                <pre className="text-sm font-mono text-blue-300">{reqs}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 gap-10 overflow-y-auto py-12">
        <div className="text-center space-y-5 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-serif italic text-white tracking-tight">Deploy your stream.</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Paste any supported video URL below to generate a direct Stremio manifest installation link powered by <code className="text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded">yt-dlp</code>.
          </p>
        </div>

        <div className="w-full max-w-3xl flex flex-col gap-4">
          <div className="w-full bg-[#121214] border border-[#222] p-1.5 rounded-2xl shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://vimeo.com/channels/staffpicks/..." 
                className="flex-1 w-full bg-transparent border-none outline-none px-6 py-4 text-white placeholder-gray-600 font-mono text-sm" 
              />
              <button 
                onClick={handleGenerate}
                className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all uppercase tracking-tighter text-sm whitespace-nowrap active:scale-95"
              >
                Generate Link
              </button>
            </div>
          </div>
          
          {resultLink && (
            <div className="animate-in fade-in slide-in-from-top-4 w-full bg-[#0A0A0B] border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between gap-4">
              <div className="overflow-hidden flex-1">
                <p className="text-xs uppercase tracking-widest text-emerald-500 font-bold mb-1">Generated URL</p>
                <p className="text-sm font-mono text-gray-300 truncate">{resultLink}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => copyToClipboard(resultLink)}
                  className="p-2.5 bg-[#121214] border border-[#222] hover:bg-[#222] hover:text-white rounded-lg transition-colors text-gray-400 flex items-center justify-center"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                </button>
                {resultLink.startsWith('stremio://') && (
                  <a 
                    href={resultLink}
                    className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Install
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-4">
          <div className="bg-[#121214] border border-[#222] p-6 rounded-2xl space-y-3 hover:border-blue-500/30 transition-colors">
            <h3 className="text-xs uppercase tracking-widest text-blue-400 font-bold">FastAPI Backend</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Asynchronous request handling with CORS headers pre-configured for Web and Desktop clients.</p>
          </div>
          <div className="bg-[#121214] border border-[#222] p-6 rounded-2xl space-y-3 hover:border-blue-500/30 transition-colors">
            <h3 className="text-xs uppercase tracking-widest text-blue-400 font-bold">yt-dlp Engine</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Dynamic resolution of direct .mp4 or .m3u8 stream URLs directly from the Python library.</p>
          </div>
          <div className="bg-[#121214] border border-[#222] p-6 rounded-2xl space-y-3 hover:border-blue-500/30 transition-colors">
            <h3 className="text-xs uppercase tracking-widest text-blue-400 font-bold">Manifest v2</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Fully compliant with Stremio Addon SDK. Support for Movies, Series, and custom link prefixes.</p>
          </div>
        </div>
      </main>

      <footer className="px-6 md:px-12 py-6 border-t border-[#222] flex justify-between items-center bg-[#0A0A0B] shrink-0">
        <div className="flex gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase text-gray-500 tracking-tighter">Architecture</span>
            <span className="text-xs font-mono text-gray-300">Python 3.11 / Render / HF</span>
          </div>
          <div className="flex flex-col gap-1 hidden sm:flex">
            <span className="text-[10px] uppercase text-gray-500 tracking-tighter">Endpoints</span>
            <span className="text-xs font-mono text-gray-300">/manifest.json, /stream</span>
          </div>
        </div>
        <div className="text-right flex flex-col gap-1">
          <p className="text-[10px] uppercase text-gray-600 tracking-widest">Developer Console</p>
          <p className="text-xs font-mono text-emerald-500/80">[INFO] Application startup complete.</p>
        </div>
      </footer>
    </div>
  );
}

