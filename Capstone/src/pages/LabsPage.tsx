import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, Shield, Terminal } from 'lucide-react';
import { LABS } from '../data/labsData';
import { ByteMood, LabId, AssessmentReportDraft, StudentProgressState } from '../types/cyberquest';
import { LabWorkspaceShell } from '../components/simulator/LabWorkspaceShell';
import { Lab1Recon } from '../components/labs/Lab1Recon';
import { Lab2WebApp } from '../components/labs/Lab2WebApp';
import { Lab3Network } from '../components/labs/Lab3Network';
import { Lab4Linux } from '../components/labs/Lab4Linux';
import { Lab5Assessment } from '../components/labs/Lab5Assessment';

interface LabsPageProps {
  progress: StudentProgressState;
  activeLabId: LabId | null;
  onSelectLab: (labId: LabId | null) => void;
  onCompleteTask: (labId: LabId, taskId: string) => void;
  onRevealHint: (labId: LabId, taskId: string, tier: number) => void;
  onResetLab: (labId: LabId) => void;
  onSaveObservation: (labId: LabId, key: string, value: string | boolean) => void;
  onUpdateLinuxPerm: (path: string, mode: string) => void;
  onUpdateAssessmentDraft: (draft: AssessmentReportDraft) => void;
}

export const LabsPage: React.FC<LabsPageProps> = ({
  progress,
  activeLabId,
  onSelectLab,
  onCompleteTask,
  onRevealHint,
  onResetLab,
  onSaveObservation,
  onUpdateLinuxPerm,
  onUpdateAssessmentDraft,
}) => {
  const [byteEvent, setByteEvent] = useState<{ message: string; mood: ByteMood; id: number } | null>(
    null
  );
  const [resetCounter, setResetCounter] = useState(0);

  const handleByteReact = (message: string, mood: ByteMood) => {
    setByteEvent({ message, mood, id: Date.now() });
  };

  const handleTaskWithByte = (
    labId: LabId,
    taskId: string,
    byteMessage?: string,
    mood: ByteMood = 'happy'
  ) => {
    onCompleteTask(labId, taskId);
    if (byteMessage) {
      handleByteReact(byteMessage, mood);
    }
  };

  if (activeLabId && LABS[activeLabId]) {
    const lab = LABS[activeLabId];
    const labState = progress.labProgress[activeLabId];

    return (
      <LabWorkspaceShell
        lab={lab}
        labState={labState}
        progress={progress}
        onBack={() => onSelectLab(null)}
        onRevealHint={(lid, tid, tier) => {
          onRevealHint(lid, tid, tier);
          handleByteReact(
            `Hint ${tier} unlocked! Take your time and apply it in the workspace.`,
            'hint'
          );
        }}
        onResetLab={(lid) => {
          onResetLab(lid);
          setResetCounter((c) => c + 1);
          handleByteReact('Lab environment reset to clean baseline.', 'idle');
        }}
        byteEvent={byteEvent}
      >
        {activeLabId === 'lab-1' && (
          <Lab1Recon
            key={`lab-1-${resetCounter}`}
            labState={labState}
            onCompleteTask={handleTaskWithByte}
            onSaveObservation={onSaveObservation}
            onByteReact={handleByteReact}
          />
        )}
        {activeLabId === 'lab-2' && (
          <Lab2WebApp
            key={`lab-2-${resetCounter}`}
            labState={labState}
            onCompleteTask={handleTaskWithByte}
            onByteReact={handleByteReact}
          />
        )}
        {activeLabId === 'lab-3' && (
          <Lab3Network
            key={`lab-3-${resetCounter}`}
            labState={labState}
            onCompleteTask={handleTaskWithByte}
            onSaveObservation={onSaveObservation}
            onByteReact={handleByteReact}
          />
        )}
        {activeLabId === 'lab-4' && (
          <Lab4Linux
            key={`lab-4-${resetCounter}`}
            labState={labState}
            onCompleteTask={handleTaskWithByte}
            onUpdateLinuxPerm={onUpdateLinuxPerm}
            onByteReact={handleByteReact}
          />
        )}
        {activeLabId === 'lab-5' && (
          <Lab5Assessment
            key={`lab-5-${resetCounter}`}
            labState={labState}
            studentName={progress.profile.displayName}
            onUpdateDraft={onUpdateAssessmentDraft}
            onCompleteTask={handleTaskWithByte}
            onByteReact={handleByteReact}
          />
        )}
      </LabWorkspaceShell>
    );
  }

  // Mission Labs Overview Directory
  const labList = Object.values(LABS);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-[#19B5A5]">
          Controlled Simulated Training Environments
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#EAF2FA]">Mission Labs</h1>
        <p className="text-sm text-[#9BAEC3] max-w-2xl">
          Apply your Academy knowledge inside five interactive cybersecurity sandboxes. All commands, mock apps, packet captures, and filesystems run safely inside CyberQuest.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {labList.map((lab) => {
          const labState = progress.labProgress[lab.id];
          const doneTasks = labState.completedTasks.length;
          const totalTasks = lab.tasks.length;
          const pct = Math.round((doneTasks / totalTasks) * 100);

          return (
            <div
              key={lab.id}
              className="rounded-2xl border border-[#102B46] bg-[#0B1C30] p-5 sm:p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs text-[#9BAEC3]">
                  <span>
                    <strong className="text-[#38BDF8]">{lab.number}</strong> · {lab.difficulty}
                  </span>
                  {labState.completed ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#19B5A5]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lab.estimatedMinutes} min</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-[#EAF2FA]">{lab.missionName}</h2>
                <div className="text-xs font-medium text-[#19B5A5]">{lab.title}</div>
                <p className="text-xs text-[#9BAEC3] leading-relaxed">{lab.story}</p>

                <div className="flex items-center gap-2 text-xs font-mono text-[#EAF2FA] pt-1">
                  <Shield className="w-3.5 h-3.5 text-[#2463EB]" />
                  <span>
                    Target: {lab.targetName} ({lab.targetAddress})
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#102B46]">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs tabular-nums">
                    <span className="text-[#9BAEC3]">
                      Tasks: {doneTasks}/{totalTasks}
                    </span>
                    <span className="text-[#E5B84B] font-semibold">+{lab.xpBonus} XP Bonus</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#071426] overflow-hidden">
                    <div
                      className="h-full bg-[#19B5A5] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectLab(lab.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Terminal className="w-4 h-4" />
                  <span>
                    {labState.completed
                      ? 'Review Simulation'
                      : doneTasks > 0
                      ? 'Resume Mission Lab'
                      : 'Launch Mission Lab'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
