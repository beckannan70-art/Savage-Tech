const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'setpp',
    category: 'owner',
    description: 'Update bot profile picture (reply to an image)',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo && !isMe) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return await sock.sendMessage(from, { text: '❌ Reply to an image message.' }, { quoted: msg });
        }
        const imageMsg = quoted.imageMessage;
        if (!imageMsg) {
            return await sock.sendMessage(from, { text: '❌ The replied message must be an image.' }, { quoted: msg });
        }
        try {
            await sock.sendMessage(from, { text: '📸 Downloading image...' }, { quoted: msg });
            const buffer = await downloadMediaMessage(
                { message: quoted },
                'buffer',
                {},
                { logger: console }
            );
            if (!buffer || buffer.length === 0) {
                throw new Error('Failed to download image');
            }
            await sock.updateProfilePicture(sock.user.id, buffer);
            await sock.sendMessage(from, { text: '✅ Digital identity updated.' }, { quoted: msg });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
