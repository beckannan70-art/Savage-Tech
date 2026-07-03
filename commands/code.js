const axios = require('axios');

module.exports = {
    name: 'code',
    category: 'tools',
    description: 'Generate code from description',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const prompt = args.join(' ');
        if (!prompt) {
            return sock.sendMessage(from, { text: '❌ Usage: .code <description of code needed>' }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_273f9867e9';
            const url = `https://apis.xwolf.space/api/ai/code?key=${apiKey}`;
            const response = await axios.post(url, { prompt }, { timeout: 30000 });

            if (response.data.status === true) {
                let code = response.data.result || response.data.code || 'No code generated.';
                await sock.sendMessage(from, {
                    text: `💻 *Generated Code:*\n\`\`\`\n${code.slice(0, 1900)}\n\`\`\``
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, {
                    text: `⚠️ ${response.data.error || 'Code generation failed.'}`
                }, { quoted: msg });
            }
        } catch (error) {
            console.error('Code generation error:', error);
            await sock.sendMessage(from, { text: '❌ Code AI error. Please try again later.' }, { quoted: msg });
        }
    }
};
