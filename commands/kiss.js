const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'kiss',
  category: 'anime',
  description: 'Random kiss anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random kiss anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/kiss', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime kiss*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('kiss error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime kiss.' }, { quoted: msg });
    }
  }
};
