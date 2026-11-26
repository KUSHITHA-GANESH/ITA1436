import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, CornerDownLeft, Trash2 } from 'lucide-react';

export interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'success' | 'warning' | 'error' | 'info';
  text: string;
}

export interface CommandDocItem {
  cmd: string;
  desc: string;
}

interface TerminalEngineProps {
  promptLabel: string;
  lines: TerminalLine[];
  onExecuteCommand: (command: string) => void;
  onClear: () => void;
  quickCommands?: string[];
  commandReference?: CommandDocItem[];
  placeholder?: string;
}

export const TerminalEngine: React.FC<TerminalEngineProps> = ({
  promptLabel,
  lines,
  onExecuteCommand,
  onClear,
  quickCommands = [],
  commandReference = [],
  placeholder = 'Type a command and press Enter (e.g. help)',
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showRef, setShowRef] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const submitCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setHistory((prev) => [...prev.slice(-30), trimmed]);
    setHistoryIndex(-1);
    setInput('');
    onExecuteCommand(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(history[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex >= history.length - 1) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    }
  };

  return (
    <div className="rounded-xl border border-[#102B46] bg-[#040D1A] overflow-hidden flex flex-col">
      {/* Terminal Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0B1C30] border-b border-[#102B46]">
        <div className="flex items-center gap-2 text-xs text-[#9BAEC3]">
          <span className="font-mono font-semibold text-[#EAF2FA]">Simulated Terminal</span>
          <span aria-hidden="true">·</span>
          <span>Controlled Sandbox</span>
        </div>
        <div className="flex items-center gap-2">
          {commandReference.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRef((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showRef
                  ? 'bg-[#2463EB] text-white'
                  : 'bg-[#102B46] text-[#EAF2FA] hover:bg-[#102B46]/80'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Command Reference</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#102B46] hover:bg-[#102B46]/80 text-[#9BAEC3] hover:text-[#EAF2FA] text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Collapsible Command Reference */}
      {showRef && commandReference.length > 0 && (
        <div className="bg-[#071426] border-b border-[#102B46] px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {commandReference.map((item) => (
              <button
                key={item.cmd}
                type="button"
                onClick={() => {
                  setInput(item.cmd);
                  inputRef.current?.focus();
                }}
                className="text-left p-2 rounded-lg bg-[#0B1C30] hover:bg-[#102B46] border border-[#102B46] transition-colors cursor-pointer"
              >
                <div className="font-mono text-xs font-semibold text-[#19B5A5]">{item.cmd}</div>
                <div className="text-[11px] text-[#9BAEC3] mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable Output Buffer */}
      <div
        ref={outputRef}
        onClick={() => inputRef.current?.focus()}
        className="h-72 sm:h-80 overflow-y-auto cq-scroll p-4 font-mono text-xs sm:text-[13px] leading-relaxed space-y-1.5 cursor-text"
      >
        {lines.map((line) => {
          const colorClass =
            line.type === 'command'
              ? 'text-[#EAF2FA] font-semibold'
              : line.type === 'success'
              ? 'text-[#19B5A5]'
              : line.type === 'warning'
              ? 'text-[#E5B84B]'
              : line.type === 'error'
              ? 'text-[#E65B6A]'
              : line.type === 'info'
              ? 'text-[#38BDF8]'
              : 'text-[#CBD5E1]';

          return (
            <pre
              key={line.id}
              className={`whitespace-pre-wrap break-words font-mono ${colorClass}`}
            >
              {line.text}
            </pre>
          );
        })}
      </div>

      {/* Quick Command Helpers for Mobile & Guided Execution */}
      {quickCommands.length > 0 && (
        <div className="px-4 py-2 bg-[#071426] border-t border-[#102B46] flex items-center gap-2 overflow-x-auto cq-scroll">
          <span className="text-[11px] text-[#9BAEC3] whitespace-nowrap shrink-0">Quick insert:</span>
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => {
                setInput(cmd);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-md bg-[#0B1C30] hover:bg-[#102B46] border border-[#102B46] font-mono text-[11px] text-[#EAF2FA] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Command Prompt Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitCommand(input);
        }}
        className="flex items-center gap-2 px-4 py-3 bg-[#071426] border-t border-[#102B46]"
      >
        <span className="font-mono text-xs sm:text-[13px] font-semibold text-[#19B5A5] whitespace-nowrap shrink-0">
          {promptLabel}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          aria-label="Simulated terminal command input"
          className="flex-1 min-w-0 bg-transparent font-mono text-xs sm:text-[13px] text-[#EAF2FA] placeholder:text-[#9BAEC3]/50 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Run</span>
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
