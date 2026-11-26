import React, { useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { KnowledgeCheckItem } from '../../types/cyberquest';

interface KnowledgeCheckWidgetProps {
  item: KnowledgeCheckItem;
  onSuccess: () => void;
  onMistake?: () => void;
  completed?: boolean;
}

export const KnowledgeCheckWidget: React.FC<KnowledgeCheckWidgetProps> = ({
  item,
  onSuccess,
  onMistake,
  completed = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [orderList, setOrderList] = useState<{ id: string; label: string }[]>(() => {
    if (!item.steps) return [];
    // Start slightly shuffled deterministically so user actually orders them
    return [...item.steps].reverse();
  });
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>(
    completed ? 'correct' : 'idle'
  );
  const [feedback, setFeedback] = useState<string>(completed ? item.explanation : '');

  const moveStep = (index: number, dir: -1 | 1) => {
    const nextIdx = index + dir;
    if (nextIdx < 0 || nextIdx >= orderList.length) return;
    const copy = [...orderList];
    const [removed] = copy.splice(index, 1);
    copy.splice(nextIdx, 0, removed);
    setOrderList(copy);
    setStatus('idle');
  };

  const handleCheck = () => {
    if (item.type === 'identify' || item.type === 'scenario') {
      if (!selectedOption) return;
      const opt = item.options?.find((o) => o.id === selectedOption);
      if (selectedOption === item.correctOptionId) {
        setStatus('correct');
        setFeedback(opt?.feedback || item.explanation);
        onSuccess();
      } else {
        setStatus('wrong');
        setFeedback(opt?.feedback || 'Review the lesson concept above and try again.');
        onMistake?.();
      }
      return;
    }

    if (item.type === 'order' && item.correctOrder) {
      const userOrder = orderList.map((s) => s.id);
      const matches = userOrder.every((id, idx) => id === item.correctOrder![idx]);
      if (matches) {
        setStatus('correct');
        setFeedback(item.explanation);
        onSuccess();
      } else {
        setStatus('wrong');
        setFeedback('The sequence is not quite right yet. Adjust the step order and check again!');
        onMistake?.();
      }
      return;
    }

    if (item.type === 'match' && item.pairs) {
      const allAnswered = item.pairs.every((p) => Boolean(matchSelections[p.id]));
      if (!allAnswered) return;
      const allCorrect = item.pairs.every((p) => matchSelections[p.id] === p.right);
      if (allCorrect) {
        setStatus('correct');
        setFeedback(item.explanation);
        onSuccess();
      } else {
        setStatus('wrong');
        setFeedback('One or more pairs do not match. Re-check each term and try again.');
        onMistake?.();
      }
    }
  };

  const resetCheck = () => {
    setSelectedOption('');
    setMatchSelections({});
    if (item.steps) setOrderList([...item.steps].reverse());
    setStatus('idle');
    setFeedback('');
  };

  return (
    <div className="rounded-xl border border-[#2463EB]/30 bg-[#071426] p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-[#19B5A5]">
            Interactive Knowledge Check
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-[#EAF2FA] mt-0.5">
            {item.prompt}
          </h4>
        </div>
        {status !== 'idle' && (
          <button
            type="button"
            onClick={resetCheck}
            className="text-xs text-[#9BAEC3] hover:text-[#EAF2FA] inline-flex items-center gap-1 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
      </div>

      {(item.type === 'identify' || item.type === 'scenario') && item.options && (
        <div className="space-y-2">
          {item.options.map((opt) => {
            const active = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelectedOption(opt.id);
                  setStatus('idle');
                }}
                className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-xs sm:text-sm transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#2463EB]/20 border-[#2463EB] text-[#EAF2FA]'
                    : 'bg-[#0B1C30] border-[#102B46] text-[#CBD5E1] hover:border-[#2463EB]/50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {item.type === 'order' && (
        <div className="space-y-2">
          {orderList.map((step, idx) => (
            <div
              key={step.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-[#0B1C30] border border-[#102B46] px-3.5 py-2.5 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-xs font-bold text-[#19B5A5] shrink-0">
                  {idx + 1}.
                </span>
                <span className="text-[#EAF2FA]">{step.label}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveStep(idx, -1)}
                  disabled={idx === 0}
                  aria-label="Move step up"
                  className="p-1.5 rounded bg-[#071426] border border-[#102B46] text-[#9BAEC3] hover:text-[#EAF2FA] disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(idx, 1)}
                  disabled={idx === orderList.length - 1}
                  aria-label="Move step down"
                  className="p-1.5 rounded bg-[#071426] border border-[#102B46] text-[#9BAEC3] hover:text-[#EAF2FA] disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {item.type === 'match' && item.pairs && (
        <div className="space-y-2.5">
          {item.pairs.map((pair) => (
            <div
              key={pair.id}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center rounded-lg bg-[#0B1C30] border border-[#102B46] p-3"
            >
              <div className="font-mono text-xs font-semibold text-[#EAF2FA]">{pair.left}</div>
              <select
                value={matchSelections[pair.id] ?? ''}
                onChange={(e) => {
                  setMatchSelections((prev) => ({ ...prev, [pair.id]: e.target.value }));
                  setStatus('idle');
                }}
                aria-label={`Match for ${pair.left}`}
                className="w-full rounded-lg bg-[#071426] border border-[#102B46] px-2.5 py-1.5 text-xs text-[#EAF2FA]"
              >
                <option value="">Select matching meaning...</option>
                {item.pairs!.map((choice) => (
                  <option key={choice.id} value={choice.right}>
                    {choice.right}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {feedback && (
        <div
          className={`rounded-lg p-3 text-xs flex items-start gap-2 ${
            status === 'correct'
              ? 'bg-[#19B5A5]/10 border border-[#19B5A5]/35 text-[#19B5A5]'
              : 'bg-[#E65B6A]/10 border border-[#E65B6A]/35 text-[#E65B6A]'
          }`}
        >
          {status === 'correct' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{feedback}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCheck}
          className="px-4 py-2 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Check Answer
        </button>
      </div>
    </div>
  );
};
