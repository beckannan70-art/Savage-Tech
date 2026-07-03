const crypto = require('crypto');

module.exports = {
  name: 'hash-generate',
  category: 'ethical hacking',
  description: 'Generate MD5, SHA1, SHA256, SHA512 hash',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(from, { text: '❓ Usage: .hash-generate <text>' }, { quoted: msg });

    const md5 = crypto.createHash('md5').update(text).digest('hex');
    const sha1 = crypto.createHash('sha1').update(text).digest('hex');
    const sha256 = crypto.createHash('sha256').update(text).digest('hex');
    const sha512 = crypto.createHash('sha512').update(text).digest('hex');
    const result = `🔐 Hashes for "${text}":\nMD5: ${md5}\nSHA1: ${sha1}\nSHA256: ${sha256}\nSHA512: ${sha512}`;

    await sock.sendMessage(from, { text: result.slice(0, 2000) }, { quoted: msg });
  }
};
