import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Flame,
  LayoutDashboard,
  Map,
  Menu,
  Shield,
  Terminal,
  User,
  X,
} from 'lucide-react';
import { NavSection, StudentProgressState } from '../../types/cyberquest';
import { getLevelInfo } from '../../utils/gamification';
import { StudentAvatar } from '../profile/StudentAvatar';

interface AppShellProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  progress: StudentProgressState;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'learning-path', label: 'Learning Path', icon: <Map className="w-4 h-4" /> },
  { id: 'academy', label: 'Academy', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'labs', label: 'Mission Labs', icon: <Terminal className="w-4 h-4" /> },
  { id: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
];

export const AppShell: React.FC<AppShellProps> = ({
  activeSection,
  onNavigate,
  progress,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const levelInfo = getLevelInfo(progress.xp);

  const handleSelectNav = (section: NavSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#071426] text-[#EAF2FA] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#0B1C30] border-r border-[#102B46] z-30">
        <div className="px-5 py-5 border-b border-[#102B46]">
          <button
            type="button"
            onClick={() => handleSelectNav('dashboard')}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#2463EB] flex items-center justify-center text-white shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-[#EAF2FA] whitespace-nowrap">
              CyberQuest
            </span>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#2463EB] text-white'
                    : 'text-[#9BAEC3] hover:text-[#EAF2FA] hover:bg-[#102B46]/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Student Level Summary */}
        <div className="p-4 m-3 rounded-xl bg-[#071426] border border-[#102B46] space-y-2.5">
          <div className="flex items-center gap-2.5">
            <StudentAvatar avatarId={progress.profile.avatarId} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#EAF2FA] truncate">
                {progress.profile.displayName}
              </div>
              <div className="text-[11px] text-[#19B5A5] truncate">
                Lv. {levelInfo.level} · {levelInfo.title}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-[#9BAEC3] tabular-nums">
              <span>{progress.xp} XP</span>
              <span>{levelInfo.nextLevelXp} XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#102B46] overflow-hidden">
              <div
                className="h-full bg-[#19B5A5] transition-all duration-300"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="no-print sticky top-0 z-20 bg-[#071426]/95 backdrop-blur border-b border-[#102B46] px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#9BAEC3] hover:text-[#EAF2FA] hover:bg-[#0B1C30] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="lg:hidden font-display font-bold text-base text-[#EAF2FA] whitespace-nowrap">
              CyberQuest
            </span>
            <span className="hidden lg:inline text-sm font-semibold text-[#EAF2FA] capitalize whitespace-nowrap">
              {NAV_ITEMS.find((i) => i.id === activeSection)?.label ?? 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#E5B84B] tabular-nums whitespace-nowrap">
              <Flame className="w-4 h-4" />
              <span>{progress.streakCount}d streak</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#9BAEC3] tabular-nums whitespace-nowrap">
              <span className="font-semibold text-[#19B5A5]">Lv. {levelInfo.level}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#EAF2FA]">{progress.xp} XP</span>
            </div>

            <button
              type="button"
              onClick={() => handleSelectNav('profile')}
              aria-label="Open student profile"
              className="flex items-center gap-2 rounded-lg hover:bg-[#0B1C30] p-1 transition-colors cursor-pointer"
            >
              <StudentAvatar avatarId={progress.profile.avatarId} size="sm" />
            </button>
          </div>
        </header>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="no-print lg:hidden fixed inset-x-0 top-14 z-30 bg-[#0B1C30] border-b border-[#102B46] p-3 shadow-2xl">
            <nav className="grid grid-cols-2 gap-2" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2463EB] text-white'
                        : 'bg-[#071426] text-[#9BAEC3] hover:text-[#EAF2FA]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Active Page Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
