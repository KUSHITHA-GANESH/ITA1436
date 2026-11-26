import { LabId, LabProgressState, StudentProgressState } from '../types/cyberquest';
import { getTodayDateString } from '../utils/gamification';

const STORAGE_KEY = 'cyberquest_student_progress_v1';
const CURRENT_VERSION = 1;

export function createInitialLabProgress(): Record<LabId, LabProgressState> {
  return {
    'lab-1': {
      completedTasks: [],
      hintsRevealed: {},
      completed: false,
      commandLog: [],
      observations: {},
    },
    'lab-2': {
      completedTasks: [],
      hintsRevealed: {},
      completed: false,
      observations: {},
    },
    'lab-3': {
      completedTasks: [],
      hintsRevealed: {},
      completed: false,
      observations: {},
    },
    'lab-4': {
      completedTasks: [],
      hintsRevealed: {},
      completed: false,
      commandLog: [],
      linuxPermissions: {
        '/opt/CQ/db_backup.conf': '777',
        '/opt/CQ/deploy.sh': '750',
        '/etc/ssh/sshd_config': '644',
        '/var/logs/auth.log': '640',
        '/home/student/notes.txt': '644',
      },
      observations: {},
    },
    'lab-5': {
      completedTasks: [],
      hintsRevealed: {},
      completed: false,
      observations: {},
      assessmentDraft: {
        title: 'Security Assessment — CQ CloudPortal v2.4',
        scopeConfirmed: false,
        exploredEvidenceIds: [],
        findings: {
          'finding-sqli': {
            id: 'finding-sqli',
            title: 'SQL Injection in Login Endpoint',
            selectedSeverity: '',
            observation: '',
            impact: '',
            remediation: '',
            verified: false,
          },
          'finding-apache': {
            id: 'finding-apache',
            title: 'Outdated Apache HTTP Server 2.4.49',
            selectedSeverity: '',
            observation: '',
            impact: '',
            remediation: '',
            verified: false,
          },
          'finding-perms': {
            id: 'finding-perms',
            title: 'World-Writable Backup Configuration (777)',
            selectedSeverity: '',
            observation: '',
            impact: '',
            remediation: '',
            verified: false,
          },
          'finding-headers': {
            id: 'finding-headers',
            title: 'Missing HttpOnly Session Flag & Security Headers',
            selectedSeverity: '',
            observation: '',
            impact: '',
            remediation: '',
            verified: false,
          },
        },
        submitted: false,
      },
    },
  };
}

export function createDefaultProgressState(): StudentProgressState {
  return {
    version: CURRENT_VERSION,
    profile: {
      displayName: 'Cyber Explorer',
      avatarId: 'avatar-shield',
      onboarded: false,
      createdAt: new Date().toISOString(),
    },
    xp: 0,
    streakCount: 1,
    lastActiveDate: getTodayDateString(),
    completedNodes: [],
    awardedActivities: [],
    unlockedAchievements: {},
    labProgress: createInitialLabProgress(),
    dailyMissionCompletedDate: null,
    activityHistory: [],
  };
}

/**
 * Capstone-level local persistence layer using browser localStorage.
 * Structured cleanly so a future backend or Firebase Firestore sync can replace
 * loadProgress / saveProgress without altering UI or simulation logic.
 */
export function loadProgress(): StudentProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultProgressState();
    }
    const parsed = JSON.parse(raw) as Partial<StudentProgressState>;
    const defaults = createDefaultProgressState();
    const initialLabs = createInitialLabProgress();

    return {
      ...defaults,
      ...parsed,
      profile: {
        ...defaults.profile,
        ...(parsed.profile ?? {}),
      },
      labProgress: {
        'lab-1': { ...initialLabs['lab-1'], ...(parsed.labProgress?.['lab-1'] ?? {}) },
        'lab-2': { ...initialLabs['lab-2'], ...(parsed.labProgress?.['lab-2'] ?? {}) },
        'lab-3': { ...initialLabs['lab-3'], ...(parsed.labProgress?.['lab-3'] ?? {}) },
        'lab-4': {
          ...initialLabs['lab-4'],
          ...(parsed.labProgress?.['lab-4'] ?? {}),
          linuxPermissions: {
            ...initialLabs['lab-4'].linuxPermissions,
            ...(parsed.labProgress?.['lab-4']?.linuxPermissions ?? {}),
          },
        },
        'lab-5': {
          ...initialLabs['lab-5'],
          ...(parsed.labProgress?.['lab-5'] ?? {}),
          assessmentDraft: {
            ...initialLabs['lab-5'].assessmentDraft!,
            ...(parsed.labProgress?.['lab-5']?.assessmentDraft ?? {}),
            findings: {
              ...initialLabs['lab-5'].assessmentDraft!.findings,
              ...(parsed.labProgress?.['lab-5']?.assessmentDraft?.findings ?? {}),
            },
          },
        },
      },
      completedNodes: Array.isArray(parsed.completedNodes) ? parsed.completedNodes : [],
      awardedActivities: Array.isArray(parsed.awardedActivities) ? parsed.awardedActivities : [],
      unlockedAchievements: parsed.unlockedAchievements ?? {},
      activityHistory: Array.isArray(parsed.activityHistory) ? parsed.activityHistory : [],
    };
  } catch {
    return createDefaultProgressState();
  }
}

export function saveProgress(state: StudentProgressState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully in constrained browsers
  }
}

export function resetAllProgress(): StudentProgressState {
  const fresh = createDefaultProgressState();
  fresh.profile.onboarded = true;
  saveProgress(fresh);
  return fresh;
}
