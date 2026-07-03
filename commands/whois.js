const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'whois',
    category: 'ethical hacking',
    description: 'WHOIS domain lookup',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const domain = args[0];
        if (!domain) {
            return sock.sendMessage(from, { text: '❌ Usage: .whois <domain>' }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { text: `🔎 Looking up WHOIS for ${domain}...` }, { quoted: msg });
            const response = await axios.get(`https://who-dat.as93.net/${domain}`, { httpsAgent: agent, timeout: 10000 });
            const data = response.data;

            let text = `📋 *WHOIS for ${domain}*\n\n`;
            text += `Registrar: ${data.registrar || 'N/A'}\n`;
            text += `Creation: ${data.creation_date || 'N/A'}\n`;
            text += `Expiry: ${data.expiry_date || 'N/A'}\n`;
            text += `Name Servers: ${data.name_servers ? data.name_servers.join(', ') : 'N/A'}`;

            await sock.sendMessage(from, { text: text.slice(0, 2000) }, { quoted: msg });
        } catch (err) {
            console.error('WHOIS error:', err);
            await sock.sendMessage(from, { text: `❌ WHOIS error: ${err.message}` }, { quoted: msg });
        }
    }
};
