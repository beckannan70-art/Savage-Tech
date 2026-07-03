const axios = require('axios');

module.exports = {
    name: 'gemini',
    category: 'ai',
    description: 'Chat with Gemini AI',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '❌ Usage: .gemini <message>' }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_1be53c1604';
            const url = `https://apis.xwolf.space/api/ai/gemini?q=${encodeURIComponent(query)}&key=${apiKey}`;
            const response = await axios.get(url, { timeout: 30000 });

            if (response.data.status === true) {
                const reply = response.data.result || 'No response.';
                await sock.sendMessage(from, { text: `🤖 *Gemini:*\n${reply.slice(0, 2000)}` }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: `⚠️ ${response.data.error || 'API error'}` }, { quoted: msg });
            }
        } catch (error) {
            console.error('Gemini error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to reach Gemini API.' }, { quoted: msg });
        }
    }
};
