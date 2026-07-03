const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'headers',
  category: 'ethical hacking',
  description: 'Fetch HTTP response headers',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    let url = args[0];
    if (!url) return sock.sendMessage(from, { text: '❓ Usage: .headers <url>' }, { quoted: msg });
    if (!url.startsWith('http')) url = 'https://' + url;

    try {
      await sock.sendMessage(from, { text: `📡 Fetching headers from ${url}...` }, { quoted: msg });
      const res = await axios.head(url, { httpsAgent: agent, timeout: 10000 });
      let text = `📋 Headers for ${url}\n`;
      for (const [key, value] of Object.entries(res.headers)) {
        text += `${key}: ${value}\n`;
      }
      await sock.sendMessage(from, { text: text.slice(0, 2000) }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ Headers fetch failed: ${err.message}` }, { quoted: msg });
    }
  }
};
