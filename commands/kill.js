const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'kill',
  category: 'anime',
  description: 'Random kill anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random kill anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/kill', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime kill*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('kill error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime kill.' }, { quoted: msg });
    }
  }
};
