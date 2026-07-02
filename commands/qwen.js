const axios = require('axios');

module.exports = {
    name: 'qwen',
    category: 'ai',
    description: 'Chat with Qwen AI',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) return sock.sendMessage(from, { text: '❌ Usage: .qwen <message>' }, { quoted: msg });

        try {
            await sock.sendMessage(from, { text: '🤔 Thinking...' }, { quoted: msg });
            const response = await axios.get(`https://ravenn.site/ai/qwenai?q=${encodeURIComponent(query)}`, { timeout: 30000 });
            const data = response.data;
            if (data.status && data.result) {
                await sock.sendMessage(from, { text: data.result }, { quoted: msg });
            } else {
                throw new Error('Invalid response');
            }
        } catch (err) {
            console.error('Qwen error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
