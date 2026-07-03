const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'dance',
  category: 'anime',
  description: 'Random dance anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random dance anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/dance', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime dance*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('dance error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime dance.' }, { quoted: msg });
    }
  }
};
