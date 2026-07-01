const settings = require('../settings.js');

module.exports = {
    name: "autoread",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        if (global.autoRead === undefined) global.autoRead = false;

        const option = args[0]?.toLowerCase();
        if (!["on", "off"].includes(option)) {
            return await sock.sendMessage(from, { text: "❌ Usage:\n.autoread on\n.autoread off" }, { quoted: msg });
        }

        global.autoRead = option === "on";
        settings.setGlobal('autoRead', global.autoRead);

        const quotesOn = ["Every message will now be seen instantly.", "The bot is now watching everything.", "No message escapes the system anymore.", "Read receipts activated globally.", "The eyes are open now."];
        const quotesOff = ["Read tracking disabled.", "Messages will remain unopened.", "The system stopped observing chats.", "Auto-read shut down successfully.", "The eyes have closed."];
        const quote = global.autoRead ? quotesOn[Math.floor(Math.random() * quotesOn.length)] : quotesOff[Math.floor(Math.random() * quotesOff.length)];

        await sock.sendMessage(from, {
            text: `👁️ *AUTO-READ SYSTEM*\n\n📌 Status: ${global.autoRead ? "ENABLED" : "DISABLED"}\n\n🧊 ${quote}\n\n⚡ Powered by Savage Tech`
        }, { quoted: msg });
    }
};
