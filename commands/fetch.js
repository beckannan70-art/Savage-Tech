const axios = require('axios');

module.exports = {
    name: "fetch",
    category: "tools",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!args[0]) return await sock.sendMessage(from, { text: "☣️ Provide a URL." }, { quoted: msg });
        
        try {
            const response = await axios.get(args[0]);
            const data = JSON.stringify(response.data, null, 2).slice(0, 1000);
            await sock.sendMessage(from, { text: `📡 **DATA FETCHED:**\n\n\`\`\`${data}\`\`\`` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: `❌ **FETCH FAILED:** ${e.message}` }, { quoted: msg });
        }
    }
};
