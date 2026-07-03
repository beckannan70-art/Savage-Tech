const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'telegramstalk',
    category: 'search menu',
    description: 'Lookup Telegram user/channel/group info with photo',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const identifier = args[0];
        if (!identifier) {
            return sock.sendMessage(from, { text: '❌ Usage: .telegramstalk <username or channel ID>' }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_9ddecf073b';
            const apiUrl = `https://apis.xwolf.space/api/stalk/telegram?username=${encodeURIComponent(identifier)}&key=${apiKey}`;
            const response = await axios.get(apiUrl, { httpsAgent: agent, timeout: 15000 });
            const data = response.data;

            if (data.success) {
                const entity = data.result;
                const isUser = entity.type === 'user';

                let caption;
                if (isUser) {
                    caption = `📱 *Telegram User*\n\n` +
                        `👤 Name: ${entity.firstName} ${entity.lastName || ''}\n` +
                        `📛 Username: @${entity.username || '-'}\n` +
                        `🆔 ID: ${entity.id}\n` +
                        `👥 Subscribers: ${entity.subscriberCount?.toLocaleString() || '-'}\n\n` +
                        `🔗 Profile: https://t.me/${entity.username || ''}`;
                } else {
                    caption = `📢 *Telegram Channel/Group*\n\n` +
                        `📛 Title: ${entity.title}\n` +
                        `📛 Username: @${entity.username || '-'}\n` +
                        `🆔 ID: ${entity.id}\n` +
                        `👥 Subscribers: ${entity.subscriberCount?.toLocaleString() || '-'}\n` +
                        `📝 Description: ${entity.description?.substring(0, 200) || '-'}\n\n` +
                        `🔗 Link: https://t.me/${entity.username || ''}`;
                }

                let imageBuffer = null;
                if (entity.photo) {
                    try {
                        const imgRes = await axios.get(entity.photo, {
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
            } else {
                await sock.sendMessage(from, { text: `❌ Telegram lookup failed: ${data.error || 'Not found'}` }, { quoted: msg });
            }
        } catch (err) {
            console.error('Telegram stalk error:', err);
            await sock.sendMessage(from, { text: '❌ Network error or invalid identifier.' }, { quoted: msg });
        }
    }
};
