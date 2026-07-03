const axios = require('axios');

module.exports = {
  name: 'groq',
  category: 'ai',
  description: 'Chat with Groq AI (fast inference)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(from, { text: '❓ Ask Groq?' }, { quoted: msg });

    try {
      const url = `https://apis.xwolf.space/api/ai/groq?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      const reply = res.data.status ? (res.data.result || 'No response') : `⚠️ ${res.data.error}`;
      await sock.sendMessage(from, { text: `🤖 *Groq:*\n${reply.slice(0, 2000)}` }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: '❌ API error' }, { quoted: msg });
    }
  }
};
