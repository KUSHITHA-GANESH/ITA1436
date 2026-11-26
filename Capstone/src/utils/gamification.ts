import { StudentProgressState } from '../types/cyberquest';

export interface LevelInfo {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
}

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Academy Recruit' },
  { level: 2, xp: 150, title: 'Recon Scout' },
  { level: 3, xp: 350, title: 'Packet Apprentice' },
  { level: 4, xp: 650, title: 'Web Inspector' },
  { level: 5, xp: 1050, title: 'System Guardian' },
  { level: 6, xp: 1550, title: 'Vulnerability Analyst' },
  { level: 7, xp: 2150, title: 'Threat Hunter' },
  { level: 8, xp: 2850, title: 'CyberQuest Specialist' },
  { level: 9, xp: 3650, title: 'Principal Defender' },
  { level: 10, xp: 4600, title: 'Master Security Architect' },
];

export function getLevelInfo(totalXp: number): LevelInfo {
  let current = LEVEL_THRESHOLDS[0];
  let next = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xp) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] ?? {
        level: current.level + 1,
        xp: current.xp + 1000,
        title: current.title,
      };
    }
  }

  const span = Math.max(1, next.xp - current.xp);
  const xpIntoLevel = Math.max(0, totalXp - current.xp);
  const progressPercent = Math.min(100, Math.round((xpIntoLevel / span) * 100));

  return {
    level: current.level,
    title: current.title,
    currentLevelXp: current.xp,
    nextLevelXp: next.xp,
    progressPercent,
    xpIntoLevel,
    xpNeededForNext: Math.max(0, next.xp - totalXp),
  };
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function computeUpdatedStreak(lastActiveDate: string, currentStreak: number): {
  streakCount: number;
  lastActiveDate: string;
} {
  const today = getTodayDateString();
  if (!lastActiveDate) {
    return { streakCount: 1, lastActiveDate: today };
  }
  if (lastActiveDate === today) {
    return { streakCount: Math.max(1, currentStreak), lastActiveDate: today };
  }

  const last = new Date(`${lastActiveDate}T00:00:00`);
  const now = new Date(`${today}T00:00:00`);
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { streakCount: currentStreak + 1, lastActiveDate: today };
  }
  return { streakCount: 1, lastActiveDate: today };
}

export function hasUsedAnyHints(state: StudentProgressState): boolean {
  return Object.values(state.labProgress).some((lab) =>
    Object.values(lab.hintsRevealed || {}).some((tier) => tier > 0)
  );
}
