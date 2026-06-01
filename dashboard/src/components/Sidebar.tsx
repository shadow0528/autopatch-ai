import Link from 'next/link';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', href: '/' },
    { name: 'Assets', href: '/assets' },
    { name: 'Vulnerabilities', href: '/vulnerabilities' },
    { name: 'Patch Queue', href: '/patch-queue' },
    { name: 'Reboot Queue', href: '/reboot-queue' },
    { name: 'Threat Alerts', href: '/threat-alerts' },
    { name: 'Logs', href: '/logs' },
  ];

  return (
    <aside className="w-64 h-full bg-gray-900 border-r border-gray-800 p-4">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          AUTOPATCH<span className="text-white">AI</span>
        </h1>
        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-[0.2em] font-semibold">SOC Command Center</p>
      </div>

      <nav className="space-y-1.5">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="group flex items-center px-4 py-3 text-sm font-medium text-gray-400 rounded-md hover:bg-gray-800/60 hover:text-blue-400 transition-all duration-200 border-l-2 border-transparent hover:border-blue-400"
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
