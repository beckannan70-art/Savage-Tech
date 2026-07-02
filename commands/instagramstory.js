const axios = require('axios');

module.exports = {
    name: 'instagramstory',
    category: 'download',
    description: 'Download Instagram story (ravenn.site)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const url = args[0];
        if (!url) return sock.sendMessage(from, { text: '❌ Provide an Instagram story URL.' }, { quoted: msg });

        const senderName = msg.pushName || 'User';
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const mention = [senderJid];

        try {
            await sock.sendMessage(from, { text: '⏳ Downloading story...' }, { quoted: msg });

            const apiUrl = `https://ravenn.site/download/instastories?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl, { timeout: 15000 });
            const data = response.data;

            if (!data.status || !data.result) {
                throw new Error('API returned: ' + JSON.stringify(data));
            }

            const mediaUrl = data.result;

            // Download the media file as buffer
            const mediaRes = await axios.get(mediaUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            const mediaBuffer = Buffer.from(mediaRes.data);

            // Detect if it's video or image based on URL or content-type
            const isVideo = mediaUrl.match(/\.mp4$/i) || 
                            mediaUrl.includes('/video/') ||
                            mediaRes.headers['content-type']?.includes('video');

            const caption = `📥 *Instagram Story*\n👤 Requested by: @${senderName}\n🚀 Powered by Savage-Tech`;

            if (isVideo) {
                await sock.sendMessage(from, {
                    video: mediaBuffer,
                    caption: caption,
                    mentions: mention
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, {
                    image: mediaBuffer,
                    caption: caption,
                    mentions: mention
                }, { quoted: msg });
            }

        } catch (err) {
            console.error('Instagram Story error:', err);
            await sock.sendMessage(from, {
                text: `❌ Failed to download story: ${err.message || 'Unknown error'}`
            }, { quoted: msg });
        }
    }
};
