const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent: httpsAgent }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        downloadFile(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = {
  name: 'copperchrome',
  category: 'Ephoto',
  description: 'Generate copper-chrome text effect',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(from, { text: '❓ Usage: .copperchrome <text>' }, { quoted: msg });

    try {
      const apiUrl = `https://apis.xwolf.space/api/textpro/copper-chrome?text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, { httpsAgent });
      if (!response.data.success) throw new Error(response.data.error || 'API failure');
      if (!response.data.imageUrl) throw new Error('No imageUrl in response');
      const imgBuffer = await downloadFile(response.data.imageUrl);
      const caption = '🎨 *Text Effect: copperchrome*';
      await sock.sendMessage(from, { image: imgBuffer, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('copperchrome error:', err);
      await sock.sendMessage(from, { text: `❌ Failed to generate image.\n${err.message}` }, { quoted: msg });
    }
  }
};
