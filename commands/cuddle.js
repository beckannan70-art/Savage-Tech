const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'cuddle',
  category: 'anime',
  description: 'Random cuddle anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random cuddle anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/cuddle', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime cuddle*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('cuddle error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime cuddle.' }, { quoted: msg });
    }
  }
};
