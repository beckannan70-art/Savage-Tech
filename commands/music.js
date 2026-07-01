const axios = require('axios');

module.exports = {
    name: 'music',
    category: 'audio',
    description: 'Search for a song and get info + audio preview (Deezer)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) return sock.sendMessage(from, { text: '❌ Usage: .music <song name>' }, { quoted: msg });

        try {
            const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
            const track = res.data.data[0];
            if (!track) return sock.sendMessage(from, { text: '❌ No results found.' }, { quoted: msg });

            const text = `🎶 *${track.title}*\n👤 Artist: ${track.artist.name}\n💿 Album: ${track.album.title}\n📅 Release: ${track.release_date || 'N/A'}`;

            let imageBuffer = null;
            if (track.album.cover_medium) {
                try {
                    const img = await axios.get(track.album.cover_medium, { responseType: 'arraybuffer' });
                    imageBuffer = Buffer.from(img.data);
                } catch (e) {}
            }

            if (imageBuffer) {
                await sock.sendMessage(from, { image: imageBuffer, caption: text }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text }, { quoted: msg });
            }

            if (track.preview) {
                try {
                    const audioRes = await axios.get(track.preview, { responseType: 'arraybuffer' });
                    const audioBuffer = Buffer.from(audioRes.data);
                    await sock.sendMessage(from, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        ptt: false
                    }, { quoted: msg });
                } catch (e) {
                    await sock.sendMessage(from, { text: '❌ Could not download preview audio.' }, { quoted: msg });
                }
            }
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: '❌ Search failed.' }, { quoted: msg });
        }
    }
};
