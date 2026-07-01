const settings = require('../settings.js');

module.exports = {
    name: 'antigroupmention',
    category: 'group',
    description: 'Protect against group mentions (@group) with delete/warn/kick actions',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = await global.checkAdmin(sock, from, sender);
        if (!isAdmin) {
            return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });
        }

        let config = settings.getGroup(from, 'antigroupmention');
        if (!config) {
            config = { enabled: false, action: 'delete' };
            settings.setGroup(from, 'antigroupmention', config);
        }

        const sub = args[0]?.toLowerCase();

        if (sub === 'on') {
            config.enabled = true;
            settings.setGroup(from, 'antigroupmention', config);
            return await sock.sendMessage(from, { text: '🛡️ Anti‑group‑mention protection ENABLED.' }, { quoted: msg });
        }

        if (sub === 'off') {
            config.enabled = false;
            settings.setGroup(from, 'antigroupmention', config);
            return await sock.sendMessage(from, { text: '🛡️ Anti‑group‑mention protection DISABLED.' }, { quoted: msg });
        }

        if (sub === 'set') {
            const action = args[1]?.toLowerCase();
            if (!['delete', 'warn', 'kick'].includes(action)) {
                return await sock.sendMessage(from, {
                    text: '❌ Action must be: delete, warn, or kick.'
                }, { quoted: msg });
            }
            config.enabled = true;
            config.action = action;
            settings.setGroup(from, 'antigroupmention', config);
            return await sock.sendMessage(from, {
                text: `✅ Anti‑group‑mention action set to: ${action.toUpperCase()}`
            }, { quoted: msg });
        }

        if (sub === 'get') {
            const status = config.enabled ? 'ON' : 'OFF';
            const action = config.action || 'delete';
            return await sock.sendMessage(from, {
                text: `📌 *Anti‑group‑mention Settings*\n\n• Status: ${status}\n• Action: ${action.toUpperCase()}`
            }, { quoted: msg });
        }

        const status = config.enabled ? 'ON' : 'OFF';
        const action = config.action || 'delete';
        await sock.sendMessage(from, {
            text: `📌 *Anti‑group‑mention Status*\n\nStatus: ${status}\nAction: ${action}\n\nUsage:\n.antigroupmention on\n.antigroupmention off\n.antigroupmention set delete|warn|kick\n.antigroupmention get`
        }, { quoted: msg });
    }
};
