const axios = require('axios');

module.exports = {
    name: 'tinyurll',
    category: 'tools',
    description: 'Shorten URL with TinyURL (official API)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const longUrl = args[0];
        if (!longUrl || !longUrl.startsWith('http')) {
            return sock.sendMessage(from, { text: '❌ Usage: .tinyurll <url>' }, { quoted: msg });
        }

        try {
            const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`, { timeout: 10000 });
            const short = response.data;
            await sock.sendMessage(from, { text: `🔗 *Shortened URL*\n\n${short}` }, { quoted: msg });
        } catch (err) {
            console.error('TinyURL error:', err);
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
        }
    }
};
