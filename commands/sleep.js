const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'sleep',
  category: 'anime',
  description: 'Random sleep anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random sleep anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/sleep', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime sleep*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('sleep error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime sleep.' }, { quoted: msg });
    }
  }
};
