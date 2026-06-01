'use client';

import { useState, useEffect } from 'react';

interface Vulnerability {
  id: number;
  host_ip: string;
  qid: string;
  severity: number;
  title: string;
  remediation: string;
  detected_at: string;
}

export default function VulnerabilitiesPage() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fetchVulns = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/vulnerabilities/');
      if (res.ok) {
        const data = await res.json();
        setVulns(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulns();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/vulnerabilities/upload-csv', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        alert('CSV Uploaded Successfully');
        setFile(null);
        fetchVulns(); // Refresh table
      } else {
        alert('Upload failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Vulnerability Management</h2>
        
        <form onSubmit={handleUpload} className="flex items-center space-x-2">
          <input 
            type="file" 
            accept=".csv"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
          />
          <button 
            type="submit" 
            disabled={!file || uploading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            {uploading ? 'Uploading...' : 'Import Qualys CSV'}
          </button>
        </form>
      </header>

      {loading ? (
        <div className="text-gray-500 p-4">Loading vulnerabilities...</div>
      ) : vulns.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
          No vulnerabilities found. Import a CSV scan to populate the database.
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-lg shadow-sm">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-800 bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">Host IP</th>
                <th className="px-6 py-4">QID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Detected</th>
              </tr>
            </thead>
            <tbody>
              {vulns.map((v) => (
                <tr key={v.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{v.host_ip}</td>
                  <td className="px-6 py-4 text-blue-400">{v.qid}</td>
                  <td className="px-6 py-4 text-gray-300 truncate max-w-xs" title={v.title}>{v.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      v.severity >= 4 ? 'bg-red-900/50 text-red-400 border border-red-800' :
                      v.severity === 3 ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
                      'bg-blue-900/50 text-blue-400 border border-blue-800'
                    }`}>
                      {v.severity >= 4 ? 'CRITICAL' : v.severity === 3 ? 'HIGH' : 'MEDIUM'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(v.detected_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
