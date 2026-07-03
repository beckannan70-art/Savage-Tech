const settings = require('../settings.js');

module.exports = {
    name: "antitag",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });

        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const senderNumber = sender.split('@')[0].split(':')[0];
            const participant = meta.participants.find(p => {
                const pNumber = p.id.split('@')[0].split(':')[0];
                return pNumber === senderNumber;
            });
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (e) {}
        if (!isAdmin) return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });

        if (!global.antiTagConfig) global.antiTagConfig = {};
        if (!global.antiTagWarnings) global.antiTagWarnings = {};
        if (global.antiTagConfig[from] === undefined) {
            global.antiTagConfig[from] = { enabled: false, action: "delete", warnLimit: 3 };
        }

        const sub = args[0]?.toLowerCase();
        const param = args[1]?.toLowerCase();

        if (sub === "on") {
            global.antiTagConfig[from].enabled = true;
            settings.setGroup(from, 'antiTagConfig', global.antiTagConfig[from]);
            await sock.sendMessage(from, { text: '🛡️ Anti-tag protection ENABLED.' }, { quoted: msg });
        } else if (sub === "off") {
            global.antiTagConfig[from].enabled = false;
            settings.setGroup(from, 'antiTagConfig', global.antiTagConfig[from]);
            await sock.sendMessage(from, { text: '🛡️ Anti-tag protection DISABLED.' }, { quoted: msg });
        } else if (sub === "set") {
            if (param === "delete" || param === "warn" || param === "kick" || param === "warn+kick") {
                global.antiTagConfig[from].action = param;
                settings.setGroup(from, 'antiTagConfig', global.antiTagConfig[from]);
                await sock.sendMessage(from, { text: `✅ Action set to: ${param.toUpperCase()}` }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: '❌ Action must be: delete, warn, kick, or warn+kick' }, { quoted: msg });
            }
        } else if (sub === "limit") {
            const limit = parseInt(param);
            if (!isNaN(limit) && limit > 0 && limit <= 10) {
                global.antiTagConfig[from].warnLimit = limit;
                settings.setGroup(from, 'antiTagConfig', global.antiTagConfig[from]);
                await sock.sendMessage(from, { text: `✅ Warning limit set to ${limit} before kick.` }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: '❌ Limit must be a number between 1 and 10.' }, { quoted: msg });
            }
        } else if (sub === "list") {
            const cfg = global.antiTagConfig[from];
            await sock.sendMessage(from, { text: `📋 *Anti-tag settings*:\nEnabled: ${cfg.enabled}\nAction: ${cfg.action}\nWarn limit: ${cfg.warnLimit}` }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: `Usage:\n.antitag on/off\n.antitag set (delete|warn|kick|warn+kick)\n.antitag limit <1-10>\n.antitag list` }, { quoted: msg });
        }
    }
};
