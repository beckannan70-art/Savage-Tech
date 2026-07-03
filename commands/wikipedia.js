const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'wikipedia',
    category: 'tools',
    description: 'Get Wikipedia article summary',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '❌ Usage: .wikipedia <topic>' }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_9ddecf073b';
            const apiUrl = `https://apis.xwolf.space/api/tools/wikipedia?query=${encodeURIComponent(query)}&key=${apiKey}`;
            const response = await axios.get(apiUrl, { httpsAgent: agent, timeout: 15000 });
            const data = response.data;

            const result = data.result || data.summary || 'No result';
            await sock.sendMessage(from, { text: `📖 *Wikipedia: ${query}*\n\n${result.slice(0, 1900)}` }, { quoted: msg });
        } catch (err) {
            console.error('Wikipedia error:', err);
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
        }
    }
};
