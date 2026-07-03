const os = require('os');
const axios = require('axios');

module.exports = {
    name: 'system',
    category: 'engine',
    description: 'Show detailed system info',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        const hostname = os.hostname();
        const platform = os.platform();
        const release = os.release();
        const arch = os.arch();
        const uptime = os.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const uptimeStr = `${days}d ${hours}h ${minutes}m`;

        const cpus = os.cpus();
        const cpuModel = cpus[0]?.model || 'Unknown';
        const cpuSpeed = cpus[0]?.speed || 0;
        const cpuCores = cpus.length;

        const loadAvg = os.loadavg();
        const load1 = loadAvg[0].toFixed(2);
        const load5 = loadAvg[1].toFixed(2);
        const load15 = loadAvg[2].toFixed(2);

        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);
        const memPercent = ((totalMem - freeMem) / totalMem * 100).toFixed(1);

        const nodeVersion = process.version;
        const botUptime = process.uptime();
        const botDays = Math.floor(botUptime / 86400);
        const botHours = Math.floor((botUptime % 86400) / 3600);
        const botMinutes = Math.floor((botUptime % 3600) / 60);
        const botUptimeStr = `${botDays}d ${botHours}h ${botMinutes}m`;

        const caption = `
╔═══════════════════════════════╗
║        SYSTEM INFORMATION     ║
╚═══════════════════════════════╝

─── *🖥️ HARDWARE* ───
🏷️ Hostname   : ${hostname}
💻 Platform   : ${platform} ${release}
🔧 Arch       : ${arch}
🧠 CPU        : ${cpuModel}
⚡ Speed      : ${cpuSpeed} MHz
💪 Cores      : ${cpuCores}
📊 Load Avg   : ${load1} / ${load5} / ${load15} (1/5/15 min)

─── *🧮 MEMORY* ───
📦 Total      : ${totalMem} GB
📤 Used       : ${usedMem} GB (${memPercent}%)
📥 Free       : ${freeMem} GB

─── *⏱️ UPTIME* ───
🔄 System     : ${uptimeStr}
🤖 Bot        : ${botUptimeStr}

─── *⚙️ NODE* ───
📦 Version    : ${nodeVersion}
`;

        let imageBuffer = null;
        try {
            const imgRes = await axios.get('https://files.catbox.moe/ls3djv.jpg', {
                responseType: 'arraybuffer',
                timeout: 10000
            });
            imageBuffer = Buffer.from(imgRes.data);
        } catch (imgErr) {
            console.warn('Could not fetch system image:', imgErr.message);
        }

        if (imageBuffer) {
            await sock.sendMessage(from, {
                image: imageBuffer,
                caption: caption
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, {
                text: caption
            }, { quoted: msg });
        }
    }
};
