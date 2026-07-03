module.exports = {
    category: 'tools',
    name: 'setgcname',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = await global.checkAdmin(sock, from, sender);
        if (!isAdmin) {
            return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });
        }

        const newName = args.join(' ');
        if (!newName) {
            return await sock.sendMessage(from, { text: '❌ Please provide the new name for the group.\nExample: *.setgcname SΛVΛGΞ HQ*' }, { quoted: msg });
        }

        try {
            await sock.groupUpdateSubject(from, newName);
            await sock.sendMessage(from, { text: `✅ Group name has been successfully changed to:\n*${newName}*` }, { quoted: msg });
        } catch (e) {
            console.log(e);
            await sock.sendMessage(from, { text: '❌ Failed to change name. Make sure I am an Admin!' }, { quoted: msg });
        }
    }
};
