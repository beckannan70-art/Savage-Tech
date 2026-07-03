const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'video-to-sticker',
    category: 'tools',
    description: 'Convert video to sticker using a URL',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const url = args[0];
        if (!url || !url.startsWith('http')) {
            return sock.sendMessage(from, {
                text: '❌ Usage: .video-to-sticker <video_url>'
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { text: '🔄 Converting video to sticker...' }, { quoted: msg });

            const apiKey = 'wxa_f_9ddecf073b';
            const apiUrl = `https://apis.xwolf.space/api/converter/video-to-sticker?url=${encodeURIComponent(url)}&key=${apiKey}`;
            const response = await axios.get(apiUrl, {
                httpsAgent: agent,
                timeout: 60000,
                responseType: 'arraybuffer'
            });

            const buffer = Buffer.from(response.data);
            const contentType = response.headers['content-type'] || '';

            if (contentType.includes('webp')) {
                await sock.sendMessage(from, {
                    sticker: buffer
                }, { quoted: msg });
            } else if (contentType.includes('image')) {
                await sock.sendMessage(from, {
                    image: buffer,
                    caption: '✅ Sticker created (image format).'
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, {
                    video: buffer,
                    caption: '✅ Sticker created (video format).'
                }, { quoted: msg });
            }
        } catch (err) {
            console.error('Video-to-sticker error:', err);
            await sock.sendMessage(from, { text: `❌ Conversion failed: ${err.message}` }, { quoted: msg });
        }
    }
};
