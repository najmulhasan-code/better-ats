/**
 * Dashboard Sidebar Component
 * Collapsible navigation sidebar with user profile menu
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setShowProfileMenu(false);
    }
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 h-screen flex flex-col fixed left-0 top-0 backdrop-blur-xl shadow-2xl`}
      style={{
        backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
        willChange: 'width',
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/logos/better-ats-logo.png"
                alt="Better ATS"
                width={140}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <Image
                src="/logos/better-ats-logo.png"
                alt="Better ATS"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </Link>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all duration-200 ml-auto text-slate-400 hover:text-white active:scale-95 group"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <div className="transform transition-transform duration-300 group-hover:scale-110">
              {isCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </div>
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
                  ? 'bg-gradient-to-r from-[#5371FE] to-[#7C3AED] text-white shadow-lg shadow-[#5371FE]/20'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              } flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group`}
              title={isCollapsed ? item.name : ''}
            >
              <Icon
                size={20}
                className={`shrink-0 ${
                  active ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`}
              />
              {!isCollapsed && (
                <span className="font-semibold text-[13px]">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-700/50 p-3 relative bg-slate-900/50" ref={menuRef}>
        <button
          className={`flex items-center gap-2.5 w-full hover:bg-white/10 rounded-lg p-2 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#5371FE] to-[#7C3AED] rounded-full flex items-center justify-center shrink-0 font-bold text-xs text-white shadow-lg">
            NH
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-white truncate">
                Profile
              </p>
              <p className="text-xs text-slate-400 truncate">Admin</p>
            </div>
          )}
        </button>

        {/* Profile Menu */}
        {showProfileMenu && (
          <div className={`absolute ${isCollapsed ? 'left-full ml-2 bottom-4' : 'left-4 bottom-full mb-2'} w-48 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-xl shadow-2xl z-50 overflow-hidden dropdown-enter`}>
            {/* Menu Items */}
            <div className="py-1.5">
              <Link
                href="/dashboard/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 active:bg-slate-100 transition-all group"
              >
                <Settings size={16} className="text-slate-600 group-hover:text-slate-900 transition-colors" strokeWidth={2} />
                <span className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Settings</span>
              </Link>

              {/* Logout */}
              <div className="my-1 border-t border-slate-200/80"></div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-50 active:bg-red-100 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut size={16} className={`text-red-600 group-hover:text-red-700 transition-colors ${isLoggingOut ? 'animate-pulse' : ''}`} strokeWidth={2} />
                <span className="text-[13px] font-semibold text-red-600 group-hover:text-red-700 transition-colors">
                  {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
