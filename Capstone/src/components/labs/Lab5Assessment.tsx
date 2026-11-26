import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Download,
  FileSearch,
  FileText,
  Printer,
  ShieldCheck,
  Target,
} from 'lucide-react';
import {
  AssessmentFindingDraft,
  AssessmentReportDraft,
  ByteMood,
  LabId,
  LabProgressState,
} from '../../types/cyberquest';

interface Lab5AssessmentProps {
  labState: LabProgressState;
  studentName: string;
  onUpdateDraft: (draft: AssessmentReportDraft) => void;
  onCompleteTask: (labId: LabId, taskId: string, byteMessage?: string, mood?: ByteMood) => void;
  onByteReact: (message: string, mood: ByteMood) => void;
}

type AssessmentStep = 'scope' | 'evidence' | 'findings' | 'verify' | 'report';

interface EvidenceItem {
  id: string;
  title: string;
  source: string;
  snippet: string;
  takeaway: string;
}

const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'ev-nmap',
    title: 'Service Discovery Scan (Nmap -sV)',
    source: 'Reconnaissance Phase · 192.168.56.101',
    snippet: `22/tcp   open   ssh    OpenSSH 8.2
80/tcp   open   http   Apache httpd 2.4.49
443/tcp  closed https`,
    takeaway: 'Apache 2.4.49 is an outdated release and HTTPS (443) is unavailable.',
  },
  {
    id: 'ev-sqli',
    title: 'Web Login Parameterized Test Trace',
    source: 'Web Testing · POST /api/login',
    snippet: `Payload: username = "' OR '1'='1"
Response: 200 OK — Authenticated as Demo Account #CQ-4091
Simulated Query: SELECT * FROM users WHERE username = '' OR '1'='1'`,
    takeaway: 'Unsanitized string concatenation enables full authentication bypass.',
  },
  {
    id: 'ev-linux',
    title: 'Backup Configuration Permission Audit',
    source: 'Host Audit · cq-linux-node01',
    snippet: `$ ls -la /opt/CQ/db_backup.conf
-rwxrwxrwx (777) student student db_backup.conf
Contains: DB_PASSWORD=Sim_Backup_Key_9941!`,
    takeaway: 'World-writable & world-readable (777) secrets file exposes DB credentials to any local user.',
  },
  {
    id: 'ev-headers',
    title: 'HTTP Cookie & Response Header Audit',
    source: 'Web Inspector · Set-Cookie',
    snippet: `HTTP/1.1 200 OK
Set-Cookie: cq_session=sim_auth_4091; Path=/
(Missing: HttpOnly, Secure, SameSite, Content-Security-Policy)`,
    takeaway: 'Session tokens lack HttpOnly/Secure flags and CSP defense-in-depth.',
  },
];

const STARTER_SUGGESTIONS: Record<
  string,
  { severity: string; observation: string; impact: string; remediation: string }
> = {
  'finding-sqli': {
    severity: 'Critical',
    observation:
      "Testing POST /api/login with \"' OR '1'='1\" bypassed password checks and authenticated as account CQ-4091 due to raw SQL string concatenation.",
    impact:
      'Any unauthenticated attacker can bypass login controls and access sensitive customer accounts.',
    remediation:
      'Replace string concatenation with parameterized queries (prepared statements) and enforce strict server-side input validation.',
  },
  'finding-apache': {
    severity: 'High',
    observation:
      'Nmap -sV on 192.168.56.101 identified port 80 running Apache httpd 2.4.49 while port 443 HTTPS is closed.',
    impact:
      'Outdated Apache 2.4.49 contains known path-traversal flaws, and plaintext HTTP exposes traffic in transit.',
    remediation:
      'Upgrade Apache HTTP Server to the latest patched release, enable TLS on port 443, and redirect HTTP to HTTPS.',
  },
  'finding-perms': {
    severity: 'High',
    observation:
      '/opt/CQ/db_backup.conf had 777 (-rwxrwxrwx) permissions while storing plaintext database backup credentials.',
    impact:
      'Any local account on cq-linux-node01 can read or tamper with database credentials.',
    remediation:
      'Run chmod 600 /opt/CQ/db_backup.conf to restrict access to owner only and rotate the exposed backup password.',
  },
  'finding-headers': {
    severity: 'Medium',
    observation:
      'Session cookies on CQ CloudPortal omit HttpOnly and Secure attributes, and responses lack Content-Security-Policy.',
    impact:
      'Increases risk of session cookie theft and reduces browser-level protection against script injection.',
    remediation:
      'Set HttpOnly, Secure, and SameSite=Strict flags on cq_session cookies and add a strict Content-Security-Policy header.',
  },
};

export const Lab5Assessment: React.FC<Lab5AssessmentProps> = ({
  labState,
  studentName,
  onUpdateDraft,
  onCompleteTask,
  onByteReact,
}) => {
  const [step, setStep] = useState<AssessmentStep>('scope');
  const [validationError, setValidationError] = useState('');

  const draft = labState.assessmentDraft!;
  const findingsList = Object.values(draft.findings);

  const handleConfirmScope = () => {
    const next: AssessmentReportDraft = { ...draft, scopeConfirmed: true };
    onUpdateDraft(next);
    onCompleteTask(
      'lab-5',
      'l5-task-1',
      'Authorized scope confirmed for CQ CloudPortal v2.4! Proceed to Step 2: Evidence Explorer.',
      'happy'
    );
    setStep('evidence');
  };

  const handleInspectEvidence = (evId: string) => {
    const existing = draft.exploredEvidenceIds ?? [];
    const updatedIds = existing.includes(evId) ? existing : [...existing, evId];
    const next: AssessmentReportDraft = { ...draft, exploredEvidenceIds: updatedIds };
    onUpdateDraft(next);

    if (updatedIds.length === EVIDENCE_ITEMS.length) {
      onCompleteTask(
        'lab-5',
        'l5-task-2',
        'All 4 technical evidence artifacts examined! Move to Step 3: Findings to classify severity and document remediation.',
        'excited'
      );
    }
  };

  const updateFindingField = (
    findingId: string,
    patch: Partial<AssessmentFindingDraft>
  ) => {
    const current = draft.findings[findingId];
    const updatedFindings = {
      ...draft.findings,
      [findingId]: { ...current, ...patch },
    };
    const nextDraft = { ...draft, findings: updatedFindings };
    onUpdateDraft(nextDraft);

    const allDocumented = Object.values(updatedFindings).every(
      (f) =>
        f.selectedSeverity.trim() &&
        f.observation.trim().length >= 10 &&
        f.impact.trim().length >= 10 &&
        f.remediation.trim().length >= 10
    );
    if (allDocumented) {
      onCompleteTask(
        'lab-5',
        'l5-task-3',
        'All four findings are documented with severity, impact, and remediation! Head to Step 4: Verification to re-test the patches.',
        'happy'
      );
    }
  };

  const handlePopulateStarter = (findingId: string) => {
    const starter = STARTER_SUGGESTIONS[findingId];
    if (!starter) return;
    updateFindingField(findingId, {
      selectedSeverity: starter.severity,
      observation: starter.observation,
      impact: starter.impact,
      remediation: starter.remediation,
    });
  };

  const handleVerifyFinding = (findingId: string) => {
    const current = draft.findings[findingId];
    const updatedFindings = {
      ...draft.findings,
      [findingId]: { ...current, verified: true },
    };
    const nextDraft = { ...draft, findings: updatedFindings };
    onUpdateDraft(nextDraft);

    const allVerified = Object.values(updatedFindings).every((f) => f.verified);
    if (allVerified) {
      onCompleteTask(
        'lab-5',
        'l5-task-4',
        'All four remediations verified fixed! Open Step 5: Report to review and submit your final assessment report.',
        'excited'
      );
    }
  };

  const handleSubmitReport = () => {
    if (!draft.scopeConfirmed) {
      setValidationError('Please confirm the engagement scope in Step 1 first.');
      setStep('scope');
      return;
    }
    const incomplete = findingsList.find(
      (f) =>
        !f.selectedSeverity ||
        f.observation.trim().length < 10 ||
        f.impact.trim().length < 10 ||
        f.remediation.trim().length < 10
    );
    if (incomplete) {
      setValidationError(
        `Please complete severity, observation, impact, and remediation for "${incomplete.title}" in Step 3.`
      );
      setStep('findings');
      onByteReact(
        `Finding "${incomplete.title}" still needs complete documentation before we submit the report.`,
        'concerned'
      );
      return;
    }
    if (!findingsList.every((f) => f.verified)) {
      setValidationError('Please verify remediation checks for all 4 findings in Step 4.');
      setStep('verify');
      return;
    }

    setValidationError('');
    onUpdateDraft({
      ...draft,
      submitted: true,
      submittedAt: new Date().toISOString(),
    });
    onCompleteTask(
      'lab-5',
      'l5-task-5',
      'Vulnerability Assessment Report submitted! Outstanding analyst work across the entire CyberQuest curriculum!',
      'mission-complete'
    );
  };

  const handleDownloadMarkdown = () => {
    const lines = [
      `# ${draft.title}`,
      `Prepared by: ${studentName}`,
      `Target System: CQ CloudPortal v2.4 (portal.cq-corp.local / 192.168.56.101)`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Scope Status: ${draft.scopeConfirmed ? 'Authorized Scope Confirmed' : 'Pending'}`,
      '',
      '## Summary of Findings',
      ...findingsList.flatMap((f, idx) => [
        `### ${idx + 1}. ${f.title}`,
        `- **Severity:** ${f.selectedSeverity || 'Unassigned'}`,
        `- **Verification:** ${f.verified ? 'Verified Fixed' : 'Open'}`,
        `- **Observation & Evidence:** ${f.observation}`,
        `- **Business Impact:** ${f.impact}`,
        `- **Recommended Remediation:** ${f.remediation}`,
        '',
      ]),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CyberQuest-Vulnerability-Assessment-Report.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const steps: { id: AssessmentStep; label: string; icon: React.ReactNode }[] = [
    { id: 'scope', label: '1. Scope', icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'evidence', label: '2. Evidence', icon: <FileSearch className="w-3.5 h-3.5" /> },
    { id: 'findings', label: '3. Findings', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'verify', label: '4. Verify', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'report', label: '5. Report', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      {/* Workflow Stepper Tabs */}
      <div className="no-print flex flex-wrap gap-2 rounded-xl border border-[#102B46] bg-[#0B1C30] p-2">
        {steps.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`flex-1 min-w-[110px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              step === s.id
                ? 'bg-[#2463EB] text-white'
                : 'text-[#9BAEC3] hover:text-[#EAF2FA] hover:bg-[#071426]'
            }`}
          >
            {s.icon}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {validationError && (
        <div className="rounded-lg bg-[#E65B6A]/10 border border-[#E65B6A]/40 px-4 py-3 text-xs text-[#E65B6A]">
          {validationError}
        </div>
      )}

      {/* Step 1: Scope */}
      {step === 'scope' && (
        <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#EAF2FA]">
              Step 1 · Target Profile & Engagement Scope
            </h3>
            <p className="text-xs text-[#9BAEC3]">
              Review authorized targets and rules of engagement before examining evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3.5 space-y-1">
              <div className="text-[#9BAEC3]">Authorized Organization</div>
              <div className="font-semibold text-[#EAF2FA]">CyberQuest Training Corp (Simulated)</div>
            </div>
            <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3.5 space-y-1">
              <div className="text-[#9BAEC3]">In-Scope Target Assets</div>
              <div className="font-mono text-[#19B5A5]">
                portal.cq-corp.local · 192.168.56.101 · cq-linux-node01
              </div>
            </div>
            <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3.5 space-y-1 sm:col-span-2">
              <div className="text-[#9BAEC3]">Rules of Engagement</div>
              <p className="text-[#EAF2FA] leading-relaxed">
                Non-destructive assessment inside isolated training sandbox. Document all confirmed configuration, web, network, and host vulnerabilities with evidence and verification status.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#9BAEC3]">
              Status:{' '}
              <strong className={draft.scopeConfirmed ? 'text-[#19B5A5]' : 'text-[#E5B84B]'}>
                {draft.scopeConfirmed ? 'Scope Confirmed' : 'Awaiting Confirmation'}
              </strong>
            </span>
            <button
              type="button"
              onClick={handleConfirmScope}
              className="px-4 py-2 rounded-lg bg-[#19B5A5] hover:bg-[#159a8c] text-[#071426] text-xs font-semibold transition-colors cursor-pointer"
            >
              {draft.scopeConfirmed ? 'Scope Confirmed · Go to Evidence' : 'Confirm Authorized Scope'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Evidence Explorer */}
      {step === 'evidence' && (
        <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-[#EAF2FA]">
                Step 2 · Technical Evidence Explorer
              </h3>
              <p className="text-xs text-[#9BAEC3]">
                Inspect all 4 collected artifacts to gather concrete proof for your report.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#19B5A5] tabular-nums">
              {draft.exploredEvidenceIds.length}/{EVIDENCE_ITEMS.length} Inspected
            </span>
          </div>

          <div className="space-y-3">
            {EVIDENCE_ITEMS.map((ev) => {
              const inspected = draft.exploredEvidenceIds.includes(ev.id);
              return (
                <div
                  key={ev.id}
                  className={`rounded-xl border p-4 space-y-2.5 transition-colors ${
                    inspected
                      ? 'bg-[#071426] border-[#19B5A5]/40'
                      : 'bg-[#071426] border-[#102B46]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-[#EAF2FA]">{ev.title}</div>
                      <div className="text-xs text-[#9BAEC3]">{ev.source}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInspectEvidence(ev.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        inspected
                          ? 'bg-[#19B5A5]/15 text-[#19B5A5]'
                          : 'bg-[#2463EB] hover:bg-[#1D4ED8] text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{inspected ? 'Inspected' : 'Mark Evidence Reviewed'}</span>
                    </button>
                  </div>

                  <pre className="rounded-lg bg-[#040D1A] border border-[#102B46] p-3 font-mono text-xs text-[#CBD5E1] whitespace-pre-wrap">
                    {ev.snippet}
                  </pre>

                  {inspected && (
                    <div className="text-xs text-[#19B5A5]">
                      <span className="font-semibold">Key Takeaway: </span>
                      {ev.takeaway}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Document Findings */}
      {step === 'findings' && (
        <div className="space-y-4">
          {findingsList.map((finding, idx) => {
            const isComplete =
              Boolean(finding.selectedSeverity) &&
              finding.observation.trim().length >= 10 &&
              finding.impact.trim().length >= 10 &&
              finding.remediation.trim().length >= 10;

            return (
              <div
                key={finding.id}
                className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-4 sm:p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#9BAEC3]">F-0{idx + 1}</span>
                    <h4 className="text-sm font-semibold text-[#EAF2FA]">{finding.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePopulateStarter(finding.id)}
                      className="text-[11px] px-2.5 py-1 rounded bg-[#102B46] hover:bg-[#2463EB]/30 text-[#EAF2FA] cursor-pointer"
                    >
                      Load Analyst Draft Template
                    </button>
                    {isComplete && (
                      <span className="text-xs font-semibold text-[#19B5A5]">Documented</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-[#9BAEC3]">Severity Rating</label>
                    <select
                      value={finding.selectedSeverity}
                      onChange={(e) =>
                        updateFindingField(finding.id, { selectedSeverity: e.target.value })
                      }
                      className="w-full rounded-lg bg-[#071426] border border-[#102B46] px-3 py-2 text-xs text-[#EAF2FA]"
                    >
                      <option value="">Select severity...</option>
                      <option value="Critical">Critical (9.0–10.0)</option>
                      <option value="High">High (7.0–8.9)</option>
                      <option value="Medium">Medium (4.0–6.9)</option>
                      <option value="Low">Low (0.1–3.9)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#9BAEC3]">
                    Observation & Technical Evidence
                  </label>
                  <textarea
                    rows={2}
                    value={finding.observation}
                    onChange={(e) =>
                      updateFindingField(finding.id, { observation: e.target.value })
                    }
                    placeholder="Describe what was observed and cite specific evidence..."
                    className="w-full rounded-lg bg-[#071426] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3 py-2 text-xs text-[#EAF2FA]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-[#9BAEC3]">Security Impact</label>
                    <textarea
                      rows={2}
                      value={finding.impact}
                      onChange={(e) =>
                        updateFindingField(finding.id, { impact: e.target.value })
                      }
                      placeholder="Explain risk to confidentiality, integrity, or availability..."
                      className="w-full rounded-lg bg-[#071426] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3 py-2 text-xs text-[#EAF2FA]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-[#9BAEC3]">
                      Recommended Remediation
                    </label>
                    <textarea
                      rows={2}
                      value={finding.remediation}
                      onChange={(e) =>
                        updateFindingField(finding.id, { remediation: e.target.value })
                      }
                      placeholder="Specify concrete steps engineers should take to fix..."
                      className="w-full rounded-lg bg-[#071426] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3 py-2 text-xs text-[#EAF2FA]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 4: Verification */}
      {step === 'verify' && (
        <div className="rounded-xl border border-[#102B46] bg-[#0B1C30] p-5 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-[#EAF2FA]">
              Step 4 · Remediation Verification Re-Tests
            </h3>
            <p className="text-xs text-[#9BAEC3] mt-0.5">
              Simulate post-patch verification checks to confirm each vulnerability is resolved.
            </p>
          </div>

          <div className="space-y-3">
            {findingsList.map((f) => (
              <div
                key={f.id}
                className="rounded-lg bg-[#071426] border border-[#102B46] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-[#EAF2FA]">{f.title}</div>
                  <div className="text-xs text-[#9BAEC3]">
                    Assigned Severity:{' '}
                    <span className="text-[#EAF2FA] font-medium">
                      {f.selectedSeverity || 'Not yet rated'}
                    </span>
                    <span aria-hidden="true"> · </span>
                    Status:{' '}
                    <span className={f.verified ? 'text-[#19B5A5] font-semibold' : 'text-[#E5B84B]'}>
                      {f.verified ? 'Verified Fixed' : 'Pending Re-test'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyFinding(f.id)}
                  disabled={f.verified}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    f.verified
                      ? 'bg-[#19B5A5]/15 text-[#19B5A5] cursor-default'
                      : 'bg-[#2463EB] hover:bg-[#1D4ED8] text-white'
                  }`}
                >
                  {f.verified ? 'Verification Passed' : 'Run Verification Check'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Report Preview & Export */}
      {step === 'report' && (
        <div className="print-report rounded-xl border border-[#102B46] bg-[#0B1C30] p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#102B46]">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#19B5A5]">
                CyberQuest Vulnerability Assessment Report
              </div>
              <h3 className="text-xl font-bold text-[#EAF2FA]">{draft.title}</h3>
              <div className="text-xs text-[#9BAEC3]">
                Analyst: {studentName} · Target: portal.cq-corp.local (192.168.56.101)
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102B46] hover:bg-[#102B46]/80 text-xs font-medium text-[#EAF2FA] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .MD</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102B46] hover:bg-[#102B46]/80 text-xs font-medium text-[#EAF2FA] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print View</span>
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#19B5A5] hover:bg-[#159a8c] text-[#071426] text-xs font-semibold cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{draft.submitted ? 'Report Submitted' : 'Submit Assessment Report'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3">
              <div className="text-[#9BAEC3]">Scope</div>
              <div className="font-semibold text-[#EAF2FA] mt-0.5">
                {draft.scopeConfirmed ? 'Authorized' : 'Pending'}
              </div>
            </div>
            <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3">
              <div className="text-[#9BAEC3]">Total Findings</div>
              <div className="font-semibold text-[#EAF2FA] tabular-nums mt-0.5">
                {findingsList.length}
              </div>
            </div>
            <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3">
              <div className="text-[#9BAEC3]">Verified Fixed</div>
              <div className="font-semibold text-[#19B5A5] tabular-nums mt-0.5">
                {findingsList.filter((f) => f.verified).length}/{findingsList.length}
              </div>
            </div>
            <div className="rounded-lg bg-[#071426] border border-[#102B46] p-3">
              <div className="text-[#9BAEC3]">Report Status</div>
              <div className="font-semibold text-[#E5B84B] mt-0.5">
                {draft.submitted ? 'Finalized' : 'Draft'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {findingsList.map((f, idx) => (
              <div
                key={f.id}
                className="rounded-lg bg-[#071426] border border-[#102B46] p-4 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-[#EAF2FA]">
                    {idx + 1}. {f.title}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-semibold ${
                        f.selectedSeverity === 'Critical'
                          ? 'text-[#E65B6A]'
                          : f.selectedSeverity === 'High'
                          ? 'text-[#E5B84B]'
                          : 'text-[#38BDF8]'
                      }`}
                    >
                      Severity: {f.selectedSeverity || 'Unassigned'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={f.verified ? 'text-[#19B5A5]' : 'text-[#9BAEC3]'}>
                      {f.verified ? 'Verified Fixed' : 'Open'}
                    </span>
                  </div>
                </div>
                <p className="text-[#CBD5E1]">
                  <strong className="text-[#9BAEC3]">Evidence & Observation: </strong>
                  {f.observation || 'Pending documentation in Step 3.'}
                </p>
                <p className="text-[#CBD5E1]">
                  <strong className="text-[#9BAEC3]">Impact: </strong>
                  {f.impact || 'Pending documentation in Step 3.'}
                </p>
                <p className="text-[#CBD5E1]">
                  <strong className="text-[#9BAEC3]">Remediation: </strong>
                  {f.remediation || 'Pending documentation in Step 3.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
