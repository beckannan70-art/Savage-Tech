const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        downloadFile(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = {
  name: 'searchplayer',
  category: 'sports',
  description: 'Search player by name (sends image)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) {
      return await sock.sendMessage(from, { text: '❓ Usage: .searchplayer <player name>' }, { quoted: msg });
    }

    try {
      await sock.sendMessage(from, { text: `🔍 Searching for "${query}"...` }, { quoted: msg });
      const res = await axios.get(`https://apis.xwolf.space/api/sports/search/player?q=${encodeURIComponent(query)}`, { httpsAgent: agent });
      if (!res.data.success || !res.data.result) throw new Error('No results');
      const p = res.data.result;
      let caption = `⚽ *Player: ${p.name}*\n\n`;
      caption += `🏷️ ID: ${p.id}\n🎯 Sport: ${p.sport}\n📋 Team: ${p.team}\n🌍 Nationality: ${p.nationality}\n📍 Position: ${p.position}\n🎂 Born: ${p.dateBorn}`;
      let imgUrl = p.cutout || p.thumbnail;
      if (imgUrl && imgUrl.startsWith('http')) {
        const imgBuffer = await downloadFile(imgUrl);
        await sock.sendMessage(from, { image: imgBuffer, caption: caption }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: caption }, { quoted: msg });
      }
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ Player not found: ${err.message}` }, { quoted: msg });
    }
  }
};
