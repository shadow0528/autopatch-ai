'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Agent {
  id: number;
  hostname: string;
  ip_address: string;
  cpu_utilization: number;
  memory_utilization: number;
}

export default function StatsCharts() {
  const [data, setData] = useState<Agent[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/agents/')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (data.length === 0) return null;

  return (
    <div className="h-80 w-full bg-gray-900 border border-gray-800 p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="hostname" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }} 
            itemStyle={{ color: '#e5e7eb' }}
          />
          <Legend />
          <Bar dataKey="cpu_utilization" name="CPU (%)" fill="#60a5fa" />
          <Bar dataKey="memory_utilization" name="Memory (%)" fill="#c084fc" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
