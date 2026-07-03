const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'pypi',
  category: 'search menu',
  description: 'PyPI package info',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(from, { text: '❓ Usage: .pypi <package>' }, { quoted: msg });

    try {
      await sock.sendMessage(from, { text: `🔍 Searching PyPI for "${query}"...` }, { quoted: msg });
      const res = await axios.get(`https://pypi.org/pypi/${encodeURIComponent(query)}/json`, { httpsAgent: agent });
      const info = res.data.info;
      const summary = (info.summary || 'No summary').slice(0, 500);
      const result = `🐍 *PYPI: ${info.name}*\n\n📦 Version: ${info.version}\n📝 Summary: ${summary}\n🔗 ${info.package_url || `https://pypi.org/project/${info.name}`}`;
      await sock.sendMessage(from, { text: result.slice(0, 2000) }, { quoted: msg });
    } catch (err) {
      if (err.response?.status === 404) await sock.sendMessage(from, { text: `❌ Package "${query}" not found.` }, { quoted: msg });
      else await sock.sendMessage(from, { text: `❌ PyPI error: ${err.message}` }, { quoted: msg });
    }
  }
};
