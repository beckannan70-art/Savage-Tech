const os = require('os');

function getHostPlatform() {
    if (process.env.DYNO) return 'Heroku (Dyno)';
    if (process.env.RENDER) return 'Render';
    if (process.env.VERCEL) return 'Vercel';
    if (process.env.KOYEB) return 'Koyeb';
    if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
    if (process.env.REPLIT_DB_URL) return 'Replit';
    if (process.env.COOLIFY) return 'Coolify';
    if (os.platform() === 'android' && process.env.PREFIX === '/data/data/com.termux/usr') return 'Termux (Android)';
    if (os.platform() === 'linux') return 'Linux (Panel)';
    if (os.platform() === 'win32') return 'Windows';
    if (os.platform() === 'darwin') return 'macOS';
    return 'Unknown / Local';
}

module.exports = {
    category: 'engine',
    name: 'alive',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        const quotes = [
            "Be a wolf. The sheep are boring.",
            "Silence is the best response to a fool.",
            "I don't have a backup plan, because I'm not going to fail.",
            "History is written by the victors. I'm busy writing.",
            "Don't study me. You won't graduate.",
            "My circle is small because I'm into quality, not quantity.",
            "I'm not heartless, I just learned how to use my heart less.",
            "Stay low, stay quiet, keep 'em guessing.",
            "Success is the loudest noise I make.",
            "Winners focus on winning. Losers focus on winners."
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const host = getHostPlatform();
        const speed = ((Date.now() - msg.messageTimestamp * 1000) / 1000).toFixed(3);

        const statusText = `
*SAVAGE-TECH IS LIVE* ⚡

${randomQuote}

*Speed:* ${speed} ms
*Status:* Online
*Host:* ${host}`;

        await sock.sendMessage(from, { 
            image: { url: 'https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/e91b4f95-67b1-4819-b737-b033df5d7e3b.jpg' }, 
            caption: statusText 
        }, { quoted: msg });
    }
};
