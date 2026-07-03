module.exports = {
    name: 'urldecode',
    category: 'tools',
    description: 'URL decode a string',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const encoded = args.join(' ');
        if (!encoded) {
            return sock.sendMessage(from, { text: '❌ Usage: .urldecode <encoded_string>' }, { quoted: msg });
        }

        try {
            const decoded = decodeURIComponent(encoded);
            await sock.sendMessage(from, { text: `🔓 *URL Decoded*\n\n${decoded}` }, { quoted: msg });
        } catch {
            await sock.sendMessage(from, { text: '❌ Invalid URL encoded string.' }, { quoted: msg });
        }
    }
};
