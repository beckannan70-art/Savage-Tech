const axios = require('axios');

module.exports = {
    name: "setgcicon",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });

        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = await global.checkAdmin?.(sock, from, sender) || false;
        if (!isAdmin) return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });

        const url = args[0];
        if (!url) return await sock.sendMessage(from, { text: "🖼️ *SΛVΛGΞ:* Provide an image link." }, { quoted: msg });

        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            await sock.updateProfilePicture(from, buffer);
            await sock.sendMessage(from, { text: "✅ **SΛVΛGΞ:** Icon updated." }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ **FAIL:** Check the link or Admin status." }, { quoted: msg });
        }
    }
};
