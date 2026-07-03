const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'wave',
    category: 'anime',
    description: 'Random anime waving image',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        try {
            await sock.sendMessage(from, { text: '🎴 Fetching random anime wave...' }, { quoted: msg });
            const response = await axios.get('https://nekos.best/api/v2/wave', { httpsAgent: agent, timeout: 10000 });
            const imgUrl = response.data.results[0].url;
            await sock.sendMessage(from, {
                image: { url: imgUrl },
                caption: '✅ Anime wave'
            }, { quoted: msg });
        } catch (err) {
            console.error('Wave error:', err);
            await sock.sendMessage(from, { text: '❌ Failed to fetch anime wave.' }, { quoted: msg });
        }
    }
};
