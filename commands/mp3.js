const axios = require('axios');
const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = {
    name: 'mp3',
    category: 'audio',
    description: 'Download a song as MP3 (YouTube URL or song name)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) return sock.sendMessage(from, { text: '❌ Usage: .mp3 <YouTube URL or song name>' }, { quoted: msg });

        try {
            await sock.sendMessage(from, { text: `🔍 Processing: ${query}\n⏳ Fetching audio...` }, { quoted: msg });

            let audioUrl = null;
            let title = 'Unknown';
            let artist = 'Unknown';
            let duration = 'N/A';
            let cover = null;
            let videoUrl = null;
            let usedFallback = false;

            // Check if query is already a YouTube URL
            const isUrl = query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);

            if (isUrl) {
                videoUrl = query;
                // Get details using ytdl-core
                try {
                    const info = await ytdl.getInfo(videoUrl);
                    title = info.videoDetails.title || 'Unknown';
                    artist = info.videoDetails.author?.name || 'Unknown';
                    duration = info.videoDetails.lengthSeconds ? 
                        `${Math.floor(info.videoDetails.lengthSeconds / 60)}:${String(info.videoDetails.lengthSeconds % 60).padStart(2, '0')}` 
                        : 'N/A';
                    cover = info.videoDetails.thumbnails?.pop()?.url || null;
                } catch (ytErr) {
                    console.log('ytdl error:', ytErr.message);
                }
            } else {
                // Search YouTube
                try {
                    const searchResult = await yts(query);
                    const video = searchResult.videos[0];
                    if (video) {
                        videoUrl = video.url;
                        title = video.title || 'Unknown';
                        artist = video.author.name || 'Unknown';
                        duration = video.duration.timestamp || 'N/A';
                        cover = video.thumbnail || null;
                    } else {
                        throw new Error('No YouTube results');
                    }
                } catch (ytErr) {
                    console.log('YouTube search failed:', ytErr.message);
                }
            }

            // If we have a YouTube URL, try ravenn.site with ytv4 endpoint
            if (videoUrl) {
                try {
                    const response = await axios.get(`https://ravenn.site/download/ytv4?url=${encodeURIComponent(videoUrl)}`, { timeout: 15000 });
                    if (response.data.status && response.data.result) {
                        audioUrl = response.data.result;
                        // If title/artist weren't set, set defaults
                        if (title === 'Unknown') title = 'YouTube Audio';
                    }
                } catch (ravErr) {
                    console.log('Ravenn API error:', ravErr.message);
                }
            }

            // If ravenn failed or no videoUrl, fallback to Deezer preview (like your play command)
            if (!audioUrl) {
                console.log('Ravenn failed, falling back to Deezer...');
                usedFallback = true;
                try {
                    const deezerRes = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
                    const track = deezerRes.data.data[0];
                    if (track && track.preview) {
                        audioUrl = track.preview;
                        title = track.title || 'Unknown';
                        artist = track.artist.name || 'Unknown';
                        duration = track.duration ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}` : '30s (preview)';
                        cover = track.album.cover_medium || null;
                    } else {
                        throw new Error('No results from Deezer');
                    }
                } catch (deezerErr) {
                    console.log('Deezer error:', deezerErr.message);
                    return sock.sendMessage(from, { text: '❌ No results found for that song.' }, { quoted: msg });
                }
            }

            if (!audioUrl) {
                throw new Error('Could not retrieve audio');
            }

            const caption = `🎵 *${title}*\n👤 *Artist:* ${artist}\n⏱️ *Duration:* ${duration}${usedFallback ? ' (preview)' : ''}`;

            // Download and send cover image (if available)
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

            // Download and send audio
            const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 30000 });
            const audioBuffer = Buffer.from(audioRes.data);

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
