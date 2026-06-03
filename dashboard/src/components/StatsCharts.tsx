'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Agent {
  id: number;
  hostname: string;
  ip_address: string;
  cpu_utilization: number;
  memory_utilization: number;
  subnet: string | null;
}

export default function StatsCharts() {
  const [data, setData] = useState<Agent[]>([]);
  const [activeTab, setActiveTab] = useState<'cpu' | 'memory' | 'subnets'>('cpu');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/agents/')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (data.length === 0) return (
    <div className="h-80 w-full bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex items-center justify-center text-gray-500 animate-pulse">
        Waiting for agent telemetry stream...
    </div>
  );

  // Group by subnet
  const subnetMap: Record<string, number> = {};
  data.forEach(d => {
    const s = d.subnet || 'Unknown';
    subnetMap[s] = (subnetMap[s] || 0) + 1;
  });
  const subnetData = Object.keys(subnetMap).map(k => ({ subnet: k, count: subnetMap[k] }));

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={() => setActiveTab('cpu')} 
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'cpu' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50' : 'bg-gray-800/50 text-gray-400 border border-transparent hover:bg-gray-800'}`}
        >
          CPU Load
        </button>
        <button 
          onClick={() => setActiveTab('memory')} 
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'memory' ? 'bg-purple-600/30 text-purple-400 border border-purple-500/50' : 'bg-gray-800/50 text-gray-400 border border-transparent hover:bg-gray-800'}`}
        >
          Memory Load
        </button>
        <button 
          onClick={() => setActiveTab('subnets')} 
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'subnets' ? 'bg-teal-600/30 text-teal-400 border border-teal-500/50' : 'bg-gray-800/50 text-gray-400 border border-transparent hover:bg-gray-800'}`}
        >
          Subnet Density
        </button>
      </div>

      <div className="h-80 w-full bg-gray-900/40 border border-gray-800 p-4 rounded-xl shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'subnets' ? (
            <BarChart data={subnetData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="subnet" stroke="#6b7280" tick={{fontSize: 12}} />
              <YAxis stroke="#6b7280" tick={{fontSize: 12}} allowDecimals={false} />
              <Tooltip cursor={{fill: '#1f2937', opacity: 0.4}} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
              <Bar dataKey="count" name="Managed Assets" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="hostname" stroke="#6b7280" tick={{fontSize: 12}} />
              <YAxis stroke="#6b7280" tick={{fontSize: 12}} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
              
              {activeTab === 'cpu' && (
                <Area type="monotone" dataKey="cpu_utilization" name="CPU (%)" stroke="#60a5fa" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
              )}
              {activeTab === 'memory' && (
                <Area type="monotone" dataKey="memory_utilization" name="Memory (%)" stroke="#c084fc" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
