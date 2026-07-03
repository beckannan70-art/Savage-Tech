const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'baka',
  category: 'anime',
  description: 'Random baka anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random baka anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/baka', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime baka*\n';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('baka error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime baka.' }, { quoted: msg });
    }
  }
};
