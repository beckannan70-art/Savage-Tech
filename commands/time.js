module.exports = {
    name: 'time',
    category: 'engine',
    description: 'Show current date and time',
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        const now = new Date();
        const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const text = `🕐 *Current Time*\n\n📅 ${date}\n⏰ ${time}\n🌍 ${timezone}`;
        await sock.sendMessage(from, { text }, { quoted: msg });
    }
};
