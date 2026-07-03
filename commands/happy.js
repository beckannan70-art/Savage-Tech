const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'happy',
  category: 'anime',
  description: 'Random happy anime',
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random happy anime...' }, { quoted: msg });
      const res = await axios.get('https://nekos.best/api/v2/happy', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime happy*';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption }, { quoted: msg });
    } catch (err) {
      console.error('happy error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime happy.' }, { quoted: msg });
    }
  }
};
