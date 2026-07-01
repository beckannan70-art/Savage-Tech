const settings = require('../settings.js');

module.exports = {
    name: 'antiforwardkickon',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only.' }, { quoted: msg });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });

        if (!global.antiForwardConfig) global.antiForwardConfig = {};
        global.antiForwardConfig[from] = { enabled: true, action: 'kick', warnLimit: 0 };
        settings.setGroup(from, 'antiForwardConfig', global.antiForwardConfig[from]);
        await sock.sendMessage(from, { text: '✅ Anti‑forward enabled: forwarded messages will be **deleted** and the sender will be **kicked immediately**.' }, { quoted: msg });
    }
};
