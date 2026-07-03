const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'bonk',
  category: 'anime',
  description: 'Random bonk anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random bonk anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/bonk', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime bonk*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('bonk error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime bonk.' }, { quoted: msg });
    }
  }
};
