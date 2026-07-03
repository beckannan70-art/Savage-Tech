const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'password-strength',
  category: 'tools',
  description: 'Check password strength',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const pwd = args.join(' ');
    if (!pwd) return sock.sendMessage(from, { text: '❓ Usage: .password-strength <password>' }, { quoted: msg });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/password-strength?password=${encodeURIComponent(pwd)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.strength || 'No result';
      await sock.sendMessage(from, {
        text: `🔒 *Password Strength*\n\n${result}`
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
    }
  }
};
