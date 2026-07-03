const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'email-validate',
  category: 'tools',
  description: 'Validate email format',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const email = args[0];
    if (!email || !email.includes('@')) return sock.sendMessage(from, { text: '❓ Usage: .email-validate <email>' }, { quoted: msg });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/email-validate?email=${encodeURIComponent(email)}`, { httpsAgent: agent });
      const isValid = res.data.valid ? '✅ Valid email' : '❌ Invalid email';
      const result = res.data.result || isValid;
      await sock.sendMessage(from, {
        text: `📧 *Email Validation*\n\n${result}`
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
    }
  }
};
