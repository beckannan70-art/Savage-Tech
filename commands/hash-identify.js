const crypto = require('crypto');

const hashPatterns = [
  { regex: /^[a-f0-9]{32}$/i, name: 'MD5' },
  { regex: /^[a-f0-9]{40}$/i, name: 'SHA-1' },
  { regex: /^[a-f0-9]{64}$/i, name: 'SHA-256' },
  { regex: /^[a-f0-9]{128}$/i, name: 'SHA-512' },
  { regex: /^\$2[aby]\$\d+\$[./A-Za-z0-9]{53}$/, name: 'bcrypt' },
  { regex: /^[0-9a-f]{16}$/i, name: 'MySQL / NTLM' },
];

module.exports = {
  name: 'hash-identify',
  category: 'ethical hacking',
  description: 'Identify hash type (MD5, SHA1, SHA256, etc.)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const hash = args[0];
    if (!hash) return sock.sendMessage(from, { text: '❓ Usage: .hash-identify <hash>' }, { quoted: msg });

    let matches = [];
    for (const pattern of hashPatterns) {
      if (pattern.regex.test(hash)) matches.push(pattern.name);
    }
    let result = matches.length ? `Possible hash types: ${matches.join(', ')}` : 'Unknown hash type (or too short)';

    await sock.sendMessage(from, { text: result.slice(0, 2000) }, { quoted: msg });
  }
};
