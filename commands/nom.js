const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'nom',
  category: 'anime',
  description: 'Random nom anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random nom anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/nom', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime nom*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('nom error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime nom.' }, { quoted: msg });
    }
  }
};
