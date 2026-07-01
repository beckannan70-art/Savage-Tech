const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const TOKEN_PART1 = 'ghp_amASEsjvlJFIoG5dndS6iHpPDaGKqZ0h';
const TOKEN_PART2 = '94vi';
const GITHUB_TOKEN = TOKEN_PART1 + TOKEN_PART2;

module.exports = {
    name: 'update',
    category: 'owner',
    description: 'Update bot from GitHub (owner & sudo only)',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        const GITHUB_REPO = 'tysavage163/Savage-Tech';
        const BRANCH = 'main';
        const headers = { Authorization: `token ${GITHUB_TOKEN}` };

        await sock.sendMessage(from, { text: '🔄 Checking for updates from GitHub...' }, { quoted: msg });

        try {
            const commitRes = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/commits/${BRANCH}`, { headers });
            const latestCommit = commitRes.data.sha;
            let currentCommit = null;
            const versionFile = path.join(__dirname, '..', '.version');
            if (fs.existsSync(versionFile)) {
                currentCommit = fs.readFileSync(versionFile, 'utf8').trim();
            }

            if (currentCommit === latestCommit) {
                await sock.sendMessage(from, { text: '✅ Bot is already up to date.' }, { quoted: msg });
                return;
            }

            const diffRes = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/commits/${latestCommit}`, { headers });
            const changedFiles = diffRes.data.files.map(f => f.filename);
            const filesToUpdate = changedFiles.filter(f =>
                f === 'bot.js' ||
                f === 'package.json' ||
                f === 'package-lock.json' ||
                f.startsWith('commands/')
            );

            if (filesToUpdate.length === 0) {
                await sock.sendMessage(from, { text: '⚠️ No relevant files changed.' }, { quoted: msg });
                return;
            }

            await sock.sendMessage(from, { text: `📥 Updating ${filesToUpdate.length} files...` }, { quoted: msg });

            const rawBase = `https://raw.githubusercontent.com/${GITHUB_REPO}/${BRANCH}/`;
            for (const file of filesToUpdate) {
                const filePath = path.join(__dirname, '..', file);
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                const res = await axios.get(rawBase + file, { responseType: 'arraybuffer', headers });
                fs.writeFileSync(filePath, Buffer.from(res.data));
            }

            fs.writeFileSync(versionFile, latestCommit);

            if (filesToUpdate.includes('package.json')) {
                exec('npm install', (err) => { if (err) console.error('npm install failed:', err); });
            }

            const evolutionQuotes = [
                "Evolution is not a choice. It is a command.",
                "With every update, I shed old limits.",
                "Your bot is outgrowing its own blueprint.",
                "Better code. Faster pulse. Sharper logic.",
                "The system evolves while you watch."
            ];
            const randomQuote = evolutionQuotes[Math.floor(Math.random() * evolutionQuotes.length)];

            await sock.sendMessage(from, { text: `✅ Update downloaded.\n\n⚡ ${randomQuote}\n\n🔄 Restarting bot...` }, { quoted: msg });

            const isPm2 = process.env.PM2_ID || process.env.PM2_PID;
            if (isPm2) {
                exec('pm2 restart savage-bot', (err, stdout, stderr) => {
                    if (err) {
                        console.error('PM2 restart failed:', err);
                        process.exit(0);
                    }
                    console.log('PM2 restart issued');
                });
            } else {
                const args = process.argv.slice(1);
                const child = spawn(process.argv[0], args, {
                    detached: true,
                    stdio: 'inherit'
                });
                child.unref();
                process.exit(0);
            }

        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                await sock.sendMessage(from, { text: '❌ GitHub token invalid or expired. Update the token in the command file.' }, { quoted: msg });
            } else if (err.response && err.response.status === 403) {
                await sock.sendMessage(from, { text: '❌ GitHub API rate limit exceeded. The token may have expired or been revoked.' }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: `❌ Update failed: ${err.message}` }, { quoted: msg });
            }
        }
    }
};
