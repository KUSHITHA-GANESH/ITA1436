import { useEffect, useState } from 'react';
import { ACHIEVEMENTS, evaluateUnlockedAchievements } from './data/achievements';
import { getNodeById } from './data/curriculum';
import { LABS } from './data/labsData';
import {
  createInitialLabProgress,
  loadProgress,
  resetAllProgress,
  saveProgress,
} from './services/storageService';
import {
  AssessmentReportDraft,
  ByteContext,
  LabId,
  NavSection,
  StudentProgressState,
} from './types/cyberquest';
import { computeUpdatedStreak, getLevelInfo, getTodayDateString } from './utils/gamification';
import { BytePanel } from './components/byte/BytePanel';
import { RewardBannerEvent, RewardToast } from './components/gamification/RewardToast';
import { AppShell } from './components/layout/AppShell';
import { OnboardingModal } from './components/profile/OnboardingModal';
import { AcademyPage } from './pages/AcademyPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LabsPage } from './pages/LabsPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const [progress, setProgress] = useState<StudentProgressState>(() => loadProgress());
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('u1-lesson-1');
  const [activeLabId, setActiveLabId] = useState<LabId | null>(null);
  const [toast, setToast] = useState<RewardBannerEvent | null>(null);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4800);
    return () => clearTimeout(timer);
  }, [toast]);

  const showRewardToast = (event: Omit<RewardBannerEvent, 'id'>) => {
    setToast({ ...event, id: Date.now() });
  };

  /**
   * Central state updater that applies streak updates, prevents duplicate XP awards,
   * evaluates newly unlocked achievements, and detects level-ups.
   */
  const commitProgressUpdate = (
    updater: (prev: StudentProgressState) => {
      nextState: StudentProgressState;
      xpGained: number;
      toastTitle?: string;
      toastSubtitle?: string;
    }
  ) => {
    setProgress((prev) => {
      const prevLevel = getLevelInfo(prev.xp).level;
      const { nextState, xpGained, toastTitle, toastSubtitle } = updater(prev);

      // Update streak if activity happened today
      const streakUpdate = computeUpdatedStreak(
        nextState.lastActiveDate,
        nextState.streakCount
      );

      let workingState: StudentProgressState = {
        ...nextState,
        streakCount: streakUpdate.streakCount,
        lastActiveDate: streakUpdate.lastActiveDate,
      };

      // Evaluate automatic achievements
      const newBadgeIds = evaluateUnlockedAchievements(workingState);
      let badgeXp = 0;
      const nowIso = new Date().toISOString();

      if (newBadgeIds.length > 0) {
        const updatedUnlocked = { ...workingState.unlockedAchievements };
        const extraHistory = [...workingState.activityHistory];

        for (const badgeId of newBadgeIds) {
          const def = ACHIEVEMENTS.find((a) => a.id === badgeId);
          if (def && !updatedUnlocked[badgeId]) {
            updatedUnlocked[badgeId] = nowIso;
            badgeXp += def.xpReward;
            extraHistory.unshift({
              id: `ach-${badgeId}-${Date.now()}`,
              timestamp: nowIso,
              title: `Unlocked Badge: ${def.title}`,
              category: 'achievement',
              xpEarned: def.xpReward,
            });
          }
        }

        workingState = {
          ...workingState,
          xp: workingState.xp + badgeXp,
          unlockedAchievements: updatedUnlocked,
          activityHistory: extraHistory.slice(0, 50),
        };
      }

      const newLevelInfo = getLevelInfo(workingState.xp);
      const totalAdded = xpGained + badgeXp;

      if (newLevelInfo.level > prevLevel) {
        showRewardToast({
          type: 'level-up',
          title: `Level Up! Level ${newLevelInfo.level}`,
          subtitle: `You reached ${newLevelInfo.title}`,
          xpEarned: totalAdded || undefined,
        });
      } else if (newBadgeIds.length > 0) {
        const firstBadge = ACHIEVEMENTS.find((a) => a.id === newBadgeIds[0]);
        showRewardToast({
          type: 'achievement',
          title: `Badge Unlocked: ${firstBadge?.title ?? 'Achievement'}`,
          subtitle: firstBadge?.description ?? 'Milestone reached!',
          xpEarned: totalAdded || undefined,
        });
      } else if (toastTitle && xpGained > 0) {
        showRewardToast({
          type: 'xp',
          title: toastTitle,
          subtitle: toastSubtitle ?? 'Progress saved to your Academy profile.',
          xpEarned: xpGained,
        });
      }

      return workingState;
    });
  };

  const handleCompleteNode = (nodeId: string) => {
    const node = getNodeById(nodeId);
    if (!node) return;

    commitProgressUpdate((prev) => {
      const awardKey = `node:${nodeId}`;
      const alreadyCompleted = prev.completedNodes.includes(nodeId);
      const alreadyAwarded = prev.awardedActivities.includes(awardKey);

      if (alreadyCompleted && alreadyAwarded) {
        return { nextState: prev, xpGained: 0 };
      }

      const xpGained = alreadyAwarded ? 0 : node.xpReward;
      const nowIso = new Date().toISOString();

      const nextState: StudentProgressState = {
        ...prev,
        xp: prev.xp + xpGained,
        completedNodes: alreadyCompleted
          ? prev.completedNodes
          : [...prev.completedNodes, nodeId],
        awardedActivities: alreadyAwarded
          ? prev.awardedActivities
          : [...prev.awardedActivities, awardKey],
        activityHistory:
          xpGained > 0
            ? [
                {
                  id: `hist-${nodeId}-${Date.now()}`,
                  timestamp: nowIso,
                  title: `Completed ${node.title}`,
                  category: node.type,
                  xpEarned: xpGained,
                },
                ...prev.activityHistory,
              ].slice(0, 50)
            : prev.activityHistory,
      };

      return {
        nextState,
        xpGained,
        toastTitle: `${node.title} Complete`,
        toastSubtitle: 'Next node unlocked on your Learning Path!',
      };
    });
  };

  const handleCompleteLabTask = (labId: LabId, taskId: string) => {
    const lab = LABS[labId];
    const task = lab?.tasks.find((t) => t.id === taskId);
    if (!lab || !task) return;

    commitProgressUpdate((prev) => {
      const labState = prev.labProgress[labId];
      const alreadyTaskDone = labState.completedTasks.includes(taskId);
      const taskAwardKey = `lab-task:${labId}:${taskId}`;
      const alreadyAwardedTask = prev.awardedActivities.includes(taskAwardKey);

      if (alreadyTaskDone && alreadyAwardedTask) {
        return { nextState: prev, xpGained: 0 };
      }

      const updatedTasks = alreadyTaskDone
        ? labState.completedTasks
        : [...labState.completedTasks, taskId];
      const allTasksDone = lab.tasks.every((t) => updatedTasks.includes(t.id));

      let xpGained = alreadyAwardedTask ? 0 : task.xpReward;
      const nextAwarded = alreadyAwardedTask
        ? [...prev.awardedActivities]
        : [...prev.awardedActivities, taskAwardKey];

      const nowIso = new Date().toISOString();
      const historyAdditions = [];

      if (!alreadyAwardedTask) {
        historyAdditions.push({
          id: `hist-${taskId}-${Date.now()}`,
          timestamp: nowIso,
          title: `${lab.number}: ${task.title}`,
          category: 'lab' as const,
          xpEarned: task.xpReward,
        });
      }

      // Check Mission Lab completion bonus + no-hint bonus + sync Learning Path node
      let nextCompletedNodes = [...prev.completedNodes];
      let noHintBonusClaimed = labState.noHintBonusClaimed ?? false;

      if (allTasksDone) {
        const missionAwardKey = `lab-complete:${labId}`;
        if (!nextAwarded.includes(missionAwardKey)) {
          nextAwarded.push(missionAwardKey);
          xpGained += lab.xpBonus;
          historyAdditions.unshift({
            id: `hist-${labId}-complete-${Date.now()}`,
            timestamp: nowIso,
            title: `Completed ${lab.missionName}`,
            category: 'lab' as const,
            xpEarned: lab.xpBonus,
          });
        }

        const usedHints = Object.values(labState.hintsRevealed || {}).some((tier) => tier > 0);
        const noHintAwardKey = `lab-nohint:${labId}`;
        if (!usedHints && !nextAwarded.includes(noHintAwardKey)) {
          nextAwarded.push(noHintAwardKey);
          noHintBonusClaimed = true;
          xpGained += 25;
        }

        // Sync corresponding Learning Path lab node (u1-lab .. u5-lab)
        const unitNum = labId.split('-')[1];
        const pathLabNodeId = `u${unitNum}-lab`;
        if (!nextCompletedNodes.includes(pathLabNodeId)) {
          nextCompletedNodes.push(pathLabNodeId);
        }
      }

      const nextState: StudentProgressState = {
        ...prev,
        xp: prev.xp + xpGained,
        completedNodes: nextCompletedNodes,
        awardedActivities: nextAwarded,
        labProgress: {
          ...prev.labProgress,
          [labId]: {
            ...labState,
            completedTasks: updatedTasks,
            completed: allTasksDone || labState.completed,
            completedAt: allTasksDone && !labState.completedAt ? nowIso : labState.completedAt,
            noHintBonusClaimed,
          },
        },
        activityHistory: [...historyAdditions, ...prev.activityHistory].slice(0, 50),
      };

      return {
        nextState,
        xpGained,
        toastTitle: allTasksDone ? `${lab.missionName} Complete!` : `Task Complete: ${task.title}`,
        toastSubtitle: allTasksDone
          ? 'Unit checkpoint unlocked on your Learning Path.'
          : `${updatedTasks.length}/${lab.tasks.length} lab objectives finished.`,
      };
    });
  };

  const handleRevealHint = (labId: LabId, taskId: string, tier: number) => {
    commitProgressUpdate((prev) => {
      const labState = prev.labProgress[labId];
      const currentTier = labState.hintsRevealed[taskId] ?? 0;
      if (tier <= currentTier) return { nextState: prev, xpGained: 0 };

      return {
        nextState: {
          ...prev,
          labProgress: {
            ...prev.labProgress,
            [labId]: {
              ...labState,
              hintsRevealed: {
                ...labState.hintsRevealed,
                [taskId]: tier,
              },
            },
          },
        },
        xpGained: 0,
      };
    });
  };

  const handleResetLab = (labId: LabId) => {
    setProgress((prev) => {
      const defaults = createInitialLabProgress()[labId];
      return {
        ...prev,
        labProgress: {
          ...prev.labProgress,
          [labId]: {
            ...defaults,
            // Preserve permanent completion badge while resetting interactive workspace
            completed: prev.labProgress[labId].completed,
            completedAt: prev.labProgress[labId].completedAt,
            noHintBonusClaimed: prev.labProgress[labId].noHintBonusClaimed,
          },
        },
      };
    });
  };

  const handleSaveObservation = (labId: LabId, key: string, value: string | boolean) => {
    setProgress((prev) => ({
      ...prev,
      labProgress: {
        ...prev.labProgress,
        [labId]: {
          ...prev.labProgress[labId],
          observations: {
            ...(prev.labProgress[labId].observations ?? {}),
            [key]: value,
          },
        },
      },
    }));
  };

  const handleUpdateLinuxPerm = (path: string, mode: string) => {
    setProgress((prev) => ({
      ...prev,
      labProgress: {
        ...prev.labProgress,
        'lab-4': {
          ...prev.labProgress['lab-4'],
          linuxPermissions: {
            ...(prev.labProgress['lab-4'].linuxPermissions ?? {}),
            [path]: mode,
          },
        },
      },
    }));
  };

  const handleUpdateAssessmentDraft = (draft: AssessmentReportDraft) => {
    setProgress((prev) => ({
      ...prev,
      labProgress: {
        ...prev.labProgress,
        'lab-5': {
          ...prev.labProgress['lab-5'],
          assessmentDraft: draft,
        },
      },
    }));
  };

  const handleCompleteDailyMission = (xpReward: number) => {
    const today = getTodayDateString();
    commitProgressUpdate((prev) => {
      if (prev.dailyMissionCompletedDate === today) {
        return { nextState: prev, xpGained: 0 };
      }
      return {
        nextState: {
          ...prev,
          xp: prev.xp + xpReward,
          dailyMissionCompletedDate: today,
          activityHistory: [
            {
              id: `daily-${today}`,
              timestamp: new Date().toISOString(),
              title: 'Completed Daily Mission',
              category: 'daily' as const,
              xpEarned: xpReward,
            },
            ...prev.activityHistory,
          ].slice(0, 50),
        },
        xpGained: xpReward,
        toastTitle: 'Daily Mission Complete',
        toastSubtitle: 'Your daily cybersecurity streak continues!',
      };
    });
  };

  const handleOpenNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setActiveSection('academy');
  };

  const handleOpenLab = (labId: LabId) => {
    setActiveLabId(labId);
    setActiveSection('labs');
  };

  const byteContext: ByteContext = {
    section: activeSection,
    unitId:
      activeSection === 'academy'
        ? getNodeById(selectedNodeId)?.unitId
        : activeSection === 'labs' && activeLabId
        ? LABS[activeLabId]?.unitId
        : undefined,
    nodeId: activeSection === 'academy' ? selectedNodeId : undefined,
    labId: activeSection === 'labs' && activeLabId ? activeLabId : undefined,
  };

  return (
    <>
      {!progress.profile.onboarded && (
        <OnboardingModal
          initialName={progress.profile.displayName}
          initialAvatarId={progress.profile.avatarId}
          onComplete={(displayName, avatarId, startFirstLesson) => {
            setProgress((prev) => ({
              ...prev,
              profile: {
                ...prev.profile,
                displayName,
                avatarId,
                onboarded: true,
              },
            }));
            if (startFirstLesson) {
              setSelectedNodeId('u1-lesson-1');
              setActiveSection('academy');
            }
          }}
        />
      )}

      <RewardToast event={toast} onDismiss={() => setToast(null)} />

      <AppShell
        activeSection={activeSection}
        onNavigate={(sec) => {
          setActiveSection(sec);
          if (sec !== 'labs') {
            setActiveLabId(null);
          }
        }}
        progress={progress}
      >
        {activeSection === 'dashboard' && (
          <DashboardPage
            progress={progress}
            onNavigate={setActiveSection}
            onOpenNode={handleOpenNode}
            onOpenLab={handleOpenLab}
            onCompleteDailyMission={handleCompleteDailyMission}
          />
        )}

        {activeSection === 'learning-path' && (
          <LearningPathPage
            progress={progress}
            onOpenNode={handleOpenNode}
            onOpenLab={handleOpenLab}
          />
        )}

        {activeSection === 'academy' && (
          <AcademyPage
            progress={progress}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onCompleteNode={handleCompleteNode}
            onOpenLab={handleOpenLab}
          />
        )}

        {activeSection === 'labs' && (
          <LabsPage
            progress={progress}
            activeLabId={activeLabId}
            onSelectLab={setActiveLabId}
            onCompleteTask={handleCompleteLabTask}
            onRevealHint={handleRevealHint}
            onResetLab={handleResetLab}
            onSaveObservation={handleSaveObservation}
            onUpdateLinuxPerm={handleUpdateLinuxPerm}
            onUpdateAssessmentDraft={handleUpdateAssessmentDraft}
          />
        )}

        {activeSection === 'achievements' && <AchievementsPage progress={progress} />}

        {activeSection === 'profile' && (
          <ProfilePage
            progress={progress}
            onUpdateProfile={(displayName, avatarId) =>
              setProgress((prev) => ({
                ...prev,
                profile: { ...prev.profile, displayName, avatarId },
              }))
            }
            onResetAll={() => {
              const fresh = resetAllProgress();
              setProgress(fresh);
              setActiveLabId(null);
              setSelectedNodeId('u1-lesson-1');
              showRewardToast({
                type: 'xp',
                title: 'Progress Reset',
                subtitle: 'Your CyberQuest academy profile has been reset to a fresh start.',
              });
            }}
          />
        )}
      </AppShell>

      {/* Floating Byte Companion on non-inline pages */}
      {activeSection !== 'academy' && !(activeSection === 'labs' && activeLabId) && (
        <BytePanel context={byteContext} progress={progress} variant="floating" />
      )}
    </>
  );
}
