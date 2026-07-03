const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'handhold',
  category: 'anime',
  description: 'Random handhold anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random handhold anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/handhold', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime handhold*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('handhold error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime handhold.' }, { quoted: msg });
    }
  }
};
