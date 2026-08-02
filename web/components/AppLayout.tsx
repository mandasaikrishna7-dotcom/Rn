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
        <div className="flex h-full flex-col bg-paper border-r border-[#E8E3DA]">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E3DA]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cobalt text-sm font-black text-white">
                  N
                </span>
                <h1 className="serif-heading text-xl text-ink font-medium">NextSelf</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-ink"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm mt-1.5 text-muted">Your Growth Compass</p>
          </div>
 
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 bg-paper">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200"
                  style={{
                    color: isActive ? 'var(--color-cobalt)' : 'var(--color-text-muted)',
                    backgroundColor: isActive ? 'rgba(42,82,245,0.06)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-cobalt)' : '3px solid transparent',
                  }}
                >
                  <Icon size={18} className={isActive ? 'text-cobalt' : 'text-muted'} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
 
          {/* Footer */}
          <div className="p-4 border-t border-[#E8E3DA]">
            <p className="text-xs text-center text-muted/60">
              Built with care for your journey
            </p>
          </div>
        </div>
      </aside>
 
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-paper p-4 border-b border-[#E8E3DA]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-ink"
            >
              <Menu size={20} />
            </button>
            <h1 className="serif-heading text-lg text-ink font-medium">NextSelf</h1>
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