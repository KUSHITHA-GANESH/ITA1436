import { LABS } from '../data/labsData';
import { getNodeById, getUnitById } from '../data/curriculum';
import { ByteContext, ByteMood, LabId, StudentProgressState } from '../types/cyberquest';

export interface ByteReply {
  text: string;
  mood: ByteMood;
  suggestedFollowUps?: string[];
}

export function getContextualGreeting(
  context: ByteContext,
  progress: StudentProgressState
): { message: string; mood: ByteMood } {
  const name = progress.profile.displayName || 'Cyber Explorer';
  const completedCount = progress.completedNodes.length;
  const completedLabs = Object.values(progress.labProgress).filter((l) => l.completed).length;

  if (context.section === 'dashboard') {
    if (completedCount === 0) {
      return {
        mood: 'welcome',
        message: `Welcome to CyberQuest, ${name}! I’m Byte, your cybersecurity academy partner. Start with Unit 01: Foundations of Reconnaissance to earn your first XP.`,
      };
    }
    if (completedLabs === 5) {
      return {
        mood: 'mission-complete',
        message: `Outstanding work, ${name}! You completed all five Mission Labs. Feel free to revisit any lab or review your Assessment Report.`,
      };
    }
    return {
      mood: 'happy',
      message: `Welcome back, ${name}! You’ve completed ${completedCount} path nodes and ${completedLabs}/5 Mission Labs. Ready for your next objective?`,
    };
  }

  if (context.section === 'learning-path') {
    return {
      mood: 'explaining',
      message:
        'Follow the glowing node along the path! Each unit builds from guided lessons and interactive drills into a hands-on Mission Lab.',
    };
  }

  if (context.section === 'academy' && context.nodeId) {
    const node = getNodeById(context.nodeId);
    if (node) {
      return {
        mood: 'explaining',
        message: node.byteIntro,
      };
    }
  }

  if (context.section === 'labs' && context.labId) {
    const lab = LABS[context.labId];
    const labState = progress.labProgress[context.labId];
    if (lab && labState) {
      if (labState.completed) {
        return {
          mood: 'mission-complete',
          message: `Mission "${lab.missionName}" complete! You can review outputs, test additional scenarios, or reset the lab anytime.`,
        };
      }
      const nextTask = lab.tasks.find((t) => !labState.completedTasks.includes(t.id));
      if (nextTask) {
        return {
          mood: 'hint',
          message: `Current objective in ${lab.missionName}: "${nextTask.title}". Ask me about commands, outputs, or request a progressive hint!`,
        };
      }
    }
  }

  if (context.section === 'achievements') {
    const count = Object.keys(progress.unlockedAchievements).length;
    return {
      mood: count > 0 ? 'happy' : 'idle',
      message:
        count > 0
          ? `You’ve unlocked ${count} badge${count === 1 ? '' : 's'} so far! Check the locked conditions below to plan your next milestone.`
          : 'Complete your first lesson or Mission Lab to unlock your very first CyberQuest badge!',
    };
  }

  if (context.section === 'profile') {
    return {
      mood: 'idle',
      message:
        'Your CyberQuest profile tracks real XP, streak days, completed nodes, and activity history saved locally in your browser.',
    };
  }

  return {
    mood: 'idle',
    message: 'I’m Byte! Ask me about the current task, supported commands, scan outputs, or security concepts.',
  };
}

export function getSuggestedQuestions(context: ByteContext): string[] {
  if (context.section === 'labs' && context.labId && LABS[context.labId]) {
    return LABS[context.labId].suggestedQuestions;
  }

  if (context.unitId === 'unit-1') {
    return [
      'What is the difference between passive and active recon?',
      'What does nmap -sV do?',
      'Why do ports 22 and 80 matter?',
    ];
  }
  if (context.unitId === 'unit-2') {
    return [
      'How does SQL injection work?',
      'How do we prevent XSS?',
      'Why use HttpOnly on cookies?',
    ];
  }
  if (context.unitId === 'unit-3') {
    return [
      'Explain TCP vs UDP simply',
      'What Wireshark filters are useful?',
      'Why is port 4444 suspicious?',
    ];
  }
  if (context.unitId === 'unit-4') {
    return [
      'What does chmod 600 mean?',
      'Why is permission 777 dangerous?',
      'What is inside /var/logs/auth.log?',
    ];
  }
  if (context.unitId === 'unit-5') {
    return [
      'How do analysts rate severity?',
      'What makes good vulnerability evidence?',
      'Why verify after remediation?',
    ];
  }

  return [
    'What should I do next?',
    'Explain how labs work in CyberQuest',
    'How do I earn XP and badges?',
  ];
}

/**
 * Local contextual response engine (zero external LLM API required).
 * Uses structured curriculum + lab knowledge + keyword matching.
 */
export function generateByteResponse(
  rawQuery: string,
  context: ByteContext,
  progress: StudentProgressState
): ByteReply {
  const q = rawQuery.trim().toLowerCase();

  if (!q) {
    return {
      mood: 'idle',
      text: 'Type a cybersecurity question or pick one of the suggested prompts below!',
    };
  }

  // 1. Current task guidance
  if (
    q.includes('current task') ||
    q.includes('next') ||
    q.includes('what should i do') ||
    q.includes('stuck') ||
    q.includes('help me')
  ) {
    if (context.labId && LABS[context.labId]) {
      const lab = LABS[context.labId];
      const labState = progress.labProgress[context.labId];
      const nextTask = lab.tasks.find((t) => !labState.completedTasks.includes(t.id));
      if (nextTask) {
        return {
          mood: 'hint',
          text: `Your active task in ${lab.missionName} is "${nextTask.title}": ${nextTask.description} First clue: ${nextTask.hints.level1}`,
          suggestedFollowUps: ['What commands are supported?', 'Give me a clearer hint'],
        };
      }
      return {
        mood: 'mission-complete',
        text: `You’ve completed every task in ${lab.missionName}! Head to the Learning Path or the next Mission Lab whenever you’re ready.`,
      };
    }

    if (context.unitId) {
      const unit = getUnitById(context.unitId);
      if (unit) {
        const nextNode = unit.nodes.find((n) => !progress.completedNodes.includes(n.id));
        if (nextNode) {
          return {
            mood: 'explaining',
            text: `In ${unit.number} (${unit.title}), your next open step is "${nextNode.title}". Finish the section and knowledge check to unlock the following node!`,
          };
        }
      }
    }
  }

  // 2. Lab 1 — Recon & Nmap
  if (q.includes('nmap') || q.includes('-sv') || q.includes('port scan') || q.includes('apache 2.4.49')) {
    if (q.includes('-sv')) {
      return {
        mood: 'explaining',
        text: '`nmap -sV <ip>` probes open ports to read service banners and detect exact software versions—like `OpenSSH 8.2` on port 22 and `Apache 2.4.49` on port 80.',
      };
    }
    if (q.includes('apache')) {
      return {
        mood: 'concerned',
        text: 'Apache HTTP Server 2.4.49 is an outdated release associated with serious path-traversal vulnerabilities. Flagging exact versions during recon is critical for remediation!',
      };
    }
    return {
      mood: 'explaining',
      text: 'In Lab 1, supported commands include `ping 192.168.56.101`, `host CQ-SERVER-01`, `nmap 192.168.56.101`, `nmap -p 22,80,443 192.168.56.101`, `nmap -sV 192.168.56.101`, `help`, and `clear`.',
    };
  }

  if (q.includes('passive') || q.includes('active') || q.includes('recon')) {
    return {
      mood: 'explaining',
      text: 'Passive recon gathers public data (WHOIS, DNS, certificates) without touching target hosts. Active recon probes targets directly (like Nmap scans) and requires explicit authorization.',
    };
  }

  if (q.includes('port') && (q.includes('22') || q.includes('80') || q.includes('443') || q.includes('open'))) {
    return {
      mood: 'explaining',
      text: 'On CQ-SERVER-01 (`192.168.56.101`), TCP port 22 (SSH) and port 80 (HTTP) are open, while port 443 (HTTPS) is closed—meaning web traffic is unencrypted HTTP.',
    };
  }

  // 3. Lab 2 — Web Security
  if (q.includes('sql') || q.includes('injection') || q.includes('sqli') || q.includes('parameterized')) {
    return {
      mood: 'explaining',
      text: 'SQL injection happens when untrusted input is concatenated into a SQL string (`WHERE user = \'\' OR \'1\'=\'1\'`). Parameterized queries (prepared statements) fix it by keeping SQL logic strictly separate from user values.',
    };
  }

  if (q.includes('xss') || q.includes('cross-site') || q.includes('script') || q.includes('escaped')) {
    return {
      mood: 'explaining',
      text: 'Reflected XSS occurs when input like `<script>...</script>` is rendered raw into HTML. Output encoding converts `<` and `>` into `&lt;` and `&gt;` so the browser safely displays literal text instead of running code.',
    };
  }

  if (q.includes('http') || q.includes('cookie') || q.includes('httponly') || q.includes('header')) {
    return {
      mood: 'explaining',
      text: 'Inspecting HTTP exchanges reveals method, path, status codes (200/401), and security headers. Adding `HttpOnly` to session cookies prevents client-side scripts from reading session tokens.',
    };
  }

  // 4. Lab 3 — Network Traffic Analysis
  if (q.includes('wireshark') || q.includes('filter') || q.includes('packet') || q.includes('4444') || q.includes('beacon')) {
    if (q.includes('4444') || q.includes('suspicious') || q.includes('beacon')) {
      return {
        mood: 'concerned',
        text: 'Packets #12–#14 show `192.168.56.101` initiating outbound TCP connections to external IP `185.220.101.42` on port `4444`—a classic indicator of unauthorized C2 beaconing or a reverse shell.',
      };
    }
    if (q.includes('filter')) {
      return {
        mood: 'explaining',
        text: 'Supported display filters in Lab 3 are `dns`, `tcp`, `udp`, `http`, `ip.addr == 192.168.56.101`, `tcp.port == 4444`, and `all` to clear filters.',
      };
    }
    return {
      mood: 'explaining',
      text: 'Click any packet row to inspect its IP addresses, ports, TCP flags (`SYN`, `SYN, ACK`), DNS queries, or plaintext HTTP payloads.',
    };
  }

  if (q.includes('tcp') || q.includes('udp') || q.includes('syn') || q.includes('dns')) {
    return {
      mood: 'explaining',
      text: 'TCP uses a 3-way handshake (`SYN` → `SYN, ACK` → `ACK`) for reliable delivery, whereas UDP is lightweight and connectionless—commonly used by DNS on port 53.',
    };
  }

  // 5. Lab 4 — Linux Security
  if (q.includes('chmod') || q.includes('777') || q.includes('600') || q.includes('permission')) {
    return {
      mood: 'explaining',
      text: 'In Linux permissions, 4=read, 2=write, 1=execute for Owner/Group/Others. `777` (`-rwxrwxrwx`) lets every user read and modify a file! Running `chmod 600 /opt/CQ/db_backup.conf` restricts it to `-rw-------` (owner read/write only).',
    };
  }

  if (q.includes('auth.log') || q.includes('linux') || q.includes('directory') || q.includes('directories') || q.includes('command')) {
    if (context.labId === 'lab-4') {
      return {
        mood: 'explaining',
        text: 'Supported Lab 4 commands: `pwd`, `ls`, `ls -la`, `cd <dir>`, `cat <file>`, `whoami`, `id`, `mkdir <dir>`, `chmod <mode> <file>`, `help`, and `clear`. Check `/opt/CQ/db_backup.conf` and `/var/logs/auth.log`!',
      };
    }
    return {
      mood: 'explaining',
      text: 'Key Linux security directories: `/etc` (configs like `sshd_config`), `/var/logs` (`auth.log` for SSH login attempts), `/opt/CQ` (deployed app configs), and `/home/student`.',
    };
  }

  // 6. Lab 5 — Vulnerability Assessment
  if (q.includes('severity') || q.includes('cvss') || q.includes('report') || q.includes('evidence') || q.includes('verif')) {
    return {
      mood: 'explaining',
      text: 'Strong assessments pair reproducible evidence with CVSS-aligned severity (e.g., SQLi Bypass = Critical; Outdated Apache 2.4.49 & 777 Secrets = High; Missing HttpOnly/Headers = Medium), specific remediation, and post-fix verification.',
    };
  }

  // 7. Platform / Gamification questions
  if (q.includes('xp') || q.includes('badge') || q.includes('level') || q.includes('achievement')) {
    return {
      mood: 'happy',
      text: 'You earn XP once for each lesson, activity, lab task, mission completion, and Daily Mission. XP increases your Academy Level and unlocks badges on the Achievements page!',
    };
  }

  if (q.includes('lab') || q.includes('simulated') || q.includes('safe')) {
    return {
      mood: 'explaining',
      text: 'All five CyberQuest labs run inside controlled browser simulations—never executing real shell commands or touching real networks—so you can practice safely.',
    };
  }

  // Fallback for unsupported / general off-topic queries (Byte never pretends to be a live LLM)
  return {
    mood: 'thinking',
    text: 'I operate with CyberQuest’s local curriculum and lab knowledge base, so I can’t answer unrelated general topics. Try asking me about your current task, supported commands (`nmap`, `chmod`, packet filters), simulated outputs, SQLi/XSS, or remediation steps!',
    suggestedFollowUps: getSuggestedQuestions(context),
  };
}

export function getProgressiveHintText(
  labId: LabId,
  taskId: string,
  tier: number
): { label: string; text: string } | null {
  const lab = LABS[labId];
  if (!lab) return null;
  const task = lab.tasks.find((t) => t.id === taskId);
  if (!task) return null;

  switch (tier) {
    case 1:
      return { label: 'Hint 1 · Conceptual Clue', text: task.hints.level1 };
    case 2:
      return { label: 'Hint 2 · Tool & Direction', text: task.hints.level2 };
    case 3:
      return { label: 'Hint 3 · Specific Guidance', text: task.hints.level3 };
    case 4:
      return { label: 'Detailed Explanation', text: task.hints.explanation };
    default:
      return null;
  }
}
