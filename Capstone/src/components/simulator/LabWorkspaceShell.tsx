import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  ShieldAlert,
  Trophy,
} from 'lucide-react';
import {
  ByteContext,
  ByteMood,
  LabDefinition,
  LabId,
  LabProgressState,
  StudentProgressState,
} from '../../types/cyberquest';
import { getProgressiveHintText } from '../../services/byteEngine';
import { ByteAvatar } from '../byte/ByteAvatar';
import { BytePanel } from '../byte/BytePanel';

interface LabWorkspaceShellProps {
  lab: LabDefinition;
  labState: LabProgressState;
  progress: StudentProgressState;
  onBack: () => void;
  onRevealHint: (labId: LabId, taskId: string, tier: number) => void;
  onResetLab: (labId: LabId) => void;
  byteEvent: { message: string; mood: ByteMood; id: number } | null;
  children: React.ReactNode;
}

export const LabWorkspaceShell: React.FC<LabWorkspaceShellProps> = ({
  lab,
  labState,
  progress,
  onBack,
  onRevealHint,
  onResetLab,
  byteEvent,
  children,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [selectedHintTaskId, setSelectedHintTaskId] = useState<string>(() => {
    const firstPending = lab.tasks.find((t) => !labState.completedTasks.includes(t.id));
    return firstPending?.id ?? lab.tasks[0].id;
  });

  const completedCount = labState.completedTasks.length;
  const totalTasks = lab.tasks.length;
  const percent = Math.round((completedCount / totalTasks) * 100);

  const activeTask =
    lab.tasks.find((t) => t.id === selectedHintTaskId) ??
    lab.tasks.find((t) => !labState.completedTasks.includes(t.id)) ??
    lab.tasks[0];

  const revealedTier = labState.hintsRevealed[activeTask.id] ?? 0;

  const byteContext: ByteContext = {
    section: 'labs',
    unitId: lab.unitId,
    labId: lab.id,
    activeTaskId: activeTask.id,
  };

  return (
    <div className="space-y-6">
      {/* Top Mission Header */}
      <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#9BAEC3] hover:text-[#EAF2FA] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Mission Labs</span>
          </button>

          <div className="flex items-center gap-3">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#102B46] bg-[#071426] hover:border-[#9BAEC3]/40 text-xs font-medium text-[#9BAEC3] hover:text-[#EAF2FA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Lab</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#071426] border border-[#E65B6A]/40 rounded-lg px-2.5 py-1">
                <span className="text-xs text-[#E65B6A]">Reset progress?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetLab(lab.id);
                    setConfirmReset(false);
                  }}
                  className="text-xs font-semibold text-white bg-[#E65B6A] hover:bg-[#dc4858] px-2 py-0.5 rounded cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="text-xs text-[#9BAEC3] hover:text-[#EAF2FA] px-1.5 py-0.5 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9BAEC3]">
              <span className="font-semibold text-[#19B5A5]">{lab.number}</span>
              <span aria-hidden="true">·</span>
              <span>{lab.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span>Simulated Training Environment</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#EAF2FA]">{lab.targetName} ({lab.targetAddress})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#EAF2FA] tracking-tight">
              {lab.missionName}
            </h1>
            <p className="text-sm text-[#9BAEC3] max-w-3xl leading-relaxed">{lab.story}</p>
          </div>

          <div className="lg:w-64 shrink-0 rounded-xl bg-[#071426] border border-[#102B46] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9BAEC3]">Mission Progress</span>
              <span className="font-semibold text-[#19B5A5] tabular-nums">
                {completedCount}/{totalTasks} Tasks
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#102B46] overflow-hidden">
              <div
                className="h-full bg-[#19B5A5] transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-1 text-[#9BAEC3]">
              <span>Completion Bonus</span>
              <span className="font-semibold text-[#E5B84B] tabular-nums">+{lab.xpBonus} XP</span>
            </div>
          </div>
        </div>

        {/* Safety / Sandbox Transparency Banner */}
        <div className="flex items-start gap-2.5 rounded-lg bg-[#071426] border border-[#102B46] px-3.5 py-2.5 text-xs text-[#9BAEC3]">
          <ShieldAlert className="w-4 h-4 text-[#2463EB] shrink-0 mt-0.5" />
          <span>
            Controlled Simulation: All targets, packets, web requests, and terminal filesystems in this lab are strictly simulated inside CyberQuest. No real networks or operating systems are modified.
          </span>
        </div>
      </div>

      {/* Mission Completion Celebration Banner */}
      {labState.completed && (
        <div className="rounded-xl border border-[#19B5A5]/50 bg-[#0B1C30] p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
          <ByteAvatar mood="mission-complete" size="md" />
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#19B5A5]">
              <Trophy className="w-4 h-4 text-[#E5B84B]" />
              <span>Mission Accomplished — {lab.missionName}</span>
            </div>
            <p className="text-sm text-[#EAF2FA]">
              All objectives verified and saved to your student record.
              {labState.noHintBonusClaimed
                ? ' You also earned the +25 XP Sharp Instincts no-hint bonus!'
                : ' You can keep exploring this environment or move on to your next unit.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-[#19B5A5] hover:bg-[#159a8c] text-[#071426] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Continue Journey
          </button>
        </div>
      )}

      {/* Main Responsive Lab Grid: Interactive Workspace + Tasks & Hints */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Interactive Environment Stage */}
        <div className="xl:col-span-8 space-y-5 min-w-0">
          {children}
          <BytePanel
            context={byteContext}
            progress={progress}
            overrideEvent={byteEvent}
            variant="inline"
          />
        </div>

        {/* Right Sidebar: Task Checklist & Progressive Hints */}
        <div className="xl:col-span-4 space-y-5">
          {/* Task Checklist */}
          <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#EAF2FA]">Mission Checklist</h2>
              <span className="text-xs text-[#9BAEC3] tabular-nums">{percent}%</span>
            </div>
            <div className="space-y-2">
              {lab.tasks.map((task, idx) => {
                const done = labState.completedTasks.includes(task.id);
                const isSelected = activeTask.id === task.id;
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setSelectedHintTaskId(task.id)}
                    className={`w-full text-left rounded-lg p-3 border transition-colors cursor-pointer ${
                      done
                        ? 'bg-[#19B5A5]/10 border-[#19B5A5]/35'
                        : isSelected
                        ? 'bg-[#102B46] border-[#2463EB]/60'
                        : 'bg-[#071426] border-[#102B46] hover:border-[#2463EB]/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-[#19B5A5] shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#9BAEC3] shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              done ? 'text-[#19B5A5]' : 'text-[#EAF2FA]'
                            }`}
                          >
                            {idx + 1}. {task.title}
                          </span>
                          <span className="text-[11px] font-medium text-[#E5B84B] tabular-nums shrink-0">
                            +{task.xpReward} XP
                          </span>
                        </div>
                        <p className="text-xs text-[#9BAEC3] mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progressive Hint System */}
          <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#E5B84B]" />
                <h2 className="text-base font-semibold text-[#EAF2FA]">Byte’s Progressive Hints</h2>
              </div>
              <span className="text-[11px] text-[#9BAEC3] tabular-nums">{revealedTier}/4 used</span>
            </div>

            <div className="text-xs text-[#9BAEC3]">
              Selected task: <span className="font-semibold text-[#EAF2FA]">{activeTask.title}</span>
            </div>

            {/* Revealed Hints List */}
            {revealedTier > 0 ? (
              <div className="space-y-2">
                {[1, 2, 3, 4]
                  .filter((tier) => tier <= revealedTier)
                  .map((tier) => {
                    const hintObj = getProgressiveHintText(lab.id, activeTask.id, tier);
                    if (!hintObj) return null;
                    return (
                      <div
                        key={tier}
                        className="rounded-lg bg-[#071426] border border-[#E5B84B]/25 p-3 space-y-1"
                      >
                        <div className="text-[11px] font-semibold text-[#E5B84B]">
                          {hintObj.label}
                        </div>
                        <p className="text-xs text-[#EAF2FA] leading-relaxed">{hintObj.text}</p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3 text-xs text-[#9BAEC3] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#2463EB] shrink-0 mt-0.5" />
                <span>
                  Need a nudge? Reveal hints gradually without losing base XP. Solving without hints earns a +25 XP bonus!
                </span>
              </div>
            )}

            {revealedTier < 4 && (
              <button
                type="button"
                onClick={() => onRevealHint(lab.id, activeTask.id, revealedTier + 1)}
                className="w-full py-2 px-4 rounded-lg bg-[#102B46] hover:bg-[#2463EB]/30 border border-[#2463EB]/40 text-xs font-semibold text-[#EAF2FA] transition-colors cursor-pointer"
              >
                {revealedTier === 0
                  ? 'Reveal Hint 1 (Conceptual Clue)'
                  : revealedTier === 1
                  ? 'Reveal Hint 2 (Direction / Tool)'
                  : revealedTier === 2
                  ? 'Reveal Hint 3 (Specific Guidance)'
                  : 'Reveal Full Explanation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
