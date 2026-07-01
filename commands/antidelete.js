const settings = require('../settings.js');

module.exports = {
    name: "antidelete",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        const sub = args[0]?.toLowerCase();

        if (sub === "on") {
            global.antiDeleteEnabled = true;
            settings.setGlobal('antiDeleteEnabled', true);
            return await sock.sendMessage(from, { text: "🛡️ Anti‑delete ENABLED globally." }, { quoted: msg });
        }
        if (sub === "off") {
            global.antiDeleteEnabled = false;
            settings.setGlobal('antiDeleteEnabled', false);
            return await sock.sendMessage(from, { text: "🛡️ Anti‑delete DISABLED." }, { quoted: msg });
        }

        if (sub === "mode") {
            const mode = args[1]?.toLowerCase();
            if (!['private', 'chat', 'both'].includes(mode)) {
                return await sock.sendMessage(from, {
                    text: "❌ Mode must be: private, chat, or both.\n\n`private` → send to your DM only\n`chat` → send back to the original chat\n`both` → send to both"
                }, { quoted: msg });
            }
            global.antideleteMode = mode;
            settings.setGlobal('antideleteMode', mode);
            return await sock.sendMessage(from, { text: `✅ Anti‑delete mode set to: *${mode.toUpperCase()}*` }, { quoted: msg });
        }

        const status = global.antiDeleteEnabled ? 'ENABLED' : 'DISABLED';
        const currentMode = global.antideleteMode || 'private';
        await sock.sendMessage(from, {
            text: `🛡️ *ANTI‑DELETE STATUS*\n\n• Status: ${status}\n• Mode: ${currentMode.toUpperCase()}\n\nUsage:\n.antidelete on/off\n.antidelete mode <private|chat|both>`
        }, { quoted: msg });
    }
};
