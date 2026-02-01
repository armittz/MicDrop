
import React from 'react';
import { UserProgress } from '../types';
import { Flame, Clock, Trophy, Target, Award, Zap, ChevronRight, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsProps {
  progress: UserProgress;
}

const Stats: React.FC<StatsProps> = ({ progress }) => {
  const chartData = progress.confidenceHistory.map((val, idx) => ({
    name: `S${idx + 1}`,
    val: val
  }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Progress Summary Card */}
        <div className="md:col-span-2 bg-slate-900 rounded-[2rem] p-8 shadow-xl border-b-4 border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-50">Your Progress</h3>
              <p className="text-slate-400 font-medium">Keep talking to build lasting confidence.</p>
            </div>
            <div className="bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/20">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-500/5 p-6 rounded-2xl flex flex-col items-center border border-orange-500/20">
              <Flame className="w-8 h-8 text-orange-400 mb-2" />
              <span className="text-xs font-black text-orange-500 uppercase tracking-tighter">Streak</span>
              <span className="text-2xl font-black text-slate-100">{progress.streak}d</span>
            </div>
            <div className="bg-blue-500/5 p-6 rounded-2xl flex flex-col items-center border border-blue-500/20">
              <Clock className="w-8 h-8 text-blue-400 mb-2" />
              <span className="text-xs font-black text-blue-500 uppercase tracking-tighter">Total Time</span>
              <span className="text-2xl font-black text-slate-100">{Math.round(progress.totalTimeSpoken/60)}m</span>
            </div>
            <div className="bg-emerald-500/5 p-6 rounded-2xl flex flex-col items-center border border-emerald-500/20">
              <Zap className="w-8 h-8 text-emerald-400 mb-2" />
              <span className="text-xs font-black text-emerald-500 uppercase tracking-tighter">Confidence</span>
              <span className="text-2xl font-black text-slate-100">{progress.confidenceHistory.slice(-1)[0] || 0}%</span>
            </div>
          </div>
        </div>

        {/* Badges Earned */}
        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl border-b-4 border-slate-800">
          <h3 className="text-xl font-black text-slate-50 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-cyan-400" />
            Milestones
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {progress.badges.length > 0 ? progress.badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-sm">
                  <Zap fill="currentColor" size={20} />
                </div>
                <span className="font-bold text-slate-300 text-sm">{badge}</span>
              </div>
            )) : (
              <p className="text-center text-slate-600 text-sm italic py-8">Practice to earn badges!</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Confidence Chart */}
        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl border-b-4 border-slate-800">
          <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Confidence Growth
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', fontWeight: 'bold', color: '#f8fafc' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#22d3ee" 
                  strokeWidth={6} 
                  dot={{ r: 6, fill: '#22d3ee', strokeWidth: 2, stroke: '#020617' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Recap */}
        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl border-b-4 border-slate-800 overflow-hidden">
          <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Activity Log</h4>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {progress.practiceSessions.map(s => (
              <div key={s.id} className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="truncate pr-4">
                  <p className="font-bold text-slate-200 text-sm truncate">{s.prompt}</p>
                  <p className="text-xs text-slate-500">{new Date(s.date).toLocaleDateString()}</p>
                </div>
                <div className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                  {s.confidence}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
