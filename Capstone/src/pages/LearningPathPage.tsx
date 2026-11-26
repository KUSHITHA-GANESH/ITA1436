import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Compass,
  Flag,
  Lock,
  Play,
  Sparkles,
  Terminal,
} from 'lucide-react';
import {
  CURRICULUM_UNITS,
  getNextRecommendedNode,
  isNodeUnlocked,
} from '../data/curriculum';
import { LabId, LearningNode, StudentProgressState } from '../types/cyberquest';
import { ByteAvatar } from '../components/byte/ByteAvatar';

interface LearningPathPageProps {
  progress: StudentProgressState;
  onOpenNode: (nodeId: string) => void;
  onOpenLab: (labId: LabId) => void;
}

export const LearningPathPage: React.FC<LearningPathPageProps> = ({
  progress,
  onOpenNode,
  onOpenLab,
}) => {
  const recommended = getNextRecommendedNode(progress.completedNodes);

  const getNodeIcon = (node: LearningNode, unlocked: boolean, completed: boolean) => {
    if (completed) return <CheckCircle2 className="w-5 h-5 text-[#19B5A5]" />;
    if (!unlocked) return <Lock className="w-4 h-4 text-[#9BAEC3]/60" />;
    switch (node.type) {
      case 'lesson':
        return <BookOpen className="w-4 h-4 text-white" />;
      case 'activity':
        return <Sparkles className="w-4 h-4 text-white" />;
      case 'practice':
        return <Compass className="w-4 h-4 text-white" />;
      case 'lab':
        return <Terminal className="w-4 h-4 text-white" />;
      case 'checkpoint':
        return <Flag className="w-4 h-4 text-[#071426]" />;
    }
  };

  const getNodeTypeLabel = (type: LearningNode['type']) => {
    switch (type) {
      case 'lesson':
        return 'Lesson';
      case 'activity':
        return 'Interactive Drill';
      case 'practice':
        return 'Practice Challenge';
      case 'lab':
        return 'Mission Lab';
      case 'checkpoint':
        return 'Unit Milestone';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#19B5A5]">
            CyberQuest Progression Journey
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#EAF2FA] mt-1">
            Cybersecurity Learning Path
          </h1>
          <p className="text-sm text-[#9BAEC3] mt-1 max-w-2xl">
            Progress node by node through five structured units. Complete lessons, interactive drills, and Mission Labs to unlock checkpoints and new units.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (recommended.type === 'lab' && recommended.labId) {
              onOpenLab(recommended.labId);
            } else {
              onOpenNode(recommended.id);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Jump to Current Node</span>
        </button>
      </div>

      {/* Winding Vertical Progression Path */}
      <div className="space-y-10">
        {CURRICULUM_UNITS.map((unit) => {
          const completedInUnit = unit.nodes.filter((n) =>
            progress.completedNodes.includes(n.id)
          ).length;
          const unitPercent = Math.round((completedInUnit / unit.nodes.length) * 100);
          const unitDone = completedInUnit === unit.nodes.length;

          return (
            <section
              key={unit.id}
              className="rounded-2xl border border-[#102B46] bg-[#0B1C30] overflow-hidden"
            >
              {/* Unit Banner Header */}
              <div className="p-5 sm:p-6 bg-[#102B46]/45 border-b border-[#102B46] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#19B5A5]">{unit.number}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#9BAEC3]">{unit.subtitle}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#EAF2FA]">{unit.title}</h2>
                  <p className="text-xs text-[#9BAEC3] max-w-2xl">{unit.description}</p>
                </div>

                <div className="sm:w-52 shrink-0 space-y-1.5">
                  <div className="flex justify-between text-xs tabular-nums">
                    <span className="text-[#9BAEC3]">Unit Mastery</span>
                    <span className="font-semibold text-[#19B5A5]">
                      {completedInUnit}/{unit.nodes.length} ({unitPercent}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#071426] overflow-hidden">
                    <div
                      className="h-full bg-[#19B5A5] transition-all duration-300"
                      style={{ width: `${unitPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Connected Winding Nodes */}
              <div className="p-5 sm:p-8 relative">
                <div className="max-w-3xl mx-auto space-y-5 relative">
                  {unit.nodes.map((node, idx) => {
                    const completed = progress.completedNodes.includes(node.id);
                    const unlocked = isNodeUnlocked(node.id, progress.completedNodes);
                    const isCurrent = recommended.id === node.id;

                    // Subtle winding stagger on desktop/tablet while clean vertical on mobile
                    const offsetClass =
                      idx % 4 === 1
                        ? 'sm:translate-x-8'
                        : idx % 4 === 3
                        ? 'sm:-translate-x-8'
                        : '';

                    return (
                      <div key={node.id} className="relative">
                        {/* Vertical Connector Line */}
                        {idx < unit.nodes.length - 1 && (
                          <div
                            aria-hidden="true"
                            className={`hidden sm:block absolute left-1/2 -translate-x-1/2 top-full h-5 w-0.5 ${
                              completed ? 'bg-[#19B5A5]/60' : 'bg-[#102B46]'
                            }`}
                          />
                        )}

                        <div className={`transition-transform ${offsetClass}`}>
                          <button
                            type="button"
                            disabled={!unlocked}
                            onClick={() => {
                              if (!unlocked) return;
                              if (node.type === 'lab' && node.labId) {
                                onOpenLab(node.labId);
                              } else {
                                onOpenNode(node.id);
                              }
                            }}
                            className={`w-full text-left rounded-2xl border p-4 transition-all flex items-center gap-4 ${
                              completed
                                ? 'bg-[#19B5A5]/10 border-[#19B5A5]/45 hover:border-[#19B5A5] cursor-pointer'
                                : isCurrent
                                ? 'bg-[#2463EB]/15 border-[#2463EB] shadow-lg shadow-[#2463EB]/15 cursor-pointer'
                                : unlocked
                                ? 'bg-[#071426] border-[#2463EB]/40 hover:border-[#2463EB] cursor-pointer'
                                : 'bg-[#071426]/60 border-[#102B46] opacity-60 cursor-not-allowed'
                            }`}
                          >
                            {/* Circular Node Badge */}
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                                completed
                                  ? 'bg-[#19B5A5]/20 border-[#19B5A5]'
                                  : isCurrent
                                  ? 'bg-[#2463EB] border-[#38BDF8]'
                                  : unlocked && node.type === 'checkpoint'
                                  ? 'bg-[#E5B84B] border-[#E5B84B]'
                                  : unlocked
                                  ? 'bg-[#102B46] border-[#2463EB]'
                                  : 'bg-[#0B1C30] border-[#102B46]'
                              }`}
                            >
                              {getNodeIcon(node, unlocked, completed)}
                            </div>

                            {/* Node Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span
                                  className={`font-semibold ${
                                    completed
                                      ? 'text-[#19B5A5]'
                                      : isCurrent
                                      ? 'text-[#38BDF8]'
                                      : 'text-[#9BAEC3]'
                                  }`}
                                >
                                  {getNodeTypeLabel(node.type)}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#9BAEC3] tabular-nums">
                                  {node.estimatedMinutes} min
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#E5B84B] font-semibold tabular-nums">
                                  +{node.xpReward} XP
                                </span>
                              </div>

                              <div className="text-sm sm:text-base font-bold text-[#EAF2FA] mt-0.5 truncate">
                                {node.title}
                              </div>
                              <div className="text-xs text-[#9BAEC3] truncate">{node.subtitle}</div>
                            </div>

                            {/* Right Action State */}
                            <div className="shrink-0 flex items-center gap-2">
                              {isCurrent && (
                                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#38BDF8]">
                                  <span>Current</span>
                                  <Play className="w-3.5 h-3.5" />
                                </span>
                              )}
                              {completed && (
                                <span className="text-xs font-semibold text-[#19B5A5]">Done</span>
                              )}
                              {!unlocked && (
                                <span className="text-xs text-[#9BAEC3]">Locked</span>
                              )}
                            </div>
                          </button>

                          {/* Byte Milestone Companion Appearance on Checkpoint */}
                          {node.type === 'checkpoint' && (
                            <div className="mt-3 rounded-xl bg-[#071426] border border-[#102B46] p-3.5 flex items-center gap-3.5">
                              <ByteAvatar
                                mood={unitDone ? 'mission-complete' : isCurrent ? 'excited' : 'idle'}
                                size="xs"
                              />
                              <p className="text-xs text-[#9BAEC3] leading-relaxed">
                                {unitDone
                                  ? node.byteMilestoneNote || 'Unit milestone achieved!'
                                  : isCurrent
                                  ? 'Byte: You reached the unit checkpoint! Claim your milestone reward to unlock the next unit.'
                                  : `Byte: Complete the lessons, drill, and ${unit.number} Mission Lab to reach this milestone.`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
