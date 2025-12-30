import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  FileText,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Team Analysis', href: '/team', icon: TrendingUp },
  { name: 'Player Analysis', href: '/players', icon: Users },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-dark-800 border-r border-dark-600
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-green/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent-green" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">ISP Soccer</span>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' 
                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-600">
          <div className="text-xs text-gray-500">
            <p>ISP Soccer Analytics</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-dark-800/80 backdrop-blur-md border-b border-dark-600">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <button 
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-semibold text-white text-center lg:text-left">
                {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-gray-500">Match:</span>
                <span className="text-accent-green font-medium">NCF vs Opponent</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" title="Live data" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
