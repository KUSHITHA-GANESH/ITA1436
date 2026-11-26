import React from 'react';

interface LessonDiagramProps {
  type: 'recon-flow' | 'http-cycle' | 'packet-layers' | 'linux-perms' | 'va-lifecycle';
}

export const LessonDiagram: React.FC<LessonDiagramProps> = ({ type }) => {
  if (type === 'recon-flow') {
    return (
      <div className="rounded-xl border border-[#102B46] bg-[#040D1A] p-4">
        <div className="text-xs font-semibold text-[#9BAEC3] mb-3">
          Visual Flow · Authorized Reconnaissance Progression
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          {[
            { step: '01', title: 'Scope Check', sub: 'Verify written authorization', color: '#2463EB' },
            { step: '02', title: 'Passive OSINT', sub: 'WHOIS, DNS & public certs', color: '#19B5A5' },
            { step: '03', title: 'Active Probe', sub: 'Nmap port & -sV scan', color: '#E5B84B' },
            { step: '04', title: 'Target Map', sub: 'Document exposed services', color: '#7C5CFC' },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-lg bg-[#0B1C30] border border-[#102B46] p-3 space-y-1"
            >
              <div className="font-mono text-[11px] font-bold" style={{ color: item.color }}>
                STEP {item.step}
              </div>
              <div className="font-semibold text-[#EAF2FA]">{item.title}</div>
              <div className="text-[11px] text-[#9BAEC3]">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'http-cycle') {
    return (
      <div className="rounded-xl border border-[#102B46] bg-[#040D1A] p-4">
        <div className="text-xs font-semibold text-[#9BAEC3] mb-3">
          Diagram · HTTP Request & Response Trust Boundaries
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-xs">
          <div className="rounded-lg bg-[#0B1C30] border border-[#2463EB]/40 p-3 space-y-1">
            <div className="font-semibold text-[#38BDF8]">Browser Client</div>
            <div className="text-[#9BAEC3]">Sends Method, Path, Cookies & Form Input</div>
          </div>
          <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3 text-center space-y-1">
            <div className="font-mono text-[#19B5A5]">POST /api/login ──▶</div>
            <div className="font-mono text-[#E5B84B]">◀── 200 OK + Set-Cookie</div>
          </div>
          <div className="rounded-lg bg-[#0B1C30] border border-[#19B5A5]/40 p-3 space-y-1">
            <div className="font-semibold text-[#19B5A5]">Web Server & DB</div>
            <div className="text-[#9BAEC3]">Validates input, binds SQL parameters & sets HttpOnly</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'packet-layers') {
    return (
      <div className="rounded-xl border border-[#102B46] bg-[#040D1A] p-4">
        <div className="text-xs font-semibold text-[#9BAEC3] mb-3">
          Diagram · Packet Encapsulation Layers
        </div>
        <div className="space-y-1.5 text-xs font-mono">
          <div className="rounded-lg bg-[#102B46]/60 border border-[#2463EB]/40 px-3 py-2 flex justify-between">
            <span className="text-[#38BDF8]">Layer 2 · Data Link (Ethernet)</span>
            <span className="text-[#9BAEC3]">Source / Dest MAC Address</span>
          </div>
          <div className="rounded-lg bg-[#102B46]/45 border border-[#19B5A5]/40 px-3 py-2 flex justify-between ml-3">
            <span className="text-[#19B5A5]">Layer 3 · Network (IP)</span>
            <span className="text-[#9BAEC3]">192.168.56.105 → 192.168.56.101</span>
          </div>
          <div className="rounded-lg bg-[#102B46]/30 border border-[#E5B84B]/40 px-3 py-2 flex justify-between ml-6">
            <span className="text-[#E5B84B]">Layer 4 · Transport (TCP/UDP)</span>
            <span className="text-[#9BAEC3]">Port 80 · Flags [SYN, ACK]</span>
          </div>
          <div className="rounded-lg bg-[#0B1C30] border border-[#7C5CFC]/40 px-3 py-2 flex justify-between ml-9">
            <span className="text-[#EAF2FA]">Layer 7 · Application</span>
            <span className="text-[#9BAEC3]">HTTP POST / DNS Query</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'linux-perms') {
    return (
      <div className="rounded-xl border border-[#102B46] bg-[#040D1A] p-4">
        <div className="text-xs font-semibold text-[#9BAEC3] mb-3">
          Diagram · Anatomy of Linux File Permission Triads
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
          <div className="rounded-lg bg-[#0B1C30] border border-[#19B5A5]/40 p-3">
            <div className="text-[#19B5A5] font-bold">Owner (u) · rw- (6)</div>
            <div className="text-[#9BAEC3] mt-1 font-sans">Read (4) + Write (2) = 6</div>
          </div>
          <div className="rounded-lg bg-[#0B1C30] border border-[#2463EB]/40 p-3">
            <div className="text-[#38BDF8] font-bold">Group (g) · --- (0)</div>
            <div className="text-[#9BAEC3] mt-1 font-sans">No access for group members</div>
          </div>
          <div className="rounded-lg bg-[#0B1C30] border border-[#7C5CFC]/40 p-3">
            <div className="text-[#EAF2FA] font-bold">Others (o) · --- (0)</div>
            <div className="text-[#9BAEC3] mt-1 font-sans">No access for other local users</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#102B46] bg-[#040D1A] p-4">
      <div className="text-xs font-semibold text-[#9BAEC3] mb-3">
        Lifecycle · Vulnerability Assessment & Closure
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {['Scope', 'Discovery', 'Evidence', 'Severity (CVSS)', 'Remediation', 'Verification', 'Report'].map(
          (stage, i) => (
            <React.Fragment key={stage}>
              <span className="px-2.5 py-1.5 rounded-lg bg-[#0B1C30] border border-[#102B46] text-[#EAF2FA] font-medium">
                {stage}
              </span>
              {i < 6 && <span className="text-[#19B5A5] font-bold">→</span>}
            </React.Fragment>
          )
        )}
      </div>
    </div>
  );
};
