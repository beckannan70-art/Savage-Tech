module.exports = {
    name: 'testadmin',
    category: 'owner',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "❌ Restricted to owner and sudo users." }, { quoted: msg });
        }

        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const participant = meta.participants.find(p => p.id === sender);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            await sock.sendMessage(from, {
                text: `Sender: ${sender}\nIs admin: ${isAdmin}\nParticipant object: ${JSON.stringify(participant)}`
            }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(from, { text: `Error: ${err.message}` }, { quoted: msg });
        }
    }
};
