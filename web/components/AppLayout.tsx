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
          <div className="p-6 border-b border-white/6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white border border-white/10">
                  N
                </span>
                <h1 className="serif-heading text-xl text-white">NextSelf</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white/70 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-xs mt-1.5 text-muted">Your Growth Compass</p>
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
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-white/40'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/6">
            <p className="text-[10px] text-center text-muted/60 font-mono tracking-wider uppercase">
              Curation, not attention.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-surface-0 p-4 border-b border-white/6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white/80"
            >
              <Menu size={20} />
            </button>
            <h1 className="serif-heading text-lg text-white">NextSelf</h1>
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