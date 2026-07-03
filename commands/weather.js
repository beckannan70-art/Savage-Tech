const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'weather',
    category: 'tools',
    description: 'Get current weather for a city',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const city = args.join(' ');
        if (!city) {
            return sock.sendMessage(from, { text: '❌ Usage: .weather <city_name>' }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_9ddecf073b';
            const apiUrl = `https://apis.xwolf.space/api/tools/weather?city=${encodeURIComponent(city)}&key=${apiKey}`;
            const response = await axios.get(apiUrl, { httpsAgent: agent, timeout: 15000 });
            const data = response.data;

            const result = data.result || data.weather || 'No result';
            await sock.sendMessage(from, { text: `🌤️ *Weather in ${city}*\n\n${result.slice(0, 1900)}` }, { quoted: msg });
        } catch (err) {
            console.error('Weather error:', err);
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
        }
    }
};
