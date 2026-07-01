module.exports = {
    name: 'owner',
    category: 'engine',
    description: 'Contact the bot owner',
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const mention = [sender];
        const ownerNum = '254105397996';
        const caption = `🌟 *SΛVΛGΞ OWNER* 🌟

👑 *Name:* Spencer
📱 *Phone:* +${ownerNum}
💬 *WhatsApp:* wa.me/${ownerNum}
🐙 *GitHub:* tysavage163
📢 *Telegram:* @Savagemystique

⚡ _Tap the WhatsApp link to chat directly._`;
        await sock.sendMessage(from, { text: caption, mentions: mention }, { quoted: msg });
    }
};
