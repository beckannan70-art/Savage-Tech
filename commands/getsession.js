const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

module.exports = {
    name: 'getsession',
    category: 'owner',
    description: 'Get the current session ID (compressed base64)',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        const credsPath = path.join(__dirname, '..', 'session', 'creds.json');
        if (!fs.existsSync(credsPath)) {
            return await sock.sendMessage(from, { text: '❌ No session found. The bot is not connected.' }, { quoted: msg });
        }

        try {
            const creds = fs.readFileSync(credsPath);
            const compressed = zlib.gzipSync(creds);
            const base64 = compressed.toString('base64');
            const sessionId = `Savage~${base64}`;

            const chunkSize = 100;
            let msgText = `📱 *SESSION ID*\n\n`;
            for (let i = 0; i < sessionId.length; i += chunkSize) {
                msgText += sessionId.slice(i, i + chunkSize) + '\n';
            }
            msgText += `\n_Use this ID in your .env file as SESSION_ID=..._`;

            await sock.sendMessage(from, { text: msgText }, { quoted: msg });
        } catch (err) {
            console.error('GetSession error:', err);
            await sock.sendMessage(from, { text: `❌ Failed to generate session: ${err.message}` }, { quoted: msg });
        }
    }
};
