import React from 'react';
import { Compass, Cpu, Lock, Radar, Shield, Terminal } from 'lucide-react';

export const AVATAR_OPTIONS = [
  { id: 'avatar-shield', label: 'Defender Shield', bg: 'bg-[#2463EB]/20 border-[#2463EB]/50 text-[#38BDF8]' },
  { id: 'avatar-radar', label: 'Recon Radar', bg: 'bg-[#19B5A5]/20 border-[#19B5A5]/50 text-[#19B5A5]' },
  { id: 'avatar-terminal', label: 'Shell Operator', bg: 'bg-[#7C5CFC]/20 border-[#7C5CFC]/50 text-[#A78BFA]' },
  { id: 'avatar-lock', label: 'Crypto Lock', bg: 'bg-[#E5B84B]/20 border-[#E5B84B]/50 text-[#E5B84B]' },
  { id: 'avatar-cpu', label: 'Packet Core', bg: 'bg-[#2463EB]/20 border-[#19B5A5]/50 text-[#EAF2FA]' },
  { id: 'avatar-compass', label: 'Pathfinder', bg: 'bg-[#102B46] border-[#2463EB]/40 text-[#38BDF8]' },
];

interface StudentAvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({ avatarId, size = 'md' }) => {
  const opt = AVATAR_OPTIONS.find((a) => a.id === avatarId) ?? AVATAR_OPTIONS[0];
  const dims =
    size === 'sm' ? 'w-8 h-8 rounded-lg' : size === 'lg' ? 'w-16 h-16 rounded-2xl' : 'w-10 h-10 rounded-xl';
  const iconCls = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';

  const renderIcon = () => {
    switch (avatarId) {
      case 'avatar-radar':
        return <Radar className={iconCls} />;
      case 'avatar-terminal':
        return <Terminal className={iconCls} />;
      case 'avatar-lock':
        return <Lock className={iconCls} />;
      case 'avatar-cpu':
        return <Cpu className={iconCls} />;
      case 'avatar-compass':
        return <Compass className={iconCls} />;
      default:
        return <Shield className={iconCls} />;
    }
  };

  return (
    <div className={`inline-flex items-center justify-center border shrink-0 ${dims} ${opt.bg}`}>
      {renderIcon()}
    </div>
  );
};
