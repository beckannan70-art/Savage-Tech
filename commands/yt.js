const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'yt',
    category: 'download',
    description: 'Download YouTube video (ravenn.site)',
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
                text: '❌ Provide a YouTube URL, or reply to a message with one.\nExample: `.yt https://youtu.be/xxx`'
            }, { quoted: msg });
        }

        if (!url.startsWith('http')) {
            return sock.sendMessage(from, { text: '❌ Invalid URL.' }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { text: '⬇️ Downloading YouTube video...' }, { quoted: msg });

            const ravennUrl = `https://ravenn.site/download/ytv4?url=${encodeURIComponent(url)}`;
            const response = await axios.get(ravennUrl, { httpsAgent: agent, timeout: 15000 });
            const data = response.data;

            if (!data.status || !data.result) {
                throw new Error('Invalid response: ' + JSON.stringify(data));
            }

            const downloadUrl = data.result;
            const videoRes = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                httpsAgent: agent,
                timeout: 60000
            });
            const videoBuffer = Buffer.from(videoRes.data);

            await sock.sendMessage(from, {
                video: videoBuffer,
                caption: '✅ YouTube video downloaded.'
            }, { quoted: msg });

        } catch (err) {
            console.error('YouTube error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
