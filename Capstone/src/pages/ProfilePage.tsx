import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Flame,
  Info,
  RotateCcw,
  Save,
  TrendingUp,
} from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import { ALL_NODES, CURRICULUM_UNITS } from '../data/curriculum';
import { StudentProgressState } from '../types/cyberquest';
import { getLevelInfo } from '../utils/gamification';
import { AVATAR_OPTIONS, StudentAvatar } from '../components/profile/StudentAvatar';

interface ProfilePageProps {
  progress: StudentProgressState;
  onUpdateProfile: (displayName: string, avatarId: string) => void;
  onResetAll: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  progress,
  onUpdateProfile,
  onResetAll,
}) => {
  const [displayName, setDisplayName] = useState(progress.profile.displayName);
  const [avatarId, setAvatarId] = useState(progress.profile.avatarId);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const levelInfo = getLevelInfo(progress.xp);
  const completedUnitsCount = CURRICULUM_UNITS.filter((unit) =>
    unit.nodes.every((n) => progress.completedNodes.includes(n.id))
  ).length;
  const completedLessonsCount = progress.completedNodes.filter((id) =>
    id.includes('-lesson-')
  ).length;
  const completedLabsCount = Object.values(progress.labProgress).filter((l) => l.completed).length;
  const earnedCount = Object.keys(progress.unlockedAchievements).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(displayName.trim() || 'Cyber Explorer', avatarId);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportProgress = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberquest-profile-${progress.profile.displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="text-xs font-semibold text-[#38BDF8]">Student Record</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#EAF2FA]">Student Profile</h1>
        <p className="text-sm text-[#9BAEC3]">
          Customize your Academy profile, inspect your learning statistics, and manage saved progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Editor */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-5 rounded-2xl border border-[#102B46] bg-[#0B1C30] p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center gap-4">
            <StudentAvatar avatarId={avatarId} size="lg" />
            <div>
              <div className="text-lg font-bold text-[#EAF2FA]">{progress.profile.displayName}</div>
              <div className="text-xs text-[#19B5A5] font-semibold">
                Level {levelInfo.level} · {levelInfo.title}
              </div>
              <div className="text-xs text-[#9BAEC3] mt-0.5 tabular-nums">
                Joined {new Date(progress.profile.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-name" className="block text-xs font-semibold text-[#9BAEC3]">
              Display Name
            </label>
            <input
              id="profile-name"
              type="text"
              maxLength={28}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg bg-[#071426] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3.5 py-2 text-sm text-[#EAF2FA]"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#9BAEC3]">Academy Avatar</div>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAvatarId(opt.id)}
                  aria-label={opt.label}
                  className={`p-1 rounded-xl border-2 transition-all cursor-pointer ${
                    avatarId === opt.id
                      ? 'border-[#19B5A5] bg-[#102B46]'
                      : 'border-transparent hover:border-[#2463EB]/40'
                  }`}
                >
                  <StudentAvatar avatarId={opt.id} size="md" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>

            {savedNotice && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#19B5A5]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
          </div>
        </form>

        {/* Stats & Activity History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4">
              <div className="text-xs text-[#9BAEC3]">Total XP</div>
              <div className="text-2xl font-bold text-[#E5B84B] tabular-nums mt-1">
                {progress.xp}
              </div>
            </div>
            <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4">
              <div className="text-xs text-[#9BAEC3]">Learning Streak</div>
              <div className="text-2xl font-bold text-[#EAF2FA] tabular-nums mt-1 flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-[#E5B84B]" />
                <span>{progress.streakCount}d</span>
              </div>
            </div>
            <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4">
              <div className="text-xs text-[#9BAEC3]">Path Nodes</div>
              <div className="text-2xl font-bold text-[#19B5A5] tabular-nums mt-1">
                {progress.completedNodes.length}/{ALL_NODES.length}
              </div>
            </div>
            <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4">
              <div className="text-xs text-[#9BAEC3]">Units Completed</div>
              <div className="text-xl font-bold text-[#EAF2FA] tabular-nums mt-1">
                {completedUnitsCount} / 5
              </div>
            </div>
            <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4">
              <div className="text-xs text-[#9BAEC3]">Lessons / Labs</div>
              <div className="text-xl font-bold text-[#EAF2FA] tabular-nums mt-1">
                {completedLessonsCount} / {completedLabsCount}
              </div>
            </div>
            <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4">
              <div className="text-xs text-[#9BAEC3]">Badges</div>
              <div className="text-xl font-bold text-[#7C5CFC] tabular-nums mt-1">
                {earnedCount} / {ACHIEVEMENTS.length}
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div className="rounded-2xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#EAF2FA]">
              <TrendingUp className="w-4 h-4 text-[#19B5A5]" />
              <span>Recent Learning Activity</span>
            </div>

            {progress.activityHistory.length === 0 ? (
              <div className="rounded-xl bg-[#071426] border border-[#102B46] p-4 text-xs text-[#9BAEC3]">
                No completed activities yet. Complete your first lesson or Mission Lab to populate your timeline!
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto cq-scroll pr-1">
                {progress.activityHistory.slice(0, 15).map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg bg-[#071426] border border-[#102B46] px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[#EAF2FA] truncate">{entry.title}</div>
                      <div className="text-[11px] text-[#9BAEC3] capitalize">
                        {entry.category} · {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <span className="font-bold text-[#E5B84B] tabular-nums shrink-0">
                      +{entry.xpEarned} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Capstone Local Persistence & Data Management */}
          <div className="rounded-2xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-4">
            <div className="flex items-start gap-2.5 text-xs text-[#9BAEC3]">
              <Info className="w-4 h-4 text-[#2463EB] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-[#EAF2FA]">
                  Capstone Local Persistence Architecture
                </div>
                <p className="leading-relaxed">
                  Progress, XP, badges, and lab states are stored locally in browser{' '}
                  <code className="text-[#19B5A5]">localStorage</code> so CyberQuest runs immediately without external API keys or databases. This demo profile is designed for capstone demonstration rather than multi-tenant production security.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#102B46]">
              <button
                type="button"
                onClick={handleExportProgress}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#102B46] hover:bg-[#102B46]/80 text-xs font-semibold text-[#EAF2FA] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Progress JSON</span>
              </button>

              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E65B6A]/40 text-xs font-semibold text-[#E65B6A] hover:bg-[#E65B6A]/10 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Progress</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#E65B6A]">Erase all local progress?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetAll();
                      setDisplayName('Cyber Explorer');
                      setAvatarId('avatar-shield');
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#E65B6A] text-white text-xs font-semibold cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#071426] text-xs text-[#9BAEC3] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
