module.exports = {
    name: 'userid',
    category: 'group',
    description: 'Get WhatsApp ID of a user (reply to a message or your own)',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');

        let hasPermission = false;
        if (isGroup) {
            let isAdmin = false;
            try {
                const meta = await sock.groupMetadata(from);
                const participant = meta.participants.find(p => p.id === sender);
                isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            } catch (e) {
                return await sock.sendMessage(from, { text: '❌ Failed to verify admin status.' }, { quoted: msg });
            }
            const isOwner = sender === global.ownerJid;
            const isSudo = global.sudoUsers?.includes(sender);
            hasPermission = isAdmin || isArchitect || isOwner || isSudo;
        } else {
            const isOwner = sender === global.ownerJid;
            const isSudo = global.sudoUsers?.includes(sender);
            hasPermission = isArchitect || isOwner || isSudo;
        }

        if (!hasPermission) {
            return await sock.sendMessage(from, { text: isGroup ? '❎ You are not worthy of this command.' : 'This command is restricted to the owner and sudo users only.' }, { quoted: msg });
        }

        let targetJid = null;
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMsg) {
            targetJid = msg.message.extendedTextMessage.contextInfo.participant || msg.message.extendedTextMessage.contextInfo.remoteJid;
        }

        if (!targetJid) {
            targetJid = sender;
        }

        await sock.sendMessage(from, { text: `🆔 User ID: ${targetJid}` }, { quoted: msg });
    }
};
