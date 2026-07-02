const axios = require('axios');

module.exports = {
    name: 'keith',
    category: 'ai',
    description: 'Chat with Keith AI',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) return sock.sendMessage(from, { text: '❌ Usage: .keith <message>' }, { quoted: msg });

        try {
            await sock.sendMessage(from, { text: '🤔 Thinking...' }, { quoted: msg });
            const response = await axios.get(`https://ravenn.site/keithai?q=${encodeURIComponent(query)}`, { timeout: 30000 });
            const data = response.data;
            if (data.status && data.result) {
                await sock.sendMessage(from, { text: data.result }, { quoted: msg });
            } else {
                throw new Error('Invalid response');
            }
        } catch (err) {
            console.error('Keith AI error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
