const axios = require('axios');

module.exports = {
    name: 'randompokemon',
    category: 'fun',
    description: 'Get a random Pokemon with full stats and artwork',
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        try {
            const apiKey = 'wxa_f_1be53c1604';
            const url = `https://apis.xwolf.space/api/pokemon/random?key=${apiKey}`;
            const response = await axios.get(url, { timeout: 15000 });
            const data = response.data;

            if (!data.success) {
                return sock.sendMessage(from, { text: '❌ Could not fetch random Pokemon.' }, { quoted: msg });
            }

            const types = data.types?.join(', ') || 'N/A';
            const abilities = data.abilities?.map(a => a.name).join(', ') || 'N/A';
            const stats = data.stats || {};
            const text = `🎲 *Random Pokemon*\n\n` +
                `*Name:* ${data.name}\n` +
                `*ID:* #${data.id}\n` +
                `*Type:* ${types}\n` +
                `*Height:* ${data.height_m} m\n` +
                `*Weight:* ${data.weight_kg} kg\n` +
                `*Abilities:* ${abilities}\n` +
                `*Stats:*\n` +
                `  ❤️ HP: ${stats.hp || '?'}\n` +
                `  ⚔️ Attack: ${stats.attack || '?'}\n` +
                `  🛡️ Defense: ${stats.defense || '?'}\n` +
                `  ✨ Sp. Attack: ${stats.special_attack || '?'}\n` +
                `  🪄 Sp. Defense: ${stats.special_defense || '?'}\n` +
                `  💨 Speed: ${stats.speed || '?'}`;

            let imageBuffer = null;
            if (data.image) {
                try {
                    const imgRes = await axios.get(data.image, { responseType: 'arraybuffer', timeout: 10000 });
                    imageBuffer = Buffer.from(imgRes.data);
                } catch (e) {
                    console.log('Image download failed:', e.message);
                }
            }

            if (imageBuffer) {
                await sock.sendMessage(from, { image: imageBuffer, caption: text }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text }, { quoted: msg });
            }
        } catch (err) {
            console.error('Random Pokemon error:', err);
            await sock.sendMessage(from, { text: '❌ API error.' }, { quoted: msg });
        }
    }
};
