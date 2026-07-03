const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'yawn',
    category: 'anime',
    description: 'Random anime yawn image',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        try {
            await sock.sendMessage(from, { text: '🎴 Fetching random anime yawn...' }, { quoted: msg });
            const response = await axios.get('https://nekos.best/api/v2/yawn', { httpsAgent: agent, timeout: 10000 });
            const imgUrl = response.data.results[0].url;
            await sock.sendMessage(from, {
                image: { url: imgUrl },
                caption: '✅ Anime yawn'
            }, { quoted: msg });
        } catch (err) {
            console.error('Yawn error:', err);
            await sock.sendMessage(from, { text: '❌ Failed to fetch anime yawn.' }, { quoted: msg });
        }
    }
};
