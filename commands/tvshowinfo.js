const axios = require('axios');

module.exports = {
    name: 'tvshowinfo',
    category: 'media',
    description: 'Get full TV show details by TVMaze ID (use .tvsearch to find ID)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const id = args[0];
        if (!id) {
            return sock.sendMessage(from, { text: '❌ Usage: .tvshowinfo <TVMaze numeric ID>' }, { quoted: msg });
        }
        if (isNaN(id)) {
            return sock.sendMessage(from, { text: '❌ ID must be a number. Use .tvsearch to find the correct numeric ID.' }, { quoted: msg });
        }

        let s;
        try {
            const directRes = await axios.get(`https://api.tvmaze.com/shows/${id}`, { timeout: 8000 });
            s = directRes.data;
        } catch (err) {
            return sock.sendMessage(from, { text: `❌ Show not found. ID ${id} does not exist.` }, { quoted: msg });
        }

        const text = `📺 *TV Show Details*\n\n` +
            `*Name:* ${s.name}\n` +
            `*Type:* ${s.type || 'N/A'}\n` +
            `*Status:* ${s.status || 'N/A'}\n` +
            `*Premiered:* ${s.premiered || 'N/A'}\n` +
            `*Ended:* ${s.ended || 'Still running'}\n` +
            `*Runtime:* ${s.runtime || 'N/A'} min\n` +
            `*Genres:* ${s.genres?.join(', ') || '-'}\n` +
            `*Rating:* ${s.rating?.average || s.rating || 'N/A'}\n` +
            `*Network:* ${s.network?.name || s.webChannel?.name || 'N/A'}\n`;

        const summary = s.summary ? s.summary.replace(/<[^>]*>/g, '').substring(0, 300) : '';
        const finalText = summary ? text + `*Summary:* ${summary}...\n\n🔗 *Episodes:* .tvepisodes ${s.id}` : text + `\n🔗 *Episodes:* .tvepisodes ${s.id}`;

        let imageBuffer = null;
        const imageUrl = s.image?.original || s.image?.medium || (typeof s.image === 'string' ? s.image : null);
        if (imageUrl) {
            try {
                const imgRes = await axios.get(imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 10000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                imageBuffer = Buffer.from(imgRes.data);
            } catch (imgErr) {
                console.log('Image download failed:', imgErr.message);
            }
        }

        if (imageBuffer) {
            await sock.sendMessage(from, {
                image: imageBuffer,
                caption: finalText
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: finalText }, { quoted: msg });
        }
    }
};
