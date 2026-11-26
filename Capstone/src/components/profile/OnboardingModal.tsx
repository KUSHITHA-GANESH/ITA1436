import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ByteAvatar } from '../byte/ByteAvatar';
import { AVATAR_OPTIONS, StudentAvatar } from './StudentAvatar';

interface OnboardingModalProps {
  initialName: string;
  initialAvatarId: string;
  onComplete: (displayName: string, avatarId: string, startFirstLesson: boolean) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialName,
  initialAvatarId,
  onComplete,
}) => {
  const [name, setName] = useState(initialName || 'Cyber Explorer');
  const [avatarId, setAvatarId] = useState(initialAvatarId || 'avatar-shield');

  return (
    <div className="fixed inset-0 z-50 bg-[#040B16]/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-[#2463EB]/40 bg-[#0B1C30] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="rounded-2xl bg-[#071426] border border-[#102B46] p-3 shrink-0">
            <ByteAvatar mood="welcome" size="lg" />
          </div>
          <div className="text-center sm:text-left space-y-2">
            <div className="text-xs font-semibold text-[#19B5A5]">
              Welcome to CyberQuest Academy
            </div>
            <h2 className="text-2xl font-bold text-[#EAF2FA] text-balance">
              Hi! I’m Byte, your cybersecurity companion.
            </h2>
            <p className="text-sm text-[#9BAEC3] leading-relaxed">
              Together we’ll progress through five interactive skill paths, practice inside safe simulated labs, earn XP, and unlock badges.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {[
            '5 Structured Skill Paths',
            '5 Interactive Simulated Labs',
            'Local Saved Progress & XP',
          ].map((item) => (
            <div
              key={item}
              className="rounded-lg bg-[#071426] border border-[#102B46] px-3 py-2.5 flex items-center gap-2 text-[#EAF2FA]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#19B5A5] shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="onboard-name" className="block text-xs font-semibold text-[#9BAEC3]">
              Choose your Academy Display Name
            </label>
            <input
              id="onboard-name"
              type="text"
              maxLength={28}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cyber Explorer"
              className="w-full rounded-lg bg-[#071426] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3.5 py-2.5 text-sm text-[#EAF2FA]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#9BAEC3]">Select Emblem Avatar</div>
            <div className="flex flex-wrap gap-2.5">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAvatarId(opt.id)}
                  aria-label={opt.label}
                  className={`p-1 rounded-xl border-2 transition-all cursor-pointer ${
                    avatarId === opt.id
                      ? 'border-[#19B5A5] bg-[#102B46]'
                      : 'border-transparent hover:border-[#2463EB]/40'
                  }`}
                >
                  <StudentAvatar avatarId={opt.id} size="md" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onComplete(name.trim() || 'Cyber Explorer', avatarId, false)}
            className="px-4 py-2.5 rounded-lg border border-[#102B46] bg-[#071426] hover:bg-[#102B46] text-xs font-semibold text-[#EAF2FA] transition-colors cursor-pointer"
          >
            Enter Mission Hub
          </button>
          <button
            type="button"
            onClick={() => onComplete(name.trim() || 'Cyber Explorer', avatarId, true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Start Lesson 1 with Byte</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
