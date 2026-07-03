const settings = require('../settings.js');

module.exports = {
    name: "antitagadmin",
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

        if (!global.antiTagAdminConfig) global.antiTagAdminConfig = {};
        if (!global.antiTagAdminWarnings) global.antiTagAdminWarnings = {};
        if (global.antiTagAdminConfig[from] === undefined) {
            global.antiTagAdminConfig[from] = { enabled: false, action: "delete", warnLimit: 3 };
        }

        const sub = args[0]?.toLowerCase();
        const param = args[1]?.toLowerCase();

        if (sub === "on") {
            global.antiTagAdminConfig[from].enabled = true;
            settings.setGroup(from, 'antiTagAdminConfig', global.antiTagAdminConfig[from]);
            await sock.sendMessage(from, { text: '🛡️ Anti‑tag‑admin protection ENABLED.' }, { quoted: msg });
        } else if (sub === "off") {
            global.antiTagAdminConfig[from].enabled = false;
            settings.setGroup(from, 'antiTagAdminConfig', global.antiTagAdminConfig[from]);
            await sock.sendMessage(from, { text: '🛡️ Anti‑tag‑admin protection DISABLED.' }, { quoted: msg });
        } else if (sub === "set") {
            if (param === "delete" || param === "warn" || param === "kick" || param === "warn+kick") {
                global.antiTagAdminConfig[from].action = param;
                settings.setGroup(from, 'antiTagAdminConfig', global.antiTagAdminConfig[from]);
                await sock.sendMessage(from, { text: `✅ Action set to: ${param.toUpperCase()}` }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: '❌ Action must be: delete, warn, kick, or warn+kick' }, { quoted: msg });
            }
        } else if (sub === "limit") {
            const limit = parseInt(param);
            if (!isNaN(limit) && limit > 0 && limit <= 10) {
                global.antiTagAdminConfig[from].warnLimit = limit;
                settings.setGroup(from, 'antiTagAdminConfig', global.antiTagAdminConfig[from]);
                await sock.sendMessage(from, { text: `✅ Warning limit set to ${limit} before kick.` }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: '❌ Limit must be a number between 1 and 10.' }, { quoted: msg });
            }
        } else if (sub === "list") {
            const cfg = global.antiTagAdminConfig[from];
            await sock.sendMessage(from, { text: `📋 *Anti‑tag‑admin settings*:\nEnabled: ${cfg.enabled}\nAction: ${cfg.action}\nWarn limit: ${cfg.warnLimit}` }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: `Usage:\n.antitagadmin on/off\n.antitagadmin set (delete|warn|kick|warn+kick)\n.antitagadmin limit <1-10>\n.antitagadmin list` }, { quoted: msg });
        }
    }
};
