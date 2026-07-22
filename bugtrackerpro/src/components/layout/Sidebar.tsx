import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  User,
  LogOut,
  Bug,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: Kanban, label: 'Kanban Board', path: '/kanban' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg">
            <Bug className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-bold text-white">BugTracker</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg',
                'transition-all duration-200',
                isActive
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white hover:text-black hover:scale-105'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-white">
        <div className="mb-4 px-4">
          <p className="text-sm text-white/70">Signed in as</p>
          <p className="text-white font-medium truncate">{user?.name}</p>
          <p className="text-xs text-white/50">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-white hover:text-black transition-all duration-200 hover:scale-105"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
