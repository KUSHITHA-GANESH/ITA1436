import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, Send, Sparkles } from 'lucide-react';
import { ByteContext, ByteMood, StudentProgressState } from '../../types/cyberquest';
import {
  generateByteResponse,
  getContextualGreeting,
  getSuggestedQuestions,
} from '../../services/byteEngine';
import { ByteAvatar } from './ByteAvatar';

interface BytePanelProps {
  context: ByteContext;
  progress: StudentProgressState;
  overrideEvent?: { message: string; mood: ByteMood; id: number } | null;
  defaultExpanded?: boolean;
  variant?: 'floating' | 'inline';
}

interface ChatEntry {
  id: string;
  sender: 'byte' | 'student';
  text: string;
}

export const BytePanel: React.FC<BytePanelProps> = ({
  context,
  progress,
  overrideEvent,
  defaultExpanded = false,
  variant = 'floating',
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [mood, setMood] = useState<ByteMood>('idle');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [suggested, setSuggested] = useState<string[]>(() => getSuggestedQuestions(context));

  useEffect(() => {
    const greeting = getContextualGreeting(context, progress);
    setMood(greeting.mood);
    setSuggested(getSuggestedQuestions(context));
    setMessages([
      {
        id: `greet-${context.section}-${context.labId ?? ''}-${context.nodeId ?? ''}`,
        sender: 'byte',
        text: greeting.message,
      },
    ]);
  }, [context.section, context.labId, context.nodeId, context.unitId]);

  useEffect(() => {
    if (!overrideEvent) return;
    setMood(overrideEvent.mood);
    setMessages((prev) => [
      ...prev.slice(-6),
      {
        id: `evt-${overrideEvent.id}`,
        sender: 'byte',
        text: overrideEvent.message,
      },
    ]);
  }, [overrideEvent]);

  const handleAsk = (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    const reply = generateByteResponse(trimmed, context, progress);
    setMood(reply.mood);
    if (reply.suggestedFollowUps && reply.suggestedFollowUps.length > 0) {
      setSuggested(reply.suggestedFollowUps);
    }

    setMessages((prev) => [
      ...prev.slice(-8),
      { id: `u-${Date.now()}`, sender: 'student', text: trimmed },
      { id: `b-${Date.now() + 1}`, sender: 'byte', text: reply.text },
    ]);
    setInputValue('');
  };

  const latestByteMsg = [...messages].reverse().find((m) => m.sender === 'byte')?.text ?? '';

  if (variant === 'inline') {
    return (
      <section
        aria-label="Byte Companion Guidance"
        className="rounded-xl border border-[#2463EB]/30 bg-[#0B1C30] p-4 sm:p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-[#071426] border border-[#102B46] p-2">
              <ByteAvatar mood={mood} size="sm" />
            </div>
            <div className="sm:hidden">
              <div className="text-sm font-semibold text-[#EAF2FA]">Byte</div>
              <div className="text-xs text-[#9BAEC3]">Academy Companion</div>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#9BAEC3]">
                <span className="font-semibold text-[#EAF2FA] text-sm">Byte</span>
                <span aria-hidden="true">·</span>
                <span>Contextual Security Companion</span>
              </div>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#19B5A5] hover:text-[#EAF2FA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{expanded ? 'Hide Q&A' : 'Ask Byte'}</span>
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-sm leading-relaxed text-[#EAF2FA]">{latestByteMsg}</p>

            {expanded && (
              <div className="pt-3 border-t border-[#102B46] space-y-3">
                {messages.length > 1 && (
                  <div className="max-h-48 overflow-y-auto cq-scroll space-y-2 pr-1">
                    {messages.slice(-5).map((m) => (
                      <div
                        key={m.id}
                        className={`text-xs leading-relaxed rounded-lg px-3 py-2 ${
                          m.sender === 'student'
                            ? 'bg-[#2463EB]/20 text-[#EAF2FA] ml-6 border border-[#2463EB]/30'
                            : 'bg-[#071426] text-[#9BAEC3] mr-4 border border-[#102B46]'
                        }`}
                      >
                        <span className="font-semibold text-[#EAF2FA] mr-1.5">
                          {m.sender === 'student' ? 'You:' : 'Byte:'}
                        </span>
                        {m.text}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {suggested.slice(0, 3).map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleAsk(prompt)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-[#102B46] hover:bg-[#2463EB]/30 text-[#EAF2FA] border border-[#2463EB]/25 transition-colors text-left cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAsk(inputValue);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask Byte about commands, outputs, or this task..."
                    className="flex-1 min-w-0 rounded-lg bg-[#071426] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3 py-2 text-xs text-[#EAF2FA] placeholder:text-[#9BAEC3]/60"
                  />
                  <button
                    type="submit"
                    aria-label="Send question to Byte"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Floating collapsible corner assistant (respects mobile viewport & never blocks lab controls)
  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] sm:w-96 no-print">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="group flex items-center gap-3 rounded-2xl bg-[#0B1C30] border border-[#2463EB]/45 hover:border-[#19B5A5] px-3.5 py-2.5 shadow-xl shadow-black/40 transition-all cursor-pointer"
        >
          <ByteAvatar mood={mood} size="xs" />
          <div className="text-left min-w-0 pr-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#EAF2FA]">
              <span>Byte</span>
              <Sparkles className="w-3 h-3 text-[#19B5A5]" />
            </div>
            <div className="text-xs text-[#9BAEC3] truncate max-w-[190px] sm:max-w-[220px]">
              {latestByteMsg}
            </div>
          </div>
          <ChevronUp className="w-4 h-4 text-[#9BAEC3] group-hover:text-[#EAF2FA] shrink-0" />
        </button>
      ) : (
        <div className="rounded-2xl bg-[#0B1C30] border border-[#2463EB]/50 shadow-2xl shadow-black/60 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#102B46]/80 border-b border-[#102B46]">
            <div className="flex items-center gap-2.5">
              <ByteAvatar mood={mood} size="xs" />
              <div>
                <div className="text-sm font-semibold text-[#EAF2FA]">Byte</div>
                <div className="text-[11px] text-[#9BAEC3]">CyberQuest Guide</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Collapse Byte companion"
              className="p-1.5 rounded-lg text-[#9BAEC3] hover:text-[#EAF2FA] hover:bg-[#071426] transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 space-y-3">
            <div className="max-h-52 overflow-y-auto cq-scroll space-y-2 pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`text-xs leading-relaxed rounded-xl px-3 py-2 ${
                    m.sender === 'student'
                      ? 'bg-[#2463EB]/25 text-[#EAF2FA] ml-6 border border-[#2463EB]/30'
                      : 'bg-[#071426] text-[#EAF2FA] mr-2 border border-[#102B46]'
                  }`}
                >
                  {m.sender === 'byte' && (
                    <span className="font-semibold text-[#19B5A5] mr-1.5">Byte:</span>
                  )}
                  {m.text}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {suggested.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleAsk(prompt)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#102B46] hover:bg-[#2463EB]/30 text-[#EAF2FA] border border-[#2463EB]/25 transition-colors text-left cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(inputValue);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Byte a question..."
                className="flex-1 min-w-0 rounded-lg bg-[#071426] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3 py-2 text-xs text-[#EAF2FA] placeholder:text-[#9BAEC3]/60"
              />
              <button
                type="submit"
                aria-label="Send question"
                className="inline-flex items-center justify-center p-2 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
