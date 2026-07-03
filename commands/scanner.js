const axios = require('axios');

module.exports = {
  name: 'scanner',
  category: 'tools',
  description: 'Detect AI-generated vs human text',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return await sock.sendMessage(from, { text: '❓ Provide text to analyze.' }, { quoted: msg });

    try {
      const response = await axios.post('https://apis.xwolf.space/api/ai/scanner', { text });
      if (response.data.status === true) {
        const result = response.data.result || response.data.prediction || 'Analysis result not found.';
        await sock.sendMessage(from, { text: `🔍 *AI Scanner Result:*\n${result.slice(0, 2000)}` }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: `⚠️ ${response.data.error || 'Scanner failed.'}` }, { quoted: msg });
      }
    } catch (error) {
      await sock.sendMessage(from, { text: '❌ Scanner API error.' }, { quoted: msg });
    }
  }
};
