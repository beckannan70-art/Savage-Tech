const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'mac',
  category: 'ethical hacking',
  description: 'Lookup MAC address vendor',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const mac = args[0];
    if (!mac) return sock.sendMessage(from, { text: '❓ Usage: .mac <MAC address>' }, { quoted: msg });

    try {
      await sock.sendMessage(from, { text: `🔍 Looking up MAC ${mac}...` }, { quoted: msg });
      const res = await axios.get(`https://api.maclookup.app/v2/macs/${mac}`, { httpsAgent: agent });
      if (!res.data.success) throw new Error(res.data.error || 'Not found');
      let text = `🏷️ Vendor: ${res.data.company}\n`;
      text += `Block start: ${res.data.blockStart}\nBlock end: ${res.data.blockEnd}\nMAC range: ${res.data.blockRange}`;
      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ MAC lookup failed: ${err.message}` }, { quoted: msg });
    }
  }
};
