const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'twitterstalk',
    category: 'search menu',
    description: 'Lookup Twitter/X user profile info with photo',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const username = args[0];
        if (!username) {
            return sock.sendMessage(from, { text: '❌ Usage: .twitterstalk <username>' }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_9ddecf073b';
            const apiUrl = `https://apis.xwolf.space/api/stalk/twitter?username=${encodeURIComponent(username)}&key=${apiKey}`;
            const response = await axios.get(apiUrl, { httpsAgent: agent, timeout: 15000 });
            const data = response.data;

            if (!data.success) {
                return sock.sendMessage(from, { text: `❌ Twitter lookup failed: ${data.error || 'User not found'}` }, { quoted: msg });
            }

            const result = data.result || data;
            const user = {
                username: result.screenName || result.username || username,
                name: result.name || 'Unknown',
                bio: (result.description || '-').substring(0, 150),
                bioDisplay: result.description && result.description.length > 150 ? result.description.substring(0, 150) + '...' : (result.description || '-'),
                avatar: result.profileImageUrlHttps || result.avatar,
                verified: result.verified || false,
                followers: (result.followersCount || result.followers || 0).toLocaleString(),
                following: (result.friendsCount || result.following || 0).toLocaleString(),
                tweets: (result.statusesCount || result.tweets || 0).toLocaleString(),
                joined: result.createdAt ? result.createdAt.split('T')[0] : (result.joined || '-'),
                profileUrl: `https://twitter.com/${username}`
            };

            const caption = `🐦 *Twitter User*\n\n` +
                `👤 Name: ${user.name}\n` +
                `📛 Username: @${user.username}\n` +
                `📝 Bio: ${user.bioDisplay}\n` +
                `✔️ Verified: ${user.verified ? 'Yes' : 'No'}\n\n` +
                `👥 Followers: ${user.followers}\n` +
                `👣 Following: ${user.following}\n` +
                `🐦 Tweets: ${user.tweets}\n` +
                `📅 Joined: ${user.joined}\n\n` +
                `🔗 Profile: ${user.profileUrl}`;

            let imageBuffer = null;
            if (user.avatar) {
                try {
                    const imgRes = await axios.get(user.avatar, {
                        responseType: 'arraybuffer',
                        httpsAgent: agent,
                        timeout: 10000
                    });
                    imageBuffer = Buffer.from(imgRes.data);
                } catch (imgErr) {
                    console.log('Avatar download failed:', imgErr.message);
                }
            }

            if (imageBuffer) {
                await sock.sendMessage(from, {
                    image: imageBuffer,
                    caption: caption
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: caption }, { quoted: msg });
            }
        } catch (err) {
            console.error('Twitter stalk error:', err);
            await sock.sendMessage(from, { text: '❌ Network error or invalid username.' }, { quoted: msg });
        }
    }
};
