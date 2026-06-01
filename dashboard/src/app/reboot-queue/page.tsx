'use client';

import { useState, useEffect } from 'react';

interface RebootRequest {
  id: number;
  target: string;
  reboot_type: string;
  status: string;
  requested_at: string;
  approved_at: string | null;
}

export default function RebootQueuePage() {
  const [requests, setRequests] = useState<RebootRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [target, setTarget] = useState('');
  const [rebootType, setRebootType] = useState('Single');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/reboots/');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/reboots/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: target,
          reboot_type: rebootType,
        }),
      });
      if (res.ok) {
        setTarget('');
        fetchRequests();
      } else {
        alert('Failed to create request');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/reboots/${id}/approve`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchRequests();
      } else {
        alert('Failed to approve request');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Reboot Orchestration</h2>
      </header>

      {/* Deployment Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Request Controlled Reboot</h3>
        <form onSubmit={handleCreateRequest} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Target (Hostname or Subnet)" 
            required 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
          />
          <select 
            value={rebootType}
            onChange={(e) => setRebootType(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option>Single</option>
            <option>Batch</option>
            <option>Subnet</option>
          </select>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 whitespace-nowrap"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* Task Queue Table */}
      {loading && requests.length === 0 ? (
        <div className="text-gray-500 p-4">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
          No reboot requests in queue.
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-lg shadow-sm">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-800 bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">Req ID</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Requested</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-gray-500">#{req.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{req.target}</td>
                  <td className="px-6 py-4 text-gray-300">{req.reboot_type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      req.status === 'Approved' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                      req.status === 'Pending Approval' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
                      req.status === 'Executing' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' :
                      'bg-gray-800 text-gray-400 border border-gray-600'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(req.requested_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {req.status === 'Pending Approval' && (
                      <button 
                        onClick={() => handleApprove(req.id)}
                        className="text-green-400 hover:text-green-300 mr-3 text-xs font-medium uppercase"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
