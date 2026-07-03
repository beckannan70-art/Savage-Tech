const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'slap',
  category: 'anime',
  description: 'Random slap anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random slap anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/slap', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime slap*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('slap error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime slap.' }, { quoted: msg });
    }
  }
};
