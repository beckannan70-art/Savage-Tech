const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

function downloadFile(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { agent }, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                downloadFile(res.headers.location).then(resolve).catch(reject);
                return;
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

module.exports = {
    name: 'neonpurple',
    category: 'Ephoto',
    description: 'Generate neon-purple text effect',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const text = args.join(' ');
        if (!text) {
            return sock.sendMessage(from, { text: '❌ Usage: .neonpurple <text>' }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_28d599362e';
            const apiUrl = `https://apis.xwolf.space/api/textpro/neon-purple?text=${encodeURIComponent(text)}&key=${apiKey}`;
            const response = await axios.get(apiUrl, { httpsAgent: agent, timeout: 30000 });

            if (!response.data.success) {
                throw new Error(response.data.error || 'API failure');
            }
            if (!response.data.imageUrl) {
                throw new Error('No imageUrl in response');
            }

            const imgBuffer = await downloadFile(response.data.imageUrl);
            await sock.sendMessage(from, {
                image: imgBuffer,
                caption: '✅ Neon purple text effect'
            }, { quoted: msg });
        } catch (err) {
            console.error('Neon purple error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
