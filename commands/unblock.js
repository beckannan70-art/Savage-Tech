module.exports = {
    name: 'unblock',
    category: 'admin',
    description: 'Unblock/whitelist a user (remove from blacklist)',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: '❌ Restricted to owner and sudo users.' }, { quoted: msg });
        }

        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                     (args[0] && args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');

        if (!target) {
            return sock.sendMessage(from, { text: '💡 Tag someone or provide a number to unblock.' }, { quoted: msg });
        }

        if (!global.blacklist) global.blacklist = new Set();
        if (!global.blacklist.has(target)) {
            return sock.sendMessage(from, { text: `ℹ️ ${target} is not blacklisted.` }, { quoted: msg });
        }

        global.blacklist.delete(target);
        await sock.sendMessage(from, { text: `✅ ${target} has been removed from the blacklist.` }, { quoted: msg });
    }
};
