module.exports = {
    name: "getbio",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        try {
            const status = await sock.fetchStatus(sock.user.id);
            await sock.sendMessage(from, { text: `📝 Current bio: ${status.status || "Not set"}` }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Could not fetch bio: ${err.message}` }, { quoted: msg });
        }
    }
};
