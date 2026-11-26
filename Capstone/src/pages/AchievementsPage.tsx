import React, { useState } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  Compass,
  FileCheck2,
  Flame,
  Lock,
  Radar,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import { StudentProgressState } from '../types/cyberquest';

interface AchievementsPageProps {
  progress: StudentProgressState;
}

type FilterMode = 'all' | 'earned' | 'locked';

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ progress }) => {
  const [filter, setFilter] = useState<FilterMode>('all');

  const earnedCount = ACHIEVEMENTS.filter((a) => Boolean(progress.unlockedAchievements[a.id])).length;

  const filtered = ACHIEVEMENTS.filter((a) => {
    const unlocked = Boolean(progress.unlockedAchievements[a.id]);
    if (filter === 'earned') return unlocked;
    if (filter === 'locked') return !unlocked;
    return true;
  });

  const renderIcon = (name: string, unlocked: boolean) => {
    const cls = `w-6 h-6 ${unlocked ? 'text-[#E5B84B]' : 'text-[#9BAEC3]/50'}`;
    switch (name) {
      case 'Compass':
        return <Compass className={cls} />;
      case 'Terminal':
        return <Terminal className={cls} />;
      case 'Radar':
        return <Radar className={cls} />;
      case 'ShieldCheck':
        return <ShieldCheck className={cls} />;
      case 'Activity':
        return <Activity className={cls} />;
      case 'Lock':
        return <Lock className={cls} />;
      case 'FileCheck2':
        return <FileCheck2 className={cls} />;
      case 'BookOpen':
        return <BookOpen className={cls} />;
      case 'Bot':
        return <Bot className={cls} />;
      case 'Sparkles':
        return <Sparkles className={cls} />;
      case 'Flame':
        return <Flame className={cls} />;
      default:
        return <Award className={cls} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#7C5CFC]">Milestones & Badges</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#EAF2FA]">Achievements</h1>
          <p className="text-sm text-[#9BAEC3]">
            Badges unlock automatically as you complete Academy modules, Mission Labs, and milestones.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B1C30] border border-[#102B46] self-start">
          {(['all', 'earned', 'locked'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filter === mode
                  ? 'bg-[#2463EB] text-white'
                  : 'text-[#9BAEC3] hover:text-[#EAF2FA]'
              }`}
            >
              {mode === 'all'
                ? `All (${ACHIEVEMENTS.length})`
                : mode === 'earned'
                ? `Earned (${earnedCount})`
                : `Locked (${ACHIEVEMENTS.length - earnedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Progress Banner */}
      <div className="rounded-2xl border border-[#102B46] bg-[#0B1C30] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-[#EAF2FA]">
            Collection Progress · {earnedCount} of {ACHIEVEMENTS.length} Badges Unlocked
          </div>
          <p className="text-xs text-[#9BAEC3]">
            Earn bonus XP with every unlocked badge toward your next CyberQuest level.
          </p>
        </div>
        <div className="sm:w-64 space-y-1.5">
          <div className="h-2.5 rounded-full bg-[#071426] overflow-hidden">
            <div
              className="h-full bg-[#7C5CFC] transition-all duration-300"
              style={{ width: `${Math.round((earnedCount / ACHIEVEMENTS.length) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((badge) => {
          const unlockedAt = progress.unlockedAchievements[badge.id];
          const unlocked = Boolean(unlockedAt);

          return (
            <div
              key={badge.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-colors ${
                unlocked
                  ? 'bg-[#0B1C30] border-[#7C5CFC]/55'
                  : 'bg-[#0B1C30]/60 border-[#102B46]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
                    unlocked
                      ? 'bg-[#7C5CFC]/15 border-[#7C5CFC]/45'
                      : 'bg-[#071426] border-[#102B46]'
                  }`}
                >
                  {renderIcon(badge.iconName, unlocked)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[#EAF2FA]">{badge.title}</h2>
                    {unlocked && <CheckCircle2 className="w-4 h-4 text-[#19B5A5] shrink-0" />}
                  </div>
                  <p className="text-xs text-[#9BAEC3] mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#102B46] flex items-center justify-between gap-2 text-xs">
                <span className="text-[#9BAEC3] truncate">
                  {unlocked
                    ? `Unlocked ${new Date(unlockedAt).toLocaleDateString()}`
                    : `Goal: ${badge.conditionText}`}
                </span>
                <span
                  className={`font-bold tabular-nums shrink-0 ${
                    unlocked ? 'text-[#E5B84B]' : 'text-[#9BAEC3]'
                  }`}
                >
                  +{badge.xpReward} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
