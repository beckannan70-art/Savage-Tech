const axios = require('axios');

module.exports = {
  name: 'gemini',
  category: 'ai',
  description: 'Chat with Gemini AI',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) {
      await sock.sendMessage(from, { text: '❓ What do you want to ask Gemini?' }, { quoted: msg });
      return;
    }

    try {
      const url = `https://apis.xwolf.space/api/ai/gemini?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url);

      if (response.data.status === true) {
        const reply = response.data.result || 'No response.';
        await sock.sendMessage(from, { text: `🤖 *Gemini:*\n${reply.slice(0, 2000)}` }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: `⚠️ API error: ${response.data.error || 'Unknown'}` }, { quoted: msg });
      }
    } catch (error) {
      console.error('Gemini error:', error);
      await sock.sendMessage(from, { text: '❌ Failed to reach Gemini API.' }, { quoted: msg });
    }
  }
};
