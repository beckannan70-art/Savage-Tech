const axios = require('axios');

module.exports = {
    name: 'lyrics',
    category: 'audio',
    description: 'Get song lyrics',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (args.length < 2) return sock.sendMessage(from, { text: '❌ Usage: .lyrics <artist> <song title>' }, { quoted: msg });

        const query = args.join(' ');

        try {
            const res = await axios.get(`https://some-random-api.ml/lyrics?title=${encodeURIComponent(query)}`);
            const data = res.data;
            if (!data.lyrics) throw new Error('No lyrics found');
            const lyrics = data.lyrics.substring(0, 4096);
            const title = data.title;
            const author = data.author;
            const thumbnail = data.thumbnail && data.thumbnail.genius ? data.thumbnail.genius : null;

            let text = `🎵 *${title}* by *${author}*\n\n${lyrics}`;

            let imageBuffer = null;
            if (thumbnail) {
                try {
                    const img = await axios.get(thumbnail, { responseType: 'arraybuffer' });
                    imageBuffer = Buffer.from(img.data);
                } catch (e) {}
            }

            if (imageBuffer) {
                await sock.sendMessage(from, { image: imageBuffer, caption: text }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text }, { quoted: msg });
            }
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: '❌ Lyrics not found for that song.' }, { quoted: msg });
        }
    }
};
