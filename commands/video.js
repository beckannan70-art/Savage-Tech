const axios = require("axios");
const yts = require("yt-search");

module.exports = {
    name: "video",
    description: "Download YouTube videos by URL or search by name (default quality: 360p)",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;

        if (!args.length) {
            await sock.sendMessage(from, {
                text: "❌ Please provide a YouTube URL or a song name.\n\nExamples:\n`.video https://youtu.be/dQw4w9WgXcQ`\n`.video Rick Astley Never Gonna Give You Up`\n`.video Rick Astley 720` (optional quality)"
            }, { quoted: msg });
            return;
        }

        let query = args.join(" ");
        let quality = null;
        const apikey = process.env.GIFTED_API_KEY || "gifted";

        // Check if the last argument is a quality number (e.g., 720, 360, 1080)
        const lastArg = args[args.length - 1];
        if (/^\d{3,4}$/.test(lastArg) && parseInt(lastArg) >= 144 && parseInt(lastArg) <= 1080) {
            quality = lastArg;
            query = args.slice(0, -1).join(" ");
        }

        if (!query) query = args.join(" ");

        // If no quality specified, default to 360
        if (!quality) quality = "360";

        const isYoutubeUrl = (str) => {
            return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/.test(str);
        };

        let videoUrl = query;

        // --- SEARCH IF NOT A URL (using yt-search) ---
        if (!isYoutubeUrl(query)) {
            const searchMsg = await sock.sendMessage(from, {
                text: `🔍 Searching for: "${query}"...`
            }, { quoted: msg });

            try {
                const searchResult = await yts(query);
                const videos = searchResult.videos;

                if (!videos || videos.length === 0) {
                    await sock.sendMessage(from, {
                        text: `❌ No results found for: "${query}"`
                    }, { quoted: msg });
                    return;
                }

                const firstVideo = videos[0];
                videoUrl = firstVideo.url;

                await sock.sendMessage(from, {
                    text: `✅ Found: *${firstVideo.title}*\n👤 ${firstVideo.author.name}\n⏳ Duration: ${firstVideo.duration}\n\n⏳ Now downloading...`
                }, { quoted: msg });

                // ❌ Removed the deletion of searchMsg

            } catch (error) {
                console.error("Search error:", error.message);
                await sock.sendMessage(from, {
                    text: `❌ Search failed: ${error.message}\n\nPlease try using a direct YouTube URL.`
                }, { quoted: msg });
                return;
            }
        }

        // --- DOWNLOAD THE VIDEO (Gifted API) ---
        const downloadMsg = await sock.sendMessage(from, {
            text: `⏳ Downloading video (${quality}p)... Please wait.`
        }, { quoted: msg });

        try {
            const params = { apikey, url: videoUrl, quality: quality };

            const response = await axios.get(
                "https://api.gifted.co.ke/api/download/ytvideo",
                { params, timeout: 60000 }
            );

            if (!response.data?.success || !response.data?.result?.download_url) {
                throw new Error(response.data?.message || "No download URL returned.");
            }

            const result = response.data.result;

            // Check file size if available (optional)
            if (result.size && parseInt(result.size) > 16 * 1024 * 1024) {
                await sock.sendMessage(from, {
                    text: `⚠️ The video is too large (${(parseInt(result.size) / (1024 * 1024)).toFixed(1)}MB) to send directly on WhatsApp (max 16MB).\n\nTry a lower quality or download it manually from:\n${result.download_url}`
                }, { quoted: msg });
                return;
            }

            // ❌ Removed the deletion of downloadMsg

            // Build caption without "Powered by Gifted API"
            let caption = `🎬 *${result.title || "Video"}*`;
            if (result.quality) caption += `\n📺 Quality: ${result.quality}`;
            if (result.format) caption += `\n📁 Format: ${result.format}`;
            if (result.availableQualities?.length) {
                caption += `\n📋 Available: ${result.availableQualities.join(', ')}p`;
            }

            // Send the actual video file as a quoted reply
            await sock.sendMessage(from, {
                video: { url: result.download_url },
                caption: caption
            }, { quoted: msg });

        } catch (error) {
            console.error("Video download error:", error.message);
            await sock.sendMessage(from, {
                text: `❌ Failed to download video.\n\n${error.message}`
            }, { quoted: msg });
        }
    }
};
