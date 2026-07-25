import React from 'react';
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
  History
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  awaitingApprovalCount: number;
  userEmail: string | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  awaitingApprovalCount,
  userEmail,
  onOpenAuth,
  onSignOut
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Job Search', icon: Search },
    { id: 'automation', label: 'Automation', icon: Clock },
    { id: 'history', label: 'Search History', icon: History },
    { id: 'cv-manager', label: 'CV Manager', icon: FileText },
    { id: 'onboarding', label: 'Profile', icon: UserCheck },
    { 
      id: 'app-prep', 
      label: 'Prep & Approve', 
      icon: CheckCircle2,
      badge: awaitingApprovalCount > 0 ? awaitingApprovalCount : null
    },
    { id: 'tracker', label: 'Tracker', icon: ListTodo }
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">JobPilot <span className="text-blue-400">AI</span></span>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Demo Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">AI Job Assistant with Human Approval Safeguard</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-amber-500 text-slate-950 font-bold text-xs px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth & Safety Banner */}
          <div className="flex items-center space-x-3">
            <div className="hidden xl:flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Human Approval Enforced</span>
            </div>

            {userEmail ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">{userEmail}</span>
                </div>
                <button 
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition shadow"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden flex overflow-x-auto py-2 space-x-1 border-t border-slate-800 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center whitespace-nowrap space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
