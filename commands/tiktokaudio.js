const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'tiktokaudio',
    category: 'download',
    description: 'Download TikTok audio (ravenn.site)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        let url = args[0];

        if (!url && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
            if (quoted.conversation) {
                const match = quoted.conversation.match(/(https?:\/\/[^\s]+)/);
                if (match) url = match[0];
            } else if (quoted.extendedTextMessage?.text) {
                const match = quoted.extendedTextMessage.text.match(/(https?:\/\/[^\s]+)/);
                if (match) url = match[0];
            }
        }

        if (!url) {
            return sock.sendMessage(from, {
                text: '❌ Provide a TikTok video URL, or reply to a message with one.\nExample: `.tiktokaudio https://vt.tiktok.com/...`'
            }, { quoted: msg });
        }

        if (!url.startsWith('http')) {
            return sock.sendMessage(from, { text: '❌ Invalid URL.' }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { text: '⬇️ Downloading TikTok audio...' }, { quoted: msg });

            const ravennUrl = `https://ravenn.site/download/tiktokaudio?url=${encodeURIComponent(url)}`;
            const response = await axios.get(ravennUrl, { httpsAgent: agent, timeout: 15000 });
            const data = response.data;

            if (!data.status || !data.result) {
                throw new Error('Invalid response: ' + JSON.stringify(data));
            }

            const downloadUrl = data.result;
            const audioRes = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                httpsAgent: agent,
                timeout: 60000
            });
            const audioBuffer = Buffer.from(audioRes.data);

            await sock.sendMessage(from, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: 'tiktok_audio.mp3',
                caption: '✅ TikTok audio downloaded.'
            }, { quoted: msg });

        } catch (err) {
            console.error('TikTok audio error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
