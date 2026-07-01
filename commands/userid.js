module.exports = {
    name: 'userid',
    category: 'group',
    description: 'Get WhatsApp ID of a user (reply to a message or your own)',
    async execute(sock, msg, args, { isArchitect }) {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = msg.key.participant || msg.key.remoteJid;

        if (isGroup) {
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
        } else {
            if (!isArchitect) {
                return await sock.sendMessage(from, { text: 'This command is restricted to the owner and sudo users only.' }, { quoted: msg });
            }
        }

        let targetJid = null;
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMsg) {
            targetJid = msg.message.extendedTextMessage.contextInfo.participant || msg.message.extendedTextMessage.contextInfo.remoteJid;
        }

        if (!targetJid) {
            targetJid = sender;
        }

        const targetName = targetJid.split('@')[0];
        await sock.sendMessage(from, { text: `🆔 User ID: ${targetJid}\n\n_⚡ Powered by Savage-Tech_` }, { quoted: msg });
    }
};
