const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'dictionary',
    category: 'tools',
    description: 'Get word definition and meanings',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const word = args[0];
        if (!word) {
            return sock.sendMessage(from, { text: '❌ Usage: .dictionary <word>' }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_273f9867e9';
            const apiUrl = `https://apis.xwolf.space/api/tools/dictionary?word=${encodeURIComponent(word)}&key=${apiKey}`;
            const response = await axios.get(apiUrl, { httpsAgent: agent, timeout: 15000 });
            const result = response.data.result || response.data.definition || 'No result';

            await sock.sendMessage(from, {
                text: `📚 *Dictionary: ${word}*\n\n${result.slice(0, 1900)}`
            }, { quoted: msg });
        } catch (err) {
            console.error('Dictionary error:', err);
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
        }
    }
};
