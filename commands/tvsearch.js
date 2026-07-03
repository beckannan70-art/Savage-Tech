const axios = require('axios');

module.exports = {
    name: 'tvsearch',
    category: 'media',
    description: 'Search TV shows by name (TVMaze) with poster',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '❌ Usage: .tvsearch <show name>' }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_9ddecf073b';
            const response = await axios.get(`https://apis.xwolf.space/api/tvshow/search?q=${encodeURIComponent(query)}&key=${apiKey}`, { timeout: 15000 });
            const data = response.data;

            if (!data.success || !data.results || data.results.length === 0) {
                return sock.sendMessage(from, { text: '❌ No results found' }, { quoted: msg });
            }

            const shows = data.results.slice(0, 5);
            let text = '📺 *TV Show Search Results*\n\n';
            for (const s of shows) {
                const year = s.premiered ? s.premiered.split('-')[0] : 'N/A';
                const rating = s.rating !== null && s.rating !== undefined ? s.rating : 'N/A';
                const genres = s.genres && s.genres.length ? s.genres.join(', ') : '-';
                text += `🔹 *${s.name}* (${year})\n   ⭐ Rating: ${rating}\n   📺 Status: ${s.status}\n   🎭 Genres: ${genres}\n\n`;
            }
            text += `🔍 Use .tvshowinfo <id> for details (e.g., .tvshowinfo 169 for Breaking Bad)`;

            const first = shows[0];
            let imageBuffer = null;
            const imageUrl = first.image && typeof first.image === 'string' ? first.image : (first.image?.medium || null);

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
                    caption: text
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: text }, { quoted: msg });
            }
        } catch (err) {
            console.error('TV search error:', err);
            await sock.sendMessage(from, { text: '❌ Search failed due to network error.' }, { quoted: msg });
        }
    }
};
