import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

// Define the Agent interface based on our FastAPI backend schema
interface Agent {
  id: number;
  hostname: string;
  ip_address: string;
  cpu_utilization: number;
  memory_utilization: number;
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
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">CPU (%)</th>
            <th className="px-6 py-4">Memory (%)</th>
            <th className="px-6 py-4">Last Seen</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
              <td className="px-6 py-4 font-medium text-white">{agent.hostname}</td>
              <td className="px-6 py-4 text-gray-400">{agent.ip_address}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  agent.status === 'online' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'
                }`}>
                  {agent.status}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-400">{agent.cpu_utilization.toFixed(1)}</td>
              <td className="px-6 py-4 text-gray-400">{agent.memory_utilization.toFixed(1)}</td>
              <td className="px-6 py-4 text-gray-400">{new Date(agent.last_seen).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function DashboardStats() {
  const agents = await getAgents();
  const total = agents.length;
  const online = agents.filter(a => a.status === 'online').length;
  const offline = total - online;

  const avgCpu = total > 0 ? (agents.reduce((acc, a) => acc + a.cpu_utilization, 0) / total).toFixed(1) : 0;
  const avgMem = total > 0 ? (agents.reduce((acc, a) => acc + a.memory_utilization, 0) / total).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Assets</p>
        <h3 className="text-3xl font-bold text-white">{total}</h3>
      </div>
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Status</p>
        <div className="flex space-x-4">
          <div>
            <span className="text-2xl font-bold text-green-500">{online}</span>
            <span className="text-gray-500 text-sm ml-1">Online</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-red-500">{offline}</span>
            <span className="text-gray-500 text-sm ml-1">Offline</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Avg CPU</p>
        <h3 className="text-3xl font-bold text-blue-400">{avgCpu}%</h3>
      </div>
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Avg Memory</p>
        <h3 className="text-3xl font-bold text-purple-400">{avgMem}%</h3>
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

      <section>
        <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-800 pb-2">Connected Agents</h3>
        <Suspense fallback={<div className="text-gray-500 p-4">Loading agents...</div>}>
          <AgentsList />
        </Suspense>
      </section>
    </div>
  );
}
