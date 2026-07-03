const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'hug',
  category: 'anime',
  description: 'Random hug anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random hug anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/hug', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime hug*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('hug error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime hug.' }, { quoted: msg });
    }
  }
};
