'use client';

import { useState, useEffect } from 'react';

interface ThreatAlert {
  id: number;
  hostname: string;
  alert_type: string;
  severity: string;
  description: string;
  detected_at: string;
}

export default function ThreatAlertsPage() {
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/threats/');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Threat Awareness Engine</h2>
      </header>

      {/* Threat Queue Table */}
      {loading && alerts.length === 0 ? (
        <div className="text-gray-500 p-4">Loading threat alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
          No security alerts detected. System is secure.
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-lg shadow-sm">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-800 bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Hostname</th>
                <th className="px-6 py-4">Anomaly Type</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Detected At</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-gray-500">#{alert.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{alert.hostname}</td>
                  <td className="px-6 py-4 text-red-400 font-medium">{alert.alert_type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      alert.severity === 'Critical' ? 'bg-red-900/50 text-red-400 border border-red-800' :
                      alert.severity === 'High' ? 'bg-orange-900/50 text-orange-400 border border-orange-800' :
                      alert.severity === 'Medium' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
                      'bg-blue-900/50 text-blue-400 border border-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 truncate max-w-xs" title={alert.description}>{alert.description}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(alert.detected_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
