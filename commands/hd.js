const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

module.exports = {
    name: 'hd',
    category: 'download',
    description: 'Download HD video (1080p/720p) from YouTube',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '❌ Usage: .hd <song name or YouTube URL>' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '🔍 Searching for HD video...' }, { quoted: msg });

        try {
            let videoUrl = query;
            let videoTitle = 'Unknown';

            if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
                const searchResults = await yts(query);
                if (!searchResults.videos.length) {
                    return sock.sendMessage(from, { text: '❌ No results found.' }, { quoted: msg });
                }
                videoUrl = searchResults.videos[0].url;
                videoTitle = searchResults.videos[0].title || 'Unknown';
            } else {
                const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('youtu.be/')[1]?.split('?')[0];
                if (!videoId) {
                    return sock.sendMessage(from, { text: '❌ Invalid YouTube URL.' }, { quoted: msg });
                }
                const info = await yts({ videoId });
                videoTitle = info.title || 'Unknown';
            }

            const apiKey = 'wxa_f_1be53c1604';
            const apiUrl = `https://apis.xwolf.space/download/hd?url=${encodeURIComponent(videoUrl)}&q=${encodeURIComponent(query)}&key=${apiKey}`;
            const response = await axios.get(apiUrl, { timeout: 30000 });

            let downloadUrl = response.data.result || response.data.downloadUrl || response.data.url;
            if (!downloadUrl) {
                throw new Error('No download URL in API response');
            }

            const videoRes = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                timeout: 120000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
            });
            const videoBuffer = Buffer.from(videoRes.data);

            if (videoBuffer.length < 50000) {
                return sock.sendMessage(from, { text: '❌ Downloaded file too small.' }, { quoted: msg });
            }

            const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);
            if (videoBuffer.length > 50 * 1024 * 1024) {
                return sock.sendMessage(from, { text: `❌ Video too large (${fileSizeMB} MB). Max 50 MB.` }, { quoted: msg });
            }

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const tempFile = path.join(tempDir, `hd_${Date.now()}.mp4`);
            fs.writeFileSync(tempFile, videoBuffer);

            await sock.sendMessage(from, {
                video: { url: tempFile },
                mimetype: 'video/mp4',
                caption: `🎥 *HD Video: ${videoTitle}*`
            }, { quoted: msg });

            fs.unlinkSync(tempFile);
        } catch (error) {
            console.error('HD error:', error);
            await sock.sendMessage(from, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
        }
    }
};
