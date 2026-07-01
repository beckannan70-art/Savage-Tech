const settings = require('../settings.js');

function getConfig(groupId) {
    return settings.getGroup(groupId, 'antipromote') || { enabled: false };
}

function setConfig(groupId, value) {
    settings.setGroup(groupId, 'antipromote', value);
}

module.exports = {
    name: 'antipromote',
    category: 'group',

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = await global.checkAdmin?.(sock, from, sender) || false;
        if (!isAdmin) {
            return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });
        }

        const state = args[0]?.toLowerCase();
        if (!['on', 'off'].includes(state)) {
            return await sock.sendMessage(from, { text: 'Usage: .antipromote on/off' }, { quoted: msg });
        }

        const config = getConfig(from);
        config.enabled = state === 'on';
        setConfig(from, config);

        await sock.sendMessage(from, {
            text: `🛡️ Anti-Promote is now ${state.toUpperCase()}`
        }, { quoted: msg });
    },

    async handleAntipromoteEvent(sock, update) {
        const { id, action, participants, author } = update;
        if (action !== 'promote') return;
        const config = getConfig(id);
        if (!config.enabled) return;

        const meta = await sock.groupMetadata(id);
        const admins = meta.participants.filter(p => p.admin).map(p => p.id);
        if (!admins.includes(author)) return;

        for (const user of participants) {
            if (admins.includes(user)) {
                await sock.groupParticipantsUpdate(id, [author, user], 'demote');
                await sock.sendMessage(id, {
                    text: `🚨 *ANTI-PROMOTE ALERT*\n\n👮 Action Blocked: Unauthorized Promotion Detected\n👤 Offender: @${author.split('@')[0]}\n🎯 Target: @${user.split('@')[0]}\n\n⚠️ Result: Both users have been demoted\n🛡️ Security System: ACTIVE\n\n⚡ Powered by Savage Tech`,
                    mentions: [author, user]
                });
            }
        }
    }
};
