module.exports = {
    name: "sudoinfo",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo && !isMe) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        if (!global.sudoUsers || !Array.isArray(global.sudoUsers)) {
            global.sudoUsers = [];
        }

        const count = global.sudoUsers.length;
        let listMsg = "";
        if (args[0] === "list") {
            const list = global.sudoUsers.map(j => `• ${j.split('@')[0]}`).join("\n");
            listMsg = `\n\n📋 *Sudo users* (${count}):\n${list || "None"}`;
        }
        await sock.sendMessage(from, {
            text: `🔧 *SUDO INFO*\nTotal sudoers: ${count}\n\nUse .addsudo (reply to user) and .removesudo (reply to user)\n.sudoinfo list to see all${listMsg}`
        }, { quoted: msg });
    }
};
