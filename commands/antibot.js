const settings = require('../settings.js');

module.exports = {
    name: 'antibot',
    category: 'group',
    description: 'Toggle anti‑bot mode (kicks new members automatically)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const senderNumber = sender.split('@')[0];
            const participant = meta.participants.find(p => p.id.split('@')[0] === senderNumber);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (e) {
            return await sock.sendMessage(from, { text: '❌ Failed to verify admin status.' }, { quoted: msg });
        }
        if (!isAdmin) {
            return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });
        }

        if (!args[0]) {
            const status = global.antiBot?.[from] ? 'enabled' : 'disabled';
            return await sock.sendMessage(from, { text: `🛡️ Anti‑bot is currently ${status}. Use .antibot on/off to change.` }, { quoted: msg });
        }

        const option = args[0].toLowerCase();
        if (option !== 'on' && option !== 'off') {
            return await sock.sendMessage(from, { text: '❌ Usage: .antibot on / off' }, { quoted: msg });
        }

        if (!global.antiBot) global.antiBot = {};
        const enabled = option === 'on';
        global.antiBot[from] = enabled;
        settings.setGroup(from, 'antiBot', enabled);

        await sock.sendMessage(from, { text: `✅ Anti‑bot ${enabled ? 'enabled' : 'disabled'}. ${enabled ? 'New members will be kicked automatically.' : ''}` }, { quoted: msg });
    }
};
