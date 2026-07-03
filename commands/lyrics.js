const axios = require('axios');

module.exports = {
    name: 'lyrics',
    category: 'tools',
    description: 'Get song lyrics by name',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '❌ Usage: .lyrics <song name> (e.g., .lyrics Bohemian Rhapsody)' }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_1be53c1604';
            const url = `https://apis.xwolf.space/download/lyrics?q=${encodeURIComponent(query)}&key=${apiKey}`;
            const response = await axios.get(url, { timeout: 15000 });

            let lyrics = 'No lyrics found.';

            if (response.data.status === true) {
                lyrics = response.data.result || response.data.lyrics || 'No lyrics found.';
            } else if (response.data.success === true) {
                lyrics = response.data.result || response.data.lyrics || 'No lyrics found.';
            } else if (response.data.lyrics) {
                lyrics = response.data.lyrics;
            } else if (response.data.result) {
                lyrics = typeof response.data.result === 'string' ? response.data.result : JSON.stringify(response.data.result, null, 2);
            }

            await sock.sendMessage(from, {
                text: `🎵 *Lyrics: ${query}*\n\n${lyrics.slice(0, 2000)}`
            }, { quoted: msg });
        } catch (err) {
            console.error('Lyrics error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
