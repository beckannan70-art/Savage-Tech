const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'phack',
  category: 'ethical hacking',
  description: 'Ping a host (ethical hacking)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    let target = args[0];
    if (!target) return sock.sendMessage(from, { text: '❓ Usage: .ping <domain>' }, { quoted: msg });
    if (!target.startsWith('http')) target = 'https://' + target;

    try {
      await sock.sendMessage(from, { text: `🏓 Pinging ${target}...` }, { quoted: msg });
      const start = Date.now();
      await axios.get(target, { httpsAgent: agent, timeout: 10000 });
      const latency = Date.now() - start;
      await sock.sendMessage(from, { text: `🛡️ *Ping Result*\n🎯 Target: ${target}\n\n✅ Response time: ${latency} ms` }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ Ping failed: ${err.message}` }, { quoted: msg });
    }
  }
};
