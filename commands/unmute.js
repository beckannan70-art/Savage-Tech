module.exports = {
    name: "unmute",
    category: "group",
    description: "Unmute group (allow all members to send messages)",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);
        const isAdmin = await global.checkAdmin?.(sock, from, sender) || false;

        if (!isArchitect && !isOwner && !isSudo && !isAdmin) {
            return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });
        }

        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sock.sendMessage(from, { text: "🔓 Group unmuted. All members can now send messages." }, { quoted: msg });
        } catch (e) {
            console.error('Unmute error:', e);
            await sock.sendMessage(from, { text: "❌ I need admin rights to unmute this group." }, { quoted: msg });
        }
    }
};
