const crypto = require('crypto');

module.exports = {
  name: 'hash',
  category: 'tools',
  description: 'Generate hash (md5, sha1, sha256)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const input = args.join(' ');
    if (!input) return sock.sendMessage(from, { text: '❓ Usage: .hash <text> [algorithm] (md5/sha1/sha256)' }, { quoted: msg });

    const parts = input.split(' ');
    const text = parts[0];
    let algo = parts[1] || 'md5';
    if (!['md5', 'sha1', 'sha256'].includes(algo)) algo = 'md5';

    const hash = crypto.createHash(algo).update(text).digest('hex');
    await sock.sendMessage(from, {
      text: `🔐 *${algo.toUpperCase()} hash*\n\n${hash}`
    }, { quoted: msg });
  }
};
