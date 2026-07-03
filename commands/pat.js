const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'pat',
  category: 'anime',
  description: 'Random pat anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random pat anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/pat', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime pat*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('pat error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime pat.' }, { quoted: msg });
    }
  }
};
