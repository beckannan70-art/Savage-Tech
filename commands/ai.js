const axios = require('axios');

const KEY_PART1 = 'AQ.Ab8RN6JNbzRrZ6F1cflC_KdwEKGFo7LqlDzoiTSTl';
const KEY_PART2 = 'WAbbGvFCA';

module.exports = {
    name: 'ai',
    category: 'ai',
    description: 'Chat with Google Gemini AI (free tier)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const prompt = args.join(' ');
        if (!prompt) return sock.sendMessage(from, { text: '❌ Usage: .ai <message>' }, { quoted: msg });

        const GEMINI_KEY = KEY_PART1 + KEY_PART2;

        try {
            const response = await axios.post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
                {
                    contents: [{ parts: [{ text: prompt }] }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-goog-api-key': GEMINI_KEY
                    }
                }
            );

            const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
            await sock.sendMessage(from, { text: `🤖 *Gemini:* ${reply}` }, { quoted: msg });

        } catch (err) {
            console.error('AI error:', err.response?.data || err.message);
            await sock.sendMessage(from, { text: `❌ AI error: ${err.response?.data?.error?.message || err.message}` }, { quoted: msg });
        }
    }
};
