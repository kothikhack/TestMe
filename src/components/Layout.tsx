import { Outlet, NavLink } from 'react-router-dom';
import { Home, Database, FilePlus, PlaySquare, Settings } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <PlaySquare className="w-8 h-8 text-indigo-200" />
              <span className="font-bold text-xl tracking-tight">ExamSim</span>
            </div>
            <nav className="hidden md:flex space-x-4">
              <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Dashboard" />
              <NavItem to="/questions" icon={<Database className="w-5 h-5" />} label="Question Bank" />
              <NavItem to="/builder" icon={<FilePlus className="w-5 h-5" />} label="Test Builder" />
              <NavItem to="/simulator" icon={<PlaySquare className="w-5 h-5" />} label="Simulator" />
              <NavItem to="/backup" icon={<Settings className="w-5 h-5" />} label="Backup" />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Mobile nav could go here */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around p-3 pb-safe z-50">
        <NavItemMobile to="/" icon={<Home className="w-6 h-6" />} label="Home" />
        <NavItemMobile to="/questions" icon={<Database className="w-6 h-6" />} label="Bank" />
        <NavItemMobile to="/builder" icon={<FilePlus className="w-6 h-6" />} label="Build" />
        <NavItemMobile to="/simulator" icon={<PlaySquare className="w-6 h-6" />} label="Sim" />
        <NavItemMobile to="/backup" icon={<Settings className="w-6 h-6" />} label="More" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-indigo-700 text-white'
            : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

function NavItemMobile({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 text-xs font-medium ${
          isActive ? 'text-indigo-600' : 'text-slate-500'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
