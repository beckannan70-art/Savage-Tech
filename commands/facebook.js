const axios = require('axios');

module.exports = {
    name: 'facebook',
    category: 'download',
    description: 'Download Facebook video (wolf space + fallback)',
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
                text: '❌ Please provide a Facebook video URL, or reply to a message that contains one.\nExample: `.facebook https://www.facebook.com/...`'
            }, { quoted: msg });
        }

        if (!url.startsWith('http')) {
            return sock.sendMessage(from, { text: '❌ Invalid URL.' }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { text: '⬇️ Downloading Facebook video...' }, { quoted: msg });

            let downloadUrl = null;
            const wolfApiKey = 'wxa_f_9ddecf073b';
            const wolfUrl = `https://apis.xwolf.space/download/facebook?url=${encodeURIComponent(url)}&api_key=${wolfApiKey}`;

            try {
                const wolfRes = await axios.get(wolfUrl, { timeout: 15000 });
                const data = wolfRes.data;

                if (data.success && data.result && data.result.downloadUrl) {
                    downloadUrl = data.result.downloadUrl;
                } else if (data.success && data.downloadUrl) {
                    downloadUrl = data.downloadUrl;
                } else if (data.result && typeof data.result === 'string') {
                    downloadUrl = data.result;
                } else {
                    throw new Error('No download URL found in wolf response');
                }
            } catch (wolfErr) {
                console.log('Wolf API failed, trying ravenn fallback...', wolfErr.message);
                const ravennUrl = `https://ravenn.site/download/fbdown?url=${encodeURIComponent(url)}`;
                const ravennRes = await axios.get(ravennUrl, { timeout: 15000 });
                const rData = ravennRes.data;
                if (rData.status && rData.result) {
                    downloadUrl = rData.result;
                } else {
                    throw new Error('Fallback also failed: ' + (rData.error || 'unknown error'));
                }
            }

            if (!downloadUrl) {
                throw new Error('Could not retrieve video URL.');
            }

            const videoRes = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                timeout: 60000
            });
            const videoBuffer = Buffer.from(videoRes.data);

            const caption = `📥 *Facebook Video*`;

            await sock.sendMessage(from, {
                video: videoBuffer,
                caption: caption
            }, { quoted: msg });

        } catch (err) {
            console.error('Facebook error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
