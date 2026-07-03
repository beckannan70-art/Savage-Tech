const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'yeet',
    category: 'anime',
    description: 'Random anime yeet image',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        try {
            await sock.sendMessage(from, { text: '🎴 Fetching random anime yeet...' }, { quoted: msg });
            const response = await axios.get('https://nekos.best/api/v2/yeet', { httpsAgent: agent, timeout: 10000 });
            const imgUrl = response.data.results[0].url;
            await sock.sendMessage(from, {
                image: { url: imgUrl },
                caption: '✅ Anime yeet'
            }, { quoted: msg });
        } catch (err) {
            console.error('Yeet error:', err);
            await sock.sendMessage(from, { text: '❌ Failed to fetch anime yeet.' }, { quoted: msg });
        }
    }
};
