import { Suspense } from 'react';

export default function SystemHealthPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end mb-10 pb-4 border-b border-gray-800/50">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-1">System Health Diagnostics</h2>
          <p className="text-gray-400 text-sm">Cluster service connectivity and failure intelligence analysis.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-emerald-400">Services Status</h3>
          <ul className="space-y-4">
            <li className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-300 font-mono text-sm">Mother API REST Engine</span>
              <span className="px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">ONLINE</span>
            </li>
            <li className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-300 font-mono text-sm">SQLite Database Subsystem</span>
              <span className="px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">ONLINE</span>
            </li>
            <li className="flex justify-between items-center pb-2">
              <span className="text-gray-300 font-mono text-sm">Asynchronous Polling Dispatcher</span>
              <span className="px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">ONLINE</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-amber-400">Failure Intelligence Diagnostics</h3>
          <div className="flex flex-col space-y-3">
             <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Most Common Self-Heal Triggers</div>
             <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
             </div>
             <p className="text-xs text-blue-400 font-mono text-right mb-4">WUAUSERV Component Corruption (45%)</p>

             <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1">
                <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
             </div>
             <p className="text-xs text-rose-400 font-mono text-right mb-4">Access Denied (0x80070005) (30%)</p>

             <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1">
                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '25%' }}></div>
             </div>
             <p className="text-xs text-purple-400 font-mono text-right">Missing Dependency Chains (25%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
