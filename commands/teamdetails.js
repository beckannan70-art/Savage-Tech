const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'teamdetails',
    category: 'sports',
    description: 'Get team details (badge included)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '❌ Usage: .teamdetails <team name or ID>' }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { text: `🔍 Fetching team details for "${query}"...` }, { quoted: msg });

            const apiKey = 'wxa_f_9ddecf073b';
            const apiUrl = `https://apis.xwolf.space/api/sports/team/details?q=${encodeURIComponent(query)}&key=${apiKey}`;
            const response = await axios.get(apiUrl, { httpsAgent: agent, timeout: 15000 });
            const data = response.data;

            if (!data.success || !data.result) {
                throw new Error(data.error || 'No data returned');
            }

            const t = data.result;
            let caption = `🏟️ *Team: ${t.name || 'Unknown'}*\n\n`;
            caption += `🏷️ ID: ${t.id || 'N/A'}\n`;
            caption += `⚽ Sport: ${t.sport || 'N/A'}\n`;
            caption += `🏅 League: ${t.league || 'N/A'}\n`;
            caption += `🌍 Country: ${t.country || 'N/A'}\n`;
            caption += `📊 Formed: ${t.formed || 'N/A'}\n`;
            caption += `🏆 Stadium: ${t.stadium || 'N/A'}\n`;
            if (t.description) {
                caption += `📝 ${t.description.slice(0, 300)}`;
            }

            let imgUrl = t.badge || t.thumbnail;
            if (imgUrl && imgUrl.startsWith('http')) {
                try {
                    const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer', httpsAgent: agent, timeout: 10000 });
                    const imgBuffer = Buffer.from(imgRes.data);
                    await sock.sendMessage(from, {
                        image: imgBuffer,
                        caption: caption
                    }, { quoted: msg });
                } catch (imgErr) {
                    console.warn('Failed to fetch badge:', imgErr.message);
                    await sock.sendMessage(from, { text: caption }, { quoted: msg });
                }
            } else {
                await sock.sendMessage(from, { text: caption }, { quoted: msg });
            }

        } catch (err) {
            console.error('Team details error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
