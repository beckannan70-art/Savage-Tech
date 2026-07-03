module.exports = {
    name: "eval",
    category: "owner",
    description: "Execute JS code on the fly",
    async execute(sock, msg, args, { isMe }) {
        if (!isMe) return;

        const code = args.join(" ");
        if (!code) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "💻 **SΛVΛGΞ:** Provide code to execute. (Example: .eval sock.user.id)"
            }, { quoted: msg });
        }

        try {
            let evaled = await eval(code);
            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ **EXECUTION SUCCESS:**\n\n\`\`\`${evaled}\`\`\``
            }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ **EXECUTION ERROR:**\n\n\`\`\`${err.message}\`\`\``
            }, { quoted: msg });
        }
    }
};
