const axios = require('axios');

module.exports = {
    name: 'translate',
    category: 'tools',
    description: 'Translate text to any language (Google Translate)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        let full = args.join(' ');
        if (!full) {
            return sock.sendMessage(from, { text: '❌ Usage: .translate <text> [to:lang]' }, { quoted: msg });
        }

        let target = 'en';
        let text = full;
        const toMatch = full.match(/\s+(to|--to)\s+([a-z]{2})$/i);
        if (toMatch) {
            target = toMatch[2];
            text = full.substring(0, toMatch.index).trim();
        } else {
            const words = full.split(' ');
            const last = words[words.length - 1];
            if (last.length === 2 && /^[a-z]{2}$/i.test(last)) {
                target = last.toLowerCase();
                words.pop();
                text = words.join(' ');
            }
        }

        try {
            await sock.sendMessage(from, { text: `🔄 Translating to ${target.toUpperCase()}...` }, { quoted: msg });

            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
            const response = await axios.get(url, { timeout: 15000 });

            let translated = '';
            for (const part of response.data[0]) {
                if (part[0]) translated += part[0];
            }
            const detectedLang = response.data[2] || 'auto';

            const caption = `🌐 *Translation (${detectedLang} → ${target})*\n\n📝 Original:\n${text}\n\n✅ Translated:\n${translated}`;

            await sock.sendMessage(from, { text: caption.slice(0, 2000) }, { quoted: msg });
        } catch (err) {
            console.error('Translate error:', err);
            await sock.sendMessage(from, { text: `❌ Translation failed: ${err.message}` }, { quoted: msg });
        }
    }
};
