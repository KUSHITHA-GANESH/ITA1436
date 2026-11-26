import React, { useState } from 'react';
import { CheckCircle2, ClipboardCheck } from 'lucide-react';
import { ByteMood, LabId, LabProgressState } from '../../types/cyberquest';
import { TerminalEngine, TerminalLine } from '../simulator/TerminalEngine';

interface Lab1ReconProps {
  labState: LabProgressState;
  onCompleteTask: (labId: LabId, taskId: string, byteMessage?: string, mood?: ByteMood) => void;
  onSaveObservation: (labId: LabId, key: string, value: string | boolean) => void;
  onByteReact: (message: string, mood: ByteMood) => void;
}

const INITIAL_LINES: TerminalLine[] = [
  {
    id: 'init-1',
    type: 'info',
    text: 'CyberQuest Recon Sandbox v1.0 · Target Range: 192.168.56.0/24',
  },
  {
    id: 'init-2',
    type: 'output',
    text: 'Assigned target: CQ-SERVER-01 (192.168.56.101). Type "help" to list supported reconnaissance commands.',
  },
];

export const Lab1Recon: React.FC<Lab1ReconProps> = ({
  labState,
  onCompleteTask,
  onSaveObservation,
  onByteReact,
}) => {
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_LINES);
  const [selectedPorts, setSelectedPorts] = useState<string>(
    String(labState.observations?.openPorts ?? '')
  );
  const [selectedService, setSelectedService] = useState<string>(
    String(labState.observations?.httpService ?? '')
  );
  const [obsFeedback, setObsFeedback] = useState<string>('');

  const appendLines = (newLines: Omit<TerminalLine, 'id'>[]) => {
    setLines((prev) => [
      ...prev,
      ...newLines.map((l, idx) => ({ ...l, id: `${Date.now()}-${idx}-${Math.random()}` })),
    ]);
  };

  const handleCommand = (raw: string) => {
    const normalized = raw.trim().replace(/\s+/g, ' ');
    const lower = normalized.toLowerCase();

    appendLines([{ type: 'command', text: `student@cq-recon:~$ ${normalized}` }]);

    if (lower === 'clear') {
      setLines([]);
      return;
    }

    if (lower === 'help') {
      appendLines([
        {
          type: 'info',
          text: `Supported Simulated Commands:
  host CQ-SERVER-01                   Resolve hostname to simulated IP
  ping 192.168.56.101                 Verify host reachability
  nmap 192.168.56.101                 Standard port discovery scan
  nmap -p 22,80,443 192.168.56.101    Targeted port scan on 22, 80, 443
  nmap -sV 192.168.56.101             Service and version detection scan
  curl -I http://192.168.56.101       Inspect HTTP response headers
  clear                               Clear terminal screen`,
        },
      ]);
      return;
    }

    if (lower === 'whoami') {
      appendLines([{ type: 'output', text: 'student (CyberQuest Authorized Analyst)' }]);
      return;
    }

    if (lower === 'host cq-server-01' || lower === 'nslookup cq-server-01') {
      appendLines([
        { type: 'success', text: 'CQ-SERVER-01.cq-range.local has address 192.168.56.101' },
      ]);
      onCompleteTask(
        'lab-1',
        'l1-task-1',
        'Great start! Host resolution confirmed CQ-SERVER-01 is at 192.168.56.101.',
        'happy'
      );
      return;
    }

    if (lower === 'ping 192.168.56.101' || lower === 'ping cq-server-01') {
      appendLines([
        {
          type: 'output',
          text: `PING 192.168.56.101 (192.168.56.101) 56(84) bytes of data.
64 bytes from 192.168.56.101: icmp_seq=1 ttl=64 time=0.42 ms
64 bytes from 192.168.56.101: icmp_seq=2 ttl=64 time=0.39 ms
64 bytes from 192.168.56.101: icmp_seq=3 ttl=64 time=0.41 ms

--- 192.168.56.101 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`,
        },
      ]);
      onCompleteTask(
        'lab-1',
        'l1-task-1',
        'Target 192.168.56.101 responded with 0% packet loss! Next, run a baseline Nmap scan.',
        'happy'
      );
      return;
    }

    // Scope guard demonstration if student tries external IP
    if (
      (lower.startsWith('nmap ') || lower.startsWith('ping ')) &&
      !lower.includes('192.168.56.101') &&
      !lower.includes('cq-server-01')
    ) {
      appendLines([
        {
          type: 'warning',
          text: 'Scope Warning: Target is outside authorized lab range. Authorized target is CQ-SERVER-01 (192.168.56.101).',
        },
      ]);
      onByteReact(
        'Remember scope discipline! Always target only the authorized sandbox host: 192.168.56.101.',
        'concerned'
      );
      return;
    }

    if (lower === 'nmap 192.168.56.101' || lower === 'nmap cq-server-01') {
      appendLines([
        {
          type: 'output',
          text: `Starting Nmap 7.94 (Simulated) — CQ-SERVER-01 (192.168.56.101)
Host is up (0.00041s latency).
Not shown: 997 filtered tcp ports (no-response)
PORT     STATE    SERVICE
22/tcp   open     ssh
80/tcp   open     http
443/tcp  closed   https

Nmap done: 1 IP address (1 host up) scanned in 0.18 seconds`,
        },
      ]);
      onCompleteTask(
        'lab-1',
        'l1-task-2',
        'Baseline scan complete! Ports 22 (ssh) and 80 (http) are open, while 443 (https) is closed.',
        'excited'
      );
      return;
    }

    if (
      lower === 'nmap -p 22,80,443 192.168.56.101' ||
      lower === 'nmap -p22,80,443 192.168.56.101'
    ) {
      appendLines([
        {
          type: 'output',
          text: `Starting Nmap 7.94 (Simulated) — Targeted Port Scan
Nmap scan report for CQ-SERVER-01 (192.168.56.101)
PORT     STATE    SERVICE
22/tcp   open     ssh
80/tcp   open     http
443/tcp  closed   https

Targeted scan completed in 0.06 seconds.`,
        },
      ]);
      onCompleteTask(
        'lab-1',
        'l1-task-3',
        'Nice precision! Scanning only ports 22, 80, and 443 finished cleanly. Now add -sV to check software versions.',
        'happy'
      );
      return;
    }

    if (
      lower === 'nmap -sv 192.168.56.101' ||
      lower === 'nmap -s -v 192.168.56.101' ||
      lower === 'nmap -sc -sv 192.168.56.101' ||
      lower === 'nmap -sv -p 22,80,443 192.168.56.101'
    ) {
      appendLines([
        {
          type: 'success',
          text: `Starting Nmap 7.94 (Simulated) — Service Version Detection
Nmap scan report for CQ-SERVER-01 (192.168.56.101)
PORT     STATE    SERVICE    VERSION
22/tcp   open     ssh        OpenSSH 8.2
80/tcp   open     http       Apache 2.4.49
443/tcp  closed   https

Service detection performed on 2 open ports.`,
        },
      ]);
      onCompleteTask(
        'lab-1',
        'l1-task-4',
        'Important discovery! Port 80 is running Apache 2.4.49 (an outdated HTTP server) and HTTPS on 443 is closed. Record this in the Recon Observation panel below!',
        'excited'
      );
      return;
    }

    if (lower === 'nmap -p- 192.168.56.101') {
      appendLines([
        {
          type: 'output',
          text: `Scanning all 65535 simulated TCP ports on 192.168.56.101...
PORT     STATE    SERVICE
22/tcp   open     ssh
80/tcp   open     http
443/tcp  closed   https
All other 65532 ports are filtered.`,
        },
      ]);
      onCompleteTask('lab-1', 'l1-task-2');
      return;
    }

    if (lower === 'curl -i http://192.168.56.101' || lower === 'curl -i 192.168.56.101') {
      appendLines([
        {
          type: 'info',
          text: `HTTP/1.1 200 OK
Server: Apache/2.4.49 (Unix)
Content-Type: text/html; charset=UTF-8
X-Powered-By: CQ-Portal-Sim`,
        },
      ]);
      onByteReact(
        'Notice the `Server: Apache/2.4.49` banner in the HTTP header—that matches our Nmap -sV finding!',
        'explaining'
      );
      return;
    }

    appendLines([
      {
        type: 'error',
        text: `Command not recognized: "${normalized}". Type "help" to see supported simulated commands (e.g. nmap -sV 192.168.56.101).`,
      },
    ]);
    onByteReact(
      `That command isn't supported in this sandbox. Type "help" or click Command Reference to view valid recon commands!`,
      'concerned'
    );
  };

  const handleSubmitObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPorts === '22-80' && selectedService === 'apache-2.4.49') {
      setObsFeedback('Observation verified! Open ports 22 & 80 and outdated Apache 2.4.49 logged.');
      onSaveObservation('lab-1', 'openPorts', selectedPorts);
      onSaveObservation('lab-1', 'httpService', selectedService);
      onCompleteTask(
        'lab-1',
        'l1-task-5',
        'Mission complete! You mapped CQ-SERVER-01 accurately and flagged Apache 2.4.49 for patching.',
        'mission-complete'
      );
    } else {
      setObsFeedback(
        'Not quite right—re-check your `nmap -sV 192.168.56.101` table for which ports show "open" and the exact Apache version.'
      );
      onByteReact(
        'Look closely at the STATE and VERSION columns from `nmap -sV 192.168.56.101`. Which two ports say open?',
        'hint'
      );
    }
  };

  const task5Done = labState.completedTasks.includes('l1-task-5');

  return (
    <div className="space-y-5">
      <TerminalEngine
        promptLabel="student@cq-recon:~$"
        lines={lines}
        onExecuteCommand={handleCommand}
        onClear={() => setLines([])}
        quickCommands={[
          'ping 192.168.56.101',
          'nmap 192.168.56.101',
          'nmap -p 22,80,443 192.168.56.101',
          'nmap -sV 192.168.56.101',
        ]}
        commandReference={[
          { cmd: 'ping 192.168.56.101', desc: 'Confirm target reachability' },
          { cmd: 'host CQ-SERVER-01', desc: 'Resolve target hostname to IP' },
          { cmd: 'nmap 192.168.56.101', desc: 'Standard TCP port discovery' },
          { cmd: 'nmap -p 22,80,443 192.168.56.101', desc: 'Scan specific ports' },
          { cmd: 'nmap -sV 192.168.56.101', desc: 'Detect service software versions' },
          { cmd: 'curl -I http://192.168.56.101', desc: 'Inspect HTTP Server banner' },
        ]}
      />

      {/* Reconnaissance Observation Check */}
      <form
        onSubmit={handleSubmitObservation}
        className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 sm:p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-[#19B5A5]" />
            <h3 className="text-base font-semibold text-[#EAF2FA]">
              Recon Observation Report
            </h3>
          </div>
          {task5Done && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#19B5A5]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submitted</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="recon-ports" className="block text-xs font-medium text-[#9BAEC3]">
              Confirmed Open TCP Ports
            </label>
            <select
              id="recon-ports"
              value={selectedPorts}
              onChange={(e) => setSelectedPorts(e.target.value)}
              className="w-full rounded-lg bg-[#071426] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3 py-2 text-xs text-[#EAF2FA]"
            >
              <option value="">Select open ports...</option>
              <option value="22-only">Port 22 only</option>
              <option value="22-80">Ports 22 (SSH) & 80 (HTTP)</option>
              <option value="22-80-443">Ports 22, 80 & 443</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="recon-service" className="block text-xs font-medium text-[#9BAEC3]">
              Notable Service & Version Finding
            </label>
            <select
              id="recon-service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full rounded-lg bg-[#071426] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3 py-2 text-xs text-[#EAF2FA]"
            >
              <option value="">Select service finding...</option>
              <option value="nginx-1.24">Nginx 1.24 on port 443</option>
              <option value="apache-2.4.49">Apache 2.4.49 on port 80 (outdated)</option>
              <option value="mysql-8.0">MySQL 8.0 on port 3306</option>
            </select>
          </div>
        </div>

        {obsFeedback && (
          <p
            className={`text-xs ${
              task5Done || obsFeedback.includes('verified') ? 'text-[#19B5A5]' : 'text-[#E5B84B]'
            }`}
          >
            {obsFeedback}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Submit Recon Findings
          </button>
        </div>
      </form>
    </div>
  );
};
