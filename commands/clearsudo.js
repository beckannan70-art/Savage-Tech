const fs = require('fs');
const path = require('path');

module.exports = {
    name: "clearsudo",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        if (!isArchitect && !isOwner && !isMe) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        if (!global.sudoUsers || !Array.isArray(global.sudoUsers)) {
            global.sudoUsers = [];
        }

        const count = global.sudoUsers.length;
        global.sudoUsers = [];

    
        try {
            const sudoPath = path.join(__dirname, '..', 'sudo.json');
            fs.writeFileSync(sudoPath, JSON.stringify(global.sudoUsers, null, 2));
        } catch (err) {
            console.error('Failed to save sudo.json:', err);
        }

        await sock.sendMessage(from, { text: `✅ Cleared sudo list. Removed ${count} user(s).` }, { quoted: msg });
    }
};
