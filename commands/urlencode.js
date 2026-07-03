module.exports = {
    name: 'urlencode',
    category: 'tools',
    description: 'URL encode a string',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const text = args.join(' ');
        if (!text) {
            return sock.sendMessage(from, { text: '❌ Usage: .urlencode <text>' }, { quoted: msg });
        }

        const encoded = encodeURIComponent(text);
        await sock.sendMessage(from, { text: `🔗 *URL Encoded*\n\n${encoded}` }, { quoted: msg });
    }
};
