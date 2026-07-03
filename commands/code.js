const axios = require('axios');

module.exports = {
  name: 'code',
  category: 'tools',
  description: 'Generate code from description',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const prompt = args.join(' ');
    if (!prompt) return sock.sendMessage(from, { text: '❓ Describe the code you need.' }, { quoted: msg });

    try {
      const response = await axios.post('https://apis.xwolf.space/api/ai/code', { prompt });
      if (response.data.status === true) {
        let code = response.data.result || response.data.code || 'No code generated.';
        await sock.sendMessage(from, { text: `💻 *Generated Code:*\n\`\`\`\n${code.slice(0, 1900)}\n\`\`\`` }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: `⚠️ ${response.data.error || 'Code generation failed.'}` }, { quoted: msg });
      }
    } catch (error) {
      await sock.sendMessage(from, { text: '❌ Code AI error.' }, { quoted: msg });
    }
  }
};
