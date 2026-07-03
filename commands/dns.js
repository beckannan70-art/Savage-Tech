const dns = require('dns').promises;

module.exports = {
  name: 'dns',
  category: 'ethical hacking',
  description: 'DNS lookup (A, AAAA, MX, TXT, NS, CNAME)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const domain = args[0];
    if (!domain) return sock.sendMessage(from, { text: '❓ Usage: .dns <domain>' }, { quoted: msg });

    try {
      await sock.sendMessage(from, { text: `🔍 Performing DNS lookup on ${domain}...` }, { quoted: msg });
      const records = {};
      const types = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'];
      for (const type of types) {
        try { records[type] = await dns.resolve(domain, type); } catch { records[type] = 'Not found'; }
      }
      let result = `🌐 DNS Records for ${domain}\n`;
      result += `A: ${Array.isArray(records.A) ? records.A.join(', ') : records.A}\n`;
      result += `AAAA: ${Array.isArray(records.AAAA) ? records.AAAA.join(', ') : records.AAAA}\n`;
      result += `MX: ${Array.isArray(records.MX) ? records.MX.map(r => `${r.exchange} (prio ${r.priority})`).join(', ') : records.MX}\n`;
      result += `TXT: ${Array.isArray(records.TXT) ? records.TXT.flat().join(', ').slice(0, 200) : records.TXT}\n`;
      result += `NS: ${Array.isArray(records.NS) ? records.NS.join(', ') : records.NS}\n`;
      result += `CNAME: ${Array.isArray(records.CNAME) ? records.CNAME.join(', ') : records.CNAME}\n`;
      await sock.sendMessage(from, { text: result.slice(0, 2000) }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ DNS error: ${err.message}` }, { quoted: msg });
    }
  }
};
