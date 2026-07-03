const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'npm',
  category: 'search menu',
  description: 'NPM package search – top 5',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(from, { text: '❓ Usage: .npm <package>' }, { quoted: msg });

    try {
      await sock.sendMessage(from, { text: `🔍 Searching NPM for "${query}"...` }, { quoted: msg });
      const res = await axios.get(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=5`, { httpsAgent: agent });
      if (!res.data.objects.length) throw new Error('No packages');
      let text = `📦 *NPM SEARCH: ${query}*\n\n`;
      res.data.objects.forEach((pkg, i) => {
        const p = pkg.package;
        text += `${i+1}. *${p.name}*\n   📌 v${p.version}\n   📝 ${(p.description || 'No description').slice(0, 150)}\n   🔗 ${p.links.npm}\n\n`;
      });
      await sock.sendMessage(from, { text: text.slice(0, 2000) }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ NPM error: ${err.message}` }, { quoted: msg });
    }
  }
};
