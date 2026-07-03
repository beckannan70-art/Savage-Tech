const { Buffer } = require('buffer');

module.exports = {
  name: 'base64encode',
  category: 'tools',
  description: 'Encode text to Base64',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .base64encode <text>' }, { quoted: msg });

    const encoded = Buffer.from(text, 'utf-8').toString('base64');
    await sock.sendMessage(msg.key.remoteJid, { text: `🔢 *Base64 Encoded*\n\n${encoded}` }, { quoted: msg });
  }
};
