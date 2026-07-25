import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  LayoutDashboard, 
  Search, 
  FileText, 
  UserCheck, 
  CheckCircle2, 
  ListTodo, 
  ShieldCheck, 
  Sparkles,
  User,
  LogOut,
  Clock,
  History,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Zap,
  Settings,
  ThumbsUp,
  Bookmark,
  Sliders,
  Check
} from 'lucide-react';
import { InAppNotification } from '../types/jobpilot';

interface GlassLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  awaitingApprovalCount: number;
  userEmail: string | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  notifications: InAppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onRunSearchNow: () => void;
  isSearching: boolean;
  children: React.ReactNode;
}

export const GlassLayout: React.FC<GlassLayoutProps> = ({
  activeTab,
  setActiveTab,
  awaitingApprovalCount,
  userEmail,
  onOpenAuth,
  onSignOut,
  globalSearchQuery,
  setGlobalSearchQuery,
  theme,
  setTheme,
  notifications,
  onMarkNotificationRead,
  onRunSearchNow,
  isSearching,
  children
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Discover Jobs', icon: Search },
    { id: 'automation', label: 'Automation Settings', icon: Clock },
    { id: 'history', label: 'Search History', icon: History },
    { 
      id: 'app-prep', 
      label: 'Application Queue', 
      icon: CheckCircle2,
      badge: awaitingApprovalCount > 0 ? awaitingApprovalCount : null
    },
    { id: 'tracker', label: 'Application Tracker', icon: ListTodo },
    { id: 'cv-manager', label: 'CV Manager', icon: FileText },
    { id: 'onboarding', label: 'Profile Preferences', icon: UserCheck },
  ];

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Executive Overview';
      case 'search': return 'Job Discovery & Matching';
      case 'automation': return 'Scheduled Search Automation';
      case 'history': return 'Search Run Audit History';
      case 'app-prep': return 'Application Queue & Approval';
      case 'tracker': return 'Application Pipeline Tracker';
      case 'cv-manager': return 'Master CV & Tailored Assets';
      case 'onboarding': return 'Career Profile & Preferences';
      default: return 'JobPilot AI';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'theme-light bg-slate-100 text-slate-900' : 'theme-dark bg-[#07111F] text-slate-100'} font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white transition-colors duration-300`}>
      
      {/* Background Decorative Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="glow-orb glow-orb-blue w-[600px] h-[600px] -top-40 -left-40 animate-pulse-glow" />
        <div className="glow-orb glow-orb-purple w-[500px] h-[500px] top-1/3 -right-20 animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="glow-orb glow-orb-cyan w-[450px] h-[450px] -bottom-20 left-1/4 animate-pulse-glow" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0a_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 flex min-h-screen">

        {/* Desktop Left Glass Sidebar */}
        <aside 
          className={`hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 border-r ${
            theme === 'light' ? 'bg-white/80 border-slate-200/80 shadow-lg' : 'bg-[#0B1628]/70 border-white/10 shadow-2xl'
          } backdrop-blur-2xl ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
        >
          {/* Sidebar Header / Branding */}
          <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center space-x-3 cursor-pointer overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg tracking-tight gradient-text">JobPilot</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">AI</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium truncate">Autonomous Assistant</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all relative group ${
                    isActive 
                      ? 'btn-gradient-primary text-white shadow-lg shadow-blue-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  
                  {!sidebarCollapsed && (
                    <span className="truncate text-left flex-1">{item.label}</span>
                  )}

                  {item.badge && !sidebarCollapsed && (
                    <span className="bg-amber-400 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}

                  {item.badge && sidebarCollapsed && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-[#0B1628]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Safety & Status Footer */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-white/10 m-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Human Safeguard Active</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                No job applications are submitted without explicit review.
              </p>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          
          {/* Top Glass Header */}
          <header className={`sticky top-0 z-30 h-20 border-b backdrop-blur-2xl flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors ${
            theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-[#07111F]/80 border-white/10'
          }`}>
            
            {/* Left: Mobile Menu Toggle & Title */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">{getPageTitle(activeTab)}</h1>
                <p className="text-xs text-slate-400 hidden sm:block">AI-powered Career Intelligence Platform</p>
              </div>
            </div>

            {/* Middle: Global Search Input */}
            <div className="hidden lg:flex items-center max-w-md w-full mx-6">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Global search (jobs, companies, skills)..."
                  className="w-full glass-input pl-10 pr-4 py-2 text-sm placeholder:text-slate-500"
                />
                {globalSearchQuery && (
                  <button 
                    onClick={() => setGlobalSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Right: Quick Action Buttons & Profile */}
            <div className="flex items-center gap-2.5">
              
              {/* Trigger Instant Search */}
              <button
                onClick={onRunSearchNow}
                disabled={isSearching}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold btn-gradient-primary disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : 'text-amber-300'}`} />
                <span>{isSearching ? 'Searching...' : 'Run Search Now'}</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Glass Theme`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>

              {/* Notifications Popover */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel p-4 z-50 space-y-3 shadow-2xl border-white/20">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-400" /> Notifications
                      </span>
                      <span className="text-xs text-slate-400">{unreadNotifsCount} unread</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No recent notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id}
                            onClick={() => onMarkNotificationRead(n.id)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                              n.read 
                                ? 'bg-white/5 border-white/5 text-slate-400' 
                                : 'bg-blue-600/10 border-blue-500/30 text-slate-200 font-medium'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-white">{n.title}</span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Account Menu */}
              <div className="relative">
                {userEmail ? (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 text-xs font-bold">
                      {userEmail[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">{userEmail}</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="btn-gradient-primary px-3.5 py-1.5 text-xs font-semibold"
                  >
                    Sign In
                  </button>
                )}

                {userMenuOpen && userEmail && (
                  <div className="absolute right-0 mt-3 w-56 glass-panel p-2 z-50 shadow-2xl border-white/20 space-y-1">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs font-semibold text-white truncate">{userEmail}</p>
                      <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                        <Check className="w-3 h-3" /> Autonomous Pro Account
                      </p>
                    </div>

                    <button 
                      onClick={() => { setActiveTab('onboarding'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Career Profile
                    </button>

                    <button 
                      onClick={() => { setActiveTab('automation'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2"
                    >
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> Automation Rules
                    </button>

                    <button 
                      onClick={() => { onSignOut(); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 border-t border-white/10 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>

            </div>

          </header>

          {/* Main Workspace Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>

        </div>

      </div>

      {/* Mobile Slide-out Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative w-72 max-w-full glass-panel border-r border-white/20 h-full p-6 flex flex-col justify-between z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white">JobPilot AI</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                        isActive ? 'btn-gradient-primary text-white' : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-amber-400 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <button
                onClick={onRunSearchNow}
                className="w-full btn-gradient-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300" /> Run Search Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel rounded-none border-t border-white/10 bg-[#07111F]/90 backdrop-blur-2xl py-2 px-3 flex items-center justify-around">
        {[
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'search', label: 'Jobs', icon: Search },
          { id: 'app-prep', label: 'Queue', icon: CheckCircle2, badge: awaitingApprovalCount },
          { id: 'tracker', label: 'Tracker', icon: ListTodo },
          { id: 'automation', label: 'Schedule', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
                isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge ? (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-amber-400 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
