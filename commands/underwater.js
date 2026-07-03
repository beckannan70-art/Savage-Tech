const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'underwater',
    category: 'Audio Effects',
    description: 'Apply underwater effect to an audio/video URL',
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
                text: '❌ Provide an audio/video URL, or reply to a message with one.\nExample: `.underwater https://youtu.be/xxx`'
            }, { quoted: msg });
        }

        if (!url.startsWith('http')) {
            return sock.sendMessage(from, { text: '❌ Invalid URL.' }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { text: '🎧 Applying underwater effect...' }, { quoted: msg });

            const apiKey = 'wxa_f_9ddecf073b';
            const apiUrl = `https://apis.xwolf.space/api/audio/underwater?url=${encodeURIComponent(url)}&key=${apiKey}`;
            const response = await axios.get(apiUrl, { httpsAgent: agent, timeout: 30000 });

            const data = response.data;
            if (!data.success || !data.result || !data.result.downloadUrl) {
                throw new Error('Invalid API response: ' + JSON.stringify(data));
            }

            const downloadUrl = data.result.downloadUrl;
            const audioRes = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                httpsAgent: agent,
                timeout: 60000
            });
            const audioBuffer = Buffer.from(audioRes.data);

            await sock.sendMessage(from, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: 'underwater_effect.mp3',
                caption: '✅ Underwater effect applied.'
            }, { quoted: msg });

        } catch (err) {
            console.error('Underwater effect error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
