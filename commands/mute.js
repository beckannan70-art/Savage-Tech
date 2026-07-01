module.exports = {
    name: "mute",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });

        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = await global.checkAdmin?.(sock, from, sender) || false;
        if (!isAdmin) return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });

        try {
            await sock.groupSettingUpdate(from, 'announcement');
            await sock.sendMessage(from, { text: "🔒 **SΛVΛGΞ-TECH:** Group Muted." }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ **ADMIN REQUIRED:** Elevate the bot to Admin." }, { quoted: msg });
        }
    }
};
