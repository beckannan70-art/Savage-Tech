const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'smile',
  category: 'anime',
  description: 'Random smile anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random smile anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/smile', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime smile*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('smile error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime smile.' }, { quoted: msg });
    }
  }
};
