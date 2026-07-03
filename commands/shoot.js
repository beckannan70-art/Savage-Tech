const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'shoot',
  category: 'anime',
  description: 'Random shoot anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random shoot anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/shoot', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime shoot*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('shoot error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime shoot.' }, { quoted: msg });
    }
  }
};
