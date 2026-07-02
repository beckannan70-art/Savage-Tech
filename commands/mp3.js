const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    name: 'mp3',
    category: 'audio',
    description: 'Download a song via API (YouTube URL or song name)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const input = args.join(' ');
        if (!input) return sock.sendMessage(from, { text: '❌ Usage: .mp3 <song name or URL> [quality]' }, { quoted: msg });

        let quality = 'low';
        const parts = input.split(' ');
        const last = parts[parts.length - 1];
        if (['low', 'medium', 'high'].includes(last.toLowerCase())) {
            quality = last.toLowerCase();
            args.pop();
        }
        const query = args.join(' ');

        try {
            await sock.sendMessage(from, { text: `🔍 ${query.match(/^https?:\/\//) ? 'Processing URL' : 'Searching for'} *${query}*...` }, { quoted: msg });

            let videoUrl, title = 'Unknown', artist = 'Unknown', duration = 'N/A', cover = null;

            const isUrl = query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);
            if (isUrl) {
                videoUrl = query;
                const info = await yts({ videoId: videoUrl });
                if (info) {
                    title = info.title || 'Unknown';
                    artist = info.author?.name || 'Unknown';
                    duration = info.duration?.timestamp || 'N/A';
                    cover = info.thumbnail || null;
                }
            } else {
                const searchResult = await yts(query);
                const video = searchResult.videos[0];
                if (!video) throw new Error('No results found.');
                videoUrl = video.url;
                title = video.title;
                artist = video.author.name || 'Unknown';
                duration = video.duration.timestamp || 'N/A';
                cover = video.thumbnail || null;
            }

            let apiBase = 'https://ravenn.site/download/ytv4';
            let qualityParam = '';
            if (quality === 'low') {
                apiBase = 'https://ravenn.site/download/ytv4';
                qualityParam = '&quality=128';
            } else if (quality === 'medium') {
                apiBase = 'https://ravenn.site/download/ytv3';
                qualityParam = '&quality=192';
            } else {
                apiBase = 'https://ravenn.site/download/ytv5';
                qualityParam = '&quality=320';
            }

            let audioUrl = null;
            let usedApi = apiBase;
            try {
                const response = await axios.get(`${apiBase}?url=${encodeURIComponent(videoUrl)}${qualityParam}`, { timeout: 15000 });
                if (response.data.status && response.data.result) {
                    audioUrl = response.data.result;
                } else {
                    const fallbackRes = await axios.get(`${apiBase}?url=${encodeURIComponent(videoUrl)}`, { timeout: 15000 });
                    if (fallbackRes.data.status && fallbackRes.data.result) {
                        audioUrl = fallbackRes.data.result;
                    }
                }
            } catch (e) {
                console.log('API attempt failed:', e.message);
                const endpoints = ['ytv3', 'ytv4', 'ytv5'];
                for (const ep of endpoints) {
                    if (audioUrl) break;
                    try {
                        const res = await axios.get(`https://ravenn.site/download/${ep}?url=${encodeURIComponent(videoUrl)}`, { timeout: 15000 });
                        if (res.data.status && res.data.result) {
                            audioUrl = res.data.result;
                            usedApi = ep;
                        }
                    } catch (err) {}
                }
            }

            if (!audioUrl) {
                throw new Error('All API endpoints failed. Try again later.');
            }

            const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 30000 });
            let audioBuffer = Buffer.from(audioRes.data);

            const fileSizeMB = audioBuffer.length / (1024 * 1024);
            let sizeWarning = '';
            if (fileSizeMB > 15) {
                try {
                    const tempFile = path.join(__dirname, `temp_${Date.now()}.mp3`);
                    fs.writeFileSync(tempFile, audioBuffer);
                    const outFile = path.join(__dirname, `temp_out_${Date.now()}.mp3`);
                    await execPromise(`ffmpeg -i "${tempFile}" -b:a 96k "${outFile}" -y`);
                    const compressedBuffer = fs.readFileSync(outFile);
                    fs.unlinkSync(tempFile);
                    fs.unlinkSync(outFile);
                    if (compressedBuffer.length < audioBuffer.length) {
                        audioBuffer = compressedBuffer;
                        sizeWarning = ' (compressed to fit)';
                    }
                } catch (ffErr) {
                    console.log('FFmpeg compression failed:', ffErr.message);
                    sizeWarning = ' (file too large, may fail)';
                }
            }

            const finalSize = (audioBuffer.length / (1024 * 1024)).toFixed(2);

            const caption = `🎵 *${title}*\n👤 *Artist:* ${artist}\n⏱️ *Duration:* ${duration}\n📦 Size: ${finalSize} MB${sizeWarning}\n⚡ Quality: ${quality}`;

            let imageBuffer = null;
            if (cover) {
                try {
                    const imgRes = await axios.get(cover, { responseType: 'arraybuffer' });
                    imageBuffer = Buffer.from(imgRes.data);
                } catch (e) {}
            }

            if (imageBuffer) {
                await sock.sendMessage(from, { image: imageBuffer, caption }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: caption }, { quoted: msg });
            }

            await sock.sendMessage(from, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                caption: caption
            }, { quoted: msg });

        } catch (err) {
            console.error('MP3 error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
