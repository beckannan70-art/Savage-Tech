const settings = require('../settings.js');

function getConfig(groupId) {
    return settings.getGroup(groupId, 'antidemote') || { enabled: false };
}

function setConfig(groupId, value) {
    settings.setGroup(groupId, 'antidemote', value);
}

module.exports = {
    name: 'antidemote',
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
            return await sock.sendMessage(from, { text: 'Usage: .antidemote on/off' }, { quoted: msg });
        }

        const config = getConfig(from);
        config.enabled = state === 'on';
        setConfig(from, config);

        await sock.sendMessage(from, {
            text: `🛡️ Anti-Demote is now ${state.toUpperCase()}`
        }, { quoted: msg });
    },

    async handleAntidemoteEvent(sock, update) {
        const { id, action, author } = update;
        if (action !== 'demote') return;
        const config = getConfig(id);
        if (!config.enabled) return;

        const meta = await sock.groupMetadata(id);
        const admins = meta.participants.filter(p => p.admin).map(p => p.id);
        if (!admins.includes(author)) return;

        await sock.groupParticipantsUpdate(id, [author], 'demote');
        await sock.sendMessage(id, {
            text: `🚨 *ANTI-DEMOTE ALERT*\n\n👮 Action Blocked: Unauthorized Demotion Detected\n👤 Offender: @${author.split('@')[0]}\n\n⚠️ Result: Admin privileges revoked\n🛡️ Security System: ACTIVE\n\n⚡ Powered by Savage Tech`,
            mentions: [author]
        });
    }
};
