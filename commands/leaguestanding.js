const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
    name: 'leaguestanding',
    category: 'sports',
    description: 'Get league standings table',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '❌ Usage: .leaguestanding <league name>' }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { text: `📊 Fetching standings for "${query}"...` }, { quoted: msg });

            const apiKey = 'wxa_f_1be53c1604';
            const apiUrl = `https://apis.xwolf.space/api/sports/league/table?q=${encodeURIComponent(query)}&key=${apiKey}`;
            const response = await axios.get(apiUrl, { httpsAgent: agent, timeout: 15000 });

            if (!response.data.success || !response.data.result) throw new Error('No table');

            const teams = response.data.result;
            let text = `🏆 *Standings: ${query}*\n\n`;
            if (Array.isArray(teams)) {
                text += `# | Team                | P | W | D | L | GF | GA | Pts\n`;
                teams.slice(0, 20).forEach((t, i) => {
                    text += `${i + 1} | ${(t.name || '').padEnd(20)} | ${t.played || 0} | ${t.win || 0} | ${t.draw || 0} | ${t.loss || 0} | ${t.goalsFor || 0} | ${t.goalsAgainst || 0} | ${t.points || 0}\n`;
                });
            } else {
                text += JSON.stringify(teams, null, 2);
            }

            await sock.sendMessage(from, { text: text.slice(0, 2000) }, { quoted: msg });
        } catch (err) {
            console.error('League standing error:', err);
            await sock.sendMessage(from, { text: `❌ Standings error: ${err.message}` }, { quoted: msg });
        }
    }
};
