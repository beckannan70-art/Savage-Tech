const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'poke',
  category: 'anime',
  description: 'Random poke anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random poke anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/poke', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime poke*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('poke error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime poke.' }, { quoted: msg });
    }
  }
};
