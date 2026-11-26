import { AchievementDefinition, StudentProgressState } from '../types/cyberquest';
import { hasUsedAnyHints } from '../utils/gamification';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Completed your very first lesson in the CyberQuest Academy.',
    conditionText: 'Complete any 1 lesson node',
    xpReward: 40,
    category: 'learning',
    iconName: 'Compass',
  },
  {
    id: 'first-mission',
    title: 'First Mission',
    description: 'Completed your first practical simulated Mission Lab.',
    conditionText: 'Complete any 1 Mission Lab',
    xpReward: 75,
    category: 'labs',
    iconName: 'Terminal',
  },
  {
    id: 'recon-specialist',
    title: 'Recon Specialist',
    description: 'Mastered reconnaissance concepts and Operation: First Contact.',
    conditionText: 'Complete Unit 01 — Reconnaissance & Lab 1',
    xpReward: 100,
    category: 'labs',
    iconName: 'Radar',
  },
  {
    id: 'web-defender',
    title: 'Web Defender',
    description: 'Uncovered and remediated flaws in CQ SecureBank.',
    conditionText: 'Complete Unit 02 — Web Security & Lab 2',
    xpReward: 100,
    category: 'labs',
    iconName: 'ShieldCheck',
  },
  {
    id: 'packet-detective',
    title: 'Packet Detective',
    description: 'Filtered simulated traffic and isolated suspicious events.',
    conditionText: 'Complete Unit 03 — Network Traffic & Lab 3',
    xpReward: 100,
    category: 'labs',
    iconName: 'Activity',
  },
  {
    id: 'linux-guardian',
    title: 'Linux Guardian',
    description: 'Navigated the Linux filesystem and locked down file permissions.',
    conditionText: 'Complete Unit 04 — Linux Security & Lab 4',
    xpReward: 100,
    category: 'labs',
    iconName: 'Lock',
  },
  {
    id: 'security-analyst',
    title: 'Security Analyst',
    description: 'Delivered a full structured vulnerability assessment report.',
    conditionText: 'Complete Unit 05 — Vulnerability Assessment & Lab 5',
    xpReward: 125,
    category: 'labs',
    iconName: 'FileCheck2',
  },
  {
    id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Completed 10 Academy learning nodes across the curriculum.',
    conditionText: 'Complete 10 learning path nodes',
    xpReward: 80,
    category: 'learning',
    iconName: 'BookOpen',
  },
  {
    id: 'helpful-hints',
    title: 'Curious Partner',
    description: 'Collaborated with Byte by requesting progressive guidance in a lab.',
    conditionText: 'Use Byte’s progressive hint system in any lab',
    xpReward: 30,
    category: 'companion',
    iconName: 'Bot',
  },
  {
    id: 'clean-sweep',
    title: 'Sharp Instincts',
    description: 'Completed an entire Mission Lab without revealing any hints.',
    conditionText: 'Complete any Mission Lab with 0 hints revealed',
    xpReward: 75,
    category: 'mastery',
    iconName: 'Sparkles',
  },
  {
    id: 'streak-starter',
    title: 'Daily Defender',
    description: 'Completed a Daily Mission challenge to reinforce your skills.',
    conditionText: 'Complete at least 1 Daily Mission',
    xpReward: 50,
    category: 'mastery',
    iconName: 'Flame',
  },
  {
    id: 'cyberquest-explorer',
    title: 'CyberQuest Explorer',
    description: 'Completed all five cybersecurity units and every practical mission.',
    conditionText: 'Complete all 5 units and all 5 Mission Labs',
    xpReward: 250,
    category: 'mastery',
    iconName: 'Award',
  },
];

export function evaluateUnlockedAchievements(state: StudentProgressState): string[] {
  const newlyUnlocked: string[] = [];
  const check = (id: string, condition: boolean) => {
    if (condition && !state.unlockedAchievements[id]) {
      newlyUnlocked.push(id);
    }
  };

  const completedLessonsCount = state.completedNodes.filter((n) => n.includes('-lesson-')).length;
  const completedLabsCount = Object.values(state.labProgress).filter((l) => l.completed).length;

  check('first-steps', completedLessonsCount >= 1);
  check('first-mission', completedLabsCount >= 1);
  check(
    'recon-specialist',
    state.labProgress['lab-1'].completed && state.completedNodes.includes('u1-checkpoint')
  );
  check(
    'web-defender',
    state.labProgress['lab-2'].completed && state.completedNodes.includes('u2-checkpoint')
  );
  check(
    'packet-detective',
    state.labProgress['lab-3'].completed && state.completedNodes.includes('u3-checkpoint')
  );
  check(
    'linux-guardian',
    state.labProgress['lab-4'].completed && state.completedNodes.includes('u4-checkpoint')
  );
  check(
    'security-analyst',
    state.labProgress['lab-5'].completed && state.completedNodes.includes('u5-checkpoint')
  );
  check('knowledge-seeker', state.completedNodes.length >= 10);
  check('helpful-hints', hasUsedAnyHints(state));
  check(
    'clean-sweep',
    Object.values(state.labProgress).some(
      (lab) =>
        lab.completed &&
        Object.values(lab.hintsRevealed || {}).every((tier) => tier === 0)
    )
  );
  check('streak-starter', Boolean(state.dailyMissionCompletedDate));
  check(
    'cyberquest-explorer',
    completedLabsCount === 5 &&
      ['u1-checkpoint', 'u2-checkpoint', 'u3-checkpoint', 'u4-checkpoint', 'u5-checkpoint'].every(
        (id) => state.completedNodes.includes(id)
      )
  );

  return newlyUnlocked;
}
