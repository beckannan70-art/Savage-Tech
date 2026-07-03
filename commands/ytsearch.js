const yts = require('yt-search');

module.exports = {
    name: 'ytsearch',
    category: 'download',
    description: 'Search YouTube videos',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '❌ Usage: .ytsearch <search query>' }, { quoted: msg });
        }

        try {
            const results = await yts(query);
            if (!results.videos.length) {
                return sock.sendMessage(from, { text: '❌ No results found.' }, { quoted: msg });
            }

            let text = '📹 *YouTube Search Results*\n\n';
            results.videos.slice(0, 10).forEach((video, index) => {
                text += `${index + 1}. *${video.title}*\n`;
                text += `   👤 ${video.author.name}\n`;
                text += `   ⏱️ ${video.duration.timestamp}\n`;
                text += `   🔗 ${video.url}\n\n`;
            });

            await sock.sendMessage(from, { text: text.slice(0, 2000) }, { quoted: msg });
        } catch (error) {
            console.error('YouTube search error:', error);
            await sock.sendMessage(from, { text: '❌ Search failed. Try again later.' }, { quoted: msg });
        }
    }
};
