const settings = require('../settings.js');

module.exports = {
    name: "mode",
    category: "owner",
    description: "Switch bot between public and private mode",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        if (!args[0]) {
            const currentMode = global.worktype === 'public' ? '🔓 PUBLIC' : '🔐 PRIVATE';
            return await sock.sendMessage(from, {
                text: `*SΛVΛGΞ MODE SETTINGS*\n\n*Current Status:* ${currentMode}\n\n*Usage:*\n${global.prefix}mode public\n${global.prefix}mode private`
            }, { quoted: msg });
        }

        const newMode = args[0].toLowerCase();
        if (newMode === "public") {
            global.worktype = "public";
            settings.setGlobal('worktype', 'public');
            await sock.sendMessage(from, { text: "🔓 **SYSTEM UPDATE:** Bot is now in PUBLIC mode." }, { quoted: msg });
        } else if (newMode === "private") {
            global.worktype = "private";
            settings.setGlobal('worktype', 'private');
            await sock.sendMessage(from, { text: "🔐 **SYSTEM UPDATE:** Bot is now in PRIVATE mode." }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: "❌ Invalid mode. Use public or private." }, { quoted: msg });
        }
    }
};
