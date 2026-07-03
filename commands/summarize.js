const axios = require('axios');

module.exports = {
  name: 'summarize',
  category: 'tools',
  description: 'Summarize long text',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) {
      return sock.sendMessage(from, { text: '❓ Provide text to summarize.' }, { quoted: msg });
    }

    try {
      const apiKey = 'wxa_f_9ddecf073b';
      const response = await axios.post(
        `https://apis.xwolf.space/api/ai/summarize?key=${apiKey}`,
        { text },
        { timeout: 30000 }
      );

      if (response.data.status === true) {
        const summary = response.data.result || response.data.summary || 'No summary returned.';
        await sock.sendMessage(from, { text: `📝 *Summary:*\n${summary.slice(0, 2000)}` }, { quoted: msg });
      } else {
        const errMsg = response.data.error || 'Summarization failed.';
        await sock.sendMessage(from, { text: `⚠️ ${errMsg}` }, { quoted: msg });
      }
    } catch (error) {
      console.error('Summarize error:', error);
      await sock.sendMessage(from, { text: '❌ Summarization API error.' }, { quoted: msg });
    }
  }
};
