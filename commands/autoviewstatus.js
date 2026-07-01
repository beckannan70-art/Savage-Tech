const settings = require('../settings.js');

module.exports = {
    name: 'autoviewstatus',
    category: 'owner',
    desc: 'Toggle automatic status viewing for the Architect.',
    execute: async (sock, msg, args, { isArchitect, isMe }) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        const input = args[0]?.toLowerCase();

        if (input === 'on') {
            global.autoViewStatus = 'on';
            settings.setGlobal('autoViewStatus', 'on');
            return await sock.sendMessage(from, { text: '👁️ *AUTO-VIEW STATUS:* ENABLED' }, { quoted: msg });
        }

        if (input === 'off') {
            global.autoViewStatus = 'off';
            settings.setGlobal('autoViewStatus', 'off');
            return await sock.sendMessage(from, { text: '🙈 *AUTO-VIEW STATUS:* DISABLED' }, { quoted: msg });
        }

        const current = global.autoViewStatus === 'on' ? 'ENABLED 👁️' : 'DISABLED 🙈';
        await sock.sendMessage(from, {
            text: `*S Λ V Λ G Ξ  -  STATUS ENGINE*\n\n*Current Clearance:* OWNER\n*Status:* ${current}\n\n*Usage:*\n${global.prefix}autoviewstatus on\n${global.prefix}autoviewstatus off`
        }, { quoted: msg });
    }
};
