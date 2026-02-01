
import React from 'react';
import { Mic2, Sparkles, Trophy, Zap, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-50 overflow-hidden relative">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[120px]"></div>

      <main className="max-w-4xl w-full text-center z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-violet-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-cyan-500/20 transform hover:scale-110 transition-transform cursor-default mb-4">
            <Mic2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-widest text-cyan-400 uppercase">OpenMic</h2>
        </div>

        <div className="mb-4 inline-block px-4 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
           <span className="text-cyan-400 font-black text-xs uppercase tracking-[0.2em]">Speak Easy • Grow Daily</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-50 mb-8 tracking-tighter leading-tight max-w-3xl mx-auto">
          The safe stage to build your <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-400">speaking confidence.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed italic">
          "Trade the fear of being wrong for the freedom to be heard."
        </p>

        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-12 py-6 rounded-[2rem] text-2xl font-black shadow-2xl shadow-cyan-500/20 transition-all transform hover:-translate-y-2 active:scale-95 mb-20 border-b-8 border-cyan-700"
        >
          Own the Stage
          <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-8 rounded-[2rem] border-b-4 border-slate-800 shadow-sm text-left hover:border-cyan-500/50 transition-colors">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="text-cyan-400" />
            </div>
            <h3 className="text-lg font-black text-slate-50 mb-2 uppercase tracking-tight">Zero Judgment</h3>
            <p className="text-slate-400 font-medium leading-relaxed text-sm">A judgment-free zone where your voice is the only thing that matters.</p>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] border-b-4 border-slate-800 shadow-sm text-left hover:border-violet-500/50 transition-colors">
            <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-6">
              <Zap className="text-violet-400" />
            </div>
            <h3 className="text-lg font-black text-slate-50 mb-2 uppercase tracking-tight">AI Vocal Coach</h3>
            <p className="text-slate-400 font-medium leading-relaxed text-sm">Get natural alternatives and vocabulary that help you shine.</p>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] border-b-4 border-slate-800 shadow-sm text-left hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
              <Trophy className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-slate-50 mb-2 uppercase tracking-tight">Visible Growth</h3>
            <p className="text-slate-400 font-medium leading-relaxed text-sm">Watch your confidence score climb as you own the microphone daily.</p>
          </div>
        </div>
      </main>

      <footer className="mt-20 text-slate-600 font-bold text-sm uppercase tracking-widest z-10">
        Practice. Perform. Prevail.
      </footer>
    </div>
  );
};

export default LandingPage;
