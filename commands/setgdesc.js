module.exports = {
    category: 'group',
    name: 'setgdesc',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = await global.checkAdmin?.(sock, from, sender) || false;
        if (!isAdmin) {
            return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });
        }

        const newDesc = args.join(' ');
        if (!newDesc) {
            return await sock.sendMessage(from, { text: '❌ What is the new description?' }, { quoted: msg });
        }

        try {
            await sock.groupUpdateDescription(from, newDesc);
            await sock.sendMessage(from, { text: `✅ *GROUP DESCRIPTION UPDATED:* \n\n${newDesc}` }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(from, { text: '❌ Error: Make sure I am an Admin!' }, { quoted: msg });
        }
    }
};
