import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flag,
  Lock,
  Terminal,
} from 'lucide-react';
import {
  ALL_NODES,
  CURRICULUM_UNITS,
  getNodeById,
  getUnitById,
  isNodeUnlocked,
} from '../data/curriculum';
import { ByteMood, LabId, LearningNode, StudentProgressState } from '../types/cyberquest';
import { ByteAvatar } from '../components/byte/ByteAvatar';
import { BytePanel } from '../components/byte/BytePanel';
import { InteractiveActivityRunner } from '../components/learning/InteractiveActivities';
import { KnowledgeCheckWidget } from '../components/learning/KnowledgeCheckWidget';
import { LessonDiagram } from '../components/learning/LessonDiagrams';

interface AcademyPageProps {
  progress: StudentProgressState;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onCompleteNode: (nodeId: string) => void;
  onOpenLab: (labId: LabId) => void;
}

export const AcademyPage: React.FC<AcademyPageProps> = ({
  progress,
  selectedNodeId,
  onSelectNode,
  onCompleteNode,
  onOpenLab,
}) => {
  const activeNode: LearningNode = getNodeById(selectedNodeId) ?? CURRICULUM_UNITS[0].nodes[0];
  const activeUnit = getUnitById(activeNode.unitId) ?? CURRICULUM_UNITS[0];

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [practiceCleared, setPracticeCleared] = useState<Record<string, boolean>>({});
  const [byteEvent, setByteEvent] = useState<{ message: string; mood: ByteMood; id: number } | null>(null);

  useEffect(() => {
    setExpandedCards({});
    setPracticeCleared({});
  }, [activeNode.id]);

  const isCompleted = progress.completedNodes.includes(activeNode.id);
  const allIndex = ALL_NODES.findIndex((n) => n.id === activeNode.id);
  const nextNode = allIndex >= 0 && allIndex < ALL_NODES.length - 1 ? ALL_NODES[allIndex + 1] : null;

  const toggleCard = (term: string) => {
    setExpandedCards((prev) => ({ ...prev, [term]: !prev[term] }));
  };

  const triggerByte = (message: string, mood: ByteMood) => {
    setByteEvent({ message, mood, id: Date.now() });
  };

  const handleGoNext = () => {
    if (!nextNode) return;
    if (nextNode.type === 'lab' && nextNode.labId) {
      onOpenLab(nextNode.labId);
    } else {
      onSelectNode(nextNode.id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Sidebar: Unit & Lesson Browser */}
      <aside className="lg:col-span-4 rounded-2xl border border-[#102B46] bg-[#0B1C30] p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#EAF2FA]">
          <BookOpen className="w-4 h-4 text-[#38BDF8]" />
          <span>Academy Curriculum</span>
        </div>

        <div className="space-y-4">
          {CURRICULUM_UNITS.map((unit) => (
            <div key={unit.id} className="space-y-1.5">
              <div className="text-xs font-semibold text-[#19B5A5] px-1">
                {unit.number} · {unit.title}
              </div>
              <div className="space-y-1">
                {unit.nodes.map((node) => {
                  const unlocked = isNodeUnlocked(node.id, progress.completedNodes);
                  const done = progress.completedNodes.includes(node.id);
                  const active = node.id === activeNode.id;

                  return (
                    <button
                      key={node.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => {
                        if (node.type === 'lab' && node.labId) {
                          onOpenLab(node.labId);
                        } else {
                          onSelectNode(node.id);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors ${
                        active
                          ? 'bg-[#2463EB] text-white font-semibold cursor-pointer'
                          : unlocked
                          ? 'bg-[#071426] hover:bg-[#102B46] text-[#EAF2FA] cursor-pointer'
                          : 'bg-[#071426]/50 text-[#9BAEC3]/50 cursor-not-allowed'
                      }`}
                    >
                      <span className="truncate">{node.title}</span>
                      {done ? (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            active ? 'text-white' : 'text-[#19B5A5]'
                          }`}
                        />
                      ) : !unlocked ? (
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                      ) : node.type === 'lab' ? (
                        <Terminal className="w-3.5 h-3.5 shrink-0 text-[#E5B84B]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Viewer */}
      <div className="lg:col-span-8 space-y-5 min-w-0">
        {/* Module Header */}
        <div className="rounded-2xl border border-[#102B46] bg-[#0B1C30] p-5 sm:p-6 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#9BAEC3]">
            <span>
              {activeUnit.number} · {activeUnit.title} · {activeNode.estimatedMinutes} min
            </span>
            <span className="font-semibold text-[#E5B84B] tabular-nums">
              +{activeNode.xpReward} XP
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#EAF2FA]">{activeNode.title}</h1>
          <p className="text-sm text-[#9BAEC3]">{activeNode.subtitle}</p>
        </div>

        {/* Byte Inline Guidance */}
        <BytePanel
          context={{ section: 'academy', unitId: activeUnit.id, nodeId: activeNode.id }}
          progress={progress}
          overrideEvent={byteEvent}
          variant="inline"
        />

        {/* LESSON CONTENT */}
        {activeNode.type === 'lesson' && (
          <div className="space-y-5">
            {activeNode.sections?.map((sec, sIdx) => (
              <section
                key={sIdx}
                className="rounded-2xl border border-[#102B46] bg-[#0B1C30] p-5 sm:p-6 space-y-4"
              >
                <h2 className="text-lg font-bold text-[#EAF2FA]">{sec.heading}</h2>
                <p className="text-sm text-[#CBD5E1] leading-relaxed">{sec.body}</p>

                {sec.diagramType && <LessonDiagram type={sec.diagramType} />}

                {sec.conceptCards && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sec.conceptCards.map((card) => {
                      const open = Boolean(expandedCards[card.term]);
                      return (
                        <button
                          key={card.term}
                          type="button"
                          onClick={() => toggleCard(card.term)}
                          className="text-left rounded-xl bg-[#071426] border border-[#102B46] hover:border-[#2463EB]/50 p-3.5 space-y-1.5 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#38BDF8]">{card.term}</span>
                            {open ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#9BAEC3]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#9BAEC3]" />
                            )}
                          </div>
                          <div className="text-xs text-[#EAF2FA]">{card.summary}</div>
                          {open && (
                            <div className="text-xs text-[#9BAEC3] pt-1.5 border-t border-[#102B46] leading-relaxed">
                              {card.detail}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {sec.commands && (
                  <div className="overflow-x-auto rounded-xl border border-[#102B46] bg-[#040D1A]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#071426] text-[#9BAEC3] border-b border-[#102B46]">
                        <tr>
                          <th className="py-2.5 px-3">Command</th>
                          <th className="py-2.5 px-3">Purpose</th>
                          <th className="py-2.5 px-3">Example</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#102B46]/60">
                        {sec.commands.map((c) => (
                          <tr key={c.command}>
                            <td className="py-2.5 px-3 font-mono text-[#19B5A5] whitespace-nowrap">
                              {c.command}
                            </td>
                            <td className="py-2.5 px-3 text-[#CBD5E1]">{c.purpose}</td>
                            <td className="py-2.5 px-3 font-mono text-[#EAF2FA] whitespace-nowrap">
                              {c.example}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {sec.codeBlock && (
                  <pre className="rounded-xl bg-[#040D1A] border border-[#102B46] p-4 font-mono text-xs text-[#CBD5E1] overflow-x-auto whitespace-pre">
                    {sec.codeBlock}
                  </pre>
                )}
              </section>
            ))}

            {activeNode.knowledgeCheck && (
              <KnowledgeCheckWidget
                item={activeNode.knowledgeCheck}
                completed={isCompleted}
                onSuccess={() => {
                  onCompleteNode(activeNode.id);
                  triggerByte(
                    `Awesome job completing "${activeNode.title}"! Your progress is saved and the next node is unlocked.`,
                    'happy'
                  );
                }}
                onMistake={() =>
                  triggerByte(
                    'Not quite—expand the concept cards above if you want a quick refresher before retrying!',
                    'concerned'
                  )
                }
              />
            )}
          </div>
        )}

        {/* INTERACTIVE ACTIVITY */}
        {activeNode.type === 'activity' && activeNode.activityData && (
          <InteractiveActivityRunner
            activity={activeNode.activityData}
            completed={isCompleted}
            onComplete={() => {
              onCompleteNode(activeNode.id);
              triggerByte(
                'Interactive drill complete! You mastered the core concept hands-on.',
                'excited'
              );
            }}
          />
        )}

        {/* PRACTICE CHALLENGES */}
        {activeNode.type === 'practice' && activeNode.practiceChallenges && (
          <div className="space-y-4">
            {activeNode.practiceChallenges.map((challenge) => (
              <KnowledgeCheckWidget
                key={challenge.id}
                item={challenge}
                completed={isCompleted || Boolean(practiceCleared[challenge.id])}
                onSuccess={() => {
                  const nextMap = { ...practiceCleared, [challenge.id]: true };
                  setPracticeCleared(nextMap);
                  const allDone = activeNode.practiceChallenges!.every((c) => nextMap[c.id]);
                  if (allDone) {
                    onCompleteNode(activeNode.id);
                    triggerByte(
                      'Practice drill complete! You are ready to launch the Mission Lab.',
                      'excited'
                    );
                  } else {
                    triggerByte('Great answer! Complete the remaining drill below.', 'happy');
                  }
                }}
                onMistake={() =>
                  triggerByte('Take another look at the scenario details and give it another try!', 'hint')
                }
              />
            ))}
          </div>
        )}

        {/* CHECKPOINT MILESTONE */}
        {activeNode.type === 'checkpoint' && (
          <div className="rounded-2xl border border-[#E5B84B]/40 bg-[#0B1C30] p-6 text-center space-y-4">
            <div className="flex justify-center">
              <ByteAvatar mood={isCompleted ? 'mission-complete' : 'excited'} size="lg" />
            </div>
            <div className="space-y-1.5 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E5B84B]">
                <Flag className="w-4 h-4" />
                <span>{activeUnit.number} Completion Milestone</span>
              </div>
              <h2 className="text-xl font-bold text-[#EAF2FA]">{activeNode.title}</h2>
              <p className="text-sm text-[#9BAEC3]">
                {activeNode.byteMilestoneNote ??
                  'You have completed all lessons, drills, and the practical Mission Lab for this unit!'}
              </p>
            </div>
            {!isCompleted ? (
              <button
                type="button"
                onClick={() => {
                  onCompleteNode(activeNode.id);
                  triggerByte(
                    `${activeUnit.number} mastered! Next unit unlocked on your Learning Path.`,
                    'mission-complete'
                  );
                }}
                className="px-6 py-2.5 rounded-xl bg-[#E5B84B] hover:bg-[#d6a93c] text-[#071426] text-sm font-bold transition-colors cursor-pointer"
              >
                Claim Milestone (+{activeNode.xpReward} XP)
              </button>
            ) : (
              <div className="text-xs font-semibold text-[#19B5A5]">
                Milestone Claimed & Saved
              </div>
            )}
          </div>
        )}

        {/* Bottom Next Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#9BAEC3]">
            {isCompleted ? 'Completed · XP recorded' : 'Complete the activity above to unlock next node'}
          </div>
          {nextNode && isCompleted && (
            <button
              type="button"
              onClick={handleGoNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#19B5A5] hover:bg-[#159a8c] text-[#071426] text-xs font-bold transition-colors cursor-pointer"
            >
              <span>
                Next: {nextNode.type === 'lab' ? 'Launch Mission Lab' : nextNode.title}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
