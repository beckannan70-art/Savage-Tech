module.exports = {
    name: 'readreceipts',
    category: 'owner',
    description: 'Toggle auto-read receipts (blue ticks) for incoming messages',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        if (!args[0]) {
            const status = global.autoRead ? 'enabled' : 'disabled';
            return await sock.sendMessage(from, { text: `📖 Read receipts are currently ${status}. Use .readreceipts on/off to change.` }, { quoted: msg });
        }

        const option = args[0].toLowerCase();
        if (option !== 'on' && option !== 'off') {
            return await sock.sendMessage(from, { text: '❌ Usage: .readreceipts on / off' }, { quoted: msg });
        }

        global.autoRead = option === 'on';
        await sock.sendMessage(from, { text: `✅ Read receipts ${global.autoRead ? 'enabled' : 'disabled'}.` }, { quoted: msg });
    }
};
