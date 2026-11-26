import { LabDefinition } from '../types/cyberquest';

export const LABS: Record<string, LabDefinition> = {
  'lab-1': {
    id: 'lab-1',
    unitId: 'unit-1',
    number: 'Lab 01',
    missionName: 'Operation: First Contact',
    title: 'Reconnaissance & Port Scanning',
    targetName: 'CQ-SERVER-01',
    targetAddress: '192.168.56.101',
    difficulty: 'Beginner',
    estimatedMinutes: 10,
    xpBonus: 120,
    story:
      'You have been authorized to investigate a newly provisioned training server named CQ-SERVER-01 inside the isolated CyberQuest lab range. Before anyone can harden the server, you need to confirm its IP reachability, map exposed network ports, identify running service versions, and record your reconnaissance findings.',
    objectives: [
      'Confirm target reachability and IP address for CQ-SERVER-01.',
      'Perform a standard Nmap port scan to locate open ports.',
      'Inspect specific ports (22, 80, 443) and determine port states.',
      'Run service version detection (-sV) to identify software versions.',
      'Submit your reconnaissance observation confirming exposed services.',
    ],
    suggestedQuestions: [
      'What does nmap -sV do?',
      'Which ports are open on CQ-SERVER-01?',
      'Why is Apache 2.4.49 important to note?',
      'What commands are supported in this terminal?',
    ],
    tasks: [
      {
        id: 'l1-task-1',
        title: 'Verify Target IP & Reachability',
        description: 'Resolve or ping CQ-SERVER-01 (192.168.56.101) to confirm it is online in the lab range.',
        xpReward: 30,
        hints: {
          level1: 'Before scanning ports, verify the target host resolves and responds on the network.',
          level2: 'Use the simulated ping or host utility against CQ-SERVER-01 or 192.168.56.101.',
          level3: 'Type "ping 192.168.56.101" or "host CQ-SERVER-01" and press Enter.',
          explanation:
            'Running `ping 192.168.56.101` or `host CQ-SERVER-01` confirms the target IP is 192.168.56.101 and reachable inside our authorized sandbox.',
        },
      },
      {
        id: 'l1-task-2',
        title: 'Run Baseline Port Scan',
        description: 'Execute a standard Nmap scan against 192.168.56.101 to discover open ports.',
        xpReward: 35,
        hints: {
          level1: 'Nmap discovers which TCP ports are listening on a target host.',
          level2: 'Pass the target IP directly to the nmap command without extra flags first.',
          level3: 'Run: nmap 192.168.56.101',
          explanation:
            '`nmap 192.168.56.101` runs a baseline port scan and reveals TCP ports 22 (ssh) and 80 (http) are open while 443 (https) is closed.',
        },
      },
      {
        id: 'l1-task-3',
        title: 'Inspect Targeted Ports (22, 80, 443)',
        description: 'Scan specifically ports 22, 80, and 443 using the -p flag.',
        xpReward: 35,
        hints: {
          level1: 'Targeted scans reduce noise and focus strictly on ports of interest.',
          level2: 'Use Nmap’s -p flag followed by a comma-separated list of ports.',
          level3: 'Run: nmap -p 22,80,443 192.168.56.101',
          explanation:
            '`nmap -p 22,80,443 192.168.56.101` narrows the scan strictly to SSH, HTTP, and HTTPS, showing 22 and 80 open and 443 closed.',
        },
      },
      {
        id: 'l1-task-4',
        title: 'Perform Service Version Detection',
        description: 'Use Nmap service detection (-sV) to fingerprint running software versions.',
        xpReward: 45,
        hints: {
          level1: 'Knowing a port is open is only half the picture—security analysts need software versions.',
          level2: 'Combine nmap with the -sV flag to probe open ports for service banners.',
          level3: 'Run: nmap -sV 192.168.56.101',
          explanation:
            '`nmap -sV 192.168.56.101` reveals OpenSSH 8.2 on port 22 and Apache 2.4.49 on port 80—crucial information for vulnerability checks.',
        },
      },
      {
        id: 'l1-task-5',
        title: 'Record Reconnaissance Observation',
        description: 'Confirm the open ports and notable HTTP service version in the Recon Observation panel.',
        xpReward: 40,
        hints: {
          level1: 'Review your -sV scan table carefully before submitting the observation check.',
          level2: 'Look at which ports say "open" and check the Apache version number on port 80.',
          level3: 'Select Open Ports: "22 & 80" and Service Finding: "Apache 2.4.49 (outdated)" in the Recon Summary panel.',
          explanation:
            'Accurate documentation turns raw scan output into actionable security intelligence: ports 22 and 80 are open, and Apache 2.4.49 is outdated and needs patching.',
        },
      },
    ],
  },

  'lab-2': {
    id: 'lab-2',
    unitId: 'unit-2',
    number: 'Lab 02',
    missionName: 'Operation: Broken Shield',
    title: 'Web Application Penetration Testing',
    targetName: 'CQ SecureBank',
    targetAddress: 'https://securebank.cq-sim.local',
    difficulty: 'Foundational',
    estimatedMinutes: 12,
    xpBonus: 140,
    story:
      'CQ SecureBank launched a staging portal for internal review. Early QA notes suggest weak input validation on both the login form and the support search bar. Use the embedded testing workspace and HTTP inspector to observe requests, safely test predefined payloads, and verify the proper code-level fixes.',
    objectives: [
      'Explore CQ SecureBank and inspect a standard HTTP POST login exchange.',
      'Test a safe SQL injection demonstration payload on the login form.',
      'Test a safe XSS demonstration payload on the Support Search bar and inspect escaped rendering.',
      'Select and verify the correct remediations to harden CQ SecureBank.',
    ],
    suggestedQuestions: [
      'Why did the SQL injection payload bypass login?',
      'How does parameterized querying stop SQLi?',
      'Why is the XSS output shown as escaped text?',
      'What should I inspect in the HTTP panel?',
    ],
    tasks: [
      {
        id: 'l2-task-1',
        title: 'Inspect Standard Login HTTP Exchange',
        description: 'Submit normal demo credentials (e.g. alice / bankpass) and inspect the HTTP Request & Response tab.',
        xpReward: 30,
        hints: {
          level1: 'Start by observing how the application behaves under normal conditions.',
          level2: 'Enter any normal username/password in CQ SecureBank Login and click Sign In.',
          level3: 'Click "Fill Demo Credentials" or type "alice" / "password123", submit, and view the HTTP Inspector.',
          explanation:
            'Normal login sends a POST request to /api/login with JSON credentials and returns 401 Unauthorized when credentials do not match.',
        },
      },
      {
        id: 'l2-task-2',
        title: 'Demonstrate Simulated SQL Injection Bypass',
        description: 'Test a safe predefined SQLi demonstration string in the username field to observe broken query logic.',
        xpReward: 45,
        hints: {
          level1: 'When user input is concatenated directly into a SQL string, quotes can alter the query structure.',
          level2: 'Try the safe SQLi test payload preset or enter: \' OR \'1\'=\'1 in the username field.',
          level3: 'Click the safe payload helper "\' OR \'1\'=\'1" on the Login tab and press Sign In.',
          explanation:
            'The simulated backend concatenated the input into `WHERE username = \'\' OR \'1\'=\'1\'`, making the condition always true and logging into the demo account without a valid password.',
        },
      },
      {
        id: 'l2-task-3',
        title: 'Test Reflected XSS & Escaped Output',
        description: 'Navigate to Support Search inside CQ SecureBank and test a safe script demonstration string.',
        xpReward: 45,
        hints: {
          level1: 'Look for another input field in CQ SecureBank that reflects user search terms back onto the page.',
          level2: 'Switch to the "Support Search" tab inside CQ SecureBank and submit a `<script>` test payload.',
          level3: 'Use the safe XSS test string `<script>alert(\'CQ-XSS\')</script>` in Support Search.',
          explanation:
            'In the vulnerable mode, the app warns that unescaped HTML reflection would execute injected script. Escaping special characters (`<` to `&lt;`) neutralizes the payload safely.',
        },
      },
      {
        id: 'l2-task-4',
        title: 'Apply & Verify Security Remediations',
        description: 'Open the Remediation tab, select the correct defensive controls, and re-test the login form.',
        xpReward: 50,
        hints: {
          level1: 'Think about how to fix SQL injection, XSS, and cookie protection at the code level.',
          level2: 'Switch to the "Remediation" panel in the testing inspector and choose parameterized queries + output encoding + HttpOnly.',
          level3: 'Select "Parameterized Queries", "Context-Aware Output Encoding", and "HttpOnly & Secure Cookies", then click Apply & Verify.',
          explanation:
            'Parameterized queries separate SQL code from data, output encoding prevents browser script interpretation, and HttpOnly protects session cookies from script access.',
        },
      },
    ],
  },

  'lab-3': {
    id: 'lab-3',
    unitId: 'unit-3',
    number: 'Lab 03',
    missionName: 'Operation: Packet Detective',
    title: 'Network Traffic Analysis',
    targetName: 'CQ Lab Capture (eth0)',
    targetAddress: '192.168.56.0/24',
    difficulty: 'Foundational',
    estimatedMinutes: 12,
    xpBonus: 140,
    story:
      'An automated alert flagged unusual outbound activity on the CyberQuest training subnet. You have been given a prepared packet capture containing DNS lookups, TCP handshakes, HTTP requests, and a suspicious outbound session. Filter the capture, inspect packet headers, and identify the anomaly.',
    objectives: [
      'Filter DNS packets and identify the domain resolved.',
      'Filter TCP packets and inspect a 3-way handshake.',
      'Inspect HTTP traffic to spot unencrypted application activity.',
      'Filter by host IP 192.168.56.101 and locate the suspicious outbound connection.',
      'Submit your packet detective findings.',
    ],
    suggestedQuestions: [
      'How do display filters work in this analyzer?',
      'What does [SYN], [SYN, ACK], [ACK] mean?',
      'Which packet looks suspicious in the capture?',
      'Why is plaintext HTTP a security concern?',
    ],
    tasks: [
      {
        id: 'l3-task-1',
        title: 'Filter & Inspect DNS Traffic',
        description: 'Apply the "dns" display filter and select a DNS packet to inspect the queried hostname.',
        xpReward: 30,
        hints: {
          level1: 'DNS translates human-readable domain names into IP addresses over UDP port 53.',
          level2: 'Type "dns" in the filter bar (or click the dns filter button) and click one of the DNS rows.',
          level3: 'Apply filter `dns` and select Packet #1 or #2 to inspect the query for `portal.cq-corp.local`.',
          explanation:
            'Filtering for `dns` isolates name resolution queries, showing `192.168.56.101` resolving `portal.cq-corp.local` before making connections.',
        },
      },
      {
        id: 'l3-task-2',
        title: 'Analyze TCP 3-Way Handshake',
        description: 'Apply the "tcp" filter and inspect a SYN or SYN-ACK packet in the Packet Details panel.',
        xpReward: 35,
        hints: {
          level1: 'Every reliable TCP connection begins with a SYN, SYN-ACK, ACK sequence.',
          level2: 'Type "tcp" in the filter bar and select a packet showing `[SYN]` in the Info column.',
          level3: 'Filter by `tcp` and click Packet #3 (`192.168.56.105 -> 192.168.56.101 [SYN]`).',
          explanation:
            'Inspecting the TCP header reveals source/destination ports and flags (`SYN`), establishing the connection before HTTP data flows.',
        },
      },
      {
        id: 'l3-task-3',
        title: 'Inspect Plaintext HTTP Request',
        description: 'Filter for "http" traffic and inspect the POST request carrying sensitive data.',
        xpReward: 40,
        hints: {
          level1: 'HTTP without TLS (port 80) transmits headers and form bodies in readable plaintext.',
          level2: 'Use the `http` filter and click the `POST /login` packet.',
          level3: 'Filter `http` and select Packet #7 (`POST /login HTTP/1.1`).',
          explanation:
            'Packet #7 demonstrates why plaintext HTTP is risky: anyone inspecting network traffic can read submitted credentials directly.',
        },
      },
      {
        id: 'l3-task-4',
        title: 'Isolate Host & Locate Suspicious Beacon',
        description: 'Filter by "ip.addr == 192.168.56.101" and inspect the unusual outbound traffic on port 4444.',
        xpReward: 45,
        hints: {
          level1: 'Focus on packets involving the server IP 192.168.56.101 to see all of its conversations.',
          level2: 'Enter `ip.addr == 192.168.56.101` in the filter input and look for an unfamiliar external IP or unusual port.',
          level3: 'Apply `ip.addr == 192.168.56.101` and click Packet #12 or #13 targeting `185.220.101.42:4444`.',
          explanation:
            'Outbound connections to external IP `185.220.101.42` on non-standard port `4444` with periodic beacon payloads indicate potential unauthorized command-and-control activity.',
        },
      },
      {
        id: 'l3-task-5',
        title: 'Confirm Traffic Investigation Findings',
        description: 'Submit the suspicious destination IP and port in the Analyst Verification panel.',
        xpReward: 40,
        hints: {
          level1: 'Review the details of the anomalous outbound TCP packets you just inspected.',
          level2: 'Check the destination IP and destination port of Packet #12/#13.',
          level3: 'Select Destination `185.220.101.42` and Port `4444` in the Analyst Conclusion box.',
          explanation:
            'Documenting the exact remote IP (`185.220.101.42`) and port (`4444`) lets responders block the connection and investigate host `192.168.56.101`.',
        },
      },
    ],
  },

  'lab-4': {
    id: 'lab-4',
    unitId: 'unit-4',
    number: 'Lab 04',
    missionName: 'Operation: Linux Guardian',
    title: 'Linux System Security',
    targetName: 'cq-linux-node01',
    targetAddress: 'local-sandbox:/',
    difficulty: 'Intermediate',
    estimatedMinutes: 14,
    xpBonus: 150,
    story:
      'You have shell access to a simulated Linux application node (`cq-linux-node01`). Recent configuration changes may have left sensitive credentials readable by everyone and SSH logs showing suspicious activity. Navigate the virtual filesystem, inspect files, identify the permission flaw, and harden the file with chmod.',
    objectives: [
      'Check your current user identity and working directory.',
      'Navigate to /opt/CQ and list detailed file permissions.',
      'Inspect /opt/CQ/db_backup.conf and /var/logs/auth.log.',
      'Change /opt/CQ/db_backup.conf permissions from 777 to 600 using chmod.',
      'Verify the updated permissions with ls -la.',
    ],
    suggestedQuestions: [
      'What does permission 777 mean in Linux?',
      'How does chmod 600 protect a file?',
      'Which directories exist in this simulated system?',
      'What did auth.log reveal?',
    ],
    tasks: [
      {
        id: 'l4-task-1',
        title: 'Identify User & Location',
        description: 'Run "whoami" and "pwd" in the simulated Linux terminal.',
        xpReward: 25,
        hints: {
          level1: 'Always orient yourself first when logging into a Linux system.',
          level2: 'Execute the commands that print your current username and working directory path.',
          level3: 'Type `whoami` and press Enter, then type `pwd` and press Enter.',
          explanation:
            '`whoami` shows you are operating as `student` (non-root), and `pwd` confirms your starting directory `/home/student`.',
        },
      },
      {
        id: 'l4-task-2',
        title: 'Navigate to /opt/CQ & Inspect Permissions',
        description: 'Change directory to /opt/CQ and run "ls -la" to view file permissions.',
        xpReward: 35,
        hints: {
          level1: 'Application configuration files are often stored under `/opt`.',
          level2: 'Use `cd /opt/CQ` followed by `ls -la` to inspect permissions and owners.',
          level3: 'Run `cd /opt/CQ` then `ls -la`.',
          explanation:
            '`ls -la` reveals `db_backup.conf` has `-rwxrwxrwx` (777) permissions—meaning any local user can read, modify, or execute it.',
        },
      },
      {
        id: 'l4-task-3',
        title: 'Read Config & Security Logs',
        description: 'Inspect /opt/CQ/db_backup.conf and /var/logs/auth.log using "cat".',
        xpReward: 40,
        hints: {
          level1: 'Reading configuration files and authentication logs helps uncover exposed secrets and brute-force attempts.',
          level2: 'Use `cat` on both `db_backup.conf` and `/var/logs/auth.log`.',
          level3: 'Run `cat /opt/CQ/db_backup.conf` and `cat /var/logs/auth.log`.',
          explanation:
            '`db_backup.conf` contains sensitive database credentials, while `/var/logs/auth.log` records multiple failed SSH login attempts against `root` and `admin`.',
        },
      },
      {
        id: 'l4-task-4',
        title: 'Restrict Insecure File Permissions',
        description: 'Use "chmod 600" on /opt/CQ/db_backup.conf so only the owner can read and write it.',
        xpReward: 50,
        hints: {
          level1: 'Remove all group and world permissions from sensitive credential files.',
          level2: 'Use `chmod 600` targeting `/opt/CQ/db_backup.conf`.',
          level3: 'Run: chmod 600 /opt/CQ/db_backup.conf',
          explanation:
            '`chmod 600` sets permissions to `-rw-------` (owner read/write only, zero access for group and others).',
        },
      },
      {
        id: 'l4-task-5',
        title: 'Verify Hardened Permissions',
        description: 'Run "ls -la /opt/CQ" (or "ls -la" inside /opt/CQ) after changing permissions to verify the fix.',
        xpReward: 35,
        hints: {
          level1: 'Never assume a security change worked without verifying it.',
          level2: 'List the directory contents again with `-la` after running `chmod`.',
          level3: 'Run `ls -la /opt/CQ` and confirm `db_backup.conf` now displays `-rw-------`.',
          explanation:
            'Verification confirms `-rw-------` (600) is active on `db_backup.conf`, completing the hardening lifecycle.',
        },
      },
    ],
  },

  'lab-5': {
    id: 'lab-5',
    unitId: 'unit-5',
    number: 'Lab 05',
    missionName: 'Operation: Security Analyst',
    title: 'Vulnerability Assessment & Reporting',
    targetName: 'CQ CloudPortal v2.4',
    targetAddress: 'portal.cq-corp.local',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    xpBonus: 175,
    story:
      'As the lead junior security analyst for CyberQuest Training Corp, you are conducting a structured vulnerability assessment of CQ CloudPortal v2.4. Confirm the engagement scope, examine the technical evidence collected across previous phases, classify severity accurately, document remediation guidance, verify patches, and generate the final report.',
    objectives: [
      'Review and confirm the authorized assessment scope.',
      'Inspect all four technical evidence artifacts.',
      'Document severity, observations, impact, and remediation for all four findings.',
      'Verify simulated patch re-tests for each finding.',
      'Compile and submit the structured Vulnerability Assessment Report.',
    ],
    suggestedQuestions: [
      'How should I assign severity ratings?',
      'What makes a strong vulnerability observation?',
      'Why does verification matter after remediation?',
      'What must be included in the final report?',
    ],
    tasks: [
      {
        id: 'l5-task-1',
        title: 'Confirm Scope & Target Profile',
        description: 'Review the Rules of Engagement and confirm the authorized target scope in Step 1.',
        xpReward: 30,
        hints: {
          level1: 'Every professional assessment starts by confirming what systems are authorized for testing.',
          level2: 'Read the target profile on Step 1 (Scope) and check the authorization confirmation.',
          level3: 'Go to Step 1: Scope, review `portal.cq-corp.local`, and click "Confirm Authorized Scope".',
          explanation:
            'Defining scope prevents accidental testing of unauthorized third-party systems and establishes clear assessment boundaries.',
        },
      },
      {
        id: 'l5-task-2',
        title: 'Examine All Technical Evidence',
        description: 'Open and inspect all 4 simulated evidence artifacts in Step 2.',
        xpReward: 35,
        hints: {
          level1: 'Evidence-backed findings prevent guesswork and give engineers reproducible proof.',
          level2: 'Switch to Step 2: Evidence Explorer and inspect each of the 4 artifacts.',
          level3: 'Click through Nmap Scan, Web SQLi Trace, Linux Permissions Snapshot, and HTTP Header Audit.',
          explanation:
            'Reviewing raw evidence gives you exact port numbers, software versions, payloads, and file permissions to cite in your report.',
        },
      },
      {
        id: 'l5-task-3',
        title: 'Assess Severity & Document Findings',
        description: 'Assign severity and complete observation, impact, and remediation for all 4 vulnerabilities in Step 3.',
        xpReward: 55,
        hints: {
          level1: 'Match each finding’s severity to its real-world exploitability and business impact.',
          level2: 'SQL Injection is Critical; Outdated Apache 2.4.49 & 777 DB Secrets are High; Missing Security Headers/HttpOnly is Medium.',
          level3: 'Fill out Severity, Observation, Impact, and Remediation for all 4 findings (you can refine or use the analyst starter templates).',
          explanation:
            'Clear severity classification (Critical/High/Medium) combined with actionable remediation helps engineering teams prioritize fixes effectively.',
        },
      },
      {
        id: 'l5-task-4',
        title: 'Verify Simulated Remediations',
        description: 'Run the simulated re-test verification check on all 4 findings in Step 4.',
        xpReward: 40,
        hints: {
          level1: 'After developers patch vulnerabilities, analysts re-test to confirm the risk is closed.',
          level2: 'Open Step 4: Verification and run the re-test verification action for each finding.',
          level3: 'Click "Run Verification Check" on each of the 4 findings until all show Verified Fixed.',
          explanation:
            'Verification closes the assessment loop by proving the applied patches resolve the original evidence.',
        },
      },
      {
        id: 'l5-task-5',
        title: 'Compile & Submit Assessment Report',
        description: 'Validate all report sections and submit the structured Vulnerability Assessment Report in Step 5.',
        xpReward: 50,
        hints: {
          level1: 'Ensure scope, all 4 findings, and verifications are complete before compiling.',
          level2: 'Open Step 5: Report and click "Submit Assessment Report".',
          level3: 'Review the structured report preview and click "Submit Assessment Report" (you can also print or download it).',
          explanation:
            'A complete, structured report communicates risk clearly to both leadership and engineering stakeholders.',
        },
      },
    ],
  },
};
