const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'spotifysearch',
  category: 'Audio',
  description: 'Get Spotify metadata (track, album, artist, playlist)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return await sock.sendMessage(from, { text: '❓ Usage: .spotifysearch <spotify_url_or_search_term>' }, { quoted: msg });

    const cmd = 'search';
    const endpoint = 'search';

    try {
      let apiUrl;
      if (query.match(/spotify\.com/)) {
        apiUrl = `https://apis.xwolf.space/api/spotify/${endpoint}?url=${encodeURIComponent(query)}`;
      } else {
        apiUrl = `https://apis.xwolf.space/api/spotify/${endpoint}?q=${encodeURIComponent(query)}`;
      }
      const response = await axios.get(apiUrl, { httpsAgent });
      let resultText = `🎵 *Spotify ${cmd.toUpperCase()}*\n\n`;
      if (response.data.success) {
        const data = response.data.result || response.data;
        resultText += JSON.stringify(data, null, 2);
      } else {
        resultText += `❌ Error: ${response.data.error || 'Not found'}`;
      }
      await sock.sendMessage(from, { text: resultText.slice(0, 2000) }, { quoted: msg });
    } catch (err) {
      console.error('spotifysearch error:', err);
      await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
    }
  }
};
