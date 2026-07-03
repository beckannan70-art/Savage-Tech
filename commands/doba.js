const axios = require('axios');
const yts = require('yt-search');

module.exports = {
    name: 'doba',
    category: 'audio',
    description: 'Download a song from YouTube as MP3 with cover',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '❌ Usage: .doba <song name or YouTube URL>' }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { text: '🔍 Searching for your song...' }, { quoted: msg });

            let videoId;
            let title = 'Unknown';
            let thumbnail = null;
            let duration = 'N/A';

            const isUrl = query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);

            if (isUrl) {
                const urlObj = new URL(query);
                if (urlObj.hostname === 'youtu.be') {
                    videoId = urlObj.pathname.slice(1);
                } else {
                    videoId = urlObj.searchParams.get('v');
                }
                if (!videoId) {
                    return sock.sendMessage(from, { text: '❌ Invalid YouTube URL.' }, { quoted: msg });
                }
                try {
                    const info = await yts({ videoId });
                    if (info) {
                        title = info.title || 'Unknown';
                        duration = info.duration?.timestamp || 'N/A';
                        thumbnail = info.thumbnail || null;
                    }
                } catch (e) {
                    console.log('Could not fetch video info:', e.message);
                }
            } else {
                const searchResults = await yts(query);
                if (!searchResults.videos.length) {
                    return sock.sendMessage(from, { text: '❌ No results found.' }, { quoted: msg });
                }
                const video = searchResults.videos[0];
                videoId = video.videoId;
                title = video.title || 'Unknown';
                duration = video.duration?.timestamp || 'N/A';
                thumbnail = video.thumbnail || null;
            }

            await sock.sendMessage(from, { text: `⬇️ Downloading *${title}*...` }, { quoted: msg });

            const apiKey = 'wxa_f_28d599362e';
            const apiUrl = `https://apis.xwolf.space/api/music/download?id=${videoId}&key=${apiKey}`;
            const response = await axios.get(apiUrl, { timeout: 30000 });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Download failed');
            }

            let downloadUrl = response.data.result?.downloadUrl || response.data.downloadUrl || response.data.url || response.data.result?.url;
            if (!downloadUrl) {
                throw new Error('No download URL found in API response');
            }

            const audioRes = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                timeout: 60000
            });
            const audioBuffer = Buffer.from(audioRes.data);

            if (audioBuffer.length < 50000) {
                return sock.sendMessage(from, { text: '❌ Downloaded file is too small.' }, { quoted: msg });
            }

            const fileSizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);
            if (audioBuffer.length > 16 * 1024 * 1024) {
                return sock.sendMessage(from, { text: `❌ File too large (${fileSizeMB} MB). Max 16 MB.` }, { quoted: msg });
            }

            if (thumbnail) {
                try {
                    const imgRes = await axios.get(thumbnail, { responseType: 'arraybuffer', timeout: 10000 });
                    const imgBuffer = Buffer.from(imgRes.data);
                    await sock.sendMessage(from, {
                        image: imgBuffer,
                        caption: `🎵 *${title}*\n⏱️ *Duration:* ${duration}`
                    }, { quoted: msg });
                } catch (e) {
                    console.log('Thumbnail download failed:', e.message);
                }
            }

            await sock.sendMessage(from, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`,
                caption: '✅ Song downloaded.'
            }, { quoted: msg });

        } catch (err) {
            console.error('Doba error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
