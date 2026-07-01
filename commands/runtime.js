const os = require('os');

function getHostPlatform() {
    if (process.env.DYNO) return 'Heroku';
    if (process.env.RENDER) return 'Render';
    if (process.env.VERCEL) return 'Vercel';
    if (process.env.KOYEB) return 'Koyeb';
    if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
    if (process.env.REPLIT_DB_URL) return 'Replit';
    if (process.env.COOLIFY) return 'Coolify';
    if (os.platform() === 'android' && process.env.PREFIX === '/data/data/com.termux/usr') return 'Termux';
    if (os.platform() === 'linux') return 'Linux';
    if (os.platform() === 'win32') return 'Windows';
    if (os.platform() === 'darwin') return 'macOS';
    return 'Unknown';
}

module.exports = {
    name: 'runtime',
    category: 'engine',
    description: 'Show bot runtime & system info',
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / 86400);
        const hours = Math.floor((uptimeSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);

        const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        const platform = getHostPlatform();

        let timeStr = '';
        if (days > 0) timeStr += `${days} day${days > 1 ? 's' : ''} `;
        if (hours > 0) timeStr += `${hours} hr${hours > 1 ? 's' : ''} `;
        if (minutes > 0) timeStr += `${minutes} min${minutes > 1 ? 's' : ''} `;
        if (seconds > 0) timeStr += `${seconds} sec${seconds > 1 ? 's' : ''}`;

        const text = `⏱️ *Savage Tech* has been running on *${platform}* for *${timeStr}*.\n💾 *RAM used:* ${memUsed} MB`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    }
};
