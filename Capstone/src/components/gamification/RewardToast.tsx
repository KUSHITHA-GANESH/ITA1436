import React from 'react';
import { Award, Sparkles, TrendingUp, X } from 'lucide-react';
import { ByteAvatar } from '../byte/ByteAvatar';

export interface RewardBannerEvent {
  id: number;
  title: string;
  subtitle: string;
  xpEarned?: number;
  type: 'xp' | 'achievement' | 'level-up';
}

interface RewardToastProps {
  event: RewardBannerEvent | null;
  onDismiss: () => void;
}

export const RewardToast: React.FC<RewardToastProps> = ({ event, onDismiss }) => {
  if (!event) return null;

  const borderClass =
    event.type === 'level-up'
      ? 'border-[#E5B84B]'
      : event.type === 'achievement'
      ? 'border-[#7C5CFC]'
      : 'border-[#19B5A5]';

  const icon =
    event.type === 'level-up' ? (
      <TrendingUp className="w-4 h-4 text-[#E5B84B]" />
    ) : event.type === 'achievement' ? (
      <Award className="w-4 h-4 text-[#7C5CFC]" />
    ) : (
      <Sparkles className="w-4 h-4 text-[#19B5A5]" />
    );

  return (
    <div
      role="status"
      aria-live="polite"
      className={`no-print fixed top-16 right-4 z-50 max-w-sm rounded-2xl bg-[#0B1C30] border ${borderClass} p-3.5 shadow-2xl shadow-black/50 flex items-center gap-3`}
    >
      <ByteAvatar
        mood={event.type === 'level-up' ? 'mission-complete' : 'excited'}
        size="xs"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#EAF2FA]">
          {icon}
          <span className="truncate">{event.title}</span>
          {event.xpEarned ? (
            <span className="text-[#E5B84B] tabular-nums ml-auto shrink-0">
              +{event.xpEarned} XP
            </span>
          ) : null}
        </div>
        <p className="text-xs text-[#9BAEC3] mt-0.5 line-clamp-2">{event.subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1 rounded text-[#9BAEC3] hover:text-[#EAF2FA] cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
