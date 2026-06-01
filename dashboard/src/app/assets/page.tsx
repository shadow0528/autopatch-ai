import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface Agent {
  id: number;
  hostname: string;
  ip_address: string;
  subnet: string | null;
  os_version: string | null;
  cpu_utilization: number;
  memory_utilization: number;
  agent_version: string;
  last_seen: string;
  status: string;
}

async function getAgents(): Promise<Agent[]> {
  try {
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

async function AssetsTable() {
  const agents = await getAgents();

  if (agents.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
        No registered assets found in inventory.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-lg shadow-sm">
      <table className="min-w-full text-left text-sm whitespace-nowrap">
        <thead className="uppercase tracking-wider border-b border-gray-800 bg-gray-800/50">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Hostname</th>
            <th className="px-6 py-4">IP Address</th>
            <th className="px-6 py-4">Subnet</th>
            <th className="px-6 py-4">OS Version</th>
            <th className="px-6 py-4">Agent Ver.</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
              <td className="px-6 py-4 text-gray-500">#{agent.id}</td>
              <td className="px-6 py-4 font-medium text-white">{agent.hostname}</td>
              <td className="px-6 py-4 text-gray-400">{agent.ip_address}</td>
              <td className="px-6 py-4 text-gray-400">{agent.subnet || 'Unknown'}</td>
              <td className="px-6 py-4 text-gray-400 truncate max-w-[150px]" title={agent.os_version || 'Unknown'}>{agent.os_version || 'Unknown'}</td>
              <td className="px-6 py-4 text-gray-400">{agent.agent_version}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  agent.status === 'online' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'
                }`}>
                  {agent.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <button className="text-blue-400 hover:text-blue-300 mr-3">Details</button>
                <button className="text-red-400 hover:text-red-300">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Asset Inventory</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
          Export CSV
        </button>
      </header>
      
      <Suspense fallback={<div className="text-gray-500 p-4">Loading asset inventory...</div>}>
        <AssetsTable />
      </Suspense>
    </div>
  );
}
