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
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
        </div>
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Managed Assets</p>
        <div className="flex items-baseline space-x-4">
          <h3 className="text-4xl font-bold text-white">{total}</h3>
          <div className="text-sm font-medium text-gray-500">
            <span className="text-green-500">{online}</span> ON / <span className="text-red-500">{offline}</span> OFF
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Avg Resource Utilization</p>
        <div className="flex space-x-6">
          <div>
            <h3 className="text-3xl font-bold text-blue-400">{avgCpu}%</h3>
            <p className="text-xs text-gray-500 mt-1 uppercase">CPU</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-purple-400">{avgMem}%</h3>
            <p className="text-xs text-gray-500 mt-1 uppercase">Memory</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Patch Compliance</p>
        <h3 className={`text-4xl font-bold ${Number(compliance) >= 90 ? 'text-green-500' : 'text-yellow-500'}`}>{compliance}%</h3>
        <p className="text-xs text-gray-500 mt-1">Based on Orchestrator Tasks</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Action Items Queue</p>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
             <span className="text-sm text-gray-300">Reboots Pending:</span>
             <span className={`px-2 py-0.5 rounded text-xs font-bold ${pendingReboots > 0 ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' : 'bg-gray-800 text-gray-400'}`}>{pendingReboots}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-sm text-gray-300">Shadow Assets:</span>
             <span className={`px-2 py-0.5 rounded text-xs font-bold ${shadowAssets > 0 ? 'bg-orange-900/50 text-orange-400 border border-orange-800' : 'bg-gray-800 text-gray-400'}`}>{shadowAssets}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </header>

      <Suspense fallback={<div className="text-gray-500 p-4">Loading stats...</div>}>
        <DashboardStats />
      </Suspense>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-800 pb-2">Resource Analytics</h3>
        <StatsCharts />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-800 pb-2">Connected Agents</h3>
        <Suspense fallback={<div className="text-gray-500 p-4">Loading agents...</div>}>
          <AgentsList />
        </Suspense>
      </section>
    </div>
  );
}
