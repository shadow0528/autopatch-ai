import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import StatsCharts from '@/components/StatsCharts';

// Define the Agent interface based on our FastAPI backend schema
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

async function getAgents(): Promise<Agent[]> {
  try {
    // In a real environment, you'd use a service URL or environment variable.
    // For this MVP running locally, we fetch from the backend running on port 8000.
    const res = await fetch('http://127.0.0.1:8000/api/v1/agents/', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch agents');
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function AgentsList() {
  const agents = await getAgents();

  if (agents.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
        No agents found. Start an agent and send a heartbeat to register.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-lg">
      <table className="min-w-full text-left text-sm whitespace-nowrap">
        <thead className="uppercase tracking-wider border-b border-gray-800 bg-gray-800/50">
          <tr>
            <th className="px-6 py-4">Hostname</th>
            <th className="px-6 py-4">IP Address</th>
            <th className="px-6 py-4">Subnet</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">CPU (%)</th>
            <th className="px-6 py-4">Memory (%)</th>
            <th className="px-6 py-4">OS Version</th>
            <th className="px-6 py-4">Last Seen</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
              <td className="px-6 py-4 font-medium text-white">{agent.hostname}</td>
              <td className="px-6 py-4 text-gray-400">{agent.ip_address}</td>
              <td className="px-6 py-4 text-gray-400">{agent.subnet || 'Unknown'}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  agent.status === 'online' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'
                }`}>
                  {agent.status}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-400">{agent.cpu_utilization.toFixed(1)}</td>
              <td className="px-6 py-4 text-gray-400">{agent.memory_utilization.toFixed(1)}</td>
              <td className="px-6 py-4 text-gray-400 truncate max-w-[150px]" title={agent.os_version || 'Unknown'}>{agent.os_version || 'Unknown'}</td>
              <td className="px-6 py-4 text-gray-400">{new Date(agent.last_seen).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function getReboots() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/reboots/', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

async function getDiscoveries() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/discovery/', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

async function getPatches() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/patches/', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

async function DashboardStats() {
  const agents = await getAgents();
  const reboots = await getReboots();
  const discoveries = await getDiscoveries();
  const patches = await getPatches();

  const total = agents.length;
  const online = agents.filter(a => a.status === 'online').length;
  const offline = total - online;

  const avgCpu = total > 0 ? (agents.reduce((acc, a) => acc + a.cpu_utilization, 0) / total).toFixed(1) : 0;
  const avgMem = total > 0 ? (agents.reduce((acc, a) => acc + a.memory_utilization, 0) / total).toFixed(1) : 0;
  
  // Calculate mock patch compliance based on successful tasks vs all tasks
  const successPatches = patches.filter((p: any) => p.status === 'Success' || p.status === 'Reboot Pending').length;
  const compliance = patches.length > 0 ? ((successPatches / patches.length) * 100).toFixed(1) : 100;
  
  const pendingReboots = reboots.filter((r: any) => r.status === 'Pending Approval').length;
  const shadowAssets = discoveries.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-6 rounded-xl relative overflow-hidden shadow-lg group hover:border-blue-500/50 transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
        </div>
        <p className="text-blue-400 text-xs uppercase tracking-widest font-semibold mb-2">Total Managed Assets</p>
        <div className="flex items-baseline space-x-4">
          <h3 className="text-5xl font-light text-white tracking-tight">{total}</h3>
          <div className="text-sm font-medium text-gray-500 flex space-x-2">
            <span className="flex items-center text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>{online} ON</span> 
            <span className="flex items-center text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span>{offline} OFF</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-6 rounded-xl relative overflow-hidden shadow-lg group hover:border-purple-500/50 transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <p className="text-purple-400 text-xs uppercase tracking-widest font-semibold mb-2">Cluster Resource Load</p>
        <div className="flex space-x-8 mt-2">
          <div>
            <h3 className="text-3xl font-light text-white">{avgCpu}<span className="text-lg text-gray-500">%</span></h3>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Avg CPU</p>
          </div>
          <div>
            <h3 className="text-3xl font-light text-white">{avgMem}<span className="text-lg text-gray-500">%</span></h3>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Avg RAM</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-6 rounded-xl relative overflow-hidden shadow-lg group hover:border-teal-500/50 transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-teal-400 text-xs uppercase tracking-widest font-semibold mb-2">Patch Compliance</p>
        <h3 className={`text-5xl font-light tracking-tight ${Number(compliance) >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{compliance}<span className="text-2xl">%</span></h3>
        <p className="text-xs text-gray-500 mt-2 font-mono">Globally Enforced</p>
      </div>

      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-6 rounded-xl relative overflow-hidden shadow-lg group hover:border-amber-500/50 transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-amber-400 text-xs uppercase tracking-widest font-semibold mb-3">Active Intel Queue</p>
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform">
             <span className="text-sm text-gray-400 font-medium">Reboots Pending</span>
             <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-inner ${pendingReboots > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800/50 text-gray-500 border border-gray-700/50'}`}>{pendingReboots}</span>
          </div>
          <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform delay-75">
             <span className="text-sm text-gray-400 font-medium">Shadow Assets Detected</span>
             <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-inner ${shadowAssets > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-gray-800/50 text-gray-500 border border-gray-700/50'}`}>{shadowAssets}</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
        <h3 className="text-lg font-medium tracking-wide text-gray-300 mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
          Compliance Heatmap
        </h3>
        <div className="grid grid-cols-6 gap-2">
            {[...Array(24)].map((_, i) => (
                <div key={i} className={`h-8 rounded-sm animate-pulse shadow-inner border border-gray-800/50 ${Math.random() > 0.8 ? 'bg-rose-500/40' : Math.random() > 0.6 ? 'bg-amber-500/40' : 'bg-emerald-500/40'}`} title={`Simulated Asset Sector ${i}`}></div>
            ))}
        </div>
        <div className="flex space-x-4 mt-4 text-xs font-mono text-gray-500 justify-end">
            <span className="flex items-center"><span className="w-2 h-2 bg-emerald-500/40 rounded-sm mr-1 border border-emerald-500/30"></span> Secure</span>
            <span className="flex items-center"><span className="w-2 h-2 bg-amber-500/40 rounded-sm mr-1 border border-amber-500/30"></span> Reboot Req.</span>
            <span className="flex items-center"><span className="w-2 h-2 bg-rose-500/40 rounded-sm mr-1 border border-rose-500/30"></span> Vuln. Found</span>
        </div>
      </div>
      <div className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
        <h3 className="text-lg font-medium tracking-wide text-gray-300 mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          Active Threat Severities
        </h3>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Critical Anomalies</span>
                <div className="w-2/3 bg-gray-800 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">High Severity</span>
                <div className="w-2/3 bg-gray-800 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Medium Alerts</span>
                <div className="w-2/3 bg-gray-800 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end mb-10 pb-4 border-b border-gray-800/50">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-1">Global Operations</h2>
          <p className="text-gray-400 text-sm">Real-time endpoint telemetry and orchestration queue.</p>
        </div>
        <div className="flex items-center space-x-2">
           <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-mono text-emerald-400 uppercase tracking-wider">System Operational</span>
        </div>
      </header>

      <Suspense fallback={<div className="text-gray-500 p-4">Loading stats...</div>}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
          <h3 className="text-lg font-medium tracking-wide text-gray-300 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
            Compliance Heatmap
          </h3>
          <div className="grid grid-cols-6 gap-2">
              {[...Array(24)].map((_, i) => (
                  <div key={i} className={`h-8 rounded-sm animate-pulse shadow-inner border border-gray-800/50 ${Math.random() > 0.8 ? 'bg-rose-500/40' : Math.random() > 0.6 ? 'bg-amber-500/40' : 'bg-emerald-500/40'}`} title={`Simulated Asset Sector ${i}`}></div>
              ))}
          </div>
          <div className="flex space-x-4 mt-4 text-xs font-mono text-gray-500 justify-end">
              <span className="flex items-center"><span className="w-2 h-2 bg-emerald-500/40 rounded-sm mr-1 border border-emerald-500/30"></span> Secure</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-amber-500/40 rounded-sm mr-1 border border-amber-500/30"></span> Reboot Req.</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-rose-500/40 rounded-sm mr-1 border border-rose-500/30"></span> Vuln. Found</span>
          </div>
        </div>
        
        <div className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
          <h3 className="text-lg font-medium tracking-wide text-gray-300 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Active Threat Severities
          </h3>
          <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Critical Anomalies</span>
                  <div className="w-2/3 bg-gray-800 rounded-full h-2">
                      <div className="bg-rose-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">High Severity</span>
                  <div className="w-2/3 bg-gray-800 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Medium Alerts</span>
                  <div className="w-2/3 bg-gray-800 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
              </div>
          </div>
        </div>
      </div>

      <section className="mb-10 bg-gray-900/40 border border-gray-800/60 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
        <h3 className="text-lg font-medium tracking-wide text-gray-300 mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
          Resource Allocation Analytics
        </h3>
        <StatsCharts />
      </section>

      <section className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
        <h3 className="text-lg font-medium tracking-wide text-gray-300 mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          Active Telemetry Stream
        </h3>
        <Suspense fallback={<div className="text-gray-500 p-4">Loading agents...</div>}>
          <AgentsList />
        </Suspense>
      </section>
    </div>
  );
}
