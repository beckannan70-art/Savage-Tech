module.exports = {
    name: 'restart',
    category: 'owner',
    description: 'Restart the bot (owner & sudo only)',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '🔄 Bot restarting...' }, { quoted: msg });

        const isPm2 = process.env.PM2_ID || process.env.PM2_PID;
        if (isPm2) {
            const { exec } = require('child_process');
            exec('pm2 restart savage-bot', (err, stdout, stderr) => {
                if (err) {
                    console.error('PM2 restart failed:', err);
                    process.exit(0);
                }
                console.log('PM2 restart issued');
            });
        } else {
            const { spawn } = require('child_process');
            const args = process.argv.slice(1);
            const child = spawn(process.argv[0], args, {
                detached: true,
                stdio: 'inherit'
            });
            child.unref();
            process.exit(0);
        }
    }
};
