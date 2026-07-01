module.exports = {
    name: "tagadmin",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });

        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = await global.checkAdmin?.(sock, from, sender) || false;
        if (!isAdmin) return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });

        try {
            const metadata = await sock.groupMetadata(from);
            const admins = metadata.participants
                .filter(v => v.admin !== null)
                .map(v => v.id);

            if (admins.length === 0) return;

            let messageText = `⛓️ **SΛVΛGΞ ADMIN ALERT** ⛓️\n\n`;
            
            admins.forEach((admin) => {
                messageText += `🔹 @${admin.split('@')[0]}\n`;
            });

            if (args.join(" ")) messageText += `\n📝 **MESSAGE:** ${args.join(" ")}`;

            await sock.sendMessage(from, { 
                text: messageText, 
                mentions: admins 
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: "❌ **LINK ERROR:** I need Admin rights to read the participant list." }, { quoted: msg });
        }
    }
};
