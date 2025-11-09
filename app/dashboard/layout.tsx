'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area - Responsive to sidebar state */}
      <main
        className={`${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        } flex-1 overflow-y-auto transition-all duration-300`}
      >
        <div className="p-6 max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
}
