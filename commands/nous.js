const axios = require('axios');

module.exports = {
  name: 'nous',
  category: 'ai',
  description: 'Chat with Nous Hermes AI',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return await sock.sendMessage(from, { text: '❓ Ask Nous Hermes something?' }, { quoted: msg });

    try {
      const url = `https://apis.xwolf.space/api/ai/nous?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      const reply = res.data.status ? (res.data.result || 'No response') : `⚠️ ${res.data.error}`;
      await sock.sendMessage(from, { text: `🤖 *Nous:*\n${reply.slice(0, 2000)}` }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: '❌ API error' }, { quoted: msg });
    }
  }
};
