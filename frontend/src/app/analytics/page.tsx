'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Award, Layers, Star, Shield, ArrowUpRight } from 'lucide-react';

const volumeData = [
  { name: 'Jan', volume: 4500 },
  { name: 'Feb', volume: 6200 },
  { name: 'Mar', volume: 8100 },
  { name: 'Apr', volume: 9500 },
  { name: 'May', volume: 12000 },
  { name: 'Jun', volume: 15400 },
];

const listingsData = [
  { name: 'Jan', active: 34, completed: 89 },
  { name: 'Feb', active: 45, completed: 112 },
  { name: 'Mar', active: 56, completed: 145 },
  { name: 'Apr', active: 78, completed: 189 },
  { name: 'May', active: 94, completed: 232 },
  { name: 'Jun', active: 142, completed: 310 },
];

const repGrowthData = [
  { name: 'Wk 1', score: 15 },
  { name: 'Wk 2', score: 45 },
  { name: 'Wk 3', score: 90 },
  { name: 'Wk 4', score: 150 },
  { name: 'Wk 5', score: 210 },
  { name: 'Wk 6', score: 320 },
];

export default function AnalyticsPage() {
  const cards = [
    { 
      label: 'Total Sales Volume', 
      value: '45,200 XLM', 
      change: '+24.5%', 
      icon: DollarSign, 
      color: 'text-white border-white/10 bg-white/5' 
    },
    { 
      label: 'Escrow Success Rate', 
      value: '99.4%', 
      change: '+0.2%', 
      icon: TrendingUp, 
      color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' 
    },
    { 
      label: 'Merchant Level', 
      value: 'Level 3 (Gold)', 
      change: 'Top 5%', 
      icon: Award, 
      color: 'text-white border-white/10 bg-white/5' 
    },
    { 
      label: 'Total Items Traded', 
      value: '2,310 Items', 
      change: '+18.2%', 
      icon: Layers, 
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' 
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10 animate-fade-in relative z-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Marketplace Analytics</h1>
        <p className="text-zinc-500 text-xs mt-1 font-medium">
          Detailed metrics, sales volumes, completion statistics, and reputation growth.
        </p>
      </div>

      {/* Profile Passport Section */}
      <div className="glass-panel p-6 bg-gradient-to-tr from-zinc-950/30 to-zinc-900/30 border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wide">
            <Star className="h-3 w-3 fill-white" />
            Verified Web3 Passport
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight leading-none">decoder-dd.stellar</h2>
          <p className="text-xs text-zinc-400">
            Reputation Score: <span className="text-white font-bold">320 trust pts</span> • Level Progress: <span className="text-zinc-200 font-semibold">68% to Level 4</span>
          </p>
          
          {/* Passport Progress Bar */}
          <div className="space-y-1 pt-1.5 max-w-md">
            <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-white to-zinc-400 rounded-full" style={{ width: '68%' }} />
            </div>
            <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>Lvl 3 Gold</span>
              <span>Lvl 4 Platinum</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-zinc-950/40 border border-white/5 rounded-2xl p-5 md:w-80">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Trust Rank</span>
            <span className="text-base font-black text-white flex items-center gap-1 mt-0.5">
              <Shield className="h-4 w-4 text-emerald-400" />
              Elite
            </span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">EXP Rate</span>
            <span className="text-base font-black text-white flex items-center gap-0.5 mt-0.5">
              1.2x Boost
            </span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel p-5 bg-zinc-950/20 border-white/5 space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
                <span className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-black text-white tracking-tight">{card.value}</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  {card.change} this month
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Sales Volume Chart */}
        <div className="glass-panel p-6 bg-zinc-950/20 border-white/5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-white" />
            Monthly Sales Volume (XLM)
          </h3>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, color: '#fafafa', fontSize: 11 }} />
                <Area type="monotone" dataKey="volume" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listings Activity Chart */}
        <div className="glass-panel p-6 bg-zinc-950/20 border-white/5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            Listing Status History
          </h3>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={listingsData}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, color: '#fafafa', fontSize: 11 }} />
                <Bar dataKey="active" fill="rgba(255, 255, 255, 0.15)" radius={[4, 4, 0, 0]} name="Active" />
                <Bar dataKey="completed" fill="#ffffff" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reputation Growth Chart */}
        <div className="glass-panel p-6 bg-zinc-950/20 border-white/5 space-y-4 md:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Award className="h-4 w-4 text-white" />
            Trust Score & Reputation Growth
          </h3>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={repGrowthData}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, color: '#fafafa', fontSize: 11 }} />
                <Line type="monotone" dataKey="score" stroke="#ffffff" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Reputation Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
