const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'ip-validate',
  category: 'tools',
  description: 'Validate IP address',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const ip = args[0];
    if (!ip) return sock.sendMessage(from, { text: '❓ Usage: .ip-validate <ip_address>' }, { quoted: msg });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/ip-validate?ip=${encodeURIComponent(ip)}`, { httpsAgent: agent });
      const isValid = res.data.valid ? '✅ Valid IP' : '❌ Invalid IP';
      const result = res.data.result || isValid;
      await sock.sendMessage(from, {
        text: `🌐 *IP Validation*\n\n${result}`
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
    }
  }
};
