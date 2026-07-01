module.exports = {
    name: 'approveall',
    category: 'group',
    description: 'Approve all pending join requests (admin only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });

        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participant = groupMetadata.participants.find(p => p.id === sender);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (e) {}
        if (!isAdmin && !isMe) return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });

        const pending = global.pendingJoinRequests?.[from] || [];
        if (pending.length === 0) {
            return await sock.sendMessage(from, { text: '✅ No pending join requests at the moment.' }, { quoted: msg });
        }

        let approved = 0;
        let failed = 0;
        for (const jid of pending) {
            try {
                await sock.groupParticipantsUpdate(from, [jid], 'add');
                approved++;
            } catch (err) {
                console.error(`Failed to approve ${jid}:`, err);
                failed++;
            }
        }
        delete global.pendingJoinRequests[from];

        await sock.sendMessage(from, { text: `✅ Approved ${approved} join requests.\n❌ Failed: ${failed}` }, { quoted: msg });
    }
};
