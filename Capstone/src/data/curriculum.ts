import { CurriculumUnit, LearningNode } from '../types/cyberquest';

export const CURRICULUM_UNITS: CurriculumUnit[] = [
  // =========================================================================
  // UNIT 01 — RECONNAISSANCE
  // =========================================================================
  {
    id: 'unit-1',
    number: 'Unit 01',
    title: 'Reconnaissance',
    subtitle: 'Discovery, Network Mapping & Enumeration',
    description:
      'Learn how security analysts gather authorized intelligence about targets, understand IP addresses and ports, and interpret Nmap scan output.',
    accentColor: 'blue',
    milestoneXp: 100,
    labId: 'lab-1',
    nodes: [
      {
        id: 'u1-lesson-1',
        unitId: 'unit-1',
        order: 1,
        type: 'lesson',
        title: 'Foundations of Reconnaissance',
        subtitle: 'Passive vs Active Recon & Authorized Scope',
        estimatedMinutes: 5,
        xpReward: 40,
        byteIntro:
          'Welcome to Unit 01! Before any security test begins, analysts map out the environment carefully—just like checking a building blueprint before inspecting locks.',
        sections: [
          {
            heading: 'What Is Reconnaissance?',
            body: 'Reconnaissance (or "recon") is the systematic information-gathering phase of a security assessment. Its goal is to understand a target’s digital footprint—domain names, IP addresses, exposed services, and software versions—before testing for vulnerabilities.',
            diagramType: 'recon-flow',
            conceptCards: [
              {
                term: 'Passive Reconnaissance',
                summary: 'Gathering public info without touching target systems.',
                detail:
                  'Uses public DNS records, WHOIS lookups, certificate transparency logs, and public documentation. Leaves zero traffic on the target server.',
              },
              {
                term: 'Active Reconnaissance',
                summary: 'Directly probing a target to observe responses.',
                detail:
                  'Involves sending packets (ping, Nmap port scans, HTTP header probes) directly to target hosts. Always requires explicit written authorization.',
              },
              {
                term: 'Authorized Scope',
                summary: 'Legal and operational boundaries of testing.',
                detail:
                  'Testing only approved IP ranges, domains, and lab environments. Unauthorized scanning is unethical and often illegal.',
              },
            ],
          },
          {
            heading: 'Why Scope Discipline Matters',
            body: 'Professional penetration testers verify target ownership and scope before running a single active probe. Throughout CyberQuest, every target resides strictly inside our isolated training range (192.168.56.0/24).',
          },
        ],
        knowledgeCheck: {
          id: 'u1-l1-kc',
          type: 'scenario',
          prompt:
            'An analyst checks public SSL certificate logs and WHOIS registration records for an organization without sending any packets to its servers. Which phase is this?',
          options: [
            {
              id: 'passive',
              label: 'Passive Reconnaissance',
              feedback: 'Correct! Reading public records without touching target hosts is passive recon.',
            },
            {
              id: 'active',
              label: 'Active Reconnaissance',
              feedback: 'Not quite—active recon sends probes directly to the target systems.',
            },
            {
              id: 'remediation',
              label: 'Vulnerability Remediation',
              feedback: 'Remediation happens after findings are discovered and reported.',
            },
          ],
          correctOptionId: 'passive',
          explanation:
            'Passive reconnaissance gathers publicly available intelligence without generating direct network traffic against the target infrastructure.',
        },
      },
      {
        id: 'u1-lesson-2',
        unitId: 'unit-1',
        order: 2,
        type: 'lesson',
        title: 'IP Addresses, Ports & Services',
        subtitle: 'How Network Hosts Expose Applications',
        estimatedMinutes: 6,
        xpReward: 45,
        byteIntro:
          'Think of an IP address as a building’s street address and ports as numbered apartment doors leading to specific services inside.',
        sections: [
          {
            heading: 'Addressing and Port Numbers',
            body: 'An IPv4 address (like 192.168.56.101) uniquely identifies a host on a network. A single server can run multiple applications simultaneously by listening on numbered TCP or UDP ports (0–65535).',
            conceptCards: [
              {
                term: 'Port 22 · SSH',
                summary: 'Secure Shell remote administration',
                detail: 'Encrypted command-line access used by administrators to manage Linux servers.',
              },
              {
                term: 'Port 53 · DNS',
                summary: 'Domain Name System resolution',
                detail: 'Translates human-friendly hostnames (portal.cq-corp.local) into IP addresses.',
              },
              {
                term: 'Port 80 · HTTP',
                summary: 'Unencrypted Web Traffic',
                detail: 'Serves web pages in plaintext unless upgraded or redirected to HTTPS.',
              },
              {
                term: 'Port 443 · HTTPS',
                summary: 'Encrypted Web Traffic (TLS)',
                detail: 'Protects web requests, passwords, and session cookies in transit using TLS.',
              },
            ],
          },
          {
            heading: 'Port States You Will Encounter',
            body: 'When scanning a host, ports typically report one of three states: Open (an application is actively accepting connections), Closed (reachable, but no service is listening), or Filtered (a firewall or packet filter is blocking probes).',
          },
        ],
        knowledgeCheck: {
          id: 'u1-l2-kc',
          type: 'identify',
          prompt:
            'A scan reports port 443/tcp as "closed" while port 80/tcp is "open". What does this tell the analyst?',
          options: [
            {
              id: 'a',
              label: 'The host is reachable, serves plain HTTP on 80, and is not listening on HTTPS (443).',
              feedback: 'Spot on! A closed port responds with a reset, proving the host is online without an HTTPS listener.',
            },
            {
              id: 'b',
              label: 'The server is powered off and unreachable.',
              feedback: 'If it were powered off, port 80 would not report open and 443 would time out.',
            },
            {
              id: 'c',
              label: 'Encrypted TLS traffic is active on port 80 by default.',
              feedback: 'Port 80 is standard unencrypted HTTP; HTTPS uses port 443.',
            },
          ],
          correctOptionId: 'a',
          explanation:
            'Open ports indicate active listeners; closed ports indicate reachable hosts with no application bound to that port number.',
        },
      },
      {
        id: 'u1-lesson-3',
        unitId: 'unit-1',
        order: 3,
        type: 'lesson',
        title: 'Nmap & Scan Interpretation',
        subtitle: 'Service Fingerprinting & Actionable Results',
        estimatedMinutes: 6,
        xpReward: 50,
        byteIntro:
          'Nmap is the industry-standard network discovery tool. Let’s learn how flags like -sV and -p turn raw ports into software intelligence.',
        sections: [
          {
            heading: 'Essential Nmap Commands',
            body: 'Knowing which port is open is useful, but knowing exact software versions lets analysts check whether a service has known security flaws.',
            commands: [
              {
                command: 'nmap <target>',
                purpose: 'Default scan of the top 1,000 TCP ports',
                example: 'nmap 192.168.56.101',
              },
              {
                command: 'nmap -p <ports> <target>',
                purpose: 'Scan only specified ports for speed and precision',
                example: 'nmap -p 22,80,443 192.168.56.101',
              },
              {
                command: 'nmap -sV <target>',
                purpose: 'Probe open ports to determine service & version banners',
                example: 'nmap -sV 192.168.56.101',
              },
            ],
            codeBlock: `PORT     STATE   SERVICE   VERSION
22/tcp   open    ssh       OpenSSH 8.2p1
80/tcp   open    http      Apache httpd 2.4.49
443/tcp  closed  https`,
          },
          {
            heading: 'Interpreting Service Versions',
            body: 'In the sample output above, port 80 reveals Apache httpd 2.4.49—a historically vulnerable release known for path-traversal flaws. Service version detection (-sV) bridges reconnaissance and vulnerability assessment.',
          },
        ],
        knowledgeCheck: {
          id: 'u1-l3-kc',
          type: 'order',
          prompt: 'Arrange the authorized reconnaissance workflow from first step to last.',
          steps: [
            { id: 's1', label: 'Confirm written scope & target authorization' },
            { id: 's2', label: 'Perform passive OSINT & DNS discovery' },
            { id: 's3', label: 'Run baseline port scan & service version detection (-sV)' },
            { id: 's4', label: 'Document open ports & outdated software versions' },
          ],
          correctOrder: ['s1', 's2', 's3', 's4'],
          explanation:
            'Always confirm scope first, gather passive context, execute targeted active scans, and document findings cleanly.',
        },
      },
      {
        id: 'u1-activity',
        unitId: 'unit-1',
        order: 4,
        type: 'activity',
        title: 'Port & Service Explorer',
        subtitle: 'Interactive Port-to-Service Matching Lab',
        estimatedMinutes: 4,
        xpReward: 55,
        byteIntro:
          'Practice pairing common network ports with their services and security implications before jumping into the terminal!',
        activityData: {
          kind: 'port-matcher',
          title: 'Port & Service Classification Challenge',
          instructions: 'Match each network port to its standard protocol and primary security risk.',
        },
      },
      {
        id: 'u1-practice',
        unitId: 'unit-1',
        order: 5,
        type: 'practice',
        title: 'Scan Output Analysis Drill',
        subtitle: 'Interpret Real-World Recon Scenarios',
        estimatedMinutes: 5,
        xpReward: 60,
        byteIntro:
          'Let’s test your eyes on realistic Nmap findings. Read carefully before picking the best analyst conclusion!',
        practiceChallenges: [
          {
            id: 'u1-p1',
            type: 'scenario',
            prompt:
              'You run `nmap -p 22,80,443 192.168.56.101` and see 22/tcp open, 80/tcp open, 443/tcp closed. Which flag should you add next to learn the exact HTTP server software?',
            options: [
              { id: 'sv', label: '-sV (Service Version Detection)', feedback: 'Correct! -sV probes banners to reveal software versions.' },
              { id: 'ping', label: '-sn (Ping Scan Only)', feedback: '-sn skips port scanning altogether.' },
              { id: 'udp', label: '-sU (UDP Scan)', feedback: 'HTTP/SSH run over TCP, not UDP.' },
            ],
            correctOptionId: 'sv',
            explanation: 'Service version detection (-sV) identifies exact daemon versions like Apache 2.4.49 or OpenSSH 8.2.',
          },
          {
            id: 'u1-p2',
            type: 'match',
            prompt: 'Match each Nmap port state to what it means operationally:',
            pairs: [
              { id: 'm1', left: 'open', right: 'An application is actively accepting connections' },
              { id: 'm2', left: 'closed', right: 'Host responded, but no service is listening' },
              { id: 'm3', left: 'filtered', right: 'Firewall or filter is blocking probe responses' },
            ],
            explanation: 'Distinguishing open, closed, and filtered prevents misreading firewall behavior as an offline host.',
          },
        ],
      },
      {
        id: 'u1-lab',
        unitId: 'unit-1',
        order: 6,
        type: 'lab',
        title: 'Mission Lab 1: Operation First Contact',
        subtitle: 'Interactive Recon Terminal on CQ-SERVER-01',
        estimatedMinutes: 10,
        xpReward: 120,
        labId: 'lab-1',
        byteIntro:
          'Time to enter the simulated range! Investigate CQ-SERVER-01 (192.168.56.101) with Nmap and report what services are exposed.',
      },
      {
        id: 'u1-checkpoint',
        unitId: 'unit-1',
        order: 7,
        type: 'checkpoint',
        title: 'Unit 01 Mastery Checkpoint',
        subtitle: 'Reconnaissance Completion Milestone',
        estimatedMinutes: 2,
        xpReward: 100,
        byteIntro:
          'Outstanding work! Completing Unit 01 unlocks your Recon Specialist milestone and opens Unit 02: Web Application Security.',
        byteMilestoneNote: 'Unit 01 Complete — You mapped targets cleanly and mastered Nmap fundamentals!',
      },
    ],
  },

  // =========================================================================
  // UNIT 02 — WEB APPLICATION SECURITY
  // =========================================================================
  {
    id: 'unit-2',
    number: 'Unit 02',
    title: 'Web Application Security',
    subtitle: 'HTTP Mechanics, SQLi, XSS & Secure Coding',
    description:
      'Explore how web browsers communicate with servers, inspect headers and cookies, understand injection flaws, and build defensive fixes.',
    accentColor: 'teal',
    milestoneXp: 110,
    labId: 'lab-2',
    nodes: [
      {
        id: 'u2-lesson-1',
        unitId: 'unit-2',
        order: 1,
        type: 'lesson',
        title: 'HTTP Requests, Responses & Sessions',
        subtitle: 'Methods, Headers & Cookies Under the Hood',
        estimatedMinutes: 6,
        xpReward: 45,
        byteIntro:
          'Every click in a browser sends a structured HTTP message. Understanding requests, status codes, and cookies is step one of web security!',
        sections: [
          {
            heading: 'The HTTP Request–Response Cycle',
            body: 'Web applications communicate through HTTP messages. Clients send a Method (GET, POST, PUT, DELETE), a path, Headers, and an optional Body. Servers reply with a Status Code (200 OK, 302 Redirect, 401 Unauthorized, 500 Server Error) and response data.',
            diagramType: 'http-cycle',
            conceptCards: [
              {
                term: 'GET vs POST',
                summary: 'Retrieving resources vs submitting state changes',
                detail: 'GET passes parameters in the URL query string; POST sends sensitive payloads like login credentials inside the request body.',
              },
              {
                term: 'Session Cookies',
                summary: 'How servers remember authenticated users',
                detail: 'Set-Cookie headers issue a session token. Adding `HttpOnly`, `Secure`, and `SameSite` flags protects tokens from theft.',
              },
              {
                term: 'Security Headers',
                summary: 'Browser-enforced defensive instructions',
                detail: 'Headers like Content-Security-Policy (CSP) and X-Frame-Options restrict script execution and clickjacking.',
              },
            ],
          },
          {
            heading: 'Sample HTTP Login Exchange',
            body: 'Notice how headers carry content type and session instructions alongside the JSON payload:',
            codeBlock: `POST /api/login HTTP/1.1
Host: securebank.cq-sim.local
Content-Type: application/json

{"username": "alice", "password": "••••••••"}`,
          },
        ],
        knowledgeCheck: {
          id: 'u2-l1-kc',
          type: 'identify',
          prompt:
            'Which cookie attribute prevents client-side JavaScript (document.cookie) from reading an authentication session token?',
          options: [
            { id: 'httponly', label: 'HttpOnly', feedback: 'Correct! HttpOnly keeps session cookies inaccessible to JavaScript.' },
            { id: 'maxage', label: 'Max-Age', feedback: 'Max-Age only controls cookie expiration time.' },
            { id: 'domain', label: 'Domain', feedback: 'Domain scopes which hosts receive the cookie.' },
          ],
          correctOptionId: 'httponly',
          explanation: 'Setting `HttpOnly` mitigates session hijacking if an XSS flaw ever occurs.',
        },
      },
      {
        id: 'u2-lesson-2',
        unitId: 'unit-2',
        order: 2,
        type: 'lesson',
        title: 'Input Validation & SQL Injection',
        subtitle: 'When User Data Alters Database Logic',
        estimatedMinutes: 7,
        xpReward: 50,
        byteIntro:
          'SQL injection happens when an application trusts user input enough to glue it straight into a database query. Let’s see how that breaks authentication—and how to stop it!',
        sections: [
          {
            heading: 'How SQL Injection Occurs',
            body: 'If backend code builds a SQL command using raw string concatenation, special characters like single quotes (`\'`) allow untrusted input to change the meaning of the query itself.',
            codeBlock: `-- Vulnerable concatenation
SELECT * FROM users WHERE username = '` + `' OR '1'='1` + `' AND password = '...';

-- Safe parameterized query (Prepared Statement)
SELECT * FROM users WHERE username = ? AND password_hash = ?;`,
            conceptCards: [
              {
                term: 'String Concatenation Risk',
                summary: 'Mixes executable SQL syntax with user data',
                detail: 'Because the database cannot tell where data ends and SQL logic begins, injected operators like OR 1=1 alter query truthiness.',
              },
              {
                term: 'Parameterized Queries',
                summary: 'Primary defense against SQL Injection',
                detail: 'Prepared statements send SQL structure and user values separately so input is strictly treated as literal text, never executable SQL.',
              },
            ],
          },
          {
            heading: 'Defense in Depth',
            body: 'Pair parameterized queries with strict server-side input validation, hashed passwords (bcrypt/Argon2), and least-privilege database accounts.',
          },
        ],
        knowledgeCheck: {
          id: 'u2-l2-kc',
          type: 'scenario',
          prompt:
            'A developer strips the word "SELECT" from login input using a regex instead of using prepared statements. Is the app now safe from SQL injection?',
          options: [
            {
              id: 'no',
              label: 'No — blocklists can be bypassed and do not separate code from data',
              feedback: 'Exactly right! Attackers can bypass simple string filters, whereas parameterized queries eliminate the root cause.',
            },
            {
              id: 'yes',
              label: 'Yes — filtering SELECT stops all database manipulation',
              feedback: 'Not true—login bypasses often rely on quotes and OR logic without needing SELECT at all.',
            },
          ],
          correctOptionId: 'no',
          explanation: 'Parameterized queries (prepared statements) are the reliable architectural fix for SQL injection.',
        },
      },
      {
        id: 'u2-lesson-3',
        unitId: 'unit-2',
        order: 3,
        type: 'lesson',
        title: 'Cross-Site Scripting (XSS) & Remediation',
        subtitle: 'Protecting Browsers via Output Encoding',
        estimatedMinutes: 6,
        xpReward: 50,
        byteIntro:
          'While SQLi targets the database, XSS targets the user’s browser by tricking a page into rendering unescaped script tags.',
        sections: [
          {
            heading: 'Understanding Cross-Site Scripting',
            body: 'When a web page echoes search queries, profile names, or comments directly into HTML without encoding special characters, the browser may interpret `<script>` or event attributes as runnable code.',
            conceptCards: [
              {
                term: 'Reflected XSS',
                summary: 'Input from a request is immediately echoed back unescaped',
                detail: 'Common in search bars or error messages that display `?q=...` directly in HTML.',
              },
              {
                term: 'Stored XSS',
                summary: 'Malicious payload saved in a database and shown to visitors',
                detail: 'Affects every user who views the infected comment, profile, or support ticket.',
              },
              {
                term: 'Output Encoding',
                summary: 'Converting `<` and `>` into harmless entities (`&lt;`, `&gt;`)',
                detail: 'Modern frameworks like React automatically escape JSX text expressions, neutralizing script tags safely.',
              },
            ],
          },
          {
            heading: 'Content Security Policy (CSP)',
            body: 'Adding a strict `Content-Security-Policy` response header acts as a safety net by instructing the browser to disallow inline scripts and unauthorized script domains.',
          },
        ],
        knowledgeCheck: {
          id: 'u2-l3-kc',
          type: 'match',
          prompt: 'Match each web vulnerability to its primary defensive control:',
          pairs: [
            { id: 'w1', left: 'SQL Injection', right: 'Parameterized queries / Prepared statements' },
            { id: 'w2', left: 'Reflected XSS', right: 'Context-aware HTML output encoding & CSP' },
            { id: 'w3', left: 'Cookie Theft via Script', right: 'HttpOnly session cookie attribute' },
          ],
          explanation: 'Each layer of web security addresses a distinct trust boundary: database queries, HTML rendering, and browser cookie storage.',
        },
      },
      {
        id: 'u2-activity',
        unitId: 'unit-2',
        order: 4,
        type: 'activity',
        title: 'HTTP Anatomy Builder',
        subtitle: 'Interactive Request & Header Inspector',
        estimatedMinutes: 5,
        xpReward: 55,
        byteIntro:
          'Inspect each component of a secure HTTP exchange and identify which header or method belongs where!',
        activityData: {
          kind: 'http-anatomy',
          title: 'HTTP Request & Security Header Builder',
          instructions: 'Inspect and assemble the secure HTTP login exchange and cookie protection flags.',
        },
      },
      {
        id: 'u2-practice',
        unitId: 'unit-2',
        order: 5,
        type: 'practice',
        title: 'Web Flaw Triage Challenge',
        subtitle: 'Spot Insecure Patterns Before Entering CQ SecureBank',
        estimatedMinutes: 5,
        xpReward: 65,
        byteIntro:
          'Practice spotting insecure code and HTTP responses before you audit CQ SecureBank in Lab 2.',
        practiceChallenges: [
          {
            id: 'u2-p1',
            type: 'scenario',
            prompt:
              'A search results page renders: `Showing results for: &lt;script&gt;alert(1)&lt;/script&gt;` as visible plain text without popping an alert box. What happened?',
            options: [
              { id: 'escaped', label: 'The application properly HTML-encoded the output.', feedback: 'Correct! Escaping turned tags into harmless literal characters.' },
              { id: 'exploited', label: 'The XSS payload executed successfully.', feedback: 'If it displays as literal text without running script, the defense worked!' },
            ],
            correctOptionId: 'escaped',
            explanation: 'HTML entity encoding converts `<` into `&lt;`, preventing the browser from executing user-supplied markup.',
          },
          {
            id: 'u2-p2',
            type: 'order',
            prompt: 'Order the web security testing workflow:',
            steps: [
              { id: 'ws1', label: 'Map forms, inputs, and HTTP endpoints' },
              { id: 'ws2', label: 'Observe normal HTTP requests and response headers' },
              { id: 'ws3', label: 'Test controlled safe inputs to verify validation' },
              { id: 'ws4', label: 'Apply parameterized queries & encoding, then re-test' },
            ],
            correctOrder: ['ws1', 'ws2', 'ws3', 'ws4'],
            explanation: 'Systematic mapping and baseline observation always come before testing inputs and verifying fixes.',
          },
        ],
      },
      {
        id: 'u2-lab',
        unitId: 'unit-2',
        order: 6,
        type: 'lab',
        title: 'Mission Lab 2: Operation Broken Shield',
        subtitle: 'Test & Harden CQ SecureBank',
        estimatedMinutes: 12,
        xpReward: 140,
        labId: 'lab-2',
        byteIntro:
          'CQ SecureBank is ready for inspection! Explore the simulated banking app, inspect HTTP traffic, test safe payloads, and verify the fixes.',
      },
      {
        id: 'u2-checkpoint',
        unitId: 'unit-2',
        order: 7,
        type: 'checkpoint',
        title: 'Unit 02 Mastery Checkpoint',
        subtitle: 'Web Application Security Milestone',
        estimatedMinutes: 2,
        xpReward: 110,
        byteIntro:
          'Brilliant defense! You earned your Web Defender milestone and unlocked Unit 03: Network Traffic Analysis.',
        byteMilestoneNote: 'Unit 02 Complete — You diagnosed SQLi, XSS, and hardened CQ SecureBank!',
      },
    ],
  },

  // =========================================================================
  // UNIT 03 — NETWORK TRAFFIC ANALYSIS
  // =========================================================================
  {
    id: 'unit-3',
    number: 'Unit 03',
    title: 'Network Traffic Analysis',
    subtitle: 'Protocols, Packet Structure & Wireshark Filtering',
    description:
      'Learn how data travels in packets across TCP, UDP, DNS, and HTTP, and how analysts use display filters to uncover suspicious network behavior.',
    accentColor: 'violet',
    milestoneXp: 110,
    labId: 'lab-3',
    nodes: [
      {
        id: 'u3-lesson-1',
        unitId: 'unit-3',
        order: 1,
        type: 'lesson',
        title: 'Packet Structure & Core Protocols',
        subtitle: 'TCP, UDP, DNS & HTTP in Action',
        estimatedMinutes: 6,
        xpReward: 45,
        byteIntro:
          'Every message on a network is broken into structured packets. Let’s look inside a packet and compare TCP, UDP, DNS, and HTTP!',
        sections: [
          {
            heading: 'Inside a Network Packet',
            body: 'Packets are layered like nested envelopes: Ethernet (Layer 2 MAC addresses) wraps IP (Layer 3 Source/Dest IPs), which wraps Transport headers (Layer 4 TCP/UDP ports), carrying Application data (DNS, HTTP) inside.',
            diagramType: 'packet-layers',
            conceptCards: [
              {
                term: 'TCP (Transmission Control Protocol)',
                summary: 'Reliable, connection-oriented transport',
                detail: 'Uses a 3-way handshake (SYN → SYN-ACK → ACK), sequence numbers, and acknowledgments to guarantee delivery (used by HTTP, SSH).',
              },
              {
                term: 'UDP (User Datagram Protocol)',
                summary: 'Lightweight, connectionless transport',
                detail: 'Sends datagrams quickly without handshakes or retransmission overhead—ideal for DNS queries and streaming.',
              },
              {
                term: 'DNS (Domain Name System)',
                summary: 'Network phonebook resolving names to IPs',
                detail: 'Usually travels over UDP port 53. Unusual DNS spikes or strange domains often reveal malware beaconing.',
              },
            ],
          },
        ],
        knowledgeCheck: {
          id: 'u3-l1-kc',
          type: 'order',
          prompt: 'Place the TCP 3-way handshake packets in the exact sequence they occur:',
          steps: [
            { id: 'syn', label: 'Client sends [SYN] to initiate connection' },
            { id: 'synack', label: 'Server replies with [SYN, ACK]' },
            { id: 'ack', label: 'Client sends [ACK] — connection established' },
          ],
          correctOrder: ['syn', 'synack', 'ack'],
          explanation: 'SYN → SYN-ACK → ACK establishes synchronized sequence numbers before application data flows.',
        },
      },
      {
        id: 'u3-lesson-2',
        unitId: 'unit-3',
        order: 2,
        type: 'lesson',
        title: 'Wireshark & Display Filtering',
        subtitle: 'Cutting Through Noise to Isolate Conversations',
        estimatedMinutes: 6,
        xpReward: 50,
        byteIntro:
          'Real packet captures contain thousands of rows! Display filters let you zoom straight into the exact protocol or IP address you need.',
        sections: [
          {
            heading: 'Essential Display Filters',
            body: 'Tools like Wireshark separate capture views into a Packet List, Packet Details tree, and raw Bytes. Display filters narrow the visible rows without deleting captured data.',
            commands: [
              { command: 'dns', purpose: 'Show only DNS name resolution packets', example: 'dns' },
              { command: 'tcp', purpose: 'Show all TCP segments and handshakes', example: 'tcp' },
              { command: 'http', purpose: 'Show plaintext HTTP requests & responses', example: 'http' },
              {
                command: 'ip.addr == <ip>',
                purpose: 'Show traffic where source OR destination matches IP',
                example: 'ip.addr == 192.168.56.101',
              },
            ],
          },
          {
            heading: 'Reading the Columns',
            body: 'Focus on Time (burst patterns or regular intervals), Source/Destination IPs, Protocol, Length, and the Info summary (`POST /login` or `[SYN]`).',
          },
        ],
        knowledgeCheck: {
          id: 'u3-l2-kc',
          type: 'identify',
          prompt:
            'You only want to inspect traffic sent to or from host 192.168.56.101 in the packet analyzer. Which filter should you enter?',
          options: [
            { id: 'ipaddr', label: 'ip.addr == 192.168.56.101', feedback: 'Correct! `ip.addr ==` matches both source and destination.' },
            { id: 'dns', label: 'dns', feedback: '`dns` filters by protocol, not by a specific host IP.' },
            { id: 'port', label: 'http.port == 192.168.56.101', feedback: 'IP addresses belong to `ip.addr`, not port filters.' },
          ],
          correctOptionId: 'ipaddr',
          explanation: '`ip.addr == 192.168.56.101` isolates every packet involving that host so you can trace its full activity.',
        },
      },
      {
        id: 'u3-lesson-3',
        unitId: 'unit-3',
        order: 3,
        type: 'lesson',
        title: 'Spotting Suspicious Traffic Patterns',
        subtitle: 'Plaintext Credentials, Unusual Ports & Beaconing',
        estimatedMinutes: 6,
        xpReward: 50,
        byteIntro:
          'What makes a packet look suspicious? Look for unencrypted secrets, unexpected external IPs, and odd ports like 4444.',
        sections: [
          {
            heading: 'Red Flags in Packet Captures',
            body: 'Analysts hunt for patterns that deviate from baseline network behavior:',
            conceptCards: [
              {
                term: 'Cleartext Credentials',
                summary: 'Passwords sent over HTTP instead of HTTPS',
                detail: 'Any `POST /login` over port 80 exposes usernames and passwords directly in the packet payload.',
              },
              {
                term: 'Unusual Outbound Ports',
                summary: 'Servers initiating connections on non-standard ports',
                detail: 'Ports like 4444, 1337, or 9001 outbound to unknown external IPs often indicate reverse shells or C2 beacons.',
              },
              {
                term: 'Periodic Beaconing',
                summary: 'Regular timed check-ins to an external server',
                detail: 'Small repeating packets at fixed intervals (e.g., every 10 seconds) are a classic sign of automated agent check-ins.',
              },
            ],
          },
        ],
        knowledgeCheck: {
          id: 'u3-l3-kc',
          type: 'scenario',
          prompt:
            'An internal web server (192.168.56.101) initiates an outbound TCP connection to an unknown external IP on port 4444 every 5 seconds. What is the safest analyst interpretation?',
          options: [
            {
              id: 'c2',
              label: 'Potential unauthorized outbound beacon / reverse channel requiring immediate investigation',
              feedback: 'Correct! Internal servers rarely initiate outbound connections to external hosts on port 4444.',
            },
            {
              id: 'normal',
              label: 'Standard HTTPS web browsing response',
              feedback: 'HTTPS uses port 443 and is initiated by clients, not outbound from a server to port 4444.',
            },
          ],
          correctOptionId: 'c2',
          explanation: 'Correlating unexpected destination IPs, non-standard ports (4444), and repeating intervals helps uncover compromises fast.',
        },
      },
      {
        id: 'u3-activity',
        unitId: 'unit-3',
        order: 4,
        type: 'activity',
        title: 'Packet Encapsulation Stack',
        subtitle: 'Interactive Network Layer Inspector',
        estimatedMinutes: 4,
        xpReward: 55,
        byteIntro:
          'Build a packet from Ethernet up to HTTP and see how each header wraps the payload inside!',
        activityData: {
          kind: 'packet-layers',
          title: 'Packet Layer Encapsulation Explorer',
          instructions: 'Order the network encapsulation layers from outermost (wire) to innermost (data) and inspect each field.',
        },
      },
      {
        id: 'u3-practice',
        unitId: 'unit-3',
        order: 5,
        type: 'practice',
        title: 'Traffic Filter Drill',
        subtitle: 'Choose the Right Filter & Interpret Clues',
        estimatedMinutes: 5,
        xpReward: 65,
        byteIntro:
          'Sharpen your packet-filtering reflexes before opening Lab 3: Operation Packet Detective!',
        practiceChallenges: [
          {
            id: 'u3-p1',
            type: 'match',
            prompt: 'Match each protocol to its typical role in a packet capture:',
            pairs: [
              { id: 'p1', left: 'DNS (UDP/53)', right: 'Resolves hostnames to IP addresses' },
              { id: 'p2', left: 'TCP (SYN/ACK)', right: 'Establishes reliable stream connections' },
              { id: 'p3', left: 'HTTP (TCP/80)', right: 'Transmits unencrypted web requests' },
            ],
            explanation: 'Recognizing normal protocol sequence—DNS lookup, then TCP handshake, then HTTP data—makes anomalies stand out.',
          },
        ],
      },
      {
        id: 'u3-lab',
        unitId: 'unit-3',
        order: 6,
        type: 'lab',
        title: 'Mission Lab 3: Operation Packet Detective',
        subtitle: 'Analyze Simulated Network Capture',
        estimatedMinutes: 12,
        xpReward: 140,
        labId: 'lab-3',
        byteIntro:
          'Your packet analyzer workspace is loaded with the suspicious subnet capture. Apply filters, inspect packets, and locate the anomaly!',
      },
      {
        id: 'u3-checkpoint',
        unitId: 'unit-3',
        order: 7,
        type: 'checkpoint',
        title: 'Unit 03 Mastery Checkpoint',
        subtitle: 'Network Traffic Analysis Milestone',
        estimatedMinutes: 2,
        xpReward: 110,
        byteIntro:
          'Case solved! You earned the Packet Detective milestone and unlocked Unit 04: Linux System Security.',
        byteMilestoneNote: 'Unit 03 Complete — You isolated plaintext leaks and spotted the outbound beacon!',
      },
    ],
  },

  // =========================================================================
  // UNIT 04 — LINUX SYSTEM SECURITY
  // =========================================================================
  {
    id: 'unit-4',
    number: 'Unit 04',
    title: 'Linux System Security',
    subtitle: 'Filesystem, CLI, Permissions, Logs & Hardening',
    description:
      'Master essential Linux terminal commands, navigate standard system directories, inspect authentication logs, and lock down insecure file permissions.',
    accentColor: 'gold',
    milestoneXp: 120,
    labId: 'lab-4',
    nodes: [
      {
        id: 'u4-lesson-1',
        unitId: 'unit-4',
        order: 1,
        type: 'lesson',
        title: 'Linux Filesystem & CLI Essentials',
        subtitle: 'Navigating /, /etc, /var/logs, /home & /opt',
        estimatedMinutes: 6,
        xpReward: 45,
        byteIntro:
          'Most cloud servers and security tools run on Linux. Knowing where configurations and logs live makes you immediately effective on the command line.',
        sections: [
          {
            heading: 'Key Directories in Security Investigations',
            body: 'Linux organizes every file under a single root (`/`). Security analysts regularly inspect specific directories:',
            conceptCards: [
              { term: '/home/student', summary: 'Personal user directories', detail: 'Contains user notes, scripts, and SSH keys.' },
              { term: '/etc', summary: 'System & service configurations', detail: 'Houses `sshd_config`, `passwd`, and firewall rules.' },
              { term: '/var/logs', summary: 'System & authentication logs', detail: 'Records login successes, failed SSH brute attempts, and errors.' },
              { term: '/opt', summary: 'Third-party / custom applications', detail: 'Often holds deployed app configs and backup scripts.' },
            ],
            commands: [
              { command: 'pwd', purpose: 'Print current working directory', example: 'pwd' },
              { command: 'ls -la', purpose: 'List all files including hidden ones & permissions', example: 'ls -la /opt/CQ' },
              { command: 'cd <path>', purpose: 'Change directory', example: 'cd /var/logs' },
              { command: 'cat <file>', purpose: 'Display file contents', example: 'cat /var/logs/auth.log' },
            ],
          },
        ],
        knowledgeCheck: {
          id: 'u4-l1-kc',
          type: 'identify',
          prompt: 'Where should an analyst look first to check for failed SSH login attempts on a Linux server?',
          options: [
            { id: 'logs', label: '/var/logs/auth.log', feedback: 'Correct! Authentication logs record SSH login successes and failures.' },
            { id: 'home', label: '/home/student', feedback: 'Home folders store user files, not system-wide auth logs.' },
            { id: 'opt', label: '/opt', feedback: '/opt contains optional/custom installed applications.' },
          ],
          correctOptionId: 'logs',
          explanation: 'System logs under `/var/logs` (or `/var/log`) provide an audit trail of authentication events.',
        },
      },
      {
        id: 'u4-lesson-2',
        unitId: 'unit-4',
        order: 2,
        type: 'lesson',
        title: 'Users, Groups & File Permissions',
        subtitle: 'Reading rwx Strings & Octal chmod Modes',
        estimatedMinutes: 7,
        xpReward: 50,
        byteIntro:
          'Misconfigured file permissions are one of the most common ways secrets leak on Linux servers. Let’s decode `-rwxrwxrwx` and `chmod`!',
        sections: [
          {
            heading: 'Decoding Permission Strings',
            body: 'Every file lists permissions for three classes: Owner (u), Group (g), and Others (o). Each class uses Read (r = 4), Write (w = 2), and Execute (x = 1).',
            diagramType: 'linux-perms',
            codeBlock: `-rwxrwxrwx (777) -> Everyone can read, write, and execute! (DANGEROUS for secrets)
-rw-r--r-- (644) -> Owner reads/writes; Group & Others can only read
-rw------- (600) -> Owner reads/writes ONLY; zero access for everyone else`,
          },
          {
            heading: 'Hardening with chmod',
            body: 'Sensitive configuration files containing passwords or API keys should follow the Principle of Least Privilege—typically `chmod 600 <file>` so only the owner can access them.',
          },
        ],
        knowledgeCheck: {
          id: 'u4-l2-kc',
          type: 'scenario',
          prompt:
            'You notice `/opt/CQ/db_backup.conf` contains database passwords and shows `-rwxrwxrwx` (777). Which command properly restricts it to owner read/write only?',
          options: [
            { id: '600', label: 'chmod 600 /opt/CQ/db_backup.conf', feedback: 'Correct! 600 grants read+write (4+2=6) solely to the owner.' },
            { id: '777', label: 'chmod 777 /opt/CQ/db_backup.conf', feedback: '777 leaves the file completely open to every user on the system.' },
            { id: '755', label: 'chmod 755 /opt/CQ/db_backup.conf', feedback: '755 still lets every local user read the database password.' },
          ],
          correctOptionId: '600',
          explanation: '`chmod 600` enforces `-rw-------`, protecting confidential configuration files from other local accounts.',
        },
      },
      {
        id: 'u4-lesson-3',
        unitId: 'unit-4',
        order: 3,
        type: 'lesson',
        title: 'Processes, Logs & Secure Configuration',
        subtitle: 'Spot Brute-Force Attempts & Lock Down Access',
        estimatedMinutes: 5,
        xpReward: 45,
        byteIntro:
          'Combining log inspection with permission auditing gives you full visibility into host-level Linux security.',
        sections: [
          {
            heading: 'Hardening Basics',
            body: 'Linux hardening focuses on minimizing unnecessary exposure: disable direct root SSH login (`PermitRootLogin no`), restrict sensitive config permissions (`600`), monitor `auth.log` for repeated failed logins, and review active processes.',
            conceptCards: [
              {
                term: 'whoami & id',
                summary: 'Verify privilege level',
                detail: 'Always confirm whether you are operating as a standard user (`student`) or `root`.',
              },
              {
                term: 'SSH Hardening',
                summary: 'Key-based auth & no root login',
                detail: 'Prevents automated password brute-forcing against privileged accounts.',
              },
            ],
          },
        ],
        knowledgeCheck: {
          id: 'u4-l3-kc',
          type: 'identify',
          prompt: 'In `/etc/ssh/sshd_config`, which setting reduces risk from automated root password guessing?',
          options: [
            { id: 'no', label: 'PermitRootLogin no', feedback: 'Yes! Disabling direct root SSH forces attackers through standard accounts and keys.' },
            { id: 'yes', label: 'PermitRootLogin yes', feedback: 'Allowing direct root login increases brute-force exposure.' },
          ],
          correctOptionId: 'no',
          explanation: 'Disabling direct root SSH login is a foundational Linux server hardening control.',
        },
      },
      {
        id: 'u4-activity',
        unitId: 'unit-4',
        order: 4,
        type: 'activity',
        title: 'Interactive chmod Calculator',
        subtitle: 'Toggle Owner, Group & Other Permission Bits',
        estimatedMinutes: 4,
        xpReward: 55,
        byteIntro:
          'Click the read, write, and execute switches below to see how symbolic strings (`-rw-------`) map to numeric modes (`600`)!',
        activityData: {
          kind: 'chmod-calc',
          title: 'Linux Permission & chmod Bit Laboratory',
          instructions: 'Configure target permissions to match secure config (600) and executable script (750) goals.',
        },
      },
      {
        id: 'u4-practice',
        unitId: 'unit-4',
        order: 5,
        type: 'practice',
        title: 'Linux Security Audit Drill',
        subtitle: 'Diagnose Log & Permission Clues',
        estimatedMinutes: 5,
        xpReward: 65,
        byteIntro:
          'Put your Linux instincts to work before launching Mission Lab 4!',
        practiceChallenges: [
          {
            id: 'u4-p1',
            type: 'match',
            prompt: 'Match each Linux command to its investigative purpose:',
            pairs: [
              { id: 'c1', left: 'whoami', right: 'Confirm active user privilege level' },
              { id: 'c2', left: 'ls -la', right: 'Inspect hidden files and permission bits' },
              { id: 'c3', left: 'chmod 600', right: 'Lock file access strictly to the owner' },
            ],
            explanation: 'These three commands form the backbone of quick host triage and permission remediation.',
          },
        ],
      },
      {
        id: 'u4-lab',
        unitId: 'unit-4',
        order: 6,
        type: 'lab',
        title: 'Mission Lab 4: Operation Linux Guardian',
        subtitle: 'Simulated Linux Terminal & Filesystem Hardening',
        estimatedMinutes: 14,
        xpReward: 150,
        labId: 'lab-4',
        byteIntro:
          'Step into `cq-linux-node01`! Explore the virtual filesystem, read logs, locate the exposed 777 config file, and secure it with `chmod`.',
      },
      {
        id: 'u4-checkpoint',
        unitId: 'unit-4',
        order: 7,
        type: 'checkpoint',
        title: 'Unit 04 Mastery Checkpoint',
        subtitle: 'Linux System Security Milestone',
        estimatedMinutes: 2,
        xpReward: 120,
        byteIntro:
          'System hardened! You earned Linux Guardian and unlocked the capstone Unit 05: Vulnerability Assessment.',
        byteMilestoneNote: 'Unit 04 Complete — Permissions secured and system logs audited!',
      },
    ],
  },

  // =========================================================================
  // UNIT 05 — VULNERABILITY ASSESSMENT
  // =========================================================================
  {
    id: 'unit-5',
    number: 'Unit 05',
    title: 'Vulnerability Assessment',
    subtitle: 'Methodology, Severity, Evidence, Remediation & Reporting',
    description:
      'Bring everything together like a real security analyst: define scope, assess severity with CVSS principles, verify fixes, and deliver an executive-ready report.',
    accentColor: 'teal',
    milestoneXp: 150,
    labId: 'lab-5',
    nodes: [
      {
        id: 'u5-lesson-1',
        unitId: 'unit-5',
        order: 1,
        type: 'lesson',
        title: 'Assessment Methodology & Scope',
        subtitle: 'From Planning to Verified Closure',
        estimatedMinutes: 6,
        xpReward: 50,
        byteIntro:
          'Technical findings only create value when structured through a repeatable methodology. Let’s map out the full vulnerability assessment lifecycle!',
        sections: [
          {
            heading: 'Structured Assessment Lifecycle',
            body: 'Professional assessments follow a disciplined sequence so nothing is missed and stakeholders receive clear, trustworthy results.',
            diagramType: 'va-lifecycle',
            conceptCards: [
              {
                term: '1. Scope & Rules of Engagement',
                summary: 'Define authorized targets and limits',
                detail: 'Confirms exact hostnames, IPs, testing windows, and prohibited actions.',
              },
              {
                term: '2. Discovery & Identification',
                summary: 'Correlate recon, web, traffic & host checks',
                detail: 'Combines port scans, web input tests, and system audits into candidate findings.',
              },
              {
                term: '3. Risk Rating & Evidence',
                summary: 'Prove findings with reproducible artifacts',
                detail: 'Captures exact request/response snippets, commands, and file states.',
              },
              {
                term: '4. Remediation & Verification',
                summary: 'Recommend fixes and re-test patches',
                detail: 'Ensures engineering changes actually eliminate the flaw.',
              },
            ],
          },
        ],
        knowledgeCheck: {
          id: 'u5-l1-kc',
          type: 'order',
          prompt: 'Order the end-to-end vulnerability assessment workflow:',
          steps: [
            { id: 'va1', label: 'Confirm authorized scope & target profile' },
            { id: 'va2', label: 'Gather information & inspect technical evidence' },
            { id: 'va3', label: 'Classify severity & recommend remediation' },
            { id: 'va4', label: 'Verify fixes & deliver the final report' },
          ],
          correctOrder: ['va1', 'va2', 'va3', 'va4'],
          explanation: 'A clear lifecycle ensures assessments are safe, repeatable, and verified.',
        },
      },
      {
        id: 'u5-lesson-2',
        unitId: 'unit-5',
        order: 2,
        type: 'lesson',
        title: 'Risk, Severity & CVSS Concepts',
        subtitle: 'Prioritizing What Matters Most',
        estimatedMinutes: 6,
        xpReward: 50,
        byteIntro:
          'Not every flaw carries equal urgency. Let’s see how analysts combine likelihood, exploitability, and impact into Critical, High, Medium, and Low ratings.',
        sections: [
          {
            heading: 'Understanding Severity & CVSS',
            body: 'The Common Vulnerability Scoring System (CVSS) evaluates factors like Attack Vector (Network vs Local), Privileges Required, User Interaction, and Impact on Confidentiality, Integrity, and Availability (CIA Triad).',
            conceptCards: [
              {
                term: 'Critical (9.0–10.0)',
                summary: 'Immediate remote compromise or full data exposure',
                detail: 'Example: Unauthenticated SQL Injection bypassing login into customer databases.',
              },
              {
                term: 'High (7.0–8.9)',
                summary: 'Major risk with significant exposure or known exploit',
                detail: 'Example: Outdated Apache 2.4.49 on port 80 or world-readable 777 database credentials.',
              },
              {
                term: 'Medium (4.0–6.9)',
                summary: 'Moderate defense-in-depth gaps',
                detail: 'Example: Missing HttpOnly cookie flags or missing Content-Security-Policy headers.',
              },
              {
                term: 'Low / Info (0.1–3.9)',
                summary: 'Minor hardening opportunities',
                detail: 'Example: Verbose server banner without direct exploit path.',
              },
            ],
          },
        ],
        knowledgeCheck: {
          id: 'u5-l2-kc',
          type: 'scenario',
          prompt:
            'An unauthenticated login form allows any internet user to bypass authentication via SQL injection and read customer account records. What severity fits best?',
          options: [
            { id: 'crit', label: 'Critical', feedback: 'Correct! Network-accessible, unauthenticated full auth bypass is Critical.' },
            { id: 'low', label: 'Low', feedback: 'Low applies to minor hardening issues, not unauthenticated database bypasses.' },
          ],
          correctOptionId: 'crit',
          explanation: 'High exploitability (remote, no credentials needed) + high impact (full data compromise) = Critical severity.',
        },
      },
      {
        id: 'u5-lesson-3',
        unitId: 'unit-5',
        order: 3,
        type: 'lesson',
        title: 'Evidence, Remediation & Report Writing',
        subtitle: 'Communicating Clearly to Developers & Leadership',
        estimatedMinutes: 6,
        xpReward: 50,
        byteIntro:
          'A great report helps developers fix issues in minutes. Always pair crisp evidence with concrete remediation steps!',
        sections: [
          {
            heading: 'Anatomy of a High-Quality Finding',
            body: 'Every finding in a professional report answers four questions: What is broken (Title & Description)? How do we know (Evidence)? Why does it matter (Impact)? And how do we fix and verify it (Remediation & Verification)?',
            codeBlock: `Finding: World-Writable Backup Configuration
Severity: High
Evidence: ls -la /opt/CQ/db_backup.conf -> -rwxrwxrwx (777)
Impact: Any local user can read database secrets or tamper with backup scripts.
Remediation: Run 'chmod 600 /opt/CQ/db_backup.conf' and rotate stored credentials.
Verification: Re-checked with 'ls -la' -> -rw------- (600) confirmed.`,
          },
        ],
        knowledgeCheck: {
          id: 'u5-l3-kc',
          type: 'identify',
          prompt: 'Which remediation note is most actionable for an engineering team?',
          options: [
            {
              id: 'good',
              label: 'Replace raw SQL string concatenation in /api/login with parameterized queries and verify bypass fails.',
              feedback: 'Exact, specific, and verifiable—developers know precisely what to change!',
            },
            {
              id: 'vague',
              label: 'Make the login page more secure.',
              feedback: 'Too vague—developers need specific technical guidance and verification criteria.',
            },
          ],
          correctOptionId: 'good',
          explanation: 'Actionable remediation names the affected component, the exact defensive pattern, and how to confirm the fix.',
        },
      },
      {
        id: 'u5-activity',
        unitId: 'unit-5',
        order: 4,
        type: 'activity',
        title: 'CVSS Severity & Risk Matrix',
        subtitle: 'Interactive Vulnerability Scoring Explorer',
        estimatedMinutes: 4,
        xpReward: 55,
        byteIntro:
          'Experiment with Attack Vector, Privileges Required, and Impact sliders to see how CVSS severity shifts in real time!',
        activityData: {
          kind: 'cvss-matrix',
          title: 'Interactive CVSS Risk & Severity Calculator',
          instructions: 'Adjust the vulnerability factors to observe how severity ratings change and classify sample findings.',
        },
      },
      {
        id: 'u5-practice',
        unitId: 'unit-5',
        order: 5,
        type: 'practice',
        title: 'Analyst Report Readiness Check',
        subtitle: 'Match Findings, Severities & Verifications',
        estimatedMinutes: 5,
        xpReward: 65,
        byteIntro:
          'One quick readiness check before you lead the full assessment in Mission Lab 5!',
        practiceChallenges: [
          {
            id: 'u5-p1',
            type: 'match',
            prompt: 'Match each finding to its appropriate severity tier:',
            pairs: [
              { id: 'v1', left: 'Unauthenticated SQL Injection Bypass', right: 'Critical' },
              { id: 'v2', left: 'World-Readable 777 Secrets File', right: 'High' },
              { id: 'v3', left: 'Missing HttpOnly Cookie Flag', right: 'Medium' },
            ],
            explanation: 'Consistent severity triage ensures critical exposures are patched immediately.',
          },
        ],
      },
      {
        id: 'u5-lab',
        unitId: 'unit-5',
        order: 6,
        type: 'lab',
        title: 'Mission Lab 5: Operation Security Analyst',
        subtitle: 'Full Vulnerability Assessment & Report Workspace',
        estimatedMinutes: 15,
        xpReward: 175,
        labId: 'lab-5',
        byteIntro:
          'Your final capstone mission! Conduct a complete 5-stage vulnerability assessment of CQ CloudPortal v2.4 and submit your report.',
      },
      {
        id: 'u5-checkpoint',
        unitId: 'unit-5',
        order: 7,
        type: 'checkpoint',
        title: 'Unit 05 Mastery Checkpoint',
        subtitle: 'CyberQuest Academy Graduation Milestone',
        estimatedMinutes: 2,
        xpReward: 150,
        byteIntro:
          'Incredible achievement! Completing Unit 05 crowns your CyberQuest journey across all five cybersecurity domains.',
        byteMilestoneNote: 'Unit 05 Complete — You delivered an analyst-grade Vulnerability Assessment Report!',
      },
    ],
  },
];

export const ALL_NODES: LearningNode[] = CURRICULUM_UNITS.flatMap((u) => u.nodes);

export function getNodeById(nodeId: string): LearningNode | undefined {
  return ALL_NODES.find((n) => n.id === nodeId);
}

export function getUnitById(unitId: string): CurriculumUnit | undefined {
  return CURRICULUM_UNITS.find((u) => u.id === unitId);
}

/**
 * Node unlocking rule:
 * - First node of Unit 1 is always unlocked.
 * - Within a unit, node N unlocks when node N-1 is completed.
 * - Unit K+1's first node unlocks when Unit K's checkpoint is completed
 *   (or if the student has already completed any node in Unit K+1).
 */
export function isNodeUnlocked(nodeId: string, completedNodes: string[]): boolean {
  const unit = CURRICULUM_UNITS.find((u) => u.nodes.some((n) => n.id === nodeId));
  if (!unit) return false;

  const nodeIndex = unit.nodes.findIndex((n) => n.id === nodeId);
  if (completedNodes.includes(nodeId)) return true;

  if (nodeIndex > 0) {
    const prevNode = unit.nodes[nodeIndex - 1];
    return completedNodes.includes(prevNode.id);
  }

  // First node of a unit:
  const unitIndex = CURRICULUM_UNITS.findIndex((u) => u.id === unit.id);
  if (unitIndex === 0) return true;

  const prevUnit = CURRICULUM_UNITS[unitIndex - 1];
  const prevCheckpoint = prevUnit.nodes[prevUnit.nodes.length - 1];
  return completedNodes.includes(prevCheckpoint.id);
}

export function getNextRecommendedNode(completedNodes: string[]): LearningNode {
  for (const unit of CURRICULUM_UNITS) {
    for (const node of unit.nodes) {
      if (!completedNodes.includes(node.id) && isNodeUnlocked(node.id, completedNodes)) {
        return node;
      }
    }
  }
  return CURRICULUM_UNITS[0].nodes[0];
}
