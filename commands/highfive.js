const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'highfive',
  category: 'anime',
  description: 'Random highfive anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random highfive anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/highfive', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime highfive*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('highfive error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime highfive.' }, { quoted: msg });
    }
  }
};
