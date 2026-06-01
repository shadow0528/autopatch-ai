'use client';

import { useState, useEffect } from 'react';

interface PatchTask {
  id: number;
  target_host: string;
  patch_type: string;
  payload: string;
  status: string;
  created_at: string;
}

export default function PatchQueuePage() {
  const [tasks, setTasks] = useState<PatchTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [targetHost, setTargetHost] = useState('');
  const [patchType, setPatchType] = useState('Windows Update');
  const [payload, setPayload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/patches/');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/patches/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_host: targetHost,
          patch_type: patchType,
          payload: payload,
        }),
      });
      if (res.ok) {
        setTargetHost('');
        setPayload('');
        fetchTasks();
      } else {
        alert('Failed to create task');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Patch Orchestration Queue</h2>
      </header>

      {/* Deployment Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Deploy New Patch Task</h3>
        <form onSubmit={handleCreateTask} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Target Hostname" 
            required 
            value={targetHost}
            onChange={(e) => setTargetHost(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
          />
          <select 
            value={patchType}
            onChange={(e) => setPatchType(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option>Windows Update</option>
            <option>Winget</option>
            <option>PowerShell</option>
          </select>
          <input 
            type="text" 
            placeholder="Payload (KB or Script)" 
            required 
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 whitespace-nowrap"
          >
            {isSubmitting ? 'Deploying...' : 'Deploy Task'}
          </button>
        </form>
      </div>

      {/* Task Queue Table */}
      {loading && tasks.length === 0 ? (
        <div className="text-gray-500 p-4">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
          No patch tasks in queue.
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-lg shadow-sm">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-800 bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">Task ID</th>
                <th className="px-6 py-4">Target Host</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Payload</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-gray-500">#{task.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{task.target_host}</td>
                  <td className="px-6 py-4 text-gray-300">{task.patch_type}</td>
                  <td className="px-6 py-4 text-blue-400 font-mono text-xs">{task.payload}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      task.status === 'Success' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                      task.status === 'Failed' ? 'bg-red-900/50 text-red-400 border border-red-800' :
                      task.status === 'Running' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' :
                      task.status === 'Reboot Pending' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
                      'bg-gray-800 text-gray-400 border border-gray-600'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(task.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
