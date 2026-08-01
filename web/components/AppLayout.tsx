"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Settings as SettingsIcon,
  FileText,
  Menu,
  X
} from "lucide-react";
import { CatCompanion, useCompanionMessages } from "./CatCompanion";

const navigation = [
  { name: "Feed", href: "/", icon: Home },
  { name: "Journey", href: "/journey", icon: BookOpen },
  { name: "Notes", href: "/notes", icon: FileText },
  { name: "Mentors", href: "/mentors", icon: Users },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { messages, dismissMessage } = useCompanionMessages();

  return (
    <div className="flex h-screen bg-paper">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 
        transform transition-transform lg:translate-x-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="leather-panel flex h-full flex-col">
          {/* Header */}
          <div className="p-6" style={{ borderBottom: '1px solid rgba(15,138,134,0.25)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-lagoon text-sm font-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.35)]">
                  N
                </span>
                <h1 className="serif-heading text-xl" style={{ color: '#FFFFFF' }}>NextSelf</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
                style={{ color: '#FFFFFF' }}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Your Growth Compass</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="nav-item"
                  style={{
                    color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                    backgroundColor: isActive ? 'rgba(15,138,134,0.25)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-lagoon)' : '3px solid transparent',
                  }}
                >
                  <Icon size={18} className={isActive ? 'text-[#6FD4CE]' : undefined} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4" style={{ borderTop: '1px solid rgba(15,138,134,0.25)' }}>
            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Built with care for your journey
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-white p-4" style={{ borderBottom: '1px solid rgba(15,138,134,0.2)' }}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-ink"
            >
              <Menu size={20} />
            </button>
            <h1 className="serif-heading text-lg text-ink">NextSelf</h1>
            <div className="w-8" />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto bg-paper">
          <div className="max-w-3xl mx-auto py-10 px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>

      {/* Cat companion */}
      <CatCompanion 
        messages={messages}
        onDismiss={dismissMessage}
      />
    </div>
  );
}