module.exports = {
    name: "addsudo",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        if (!global.sudoUsers || !Array.isArray(global.sudoUsers)) {
            global.sudoUsers = [];
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return await sock.sendMessage(from, { text: "❌ Reply to a user's message to grant sudo." }, { quoted: msg });
        }

        let target = null;
        if (quoted.key?.participant) {
            target = quoted.key.participant;
        } else if (quoted.key?.remoteJid) {
            target = quoted.key.remoteJid;
        } else if (msg.message.extendedTextMessage.contextInfo.participant) {
            target = msg.message.extendedTextMessage.contextInfo.participant;
        }

        if (!target) {
            console.log("DEBUG quoted:", JSON.stringify(quoted, null, 2));
            return await sock.sendMessage(from, { text: "❌ Could not identify the user. Check console for details." }, { quoted: msg });
        }

        if (global.sudoUsers.includes(target)) {
            return await sock.sendMessage(from, { text: `⚠️ ${target.split('@')[0]} already has sudo privileges.` }, { quoted: msg });
        }

        global.sudoUsers.push(target);
        await sock.sendMessage(from, { text: `✅ ${target.split('@')[0]} added to sudo list.\n🔓 They can now use owner commands.` }, { quoted: msg });
    }
};
