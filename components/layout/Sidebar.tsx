'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Settings,
  CreditCard,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 ease-in-out bg-white border-r border-slate-200/60 h-screen flex flex-col fixed left-0 top-0 backdrop-blur-xl`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-lg font-semibold text-slate-900">
              Better ATS
            </h1>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-slate-100 transition-colors ml-auto text-slate-500"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2.5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                active
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 group`}
              title={isCollapsed ? item.name : ''}
            >
              <Icon
                size={20}
                className={`shrink-0 ${
                  active ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'
                }`}
              />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-200/60 p-3 relative" ref={menuRef}>
        <button
          className={`flex items-center gap-2.5 w-full hover:bg-slate-50 rounded-md p-2 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="w-8 h-8 bg-linear-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center shrink-0 font-semibold text-xs text-white">
            NH
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-slate-900 truncate">
                Najmul Hasan
              </p>
            </div>
          )}
        </button>

        {/* Profile Menu */}
        {showProfileMenu && (
          <div className={`absolute ${isCollapsed ? 'left-full ml-2 bottom-4' : 'left-4 bottom-full mb-2'} w-56 bg-white border border-slate-200/60 rounded-xl shadow-xl z-50 overflow-hidden`}>
            {/* Profile Header */}
            <div className="p-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-linear-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center font-semibold text-white text-xs">
                  NH
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    Najmul Hasan
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Demo Company
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/dashboard/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
              >
                <Settings size={16} className="text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Company Settings</span>
              </Link>

              <Link
                href="/dashboard/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
              >
                <UserCircle size={16} className="text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Profile</span>
              </Link>

              <Link
                href="/dashboard/billing"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
              >
                <CreditCard size={16} className="text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Billing</span>
              </Link>

              {/* Logout */}
              <div className="my-1 border-t border-slate-200"></div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  // TODO: Implement logout
                  console.log('Logout clicked');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-600">Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
