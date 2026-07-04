'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Award, Layers } from 'lucide-react';

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
    { label: 'Total Sales Volume', value: '45,200 XLM', change: '+24.5%', icon: DollarSign, color: 'text-zinc-200 bg-white/5 border border-white/10' },
    { label: 'Escrow Success Rate', value: '99.4%', change: '+0.2%', icon: TrendingUp, color: 'text-zinc-300 bg-white/5 border border-white/10' },
    { label: 'Merchant Level', value: 'Level 3 (Gold)', change: 'Top 5%', icon: Award, color: 'text-zinc-200 bg-white/5 border border-white/10' },
    { label: 'Total Items Traded', value: '2,310 Items', change: '+18.2%', icon: Layers, color: 'text-zinc-100 bg-white/5 border border-white/10' },
  ];

  return (
    <div className="page-container space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100">Marketplace Analytics</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Detailed metrics, sales volumes, completion statistics, and reputation growth.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-card p-5 space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-zinc-500 text-xs font-semibold">{card.label}</span>
                <span className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-extrabold text-zinc-200">{card.value}</h3>
                <p className="text-xs text-zinc-400 font-semibold">{card.change} this month</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Sales Volume Chart */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-md font-bold text-zinc-200 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-zinc-300" />
            Monthly Sales Volume (XLM)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fafafa" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#fafafa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#12121e', borderColor: '#27272a', borderRadius: 8, color: '#eaeaf0' }} />
                <Area type="monotone" dataKey="volume" stroke="#fafafa" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listings Activity Chart */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-md font-bold text-zinc-200 flex items-center gap-2">
            <Layers className="h-4 w-4 text-zinc-300" />
            Listing Status History
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={listingsData}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#12121e', borderColor: '#27272a', borderRadius: 8, color: '#eaeaf0' }} />
                <Bar dataKey="active" fill="#71717a" radius={[4, 4, 0, 0]} name="Active" />
                <Bar dataKey="completed" fill="#fafafa" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reputation Growth Chart */}
        <div className="glass-card p-6 space-y-4 md:col-span-2">
          <h3 className="text-md font-bold text-zinc-200 flex items-center gap-2">
            <Award className="h-4 w-4 text-zinc-300" />
            Trust Score & Reputation Growth
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={repGrowthData}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#12121e', borderColor: '#27272a', borderRadius: 8, color: '#eaeaf0' }} />
                <Line type="monotone" dataKey="score" stroke="#ffffff" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Reputation Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
