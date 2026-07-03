const axios = require('axios');

module.exports = {
    name: 'deepseek',
    category: 'tools',
    description: 'Chat with DeepSeek AI',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '❌ Usage: .deepseek <message>' }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_273f9867e9';
            const url = `https://apis.xwolf.space/api/ai/deepseek?q=${encodeURIComponent(query)}&key=${apiKey}`;
            const response = await axios.get(url, { timeout: 30000 });

            if (response.data.status === true) {
                const reply = response.data.result || 'No response.';
                await sock.sendMessage(from, { text: `🤖 *DeepSeek:*\n${reply.slice(0, 2000)}` }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: `⚠️ ${response.data.error || 'API error'}` }, { quoted: msg });
            }
        } catch (error) {
            console.error('DeepSeek error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to reach DeepSeek API.' }, { quoted: msg });
        }
    }
};
