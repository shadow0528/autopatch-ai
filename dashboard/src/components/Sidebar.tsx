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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-green-500 tracking-wider">
          AUTOPATCH<span className="text-white">AI</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1 uppercase">Cybersecurity Node</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="block px-4 py-2 text-sm text-gray-300 rounded hover:bg-gray-800 hover:text-white transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
