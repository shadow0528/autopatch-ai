import { Suspense } from 'react';

export default function AgentHealthPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end mb-10 pb-4 border-b border-gray-800/50">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-1">Agent Endpoint Health</h2>
          <p className="text-gray-400 text-sm">Security telemetry and internal service resilience diagnostics for all polling agents.</p>
        </div>
      </header>

      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-6 text-indigo-400">Agent Subsystem Telemetry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Heartbeat Loop</p>
                <p className="text-2xl text-emerald-400 font-light">100% <span className="text-sm text-gray-500">Uptime</span></p>
            </div>
            <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Orchestration Polling</p>
                <p className="text-2xl text-emerald-400 font-light">100% <span className="text-sm text-gray-500">Uptime</span></p>
            </div>
            <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Threat Monitor Engine</p>
                <p className="text-2xl text-emerald-400 font-light">100% <span className="text-sm text-gray-500">Uptime</span></p>
            </div>
            <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Discovery Async Sockets</p>
                <p className="text-2xl text-emerald-400 font-light">100% <span className="text-sm text-gray-500">Uptime</span></p>
            </div>
        </div>
      </div>

      <div className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-6 shadow-2xl backdrop-blur-sm mb-10">
        <h3 className="text-lg font-medium tracking-wide text-gray-300 mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          Security Sandbox Audit Drops
        </h3>
        <p className="text-sm text-gray-400 mb-4">
            Monitoring occurrences where the strict Powershell Whitelist / Trusted Execution Directory engine intercepted and actively dropped arbitrary scripts.
        </p>
        <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-700/30">
                <div>
                   <span className="text-rose-400 font-mono text-sm block">Invoke-Expression http://badsite.com</span>
                   <span className="text-xs text-gray-500 mt-1">Intercepted via dynamic `iex` string match blocking.</span>
                </div>
                <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-bold uppercase tracking-wider">BLOCKED</span>
            </div>
             <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-700/30">
                <div>
                   <span className="text-rose-400 font-mono text-sm block">C:\Temp\unauthorized_script.ps1</span>
                   <span className="text-xs text-gray-500 mt-1">Intercepted via Trusted Directory scope violations.</span>
                </div>
                <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-bold uppercase tracking-wider">BLOCKED</span>
            </div>
        </div>
      </div>
    </div>
  );
}
