import React, { useState } from 'react';
import { FolderTree, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ByteMood, LabId, LabProgressState } from '../../types/cyberquest';
import { TerminalEngine, TerminalLine } from '../simulator/TerminalEngine';

interface Lab4LinuxProps {
  labState: LabProgressState;
  onCompleteTask: (labId: LabId, taskId: string, byteMessage?: string, mood?: ByteMood) => void;
  onUpdateLinuxPerm: (path: string, mode: string) => void;
  onByteReact: (message: string, mood: ByteMood) => void;
}

interface VirtualNode {
  type: 'dir' | 'file';
  owner: string;
  group: string;
  defaultMode: string;
  content?: string;
}

const BASE_FS: Record<string, VirtualNode> = {
  '/': { type: 'dir', owner: 'root', group: 'root', defaultMode: '755' },
  '/home': { type: 'dir', owner: 'root', group: 'root', defaultMode: '755' },
  '/home/student': { type: 'dir', owner: 'student', group: 'student', defaultMode: '750' },
  '/home/student/notes.txt': {
    type: 'file',
    owner: 'student',
    group: 'student',
    defaultMode: '644',
    content:
      'Shift Handover Notes:\n- Check /opt/CQ for backup configuration permissions.\n- Inspect /var/logs/auth.log for repeated SSH login failures.',
  },
  '/etc': { type: 'dir', owner: 'root', group: 'root', defaultMode: '755' },
  '/etc/ssh': { type: 'dir', owner: 'root', group: 'root', defaultMode: '755' },
  '/etc/ssh/sshd_config': {
    type: 'file',
    owner: 'root',
    group: 'root',
    defaultMode: '644',
    content:
      '# Simulated OpenSSH Server Config\nPort 22\nPermitRootLogin no\nPasswordAuthentication yes\nMaxAuthTries 4',
  },
  '/etc/passwd': {
    type: 'file',
    owner: 'root',
    group: 'root',
    defaultMode: '644',
    content:
      'root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000:CyberQuest Student:/home/student:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
  },
  '/var': { type: 'dir', owner: 'root', group: 'root', defaultMode: '755' },
  '/var/logs': { type: 'dir', owner: 'root', group: 'adm', defaultMode: '755' },
  '/var/logs/auth.log': {
    type: 'file',
    owner: 'root',
    group: 'adm',
    defaultMode: '640',
    content: `Nov 20 14:12:04 cq-linux-node01 sshd[1842]: Failed password for invalid user admin from 192.168.56.200 port 51204 ssh2
Nov 20 14:12:08 cq-linux-node01 sshd[1842]: Failed password for root from 192.168.56.200 port 51204 ssh2
Nov 20 14:12:11 cq-linux-node01 sshd[1842]: Failed password for root from 192.168.56.200 port 51204 ssh2
Nov 20 14:15:30 cq-linux-node01 sshd[1904]: Accepted key for student from 192.168.56.10 port 54012 ssh2`,
  },
  '/opt': { type: 'dir', owner: 'root', group: 'root', defaultMode: '755' },
  '/opt/CQ': { type: 'dir', owner: 'student', group: 'student', defaultMode: '755' },
  '/opt/CQ/db_backup.conf': {
    type: 'file',
    owner: 'student',
    group: 'student',
    defaultMode: '777',
    content: `# CQ Backup Configuration (SENSITIVE)
DB_HOST=127.0.0.1
DB_USER=cq_backup_svc
DB_PASSWORD=Sim_Backup_Key_9941!
RETENTION_DAYS=14`,
  },
  '/opt/CQ/deploy.sh': {
    type: 'file',
    owner: 'student',
    group: 'student',
    defaultMode: '750',
    content: `#!/bin/bash\n# Simulated deployment script\necho "Deploying CQ-Portal service..."`,
  },
};

function modeToSymbolic(mode: string, isDir: boolean): string {
  const digitMap: Record<string, string> = {
    '0': '---',
    '1': '--x',
    '2': '-w-',
    '3': '-wx',
    '4': 'r--',
    '5': 'r-x',
    '6': 'rw-',
    '7': 'rwx',
  };
  const padded = mode.padStart(3, '0').slice(-3);
  return `${isDir ? 'd' : '-'}${padded
    .split('')
    .map((d) => digitMap[d] ?? '---')
    .join('')}`;
}

function resolveVirtualPath(cwd: string, target: string): string {
  if (!target || target === '~') return '/home/student';
  const rawParts = target.startsWith('/')
    ? target.split('/')
    : `${cwd}/${target}`.split('/');

  const stack: string[] = [];
  for (const part of rawParts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return '/' + stack.join('/');
}

export const Lab4Linux: React.FC<Lab4LinuxProps> = ({
  labState,
  onCompleteTask,
  onUpdateLinuxPerm,
  onByteReact,
}) => {
  const [cwd, setCwd] = useState<string>('/home/student');
  const [customDirs, setCustomDirs] = useState<Record<string, VirtualNode>>({});
  const [seenWhoami, setSeenWhoami] = useState(false);
  const [seenPwd, setSeenPwd] = useState(false);
  const [readConfig, setReadConfig] = useState(false);
  const [readAuthLog, setReadAuthLog] = useState(false);

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'l4-init-1',
      type: 'info',
      text: 'Simulated Linux Shell · Host: cq-linux-node01 · Type "help" to view available commands.',
    },
  ]);

  const fsMap: Record<string, VirtualNode> = { ...BASE_FS, ...customDirs };

  const getPerm = (path: string): string => {
    return labState.linuxPermissions?.[path] ?? fsMap[path]?.defaultMode ?? '644';
  };

  const appendLines = (newLines: Omit<TerminalLine, 'id'>[]) => {
    setLines((prev) => [
      ...prev,
      ...newLines.map((l, idx) => ({ ...l, id: `${Date.now()}-${idx}-${Math.random()}` })),
    ]);
  };

  const listChildren = (dirPath: string): string[] => {
    const prefix = dirPath === '/' ? '/' : `${dirPath}/`;
    return Object.keys(fsMap)
      .filter((p) => {
        if (p === dirPath || !p.startsWith(prefix)) return false;
        const remainder = p.slice(prefix.length);
        return !remainder.includes('/');
      })
      .sort();
  };

  const handleCommand = (raw: string) => {
    const trimmed = raw.trim();
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0]?.toLowerCase() ?? '';
    const args = parts.slice(1);

    appendLines([{ type: 'command', text: `student@cq-linux:${cwd}$ ${trimmed}` }]);

    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    if (cmd === 'help') {
      appendLines([
        {
          type: 'info',
          text: `Supported Simulated Linux Commands:
  whoami                  Display current username
  id                      Show user & group IDs
  pwd                     Print current working directory
  ls [-la] [path]         List directory contents & permissions
  cd <path>               Change current directory (supports .. and ~)
  cat <file>              Read contents of a file
  mkdir <dir>             Create a simulated directory
  chmod <mode> <file>     Update octal permissions (e.g. chmod 600 db_backup.conf)
  clear                   Clear terminal buffer`,
        },
      ]);
      return;
    }

    if (cmd === 'whoami') {
      setSeenWhoami(true);
      appendLines([{ type: 'output', text: 'student' }]);
      if (seenPwd) {
        onCompleteTask(
          'lab-4',
          'l4-task-1',
          'You confirmed you are `student` inside `/home/student`. Next, explore `/opt/CQ` with `cd` and `ls -la`!',
          'happy'
        );
      } else {
        onByteReact('Nice! Now run `pwd` to confirm your current directory path.', 'explaining');
      }
      return;
    }

    if (cmd === 'id') {
      appendLines([{ type: 'output', text: 'uid=1000(student) gid=1000(student) groups=1000(student)' }]);
      return;
    }

    if (cmd === 'pwd') {
      setSeenPwd(true);
      appendLines([{ type: 'output', text: cwd }]);
      if (seenWhoami) {
        onCompleteTask(
          'lab-4',
          'l4-task-1',
          'Identity and location verified! Now navigate to `/opt/CQ` and inspect permissions with `ls -la`.',
          'happy'
        );
      } else {
        onByteReact('Great! Also run `whoami` to verify your account privileges.', 'explaining');
      }
      return;
    }

    if (cmd === 'cd') {
      const targetArg = args[0] ?? '/home/student';
      const resolved = resolveVirtualPath(cwd, targetArg);
      const node = fsMap[resolved];
      if (!node) {
        appendLines([{ type: 'error', text: `cd: ${targetArg}: No such file or directory` }]);
        return;
      }
      if (node.type !== 'dir') {
        appendLines([{ type: 'error', text: `cd: ${targetArg}: Not a directory` }]);
        return;
      }
      setCwd(resolved);
      return;
    }

    if (cmd === 'ls') {
      const flags = args.filter((a) => a.startsWith('-')).join('');
      const longMode = flags.includes('l') || flags.includes('a');
      const pathArg = args.find((a) => !a.startsWith('-'));
      const targetPath = pathArg ? resolveVirtualPath(cwd, pathArg) : cwd;
      const node = fsMap[targetPath];

      if (!node) {
        appendLines([{ type: 'error', text: `ls: cannot access '${pathArg}': No such file or directory` }]);
        return;
      }

      const items = node.type === 'dir' ? listChildren(targetPath) : [targetPath];

      if (!longMode) {
        const names = items.map((p) => {
          const name = p.split('/').pop() ?? p;
          return fsMap[p].type === 'dir' ? `${name}/` : name;
        });
        appendLines([{ type: 'output', text: names.join('  ') || '(empty)' }]);
      } else {
        const rows = items.map((p) => {
          const item = fsMap[p];
          const mode = getPerm(p);
          const sym = modeToSymbolic(mode, item.type === 'dir');
          const name = p.split('/').pop() ?? p;
          return `${sym} (${mode})  ${item.owner.padEnd(8)} ${item.group.padEnd(8)} ${name}${
            item.type === 'dir' ? '/' : ''
          }`;
        });
        appendLines([
          {
            type: targetPath === '/opt/CQ' && getPerm('/opt/CQ/db_backup.conf') === '777' ? 'warning' : 'output',
            text: rows.join('\n') || '(empty)',
          },
        ]);

        if (targetPath === '/opt/CQ') {
          onCompleteTask(
            'lab-4',
            'l4-task-2',
            'Look at `db_backup.conf`: `-rwxrwxrwx (777)` lets anyone read it! Check its contents and `/var/logs/auth.log` using `cat`.',
            'concerned'
          );

          if (getPerm('/opt/CQ/db_backup.conf') === '600') {
            onCompleteTask(
              'lab-4',
              'l4-task-5',
              'Hardening verified! `db_backup.conf` now displays `-rw------- (600)`. Operation Linux Guardian complete!',
              'mission-complete'
            );
          }
        }
      }
      return;
    }

    if (cmd === 'cat') {
      const targetArg = args[0];
      if (!targetArg) {
        appendLines([{ type: 'error', text: 'cat: missing file operand (example: cat db_backup.conf)' }]);
        return;
      }
      const resolved = resolveVirtualPath(cwd, targetArg);
      const node = fsMap[resolved];
      if (!node) {
        appendLines([{ type: 'error', text: `cat: ${targetArg}: No such file or directory` }]);
        return;
      }
      if (node.type === 'dir') {
        appendLines([{ type: 'error', text: `cat: ${targetArg}: Is a directory` }]);
        return;
      }
      appendLines([{ type: 'info', text: node.content ?? '' }]);

      let nextConfig = readConfig;
      let nextLog = readAuthLog;
      if (resolved === '/opt/CQ/db_backup.conf') {
        nextConfig = true;
        setReadConfig(true);
      }
      if (resolved === '/var/logs/auth.log') {
        nextLog = true;
        setReadAuthLog(true);
      }

      if (nextConfig && nextLog) {
        onCompleteTask(
          'lab-4',
          'l4-task-3',
          'Both sensitive config secrets and failed SSH brute-force logs reviewed! Now lock down `db_backup.conf` using `chmod 600 /opt/CQ/db_backup.conf`.',
          'hint'
        );
      } else if (nextConfig) {
        onByteReact(
          'Whoa—`db_backup.conf` stores a database password while readable by everyone (777)! Also inspect `/var/logs/auth.log`.',
          'concerned'
        );
      } else if (nextLog) {
        onByteReact(
          'Those failed SSH attempts in `auth.log` show why least privilege matters! Also inspect `/opt/CQ/db_backup.conf`.',
          'explaining'
        );
      }
      return;
    }

    if (cmd === 'mkdir') {
      const dirArg = args[0];
      if (!dirArg) {
        appendLines([{ type: 'error', text: 'mkdir: missing operand' }]);
        return;
      }
      const resolved = resolveVirtualPath(cwd, dirArg);
      if (fsMap[resolved]) {
        appendLines([{ type: 'error', text: `mkdir: cannot create directory '${dirArg}': File exists` }]);
        return;
      }
      setCustomDirs((prev) => ({
        ...prev,
        [resolved]: { type: 'dir', owner: 'student', group: 'student', defaultMode: '755' },
      }));
      appendLines([{ type: 'success', text: `Created simulated directory: ${resolved}` }]);
      return;
    }

    if (cmd === 'chmod') {
      const modeArg = args[0];
      const fileArg = args[1];
      if (!modeArg || !fileArg) {
        appendLines([{ type: 'error', text: 'Usage: chmod <octal-mode> <file> (example: chmod 600 /opt/CQ/db_backup.conf)' }]);
        return;
      }
      if (!/^[0-7]{3}$/.test(modeArg)) {
        appendLines([{ type: 'error', text: `chmod: invalid octal mode '${modeArg}'. Use 3 digits like 600 or 644.` }]);
        return;
      }
      const resolved = resolveVirtualPath(cwd, fileArg);
      if (!fsMap[resolved]) {
        appendLines([{ type: 'error', text: `chmod: cannot access '${fileArg}': No such file or directory` }]);
        return;
      }
      onUpdateLinuxPerm(resolved, modeArg);
      appendLines([
        {
          type: 'success',
          text: `Updated permissions for ${resolved} to ${modeToSymbolic(modeArg, fsMap[resolved].type === 'dir')} (${modeArg})`,
        },
      ]);

      if (resolved === '/opt/CQ/db_backup.conf' && modeArg === '600') {
        onCompleteTask(
          'lab-4',
          'l4-task-4',
          'Permissions locked to 600 (`-rw-------`)! Now run `ls -la /opt/CQ` to verify the hardened permissions.',
          'excited'
        );
      } else if (resolved === '/opt/CQ/db_backup.conf' && modeArg !== '600') {
        onByteReact(
          `You set ${modeArg}, but sensitive secret files should restrict access strictly to the owner with \`chmod 600 /opt/CQ/db_backup.conf\`.`,
          'hint'
        );
      }
      return;
    }

    appendLines([
      {
        type: 'error',
        text: `${cmd}: command not supported in this sandbox. Type "help" for valid Linux commands.`,
      },
    ]);
  };

  const backupPerm = getPerm('/opt/CQ/db_backup.conf');
  const backupHardened = backupPerm === '600';

  return (
    <div className="space-y-5">
      <TerminalEngine
        promptLabel={`student@cq-linux:${cwd}$`}
        lines={lines}
        onExecuteCommand={handleCommand}
        onClear={() => setLines([])}
        quickCommands={[
          'whoami',
          'pwd',
          'cd /opt/CQ',
          'ls -la',
          'cat /opt/CQ/db_backup.conf',
          'cat /var/logs/auth.log',
          'chmod 600 /opt/CQ/db_backup.conf',
        ]}
        commandReference={[
          { cmd: 'whoami / pwd', desc: 'Confirm current user & working directory' },
          { cmd: 'cd /opt/CQ', desc: 'Move into CyberQuest app directory' },
          { cmd: 'ls -la', desc: 'List files with permission bits' },
          { cmd: 'cat /var/logs/auth.log', desc: 'Inspect authentication logs' },
          { cmd: 'cat /opt/CQ/db_backup.conf', desc: 'Read backup config file' },
          { cmd: 'chmod 600 /opt/CQ/db_backup.conf', desc: 'Restrict secrets file to owner only' },
        ]}
      />

      {/* Live Virtual Filesystem & Permissions Visualizer */}
      <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#2463EB]" />
            <h3 className="text-sm font-semibold text-[#EAF2FA]">
              Virtual Filesystem & Permission Monitor
            </h3>
          </div>
          <span className="font-mono text-xs text-[#9BAEC3]">CWD: {cwd}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {[
            '/opt/CQ/db_backup.conf',
            '/opt/CQ/deploy.sh',
            '/etc/ssh/sshd_config',
            '/var/logs/auth.log',
          ].map((filePath) => {
            const mode = getPerm(filePath);
            const sym = modeToSymbolic(mode, false);
            const isInsecure = mode === '777';
            return (
              <div
                key={filePath}
                className={`rounded-lg p-3 border flex items-center justify-between gap-2 ${
                  isInsecure
                    ? 'bg-[#E65B6A]/10 border-[#E65B6A]/40'
                    : 'bg-[#071426] border-[#102B46]'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-mono text-[#EAF2FA] truncate">{filePath}</div>
                  <div className="font-mono text-[11px] text-[#9BAEC3] mt-0.5">
                    {sym} ({mode})
                  </div>
                </div>
                {isInsecure ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E65B6A] shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Exposed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#19B5A5] shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{filePath.includes('db_backup') && backupHardened ? 'Hardened' : 'OK'}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
