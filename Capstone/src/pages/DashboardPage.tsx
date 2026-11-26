import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Map,
  Target,
  Terminal,
} from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  ALL_NODES,
  CURRICULUM_UNITS,
  getNextRecommendedNode,
  getUnitById,
} from '../data/curriculum';
import { LABS } from '../data/labsData';
import { getContextualGreeting } from '../services/byteEngine';
import { LabId, NavSection, StudentProgressState } from '../types/cyberquest';
import { getLevelInfo, getTodayDateString } from '../utils/gamification';
import { ByteAvatar } from '../components/byte/ByteAvatar';

interface DashboardPageProps {
  progress: StudentProgressState;
  onNavigate: (section: NavSection) => void;
  onOpenNode: (nodeId: string) => void;
  onOpenLab: (labId: LabId) => void;
  onCompleteDailyMission: (xpReward: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  progress,
  onNavigate,
  onOpenNode,
  onOpenLab,
  onCompleteDailyMission,
}) => {
  const levelInfo = getLevelInfo(progress.xp);
  const nextNode = getNextRecommendedNode(progress.completedNodes);
  const nextUnit = getUnitById(nextNode.unitId)!;

  const totalNodes = ALL_NODES.length;
  const completedNodesCount = progress.completedNodes.length;
  const overallPercent = Math.round((completedNodesCount / totalNodes) * 100);

  const completedUnitsCount = CURRICULUM_UNITS.filter((unit) =>
    unit.nodes.every((n) => progress.completedNodes.includes(n.id))
  ).length;
  const completedLessonsCount = progress.completedNodes.filter((id) =>
    id.includes('-lesson-')
  ).length;
  const completedLabsCount = Object.values(progress.labProgress).filter((l) => l.completed).length;

  const greeting = getContextualGreeting({ section: 'dashboard' }, progress);

  // Functional Daily Mission challenge
  const todayStr = getTodayDateString();
  const dailyDone = progress.dailyMissionCompletedDate === todayStr;
  const [dailyChoice, setDailyChoice] = useState('');
  const [dailyFeedback, setDailyFeedback] = useState('');

  const dailyQuestions = [
    {
      prompt: 'Which Nmap flag fingerprints running software versions on open ports?',
      options: [
        { id: 'sv', label: 'nmap -sV' },
        { id: 'sn', label: 'nmap -sn' },
        { id: 'f', label: 'nmap -F' },
      ],
      answer: 'sv',
      success: 'Verified! `-sV` probes service banners to detect versions like Apache 2.4.49.',
    },
    {
      prompt: 'Which Linux command restricts a secrets config file strictly to owner read/write?',
      options: [
        { id: '777', label: 'chmod 777 config.conf' },
        { id: '600', label: 'chmod 600 config.conf' },
        { id: '644', label: 'chmod 644 config.conf' },
      ],
      answer: '600',
      success: 'Correct! `chmod 600` applies `-rw-------`, blocking group and other users.',
    },
  ];
  const dailyItem = dailyQuestions[new Date().getDate() % dailyQuestions.length];

  const handleVerifyDaily = () => {
    if (dailyDone || !dailyChoice) return;
    if (dailyChoice === dailyItem.answer) {
      setDailyFeedback(dailyItem.success);
      onCompleteDailyMission(35);
    } else {
      setDailyFeedback('Not quite—review the question and try another option!');
    }
  };

  const earnedBadges = ACHIEVEMENTS.filter((a) => Boolean(progress.unlockedAchievements[a.id]));
  const upcomingBadges = ACHIEVEMENTS.filter((a) => !progress.unlockedAchievements[a.id]).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome & Byte Hero Row */}
      <section className="rounded-2xl border border-[#102B46] bg-[#0B1C30] p-5 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="rounded-2xl bg-[#071426] border border-[#2463EB]/30 p-3 shrink-0">
              <ByteAvatar mood={greeting.mood} size="lg" />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <div className="text-xs font-semibold text-[#19B5A5]">
                Mission Hub · {levelInfo.title}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#EAF2FA] text-balance">
                Welcome{completedNodesCount > 0 ? ' back' : ''}, {progress.profile.displayName}
              </h1>
              <p className="text-sm text-[#9BAEC3] max-w-2xl leading-relaxed">
                {greeting.message}
              </p>
            </div>
          </div>

          {/* Level & Streak Card */}
          <div className="md:w-72 shrink-0 rounded-xl bg-[#071426] border border-[#102B46] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#9BAEC3]">Current Level</div>
                <div className="text-lg font-bold text-[#EAF2FA] tabular-nums">
                  Level {levelInfo.level}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E5B84B] tabular-nums">
                <Flame className="w-4 h-4" />
                <span>{progress.streakCount} Day Streak</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-[#19B5A5] font-semibold">{progress.xp} XP</span>
                <span className="text-[#9BAEC3]">
                  {levelInfo.xpNeededForNext} XP to Lv. {levelInfo.level + 1}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#102B46] overflow-hidden">
                <div
                  className="h-full bg-[#19B5A5] transition-all duration-300"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Action Grid: Continue Learning + Daily Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Continue Learning */}
        <section className="lg:col-span-7 rounded-2xl border border-[#2463EB]/40 bg-[#0B1C30] p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#38BDF8]">
                {completedNodesCount === 0 ? 'Recommended Starting Activity' : 'Continue Learning'}
              </span>
              <span className="text-[#E5B84B] font-semibold tabular-nums">
                +{nextNode.xpReward} XP Reward
              </span>
            </div>
            <div className="text-xs text-[#9BAEC3]">
              {nextUnit.number} · {nextUnit.title} · {nextNode.estimatedMinutes} min
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#EAF2FA]">{nextNode.title}</h2>
            <p className="text-sm text-[#9BAEC3] leading-relaxed">{nextNode.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#102B46]">
            <div className="text-xs text-[#9BAEC3] tabular-nums">
              Overall Academy Progress:{' '}
              <span className="font-semibold text-[#EAF2FA]">{overallPercent}%</span> (
              {completedNodesCount}/{totalNodes} nodes)
            </div>
            <button
              type="button"
              onClick={() => {
                if (nextNode.type === 'lab' && nextNode.labId) {
                  onOpenLab(nextNode.labId);
                } else {
                  onOpenNode(nextNode.id);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{completedNodesCount === 0 ? 'Start First Lesson' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Daily Mission */}
        <section className="lg:col-span-5 rounded-2xl border border-[#102B46] bg-[#0B1C30] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#E5B84B]" />
              <h2 className="text-base font-bold text-[#EAF2FA]">Daily Mission</h2>
            </div>
            <span className="text-xs font-semibold text-[#E5B84B] tabular-nums">
              {dailyDone ? 'Completed' : '+35 XP'}
            </span>
          </div>

          {dailyDone ? (
            <div className="rounded-xl bg-[#19B5A5]/10 border border-[#19B5A5]/35 p-4 flex items-start gap-3 text-xs text-[#19B5A5]">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div className="space-y-1">
                <div className="font-semibold text-sm">Today’s Daily Mission Complete!</div>
                <p className="text-[#EAF2FA]">
                  You earned +35 XP and maintained your CyberQuest training streak.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#EAF2FA] leading-relaxed">{dailyItem.prompt}</p>
              <div className="space-y-1.5">
                {dailyItem.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setDailyChoice(opt.id);
                      setDailyFeedback('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg border font-mono text-xs transition-colors cursor-pointer ${
                      dailyChoice === opt.id
                        ? 'bg-[#2463EB]/20 border-[#2463EB] text-[#EAF2FA]'
                        : 'bg-[#071426] border-[#102B46] text-[#CBD5E1] hover:border-[#2463EB]/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {dailyFeedback && <p className="text-xs text-[#E5B84B]">{dailyFeedback}</p>}
              <button
                type="button"
                onClick={handleVerifyDaily}
                disabled={!dailyChoice}
                className="w-full py-2 px-4 rounded-lg bg-[#E5B84B] hover:bg-[#d6a93c] disabled:opacity-40 text-[#071426] text-xs font-bold transition-colors cursor-pointer"
              >
                Claim Daily Reward
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Real Learning Progress Stats Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 space-y-1">
          <div className="text-xs text-[#9BAEC3]">Units Completed</div>
          <div className="text-2xl font-bold text-[#EAF2FA] tabular-nums">
            {completedUnitsCount} / 5
          </div>
          <div className="text-xs text-[#19B5A5]">Structured skill paths</div>
        </div>
        <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 space-y-1">
          <div className="text-xs text-[#9BAEC3]">Lessons Completed</div>
          <div className="text-2xl font-bold text-[#EAF2FA] tabular-nums">
            {completedLessonsCount} / 15
          </div>
          <div className="text-xs text-[#38BDF8]">Academy modules</div>
        </div>
        <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 space-y-1">
          <div className="text-xs text-[#9BAEC3]">Mission Labs Done</div>
          <div className="text-2xl font-bold text-[#EAF2FA] tabular-nums">
            {completedLabsCount} / 5
          </div>
          <div className="text-xs text-[#E5B84B]">Simulated environments</div>
        </div>
        <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 space-y-1">
          <div className="text-xs text-[#9BAEC3]">Badges Unlocked</div>
          <div className="text-2xl font-bold text-[#EAF2FA] tabular-nums">
            {earnedBadges.length} / {ACHIEVEMENTS.length}
          </div>
          <div className="text-xs text-[#7C5CFC]">Mastery milestones</div>
        </div>
      </section>

      {/* Bottom Split: Quick Access & Achievements Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 rounded-2xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-4">
          <h2 className="text-base font-bold text-[#EAF2FA]">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                section: 'learning-path' as NavSection,
                title: 'Learning Path',
                desc: 'Visual 5-unit adventure map',
                icon: <Map className="w-4 h-4 text-[#19B5A5]" />,
              },
              {
                section: 'academy' as NavSection,
                title: 'Academy Lessons',
                desc: 'Concept cards, diagrams & drills',
                icon: <BookOpen className="w-4 h-4 text-[#38BDF8]" />,
              },
              {
                section: 'labs' as NavSection,
                title: 'Mission Labs',
                desc: `${Object.keys(LABS).length} interactive simulations`,
                icon: <Terminal className="w-4 h-4 text-[#E5B84B]" />,
              },
              {
                section: 'achievements' as NavSection,
                title: 'Achievements',
                desc: 'Badges, milestones & XP rewards',
                icon: <Award className="w-4 h-4 text-[#7C5CFC]" />,
              },
            ].map((item) => (
              <button
                key={item.section}
                type="button"
                onClick={() => onNavigate(item.section)}
                className="text-left rounded-xl bg-[#071426] hover:bg-[#102B46] border border-[#102B46] p-3.5 transition-colors flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-[#0B1C30] border border-[#102B46] shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#EAF2FA]">{item.title}</div>
                  <div className="text-xs text-[#9BAEC3] mt-0.5">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="lg:col-span-6 rounded-2xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#EAF2FA]">Achievements Preview</h2>
            <button
              type="button"
              onClick={() => onNavigate('achievements')}
              className="text-xs font-semibold text-[#38BDF8] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="space-y-2.5">
            {earnedBadges.slice(-2).map((badge) => (
              <div
                key={badge.id}
                className="rounded-xl bg-[#19B5A5]/10 border border-[#19B5A5]/35 p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-semibold text-[#19B5A5]">Unlocked · {badge.title}</div>
                  <div className="text-xs text-[#EAF2FA] mt-0.5">{badge.description}</div>
                </div>
                <span className="text-xs font-bold text-[#E5B84B] tabular-nums shrink-0">
                  +{badge.xpReward} XP
                </span>
              </div>
            ))}

            {upcomingBadges.slice(0, earnedBadges.length > 0 ? 2 : 3).map((badge) => (
              <div
                key={badge.id}
                className="rounded-xl bg-[#071426] border border-[#102B46] p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-semibold text-[#EAF2FA]">Upcoming · {badge.title}</div>
                  <div className="text-xs text-[#9BAEC3] mt-0.5">{badge.conditionText}</div>
                </div>
                <span className="text-xs font-semibold text-[#9BAEC3] tabular-nums shrink-0">
                  +{badge.xpReward} XP
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
