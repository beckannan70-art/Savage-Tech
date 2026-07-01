module.exports = {
    name: "cancelkick",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });

        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const senderNumber = sender.split('@')[0].split(':')[0];
            const participant = meta.participants.find(p => {
                const pNumber = p.id.split('@')[0].split(':')[0];
                return pNumber === senderNumber;
            });
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (e) {}
        if (!isAdmin) return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });

        if (!global.kickallCancel) global.kickallCancel = new Set();
        if (global.kickallCancel.has(from)) {
            global.kickallCancel.delete(from);
            await sock.sendMessage(from, { text: '✅ Kickall cancellation requested. Operation will be aborted.' }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: 'ℹ️ No active kickall operation in this group.' }, { quoted: msg });
        }
    }
};
