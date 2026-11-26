import React, { useState } from 'react';
import { CheckCircle2, Lock, ShieldCheck, Sliders } from 'lucide-react';
import { InteractiveActivityData } from '../../types/cyberquest';

interface InteractiveActivityRunnerProps {
  activity: InteractiveActivityData;
  onComplete: () => void;
  completed: boolean;
}

export const InteractiveActivityRunner: React.FC<InteractiveActivityRunnerProps> = ({
  activity,
  onComplete,
  completed,
}) => {
  // 1. Port Matcher State
  const [portPicks, setPortPicks] = useState<Record<string, string>>({});
  const [portFeedback, setPortFeedback] = useState('');

  // 2. HTTP Anatomy State
  const [httpMethod, setHttpMethod] = useState('GET');
  const [httpCookieFlag, setHttpCookieFlag] = useState('None');
  const [httpCsp, setHttpCsp] = useState(false);
  const [httpFeedback, setHttpFeedback] = useState('');

  // 3. Packet Layers State
  const [layerIdx, setLayerIdx] = useState<number>(0);
  const [visitedLayers, setVisitedLayers] = useState<number[]>([0]);

  // 4. Chmod Interactive Lab State
  const [perms, setPerms] = useState({
    ur: true,
    uw: true,
    ux: true,
    gr: true,
    gw: true,
    gx: true,
    or: true,
    ow: true,
    ox: true,
  });
  const [chmodGoalDone, setChmodGoalDone] = useState(completed);

  // 5. CVSS Matrix Explorer State
  const [attackVector, setAttackVector] = useState<'Network' | 'Local'>('Network');
  const [privileges, setPrivileges] = useState<'None' | 'Low' | 'High'>('None');
  const [impactLevel, setImpactLevel] = useState<'High' | 'Medium' | 'Low'>('High');
  const [cvssConfirmed, setCvssConfirmed] = useState(completed);

  if (activity.kind === 'port-matcher') {
    const targets = [
      { port: '22/tcp', expected: 'SSH — Remote Admin' },
      { port: '53/udp', expected: 'DNS — Name Resolution' },
      { port: '80/tcp', expected: 'HTTP — Unencrypted Web' },
      { port: '443/tcp', expected: 'HTTPS — TLS Encrypted Web' },
    ];
    const choices = targets.map((t) => t.expected);

    const verifyPorts = () => {
      const ok = targets.every((t) => portPicks[t.port] === t.expected);
      if (ok) {
        setPortFeedback('All 4 network ports matched accurately! Activity complete.');
        onComplete();
      } else {
        setPortFeedback('One or more ports need adjustment—check 80 vs 443 and 22 vs 53.');
      }
    };

    return (
      <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#EAF2FA]">{activity.title}</h3>
          <p className="text-xs text-[#9BAEC3]">{activity.instructions}</p>
        </div>

        <div className="space-y-2.5">
          {targets.map((t) => (
            <div
              key={t.port}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center rounded-lg bg-[#071426] border border-[#102B46] p-3"
            >
              <span className="font-mono text-sm font-bold text-[#19B5A5]">{t.port}</span>
              <select
                value={portPicks[t.port] ?? ''}
                onChange={(e) => setPortPicks((p) => ({ ...p, [t.port]: e.target.value }))}
                className="rounded-lg bg-[#0B1C30] border border-[#102B46] px-3 py-2 text-xs text-[#EAF2FA]"
              >
                <option value="">Select service...</option>
                {choices.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {portFeedback && <p className="text-xs text-[#19B5A5]">{portFeedback}</p>}

        <button
          type="button"
          onClick={verifyPorts}
          className="px-4 py-2 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold cursor-pointer"
        >
          Verify Port Classification
        </button>
      </div>
    );
  }

  if (activity.kind === 'http-anatomy') {
    const checkHttp = () => {
      if (httpMethod === 'POST' && httpCookieFlag === 'HttpOnly + Secure' && httpCsp) {
        setHttpFeedback(
          'Secure configuration verified! POST keeps credentials out of URLs, HttpOnly protects cookies, and CSP blocks rogue scripts.'
        );
        onComplete();
      } else {
        setHttpFeedback(
          'To harden login: use POST (not GET), enable HttpOnly + Secure cookies, and turn on Content-Security-Policy.'
        );
      }
    };

    return (
      <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-[#EAF2FA]">{activity.title}</h3>
          <p className="text-xs text-[#9BAEC3] mt-0.5">{activity.instructions}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3 space-y-1.5">
            <label className="block font-semibold text-[#EAF2FA]">Login HTTP Method</label>
            <select
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
              className="w-full rounded bg-[#0B1C30] border border-[#102B46] px-2.5 py-1.5 text-[#EAF2FA]"
            >
              <option value="GET">GET (Query String)</option>
              <option value="POST">POST (Request Body)</option>
            </select>
          </div>
          <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3 space-y-1.5">
            <label className="block font-semibold text-[#EAF2FA]">Session Cookie Flags</label>
            <select
              value={httpCookieFlag}
              onChange={(e) => setHttpCookieFlag(e.target.value)}
              className="w-full rounded bg-[#0B1C30] border border-[#102B46] px-2.5 py-1.5 text-[#EAF2FA]"
            >
              <option value="None">None (Default)</option>
              <option value="HttpOnly + Secure">HttpOnly + Secure</option>
            </select>
          </div>
          <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3 flex items-center gap-2">
            <input
              id="csp-toggle"
              type="checkbox"
              checked={httpCsp}
              onChange={(e) => setHttpCsp(e.target.checked)}
              className="accent-[#19B5A5]"
            />
            <label htmlFor="csp-toggle" className="font-semibold text-[#EAF2FA] cursor-pointer">
              Enable Content-Security-Policy
            </label>
          </div>
        </div>

        <pre className="rounded-lg bg-[#040D1A] border border-[#102B46] p-3 font-mono text-xs text-[#CBD5E1] overflow-x-auto">
          {`${httpMethod} /api/login HTTP/1.1\nHost: securebank.cq-sim.local\nSet-Cookie: cq_session=tok123; ${
            httpCookieFlag === 'None' ? '(no flags)' : 'HttpOnly; Secure; SameSite=Strict'
          }${httpCsp ? "\nContent-Security-Policy: default-src 'self'" : ''}`}
        </pre>

        {httpFeedback && <p className="text-xs text-[#19B5A5]">{httpFeedback}</p>}

        <button
          type="button"
          onClick={checkHttp}
          className="px-4 py-2 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold cursor-pointer"
        >
          Validate Hardened HTTP Exchange
        </button>
      </div>
    );
  }

  if (activity.kind === 'packet-layers') {
    const layers = [
      {
        name: 'Layer 2 · Ethernet Frame',
        fields: 'Src MAC: 08:00:27:4b:11:09 → Dst MAC: 08:00:27:9c:44:21',
        role: 'Delivers frames across the local network segment.',
      },
      {
        name: 'Layer 3 · IPv4 Packet',
        fields: 'Src IP: 192.168.56.105 → Dst IP: 192.168.56.101 · TTL: 64',
        role: 'Routes packets logically between source and destination hosts.',
      },
      {
        name: 'Layer 4 · TCP Segment',
        fields: 'Src Port: 49210 → Dst Port: 80 · Flags: [PSH, ACK]',
        role: 'Tracks reliable ordered streams and port endpoints.',
      },
      {
        name: 'Layer 7 · HTTP Application Data',
        fields: 'POST /login HTTP/1.1 · Content-Type: application/json',
        role: 'Carries the readable application request inside the packet.',
      },
    ];

    const selectLayer = (idx: number) => {
      setLayerIdx(idx);
      const nextVisited = visitedLayers.includes(idx) ? visitedLayers : [...visitedLayers, idx];
      setVisitedLayers(nextVisited);
      if (nextVisited.length === layers.length) {
        onComplete();
      }
    };

    return (
      <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#EAF2FA]">{activity.title}</h3>
            <p className="text-xs text-[#9BAEC3]">Inspect all 4 encapsulation layers below to complete this drill.</p>
          </div>
          <span className="text-xs font-semibold text-[#19B5A5] tabular-nums">
            {visitedLayers.length}/4 Inspected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {layers.map((layer, idx) => (
            <button
              key={layer.name}
              type="button"
              onClick={() => selectLayer(idx)}
              className={`text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                layerIdx === idx
                  ? 'bg-[#2463EB]/20 border-[#2463EB]'
                  : visitedLayers.includes(idx)
                  ? 'bg-[#071426] border-[#19B5A5]/40'
                  : 'bg-[#071426] border-[#102B46]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#EAF2FA]">
                <span>{layer.name}</span>
                {visitedLayers.includes(idx) && <CheckCircle2 className="w-3.5 h-3.5 text-[#19B5A5]" />}
              </div>
              <div className="font-mono text-[11px] text-[#9BAEC3] mt-1">{layer.fields}</div>
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-[#040D1A] border border-[#102B46] p-3.5 text-xs text-[#EAF2FA]">
          <strong className="text-[#19B5A5]">{layers[layerIdx].name}: </strong>
          {layers[layerIdx].role}
        </div>
      </div>
    );
  }

  if (activity.kind === 'chmod-calc') {
    const calcOctal = (r: boolean, w: boolean, x: boolean) => (r ? 4 : 0) + (w ? 2 : 0) + (x ? 1 : 0);
    const u = calcOctal(perms.ur, perms.uw, perms.ux);
    const g = calcOctal(perms.gr, perms.gw, perms.gx);
    const o = calcOctal(perms.or, perms.ow, perms.ox);
    const octal = `${u}${g}${o}`;
    const sym = `-${perms.ur ? 'r' : '-'}${perms.uw ? 'w' : '-'}${perms.ux ? 'x' : '-'}${
      perms.gr ? 'r' : '-'
    }${perms.gw ? 'w' : '-'}${perms.gx ? 'x' : '-'}${perms.or ? 'r' : '-'}${
      perms.ow ? 'w' : '-'
    }${perms.ox ? 'x' : '-'}`;

    const isSecure600 = octal === '600';

    return (
      <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-[#EAF2FA]">{activity.title}</h3>
            <p className="text-xs text-[#9BAEC3]">
              Goal: Toggle the checkboxes below to configure <span className="font-mono text-[#19B5A5]">chmod 600 (-rw-------)</span> for a secret file!
            </p>
          </div>
          <div className="rounded-lg bg-[#040D1A] border border-[#102B46] px-3 py-1.5 font-mono text-sm">
            <span className="text-[#19B5A5] font-bold">{octal}</span>
            <span className="text-[#9BAEC3] ml-2">{sym}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Owner (u)', keys: ['ur', 'uw', 'ux'] as const },
            { label: 'Group (g)', keys: ['gr', 'gw', 'gx'] as const },
            { label: 'Others (o)', keys: ['or', 'ow', 'ox'] as const },
          ].map((col) => (
            <div key={col.label} className="rounded-lg bg-[#071426] border border-[#102B46] p-3 space-y-2">
              <div className="font-semibold text-[#EAF2FA]">{col.label}</div>
              {col.keys.map((k, i) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer text-[#CBD5E1]">
                  <input
                    type="checkbox"
                    checked={perms[k]}
                    onChange={(e) => {
                      const next = { ...perms, [k]: e.target.checked };
                      setPerms(next);
                      const nu = calcOctal(next.ur, next.uw, next.ux);
                      const ng = calcOctal(next.gr, next.gw, next.gx);
                      const no = calcOctal(next.or, next.ow, next.ox);
                      if (`${nu}${ng}${no}` === '600') {
                        setChmodGoalDone(true);
                        onComplete();
                      }
                    }}
                    className="accent-[#19B5A5]"
                  />
                  <span>{i === 0 ? 'Read (4)' : i === 1 ? 'Write (2)' : 'Execute (1)'}</span>
                </label>
              ))}
            </div>
          ))}
        </div>

        {isSecure600 || chmodGoalDone ? (
          <div className="rounded-lg bg-[#19B5A5]/10 border border-[#19B5A5]/35 p-3 text-xs text-[#19B5A5] flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              600 (-rw-------) achieved! Only the file owner can read or write this sensitive file.
            </span>
          </div>
        ) : (
          <div className="text-xs text-[#E5B84B]">
            Current mode is {octal} ({sym}). Uncheck Execute for Owner and all permissions for Group and Others to reach 600.
          </div>
        )}
      </div>
    );
  }

  // 5. CVSS Matrix Explorer
  const score =
    (attackVector === 'Network' ? 3.8 : 1.8) +
    (privileges === 'None' ? 2.8 : privileges === 'Low' ? 1.8 : 0.8) +
    (impactLevel === 'High' ? 3.2 : impactLevel === 'Medium' ? 1.8 : 0.6);
  const clamped = Math.min(10, Number(score.toFixed(1)));
  const rating =
    clamped >= 9.0 ? 'Critical' : clamped >= 7.0 ? 'High' : clamped >= 4.0 ? 'Medium' : 'Low';

  return (
    <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-[#EAF2FA]">{activity.title}</h3>
          <p className="text-xs text-[#9BAEC3]">{activity.instructions}</p>
        </div>
        <div className="rounded-lg bg-[#040D1A] border border-[#102B46] px-3 py-1.5 text-xs font-mono">
          <span className="text-[#9BAEC3]">Simulated Score: </span>
          <span className="font-bold text-[#E5B84B] tabular-nums">{clamped}</span>
          <span className="ml-2 font-semibold text-[#19B5A5]">({rating})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-[#EAF2FA]">
            <Sliders className="w-3.5 h-3.5 text-[#2463EB]" />
            <span>Attack Vector</span>
          </div>
          {(['Network', 'Local'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAttackVector(v)}
              className={`w-full text-left px-2.5 py-1.5 rounded cursor-pointer ${
                attackVector === v ? 'bg-[#2463EB] text-white' : 'bg-[#0B1C30] text-[#9BAEC3]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3 space-y-1.5">
          <div className="font-semibold text-[#EAF2FA]">Privileges Required</div>
          {(['None', 'Low', 'High'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrivileges(p)}
              className={`w-full text-left px-2.5 py-1.5 rounded cursor-pointer ${
                privileges === p ? 'bg-[#2463EB] text-white' : 'bg-[#0B1C30] text-[#9BAEC3]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3 space-y-1.5">
          <div className="font-semibold text-[#EAF2FA]">CIA Impact</div>
          {(['High', 'Medium', 'Low'] as const).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setImpactLevel(i)}
              className={`w-full text-left px-2.5 py-1.5 rounded cursor-pointer ${
                impactLevel === i ? 'bg-[#2463EB] text-white' : 'bg-[#0B1C30] text-[#9BAEC3]'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <span className="text-xs text-[#9BAEC3]">
          Try configuring a Critical (9.0+) Network / None / High scenario and save your exploration.
        </span>
        <button
          type="button"
          onClick={() => {
            setCvssConfirmed(true);
            onComplete();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#19B5A5] hover:bg-[#159a8c] text-[#071426] text-xs font-semibold cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{cvssConfirmed ? 'Exploration Saved' : 'Confirm CVSS Exploration'}</span>
        </button>
      </div>
    </div>
  );
};
