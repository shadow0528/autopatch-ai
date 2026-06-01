'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: number;
  hostname: string;
  ip_address: string;
  cpu_utilization: number;
  memory_utilization: number;
  os_version: string | null;
  subnet: string | null;
  agent_version: string;
  last_seen: string;
  status: string;
}

export default function AgentStatusPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/agents/');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000); // Live poll 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end mb-10 pb-4 border-b border-gray-800/50">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-1">Agent Fleet Status</h2>
          <p className="text-gray-400 text-sm">Real-time heartbeat polling telemetry across all managed subnets.</p>
        </div>
      </header>

      {loading && agents.length === 0 ? (
        <div className="text-gray-500 p-4 animate-pulse">Loading telemetry...</div>
      ) : agents.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500 shadow-inner">
          No fleet agents currently broadcasting to Mother API.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-gray-900/60 border border-gray-800 p-5 rounded-xl shadow-lg hover:border-blue-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="text-xl font-bold text-gray-100">{agent.hostname}</h3>
                   <p className="text-xs text-blue-400 font-mono mt-1">{agent.ip_address}</p>
                 </div>
                 <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest ${
                    agent.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {agent.status}
                 </span>
              </div>
              
              <div className="space-y-3">
                 <div>
                   <div className="flex justify-between text-xs mb-1">
                     <span className="text-gray-400">CPU Load</span>
                     <span className="text-gray-300 font-mono">{agent.cpu_utilization.toFixed(1)}%</span>
                   </div>
                   <div className="w-full bg-gray-800 rounded-full h-1.5">
                     <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${agent.cpu_utilization}%` }}></div>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between text-xs mb-1">
                     <span className="text-gray-400">Memory Usage</span>
                     <span className="text-gray-300 font-mono">{agent.memory_utilization.toFixed(1)}%</span>
                   </div>
                   <div className="w-full bg-gray-800 rounded-full h-1.5">
                     <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${agent.memory_utilization}%` }}></div>
                   </div>
                 </div>
                 
                 <div className="pt-4 mt-2 border-t border-gray-800/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 block mb-0.5">OS Version</span>
                      <span className="text-gray-300 truncate block" title={agent.os_version || 'Unknown'}>{agent.os_version || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Last Seen</span>
                      <span className="text-gray-300 font-mono">{new Date(agent.last_seen).toLocaleTimeString()}</span>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
