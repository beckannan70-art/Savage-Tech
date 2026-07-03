const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function extractShortUrl(obj) {
  if (!obj) return null;
  if (typeof obj === 'string') return obj;
  if (obj.shortUrl) return obj.shortUrl;
  if (obj.url) return obj.url;
  if (obj.result) return extractShortUrl(obj.result);
  if (obj.data) return extractShortUrl(obj.data);
  return null;
}

module.exports = {
  name: 'clckru',
  category: 'tools',
  description: 'Shorten URL with clck.ru',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const longUrl = args[0];
    if (!longUrl || !longUrl.startsWith('http')) {
      return sock.sendMessage(from, { text: '❓ Usage: .clckru <https://example.com/long/url>' }, { quoted: msg });
    }

    try {
      const apiUrl = `https://apis.xwolf.space/api/short/clckru?url=${encodeURIComponent(longUrl)}`;
      const res = await axios.get(apiUrl, { httpsAgent: agent });
      let short = null;
      if (res.data.success) short = extractShortUrl(res.data);
      if (!short) short = res.data.error || 'Shortening failed';
      await sock.sendMessage(from, {
        text: `🔗 *clck.ru Shortened URL*\n\n${short}`
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
    }
  }
};
