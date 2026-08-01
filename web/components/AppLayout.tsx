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
    <div className="flex h-screen" style={{ backgroundColor: 'var(--color-paper)' }}>
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
      `} style={{ background: 'linear-gradient(145deg, #42332A, #3A2A21)' }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-brass/20">
            <div className="flex items-center justify-between">
              <h1 className="serif-heading text-xl text-card">NextSelf</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-card hover:text-brass p-1"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-card/70 mt-1">Your Growth Compass</p>
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
                  <Icon size={18} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-brass/20">
            <p className="text-xs text-card/50 text-center">
              Built with care for your journey
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-card border-b border-brass/20 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-ink hover:text-brass p-1"
            >
              <Menu size={20} />
            </button>
            <h1 className="serif-heading text-lg text-ink">NextSelf</h1>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <div className="container-narrow py-8">
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