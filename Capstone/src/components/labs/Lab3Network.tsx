import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Filter, Network, RotateCcw } from 'lucide-react';
import { ByteMood, LabId, LabProgressState } from '../../types/cyberquest';

interface Lab3NetworkProps {
  labState: LabProgressState;
  onCompleteTask: (labId: LabId, taskId: string, byteMessage?: string, mood?: ByteMood) => void;
  onSaveObservation: (labId: LabId, key: string, value: string | boolean) => void;
  onByteReact: (message: string, mood: ByteMood) => void;
}

interface SimulatedPacket {
  no: number;
  time: string;
  source: string;
  destination: string;
  srcPort: number;
  dstPort: number;
  protocol: 'DNS' | 'TCP' | 'UDP' | 'HTTP';
  length: number;
  flags?: string;
  info: string;
  payloadSummary: string;
  observation: string;
  suspicious?: boolean;
}

const SIMULATED_PACKETS: SimulatedPacket[] = [
  {
    no: 1,
    time: '0.0000',
    source: '192.168.56.101',
    destination: '192.168.56.2',
    srcPort: 51420,
    dstPort: 53,
    protocol: 'DNS',
    length: 76,
    info: 'Standard query 0x4a1f A portal.cq-corp.local',
    payloadSummary: 'Query Name: portal.cq-corp.local | Type: A (IPv4) | Class: IN',
    observation: 'Normal internal DNS resolution request over UDP port 53.',
  },
  {
    no: 2,
    time: '0.0021',
    source: '192.168.56.2',
    destination: '192.168.56.101',
    srcPort: 53,
    dstPort: 51420,
    protocol: 'DNS',
    length: 92,
    info: 'Standard query response 0x4a1f A 192.168.56.101',
    payloadSummary: 'Answer: portal.cq-corp.local -> 192.168.56.101 | TTL: 300s',
    observation: 'DNS server returned local address 192.168.56.101.',
  },
  {
    no: 3,
    time: '0.1140',
    source: '192.168.56.105',
    destination: '192.168.56.101',
    srcPort: 49210,
    dstPort: 80,
    protocol: 'TCP',
    length: 74,
    flags: '[SYN]',
    info: '49210 -> 80 [SYN] Seq=0 Win=64240 Len=0',
    payloadSummary: 'TCP Header: SrcPort 49210, DstPort 80 (HTTP), Flags: SYN',
    observation: 'Step 1 of TCP 3-way handshake initiated by workstation 192.168.56.105.',
  },
  {
    no: 4,
    time: '0.1144',
    source: '192.168.56.101',
    destination: '192.168.56.105',
    srcPort: 80,
    dstPort: 49210,
    protocol: 'TCP',
    length: 74,
    flags: '[SYN, ACK]',
    info: '80 -> 49210 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0',
    payloadSummary: 'TCP Header: SrcPort 80, DstPort 49210, Flags: SYN + ACK',
    observation: 'Step 2 of TCP 3-way handshake: server acknowledges SYN.',
  },
  {
    no: 5,
    time: '0.1147',
    source: '192.168.56.105',
    destination: '192.168.56.101',
    srcPort: 49210,
    dstPort: 80,
    protocol: 'TCP',
    length: 66,
    flags: '[ACK]',
    info: '49210 -> 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0',
    payloadSummary: 'TCP Header: Flags: ACK. Connection ready for HTTP payload.',
    observation: 'Step 3 of TCP 3-way handshake complete.',
  },
  {
    no: 6,
    time: '0.1155',
    source: '192.168.56.105',
    destination: '192.168.56.101',
    srcPort: 49210,
    dstPort: 80,
    protocol: 'HTTP',
    length: 218,
    info: 'GET /index.html HTTP/1.1',
    payloadSummary: 'GET /index.html HTTP/1.1 | Host: portal.cq-corp.local',
    observation: 'Standard unencrypted HTTP GET page fetch.',
  },
  {
    no: 7,
    time: '0.3402',
    source: '192.168.56.105',
    destination: '192.168.56.101',
    srcPort: 49210,
    dstPort: 80,
    protocol: 'HTTP',
    length: 312,
    info: 'POST /login HTTP/1.1 (application/x-www-form-urlencoded)',
    payloadSummary: 'POST /login | Body: username=analyst_demo&password=[REDACTED_PLAINTEXT]',
    observation: 'Security Finding: Login credentials transmitted over plaintext HTTP (port 80) instead of HTTPS!',
  },
  {
    no: 8,
    time: '0.3428',
    source: '192.168.56.101',
    destination: '192.168.56.105',
    srcPort: 80,
    dstPort: 49210,
    protocol: 'HTTP',
    length: 264,
    info: 'HTTP/1.1 200 OK (application/json)',
    payloadSummary: 'HTTP/1.1 200 OK | {"status":"ok","role":"staff"}',
    observation: 'Server responded 200 OK over unencrypted HTTP.',
  },
  {
    no: 9,
    time: '1.0120',
    source: '192.168.56.108',
    destination: '192.168.56.2',
    srcPort: 53911,
    dstPort: 123,
    protocol: 'UDP',
    length: 90,
    info: 'NTPv4 Client time sync request',
    payloadSummary: 'UDP Port 123 (NTP) | Routine clock synchronization',
    observation: 'Benign UDP Network Time Protocol traffic.',
  },
  {
    no: 10,
    time: '1.0145',
    source: '192.168.56.2',
    destination: '192.168.56.108',
    srcPort: 123,
    dstPort: 53911,
    protocol: 'UDP',
    length: 90,
    info: 'NTPv4 Server time sync response',
    payloadSummary: 'UDP Port 123 (NTP) | Stratum 2 timestamp reply',
    observation: 'Benign NTP reply.',
  },
  {
    no: 11,
    time: '2.1004',
    source: '192.168.56.101',
    destination: '192.168.56.2',
    srcPort: 58102,
    dstPort: 53,
    protocol: 'DNS',
    length: 84,
    info: 'Standard query 0x8c22 A sync-node.external-sim.net',
    payloadSummary: 'Query Name: sync-node.external-sim.net | Type: A',
    observation: 'Server 192.168.56.101 unexpectedly queried an unknown external domain.',
  },
  {
    no: 12,
    time: '2.1050',
    source: '192.168.56.101',
    destination: '185.220.101.42',
    srcPort: 55108,
    dstPort: 4444,
    protocol: 'TCP',
    length: 74,
    flags: '[SYN]',
    info: '55108 -> 4444 [SYN] Seq=0 Win=64240 (Unusual Outbound Port)',
    payloadSummary: 'TCP Header: 192.168.56.101 -> 185.220.101.42:4444 | Flags: SYN',
    observation: 'HIGH ALERT: Server initiated outbound connection to external IP 185.220.101.42 on port 4444.',
    suspicious: true,
  },
  {
    no: 13,
    time: '2.1480',
    source: '185.220.101.42',
    destination: '192.168.56.101',
    srcPort: 4444,
    dstPort: 55108,
    protocol: 'TCP',
    length: 74,
    flags: '[SYN, ACK]',
    info: '4444 -> 55108 [SYN, ACK] Seq=0 Ack=1',
    payloadSummary: 'External endpoint accepted connection on TCP port 4444.',
    observation: 'External host acknowledged suspicious outbound session on port 4444.',
    suspicious: true,
  },
  {
    no: 14,
    time: '2.1520',
    source: '192.168.56.101',
    destination: '185.220.101.42',
    srcPort: 55108,
    dstPort: 4444,
    protocol: 'TCP',
    length: 118,
    flags: '[PSH, ACK]',
    info: '55108 -> 4444 [PSH, ACK] Beacon heartbeat payload (52 bytes)',
    payloadSummary: 'Simulated Payload: {"host":"CQ-SERVER-01","beacon":"checkin-01"}',
    observation: 'Suspicious periodic beacon / potential reverse channel data exchange on port 4444.',
    suspicious: true,
  },
];

export const Lab3Network: React.FC<Lab3NetworkProps> = ({
  labState,
  onCompleteTask,
  onSaveObservation,
  onByteReact,
}) => {
  const [filterInput, setFilterInput] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filterError, setFilterError] = useState('');
  const [selectedPacketNo, setSelectedPacketNo] = useState<number>(1);

  const [suspectIp, setSuspectIp] = useState(String(labState.observations?.suspectIp ?? ''));
  const [suspectPort, setSuspectPort] = useState(String(labState.observations?.suspectPort ?? ''));
  const [conclusionMsg, setConclusionMsg] = useState('');

  const filteredPackets = useMemo(() => {
    const f = activeFilter.trim().toLowerCase();
    if (!f || f === 'all') return SIMULATED_PACKETS;
    if (f === 'dns') return SIMULATED_PACKETS.filter((p) => p.protocol === 'DNS');
    if (f === 'tcp') return SIMULATED_PACKETS.filter((p) => p.protocol === 'TCP');
    if (f === 'udp') return SIMULATED_PACKETS.filter((p) => p.protocol === 'UDP');
    if (f === 'http') return SIMULATED_PACKETS.filter((p) => p.protocol === 'HTTP');
    if (f === 'ip.addr == 192.168.56.101' || f === 'ip.addr==192.168.56.101') {
      return SIMULATED_PACKETS.filter(
        (p) => p.source === '192.168.56.101' || p.destination === '192.168.56.101'
      );
    }
    if (f === 'tcp.port == 4444' || f === 'tcp.port==4444') {
      return SIMULATED_PACKETS.filter((p) => p.srcPort === 4444 || p.dstPort === 4444);
    }
    return SIMULATED_PACKETS;
  }, [activeFilter]);

  const selectedPacket =
    SIMULATED_PACKETS.find((p) => p.no === selectedPacketNo) ?? SIMULATED_PACKETS[0];

  const applyFilter = (raw: string) => {
    const f = raw.trim().toLowerCase();
    const validFilters = [
      '',
      'all',
      'dns',
      'tcp',
      'udp',
      'http',
      'ip.addr == 192.168.56.101',
      'ip.addr==192.168.56.101',
      'tcp.port == 4444',
      'tcp.port==4444',
    ];

    if (!validFilters.includes(f)) {
      setFilterError(
        'Unsupported filter syntax. Try: dns, tcp, udp, http, ip.addr == 192.168.56.101, or tcp.port == 4444.'
      );
      onByteReact(
        'Supported display filters here are `dns`, `tcp`, `udp`, `http`, `ip.addr == 192.168.56.101`, and `tcp.port == 4444`.',
        'concerned'
      );
      return;
    }

    setFilterError('');
    const nextFilter = f || 'all';
    setActiveFilter(nextFilter);
    setFilterInput(nextFilter === 'all' ? '' : raw.trim());

    if (nextFilter === 'dns') {
      onByteReact('DNS filter active! Click a DNS row to see what domain was resolved.', 'explaining');
    } else if (nextFilter.includes('192.168.56.101')) {
      onByteReact(
        'Now showing every packet involving 192.168.56.101. Look near the bottom for an unfamiliar external destination!',
        'hint'
      );
    }
  };

  const handleSelectPacket = (pkt: SimulatedPacket) => {
    setSelectedPacketNo(pkt.no);

    if (pkt.protocol === 'DNS' && activeFilter === 'dns') {
      onCompleteTask(
        'lab-3',
        'l3-task-1',
        'DNS inspection complete! Notice how 192.168.56.101 resolved hostnames before opening TCP connections.',
        'happy'
      );
    }

    if (pkt.protocol === 'TCP' && (pkt.flags === '[SYN]' || pkt.flags === '[SYN, ACK]') && activeFilter === 'tcp') {
      onCompleteTask(
        'lab-3',
        'l3-task-2',
        'TCP handshake packet inspected! Next, check `http` traffic for unencrypted activity.',
        'happy'
      );
    }

    if (pkt.protocol === 'HTTP' && pkt.info.startsWith('POST')) {
      onCompleteTask(
        'lab-3',
        'l3-task-3',
        'Good catch! Packet #7 sends login form data over plaintext HTTP port 80.',
        'concerned'
      );
    }

    if (pkt.suspicious) {
      onCompleteTask(
        'lab-3',
        'l3-task-4',
        `Alert confirmed! Packet #${pkt.no} shows outbound traffic to ${pkt.destination}:${pkt.dstPort || pkt.srcPort}. Record this in the Analyst Conclusion below.`,
        'excited'
      );
    }
  };

  const handleConclusionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suspectIp === '185.220.101.42' && suspectPort === '4444') {
      setConclusionMsg('Investigation verified! Suspicious beacon to 185.220.101.42:4444 confirmed.');
      onSaveObservation('lab-3', 'suspectIp', suspectIp);
      onSaveObservation('lab-3', 'suspectPort', suspectPort);
      onCompleteTask(
        'lab-3',
        'l3-task-5',
        'Case closed, Packet Detective! You isolated DNS, TCP, HTTP leaks, and the suspicious port 4444 beacon.',
        'mission-complete'
      );
    } else {
      setConclusionMsg('Check Packets #12–#14 again for the external IP address and unusual destination port.');
      onByteReact(
        'Filter with `ip.addr == 192.168.56.101` and click Packet #12 or #14 to read the remote IP and port.',
        'hint'
      );
    }
  };

  const task5Done = labState.completedTasks.includes('l3-task-5');

  return (
    <div className="space-y-5">
      {/* Display Filter Bar */}
      <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilter(filterInput);
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <div className="flex items-center gap-2 flex-1 min-w-[220px] rounded-lg bg-[#040D1A] border border-[#102B46] focus-within:border-[#2463EB] px-3 py-2">
            <Filter className="w-4 h-4 text-[#19B5A5] shrink-0" />
            <input
              type="text"
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              placeholder="Apply display filter (e.g. dns, tcp, http, ip.addr == 192.168.56.101)"
              aria-label="Packet display filter"
              className="w-full bg-transparent font-mono text-xs text-[#EAF2FA] placeholder:text-[#9BAEC3]/55 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Apply Filter
          </button>
          <button
            type="button"
            onClick={() => applyFilter('all')}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#071426] hover:bg-[#102B46] border border-[#102B46] text-xs text-[#9BAEC3] hover:text-[#EAF2FA] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[#9BAEC3] mr-1">Quick filters:</span>
          {['all', 'dns', 'tcp', 'udp', 'http', 'ip.addr == 192.168.56.101'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => applyFilter(f)}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                activeFilter === f
                  ? 'bg-[#19B5A5] text-[#071426] font-semibold'
                  : 'bg-[#071426] text-[#EAF2FA] border border-[#102B46] hover:border-[#2463EB]/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filterError && <p className="text-xs text-[#E65B6A]">{filterError}</p>}
      </div>

      {/* Packet List Table */}
      <div className="rounded-xl border border-[#102B46] bg-[#040D1A] overflow-hidden">
        <div className="px-4 py-2.5 bg-[#0B1C30] border-b border-[#102B46] flex items-center justify-between text-xs text-[#9BAEC3]">
          <div className="flex items-center gap-2 font-semibold text-[#EAF2FA]">
            <Network className="w-4 h-4 text-[#2463EB]" />
            <span>Captured Packets ({filteredPackets.length} shown)</span>
          </div>
          <span>Click any row to inspect</span>
        </div>

        <div className="overflow-x-auto max-h-72 overflow-y-auto cq-scroll">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead className="sticky top-0 bg-[#071426] text-[#9BAEC3] border-b border-[#102B46]">
              <tr>
                <th className="py-2 px-3">No.</th>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Source</th>
                <th className="py-2 px-3">Destination</th>
                <th className="py-2 px-3">Proto</th>
                <th className="py-2 px-3">Len</th>
                <th className="py-2 px-3">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102B46]/60">
              {filteredPackets.map((pkt) => {
                const isSelected = pkt.no === selectedPacket.no;
                return (
                  <tr
                    key={pkt.no}
                    onClick={() => handleSelectPacket(pkt)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#2463EB]/30 text-[#EAF2FA]'
                        : pkt.suspicious
                        ? 'bg-[#E65B6A]/10 hover:bg-[#E65B6A]/20 text-[#EAF2FA]'
                        : 'hover:bg-[#0B1C30] text-[#CBD5E1]'
                    }`}
                  >
                    <td className="py-2 px-3 tabular-nums">{pkt.no}</td>
                    <td className="py-2 px-3 tabular-nums text-[#9BAEC3]">{pkt.time}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{pkt.source}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{pkt.destination}</td>
                    <td className="py-2 px-3 font-semibold text-[#19B5A5]">{pkt.protocol}</td>
                    <td className="py-2 px-3 tabular-nums">{pkt.length}</td>
                    <td className="py-2 px-3 max-w-xs truncate">{pkt.info}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Packet Details Panel */}
      <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#EAF2FA]">
            Packet #{selectedPacket.no} Details · {selectedPacket.protocol}
          </h3>
          {selectedPacket.suspicious && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E65B6A]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Anomalous Event</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg bg-[#071426] border border-[#102B46] p-2.5">
            <div className="text-[#9BAEC3]">Source</div>
            <div className="font-mono text-[#EAF2FA] mt-0.5">
              {selectedPacket.source}:{selectedPacket.srcPort}
            </div>
          </div>
          <div className="rounded-lg bg-[#071426] border border-[#102B46] p-2.5">
            <div className="text-[#9BAEC3]">Destination</div>
            <div className="font-mono text-[#EAF2FA] mt-0.5">
              {selectedPacket.destination}:{selectedPacket.dstPort}
            </div>
          </div>
          <div className="rounded-lg bg-[#071426] border border-[#102B46] p-2.5">
            <div className="text-[#9BAEC3]">TCP Flags</div>
            <div className="font-mono text-[#19B5A5] mt-0.5">
              {selectedPacket.flags ?? 'N/A'}
            </div>
          </div>
          <div className="rounded-lg bg-[#071426] border border-[#102B46] p-2.5">
            <div className="text-[#9BAEC3]">Length</div>
            <div className="font-mono text-[#EAF2FA] tabular-nums mt-0.5">
              {selectedPacket.length} bytes
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-[#040D1A] border border-[#102B46] p-3 font-mono text-xs text-[#CBD5E1]">
          {selectedPacket.payloadSummary}
        </div>

        <div className="rounded-lg bg-[#071426] border border-[#2463EB]/30 p-3 text-xs text-[#EAF2FA]">
          <span className="font-semibold text-[#38BDF8]">Analyst Note: </span>
          {selectedPacket.observation}
        </div>
      </div>

      {/* Analyst Conclusion Form */}
      <form
        onSubmit={handleConclusionSubmit}
        className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 sm:p-5 space-y-3.5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#EAF2FA]">
            Traffic Investigation Conclusion
          </h3>
          {task5Done && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#19B5A5]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="suspect-ip" className="block text-xs text-[#9BAEC3]">
              Suspicious Remote IP
            </label>
            <select
              id="suspect-ip"
              value={suspectIp}
              onChange={(e) => setSuspectIp(e.target.value)}
              className="w-full rounded-lg bg-[#071426] border border-[#102B46] px-3 py-2 text-xs font-mono text-[#EAF2FA]"
            >
              <option value="">Select remote IP...</option>
              <option value="192.168.56.2">192.168.56.2 (Internal DNS)</option>
              <option value="185.220.101.42">185.220.101.42 (External Host)</option>
              <option value="192.168.56.105">192.168.56.105 (Workstation)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="suspect-port" className="block text-xs text-[#9BAEC3]">
              Suspicious Destination Port
            </label>
            <select
              id="suspect-port"
              value={suspectPort}
              onChange={(e) => setSuspectPort(e.target.value)}
              className="w-full rounded-lg bg-[#071426] border border-[#102B46] px-3 py-2 text-xs font-mono text-[#EAF2FA]"
            >
              <option value="">Select port...</option>
              <option value="53">53 (DNS)</option>
              <option value="80">80 (HTTP)</option>
              <option value="4444">4444 (Non-standard Beacon Port)</option>
            </select>
          </div>
        </div>

        {conclusionMsg && (
          <p className={`text-xs ${task5Done ? 'text-[#19B5A5]' : 'text-[#E5B84B]'}`}>
            {conclusionMsg}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Submit Traffic Finding
          </button>
        </div>
      </form>
    </div>
  );
};
