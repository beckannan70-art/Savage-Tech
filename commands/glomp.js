const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'glomp',
  category: 'anime',
  description: 'Random glomp anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random glomp anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/glomp', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime glomp*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('glomp error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime glomp.' }, { quoted: msg });
    }
  }
};
