const axios = require('axios');

module.exports = {
    name: 'moviegenres',
    category: 'media',
    description: 'List all TMDb movie genre IDs and names',
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        try {
            const apiKey = 'wxa_f_28d599362e';
            const url = `https://apis.xwolf.space/api/movie/genres?key=${apiKey}`;
            const response = await axios.get(url, { timeout: 15000 });
            const data = response.data;

            if (data.success && data.genres) {
                let text = '🎬 *Movie Genres (TMDb)*\n\n';
                for (const g of data.genres) {
                    text += `🔹 *${g.name}* – ID: ${g.id}\n`;
                }
                await sock.sendMessage(from, { text }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: `❌ Failed: ${data.error || 'Unknown error'}` }, { quoted: msg });
            }
        } catch (err) {
            console.error('Movie genres error:', err);
            await sock.sendMessage(from, { text: '❌ Network error or API unavailable.' }, { quoted: msg });
        }
    }
};
