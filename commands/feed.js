const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'feed',
  category: 'anime',
  description: 'Random feed anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random feed anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/feed', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime feed*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('feed error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime feed.' }, { quoted: msg });
    }
  }
};
