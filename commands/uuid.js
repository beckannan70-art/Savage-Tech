const crypto = require('crypto');

module.exports = {
    name: 'uuid',
    category: 'tools',
    description: 'Generate UUID v4',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const uuid = crypto.randomUUID();
        await sock.sendMessage(from, { text: `🆔 *UUID*\n\n${uuid}` }, { quoted: msg });
    }
};
