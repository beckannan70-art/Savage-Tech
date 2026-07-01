const settings = require('../settings.js');

module.exports = {
    name: 'antiforwardwarnon',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only.' }, { quoted: msg });
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });

        let warnLimit = 3;
        if (args[0] && !isNaN(parseInt(args[0]))) warnLimit = parseInt(args[0]);
        if (!global.antiForwardConfig) global.antiForwardConfig = {};
        global.antiForwardConfig[from] = { enabled: true, action: 'warn', warnLimit: warnLimit };
        settings.setGroup(from, 'antiForwardConfig', global.antiForwardConfig[from]);
        await sock.sendMessage(from, { text: `✅ Anti‑forward enabled: forwarded messages will be **deleted** and the sender will be warned. Warn limit: ${warnLimit}.` }, { quoted: msg });
    }
};
