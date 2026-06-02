'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DiscoveredAsset {
  id: number;
  ip_address: string;
  hostname: string | null;
  subnet: string | null;
  discovered_by: string;
  is_managed: boolean;
  last_seen: string;
}

export default function DiscoveryOverviewPage() {
  const [discoveries, setDiscoveries] = useState<DiscoveredAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDiscoveries = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/discovery/');
      if (res.ok) {
        const data = await res.json();
        setDiscoveries(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveries();
    const interval = setInterval(fetchDiscoveries, 15000); // 15s poll
    return () => clearInterval(interval);
  }, []);

  const managedCount = discoveries.filter(d => d.is_managed).length;
  const shadowCount = discoveries.length - managedCount;

  // Aggregate by subnet
  const subnetMap: Record<string, number> = {};
  discoveries.forEach(d => {
    const s = d.subnet || 'Unknown Subnet';
    subnetMap[s] = (subnetMap[s] || 0) + 1;
  });
  const chartData = Object.keys(subnetMap).map(k => ({ subnet: k, count: subnetMap[k] }));

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end mb-10 pb-4 border-b border-gray-800/50">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-1">Global Discovery Engine</h2>
          <p className="text-gray-400 text-sm">Asynchronous asset scanning mapped across all managed subnet domains.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-sm uppercase tracking-widest text-emerald-400 font-semibold mb-2">Total Managed Agents</h3>
            <p className="text-5xl font-light text-white">{managedCount}</p>
         </div>
         <div className="bg-gray-900/60 border border-rose-900/40 p-6 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>
            <h3 className="text-sm uppercase tracking-widest text-rose-400 font-semibold mb-2 relative z-10">Unmanaged Shadow Assets</h3>
            <p className="text-5xl font-light text-rose-100 relative z-10">{shadowCount}</p>
         </div>
         <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-sm uppercase tracking-widest text-teal-400 font-semibold mb-2">Active Subnet Routings</h3>
            <p className="text-5xl font-light text-white">{Object.keys(subnetMap).length}</p>
         </div>
      </div>

      <div className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-6 shadow-2xl backdrop-blur-sm mb-10 h-80">
        <h3 className="text-lg font-medium tracking-wide text-gray-300 mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
          Subnet Density Matrix
        </h3>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="subnet" stroke="#6b7280" tick={{fontSize: 12}} />
            <YAxis stroke="#6b7280" tick={{fontSize: 12}} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
            <Area type="monotone" dataKey="count" name="Discovered Assets" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto bg-gray-900/60 border border-gray-800 rounded-xl shadow-lg">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-800 bg-gray-800/40">
              <tr>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Hostname</th>
                <th className="px-6 py-4">Subnet Route</th>
                <th className="px-6 py-4">Discovered By</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Last Ping</th>
              </tr>
            </thead>
            <tbody>
              {discoveries.map((d) => (
                <tr key={d.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-400">{d.ip_address}</td>
                  <td className="px-6 py-4 font-medium text-white">{d.hostname || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-400">{d.subnet || 'Unknown'}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{d.discovered_by}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${
                      d.is_managed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                    }`}>
                      {d.is_managed ? 'MANAGED' : 'SHADOW ASSET'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{new Date(d.last_seen).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {discoveries.length === 0 && !loading && (
             <div className="p-8 text-center text-gray-500">No assets have been discovered by the subnet scanning engines yet.</div>
          )}
      </div>
    </div>
  );
}
