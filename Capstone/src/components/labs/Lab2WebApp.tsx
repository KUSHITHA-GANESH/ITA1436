import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Code2,
  Globe,
  Lock,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { ByteMood, LabId, LabProgressState } from '../../types/cyberquest';

interface Lab2WebAppProps {
  labState: LabProgressState;
  onCompleteTask: (labId: LabId, taskId: string, byteMessage?: string, mood?: ByteMood) => void;
  onByteReact: (message: string, mood: ByteMood) => void;
}

type AppPage = 'login' | 'account' | 'support';
type InspectorTab = 'http' | 'remediation';

interface MockHttpExchange {
  method: string;
  url: string;
  requestHeaders: string;
  requestBody: string;
  status: string;
  responseHeaders: string;
  responseBody: string;
  securityNote: string;
}

const DEFAULT_EXCHANGE: MockHttpExchange = {
  method: 'GET',
  url: '/login',
  requestHeaders: 'Host: securebank.cq-sim.local\nAccept: text/html',
  requestBody: '(empty)',
  status: '200 OK',
  responseHeaders: 'Content-Type: text/html; charset=utf-8\nSet-Cookie: cq_session=demo_guest; Path=/',
  responseBody: '<html>...CQ SecureBank Login Portal...</html>',
  securityNote: 'Notice the session cookie currently lacks HttpOnly and Secure flags.',
};

export const Lab2WebApp: React.FC<Lab2WebAppProps> = ({
  labState,
  onCompleteTask,
  onByteReact,
}) => {
  const [appPage, setAppPage] = useState<AppPage>('login');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('http');

  // Login mock state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authUser, setAuthUser] = useState<{ name: string; accountNo: string; balance: string; viaBypass: boolean } | null>(null);
  const [loginStatus, setLoginStatus] = useState<string>('');

  // Support search mock state (safe escaped XSS demo)
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [xssFlagged, setXssFlagged] = useState(false);

  // Remediation toggles
  const [patchedMode, setPatchedMode] = useState(
    labState.completedTasks.includes('l2-task-4')
  );
  const [fixParameterized, setFixParameterized] = useState(
    labState.completedTasks.includes('l2-task-4')
  );
  const [fixEncoding, setFixEncoding] = useState(
    labState.completedTasks.includes('l2-task-4')
  );
  const [fixHttpOnly, setFixHttpOnly] = useState(
    labState.completedTasks.includes('l2-task-4')
  );
  const [fixFeedback, setFixFeedback] = useState('');

  const [httpLog, setHttpLog] = useState<MockHttpExchange>(DEFAULT_EXCHANGE);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    const isSqliPayload =
      trimmedUser.includes("' OR '1'='1") ||
      trimmedUser.toLowerCase().includes('or 1=1') ||
      trimmedUser.includes("'--");

    if (isSqliPayload) {
      if (!patchedMode) {
        setAuthUser({
          name: 'Demo Account (Bypassed)',
          accountNo: 'CQ-4091-DEMO',
          balance: '$14,820.00 (Simulated)',
          viaBypass: true,
        });
        setAppPage('account');
        setLoginStatus('Simulated SQLi authentication bypass observed!');
        setHttpLog({
          method: 'POST',
          url: '/api/login',
          requestHeaders: 'Host: securebank.cq-sim.local\nContent-Type: application/json',
          requestBody: JSON.stringify({ username: trimmedUser, password: password || '***' }, null, 2),
          status: '200 OK (Simulated Bypass)',
          responseHeaders:
            'Content-Type: application/json\nSet-Cookie: cq_session=sim_auth_4091; Path=/',
          responseBody: JSON.stringify(
            {
              authenticated: true,
              simulatedQuery: `SELECT * FROM users WHERE username = '${trimmedUser}' AND password = '...'`,
              note: 'Unescaped quote altered the simulated SQL WHERE clause to always evaluate true.',
            },
            null,
            2
          ),
          securityNote:
            'Vulnerable concatenation allowed input syntax to modify database logic.',
        });
        onCompleteTask(
          'lab-2',
          'l2-task-2',
          'You just demonstrated how raw SQL string concatenation lets `\' OR \'1\'=\'1` bypass authentication! Check the simulated query in the HTTP Inspector.',
          'concerned'
        );
      } else {
        setLoginStatus('Blocked cleanly! Parameterized query treated input as a literal username.');
        setHttpLog({
          method: 'POST',
          url: '/api/login',
          requestHeaders: 'Host: securebank.cq-sim.local\nContent-Type: application/json',
          requestBody: JSON.stringify({ username: trimmedUser, password: '***' }, null, 2),
          status: '401 Unauthorized',
          responseHeaders:
            'Content-Type: application/json\nSet-Cookie: cq_session=none; HttpOnly; Secure',
          responseBody: JSON.stringify(
            {
              authenticated: false,
              queryPattern: 'SELECT * FROM users WHERE username = ? AND password_hash = ?',
              message: 'Invalid credentials (SQLi attempt safely neutralized)',
            },
            null,
            2
          ),
          securityNote:
            'Patched behavior verified: prepared statements bind input strictly as literal data.',
        });
        onByteReact(
          'Awesome verification! With parameterized queries enabled, the SQLi string failed safely with 401 Unauthorized.',
          'happy'
        );
      }
      return;
    }

    // Standard login test
    if (trimmedUser === 'alice' && password === 'bankpass') {
      setAuthUser({
        name: 'Alice Mercer (Demo)',
        accountNo: 'CQ-1024-DEMO',
        balance: '$2,450.00 (Simulated)',
        viaBypass: false,
      });
      setAppPage('account');
      setLoginStatus('Signed in with valid demo credentials.');
      setHttpLog({
        method: 'POST',
        url: '/api/login',
        requestHeaders: 'Host: securebank.cq-sim.local\nContent-Type: application/json',
        requestBody: JSON.stringify({ username: trimmedUser, password: '••••••••' }, null, 2),
        status: '200 OK',
        responseHeaders: patchedMode
          ? 'Content-Type: application/json\nSet-Cookie: cq_session=alice_tok; HttpOnly; Secure; SameSite=Strict'
          : 'Content-Type: application/json\nSet-Cookie: cq_session=alice_tok; Path=/',
        responseBody: JSON.stringify({ authenticated: true, account: 'CQ-1024-DEMO' }, null, 2),
        securityNote: patchedMode
          ? 'Session cookie includes HttpOnly, Secure, and SameSite.'
          : 'Baseline exchange captured. Notice the Set-Cookie header is missing HttpOnly.',
      });
      onCompleteTask(
        'lab-2',
        'l2-task-1',
        'Baseline HTTP POST captured! Now test a safe SQL injection string like `\' OR \'1\'=\'1` on the login form.',
        'explaining'
      );
    } else {
      setLoginStatus('Invalid credentials (demo account is alice / bankpass).');
      setHttpLog({
        method: 'POST',
        url: '/api/login',
        requestHeaders: 'Host: securebank.cq-sim.local\nContent-Type: application/json',
        requestBody: JSON.stringify({ username: trimmedUser || '(empty)', password: '••••••••' }, null, 2),
        status: '401 Unauthorized',
        responseHeaders: 'Content-Type: application/json',
        responseBody: JSON.stringify({ authenticated: false, error: 'Invalid username or password' }, null, 2),
        securityNote: 'Standard 401 response observed. Next, test the safe SQLi payload.',
      });
      onCompleteTask(
        'lab-2',
        'l2-task-1',
        'You inspected a normal POST /api/login request and 401 response! Try testing `\' OR \'1\'=\'1` in Username next.',
        'happy'
      );
    }
  };

  const handleSupportSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = searchTerm.trim();
    if (!raw) return;

    const looksLikeXss = /<script|onerror=|onload=|<img/i.test(raw);
    setSubmittedSearch(raw);
    setXssFlagged(looksLikeXss);

    setHttpLog({
      method: 'GET',
      url: `/support?q=${encodeURIComponent(raw)}`,
      requestHeaders: 'Host: securebank.cq-sim.local\nAccept: text/html',
      requestBody: '(query parameter)',
      status: '200 OK',
      responseHeaders: patchedMode
        ? 'Content-Type: text/html\nContent-Security-Policy: default-src \'self\''
        : 'Content-Type: text/html',
      responseBody: patchedMode
        ? `<p>Search results for: ${raw.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
        : `<!-- Simulated Vulnerable Reflection (safely neutralized in CyberQuest) -->\n<p>Search results for: ${raw}</p>`,
      securityNote: looksLikeXss
        ? patchedMode
          ? 'Protected! Output encoding converted angle brackets to entities and CSP is active.'
          : 'Reflected XSS flaw detected! Raw `<script>` tags would execute in an unprotected browser.'
        : 'Normal search query reflected.',
    });

    if (looksLikeXss) {
      onCompleteTask(
        'lab-2',
        'l2-task-3',
        'Reflected XSS identified safely! CyberQuest escaped the rendered output so no script executed. Open the Remediation tab to harden the app.',
        'hint'
      );
    }
  };

  const handleApplyFixes = (e: React.FormEvent) => {
    e.preventDefault();
    if (fixParameterized && fixEncoding && fixHttpOnly) {
      setPatchedMode(true);
      setFixFeedback(
        'All 3 defensive controls applied! Re-test the SQLi payload or inspect headers to see the hardened behavior.'
      );
      onCompleteTask(
        'lab-2',
        'l2-task-4',
        'CQ SecureBank is now hardened with parameterized queries, output encoding, and HttpOnly cookies! Mission accomplished.',
        'mission-complete'
      );
    } else {
      setFixFeedback(
        'Make sure all three essential fixes (Parameterized Queries, Output Encoding, and HttpOnly/Secure Cookies) are selected.'
      );
      onByteReact(
        'Each flaw needs its matching control: Parameterized Queries for SQLi, Output Encoding for XSS, and HttpOnly for cookies.',
        'hint'
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: Contained Mock Web Application */}
      <div className="lg:col-span-7 rounded-xl border border-[#102B46] bg-[#040D1A] overflow-hidden flex flex-col">
        {/* Simulated Browser Chrome */}
        <div className="bg-[#0B1C30] border-b border-[#102B46] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="w-3.5 h-3.5 text-[#19B5A5] shrink-0" />
            <span className="font-mono text-xs text-[#EAF2FA] truncate">
              https://securebank.cq-sim.local/{appPage}
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              patchedMode
                ? 'bg-[#19B5A5]/15 text-[#19B5A5]'
                : 'bg-[#E5B84B]/15 text-[#E5B84B]'
            }`}
          >
            {patchedMode ? 'Hardened Build' : 'Vulnerable Staging'}
          </span>
        </div>

        {/* Mock Bank Header & Nav */}
        <div className="bg-[#081629] border-b border-[#102B46] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#2463EB]" />
            <span className="font-semibold text-sm text-[#EAF2FA]">CQ SecureBank</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAppPage('login')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                appPage === 'login'
                  ? 'bg-[#2463EB] text-white'
                  : 'text-[#9BAEC3] hover:text-[#EAF2FA]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setAppPage('account')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                appPage === 'account'
                  ? 'bg-[#2463EB] text-white'
                  : 'text-[#9BAEC3] hover:text-[#EAF2FA]'
              }`}
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => setAppPage('support')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                appPage === 'support'
                  ? 'bg-[#2463EB] text-white'
                  : 'text-[#9BAEC3] hover:text-[#EAF2FA]'
              }`}
            >
              Support Search
            </button>
          </div>
        </div>

        {/* Mock App Body */}
        <div className="p-5 flex-1">
          {appPage === 'login' && (
            <div className="max-w-sm mx-auto space-y-4">
              <div>
                <h3 className="text-base font-semibold text-[#EAF2FA]">Customer Portal Sign In</h3>
                <p className="text-xs text-[#9BAEC3] mt-0.5">
                  Demo credentials: <span className="font-mono text-[#EAF2FA]">alice / bankpass</span>
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="bank-user" className="block text-xs text-[#9BAEC3]">
                    Username
                  </label>
                  <input
                    id="bank-user"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username or test payload"
                    className="w-full rounded-lg bg-[#0B1C30] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3 py-2 text-xs font-mono text-[#EAF2FA]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="bank-pass" className="block text-xs text-[#9BAEC3]">
                    Password
                  </label>
                  <input
                    id="bank-pass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-lg bg-[#0B1C30] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3 py-2 text-xs text-[#EAF2FA]"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('alice');
                      setPassword('bankpass');
                    }}
                    className="px-2.5 py-1 rounded bg-[#102B46] hover:bg-[#102B46]/80 text-[11px] text-[#EAF2FA] cursor-pointer"
                  >
                    Fill Demo Credentials
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername("' OR '1'='1");
                      setPassword('anything');
                    }}
                    className="px-2.5 py-1 rounded bg-[#E5B84B]/15 hover:bg-[#E5B84B]/25 border border-[#E5B84B]/30 text-[11px] font-mono text-[#E5B84B] cursor-pointer"
                  >
                    Test Payload: &apos; OR &apos;1&apos;=&apos;1
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </form>

              {loginStatus && (
                <div className="rounded-lg bg-[#0B1C30] border border-[#102B46] p-3 text-xs text-[#EAF2FA]">
                  {loginStatus}
                </div>
              )}
            </div>
          )}

          {appPage === 'account' && (
            <div className="space-y-4">
              {authUser ? (
                <>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#102B46]">
                    <div>
                      <div className="text-xs text-[#9BAEC3]">Authenticated Profile</div>
                      <div className="text-base font-semibold text-[#EAF2FA]">{authUser.name}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthUser(null);
                        setAppPage('login');
                      }}
                      className="text-xs text-[#9BAEC3] hover:text-[#EAF2FA] underline cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>

                  {authUser.viaBypass && (
                    <div className="rounded-lg bg-[#E65B6A]/10 border border-[#E65B6A]/35 p-3 flex items-start gap-2.5 text-xs text-[#EAF2FA]">
                      <AlertTriangle className="w-4 h-4 text-[#E65B6A] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#E65B6A]">Simulated Auth Bypass:</span>{' '}
                        You reached this demo account without a valid password because the staging query concatenated raw username input.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[#0B1C30] border border-[#102B46] p-3.5">
                      <div className="text-xs text-[#9BAEC3]">Demo Account ID</div>
                      <div className="font-mono text-sm font-semibold text-[#EAF2FA] mt-1">
                        {authUser.accountNo}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#0B1C30] border border-[#102B46] p-3.5">
                      <div className="text-xs text-[#9BAEC3]">Available Balance</div>
                      <div className="font-mono text-sm font-semibold text-[#19B5A5] mt-1">
                        {authUser.balance}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <p className="text-sm text-[#9BAEC3]">No active mock session.</p>
                  <button
                    type="button"
                    onClick={() => setAppPage('login')}
                    className="px-3.5 py-1.5 rounded-lg bg-[#2463EB] text-white text-xs font-medium cursor-pointer"
                  >
                    Go to Login
                  </button>
                </div>
              )}
            </div>
          )}

          {appPage === 'support' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-[#EAF2FA]">Help & FAQ Search</h3>
                <p className="text-xs text-[#9BAEC3] mt-0.5">
                  Test how the application reflects search queries into HTML output.
                </p>
              </div>

              <form onSubmit={handleSupportSearch} className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search help topics or test XSS payload..."
                    className="flex-1 min-w-0 rounded-lg bg-[#0B1C30] border border-[#102B46] focus:border-[#2463EB] focus:outline-none px-3 py-2 text-xs font-mono text-[#EAF2FA]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchTerm("<script>alert('CQ-XSS')</script>")}
                  className="px-2.5 py-1 rounded bg-[#E5B84B]/15 hover:bg-[#E5B84B]/25 border border-[#E5B84B]/30 text-[11px] font-mono text-[#E5B84B] cursor-pointer"
                >
                  Insert Safe XSS Test: &lt;script&gt;alert(&apos;CQ-XSS&apos;)&lt;/script&gt;
                </button>
              </form>

              {submittedSearch && (
                <div className="rounded-lg bg-[#0B1C30] border border-[#102B46] p-4 space-y-2.5">
                  <div className="text-xs text-[#9BAEC3]">
                    Rendered Page Output (Safely Escaped in Sandbox):
                  </div>
                  <div className="font-mono text-xs text-[#EAF2FA] bg-[#071426] p-2.5 rounded border border-[#102B46] break-all">
                    Showing support results for: {submittedSearch}
                  </div>
                  {xssFlagged && (
                    <div
                      className={`rounded-lg p-3 text-xs flex items-start gap-2 ${
                        patchedMode
                          ? 'bg-[#19B5A5]/10 border border-[#19B5A5]/35 text-[#19B5A5]'
                          : 'bg-[#E65B6A]/10 border border-[#E65B6A]/35 text-[#EAF2FA]'
                      }`}
                    >
                      {patchedMode ? (
                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#E65B6A] shrink-0 mt-0.5" />
                      )}
                      <div>
                        {patchedMode
                          ? 'Patched & Verified: Output encoding rendered `<script>` strictly as harmless text and CSP blocked inline script execution.'
                          : 'Simulated Vulnerability Warning: In vulnerable mode, reflecting unescaped `<script>` tags would trigger Reflected XSS in a user’s browser. (CyberQuest keeps execution safely escaped.)'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: HTTP Request/Response Inspector & Remediation Panel */}
      <div className="lg:col-span-5 rounded-xl border border-[#102B46] bg-[#0B1C30] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#102B46] bg-[#071426]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#EAF2FA]">
            <Globe className="w-4 h-4 text-[#2463EB]" />
            <span>Security Testing Inspector</span>
          </div>
          <div className="flex items-center gap-1 bg-[#0B1C30] p-0.5 rounded-lg border border-[#102B46]">
            <button
              type="button"
              onClick={() => setInspectorTab('http')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                inspectorTab === 'http'
                  ? 'bg-[#2463EB] text-white'
                  : 'text-[#9BAEC3] hover:text-[#EAF2FA]'
              }`}
            >
              HTTP Trace
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab('remediation')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                inspectorTab === 'remediation'
                  ? 'bg-[#19B5A5] text-[#071426] font-semibold'
                  : 'text-[#9BAEC3] hover:text-[#EAF2FA]'
              }`}
            >
              Remediation
            </button>
          </div>
        </div>

        {inspectorTab === 'http' ? (
          <div className="p-4 space-y-3 text-xs overflow-y-auto cq-scroll max-h-[460px]">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#102B46]">
              <span className="font-mono font-semibold text-[#19B5A5]">
                {httpLog.method} {httpLog.url}
              </span>
              <span className="font-mono text-[#E5B84B]">{httpLog.status}</span>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-[#9BAEC3] mb-1">Request Headers & Body</div>
              <pre className="rounded-lg bg-[#040D1A] border border-[#102B46] p-2.5 font-mono text-[11px] text-[#CBD5E1] whitespace-pre-wrap break-words">
                {httpLog.requestHeaders}
                {'\n\n'}
                {httpLog.requestBody}
              </pre>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-[#9BAEC3] mb-1">Simulated Response</div>
              <pre className="rounded-lg bg-[#040D1A] border border-[#102B46] p-2.5 font-mono text-[11px] text-[#CBD5E1] whitespace-pre-wrap break-words">
                {httpLog.responseHeaders}
                {'\n\n'}
                {httpLog.responseBody}
              </pre>
            </div>

            <div className="rounded-lg bg-[#071426] border border-[#2463EB]/30 p-2.5 text-[#EAF2FA] leading-relaxed">
              <span className="font-semibold text-[#38BDF8]">Observation: </span>
              {httpLog.securityNote}
            </div>
          </div>
        ) : (
          <form onSubmit={handleApplyFixes} className="p-4 space-y-3.5 text-xs">
            <div className="flex items-center gap-2 text-[#EAF2FA] font-semibold">
              <Code2 className="w-4 h-4 text-[#19B5A5]" />
              <span>Select Defensive Controls to Patch CQ SecureBank</span>
            </div>

            <label className="flex items-start gap-2.5 rounded-lg bg-[#071426] border border-[#102B46] p-3 cursor-pointer hover:border-[#2463EB]/50">
              <input
                type="checkbox"
                checked={fixParameterized}
                onChange={(e) => setFixParameterized(e.target.checked)}
                className="mt-0.5 accent-[#19B5A5]"
              />
              <div>
                <div className="font-semibold text-[#EAF2FA]">Parameterized Queries (Prepared Statements)</div>
                <div className="text-[#9BAEC3] mt-0.5">
                  Separate SQL structure from user-supplied credentials in `/api/login`.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 rounded-lg bg-[#071426] border border-[#102B46] p-3 cursor-pointer hover:border-[#2463EB]/50">
              <input
                type="checkbox"
                checked={fixEncoding}
                onChange={(e) => setFixEncoding(e.target.checked)}
                className="mt-0.5 accent-[#19B5A5]"
              />
              <div>
                <div className="font-semibold text-[#EAF2FA]">Context-Aware Output Encoding & CSP</div>
                <div className="text-[#9BAEC3] mt-0.5">
                  HTML-encode reflected search terms (`&lt;`, `&gt;`) and enforce Content-Security-Policy.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 rounded-lg bg-[#071426] border border-[#102B46] p-3 cursor-pointer hover:border-[#2463EB]/50">
              <input
                type="checkbox"
                checked={fixHttpOnly}
                onChange={(e) => setFixHttpOnly(e.target.checked)}
                className="mt-0.5 accent-[#19B5A5]"
              />
              <div>
                <div className="font-semibold text-[#EAF2FA]">HttpOnly, Secure & SameSite Session Cookies</div>
                <div className="text-[#9BAEC3] mt-0.5">
                  Prevent client-side scripts from accessing `cq_session` cookies.
                </div>
              </div>
            </label>

            {fixFeedback && (
              <div className="rounded-lg bg-[#071426] border border-[#19B5A5]/40 p-2.5 text-[#19B5A5] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{fixFeedback}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-[#19B5A5] hover:bg-[#159a8c] text-[#071426] font-semibold transition-colors cursor-pointer"
            >
              Apply & Verify Security Patches
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
