const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

function formatNumber(num) {
    if (num === undefined || num === null) return 'N/A';
    if (typeof num === 'number') {
        if (num > 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
        if (num > 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
        if (num > 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
        return num.toLocaleString();
    }
    return num;
}

module.exports = {
    name: 'wallet',
    category: 'financial data',
    description: 'Get financial data (crypto, stock, forex, etc.)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const subcommand = args[0] ? args[0].toLowerCase() : null;
        const param = args.slice(1).join(' ');

        let apiUrl = 'https://apis.xwolf.space/api/economy/wallet';
        let paramLabel = '';
        let type = 'wallet';

        if (subcommand === 'crypto') {
            const symbol = param || 'BTC';
            apiUrl = `https://apis.xwolf.space/api/economy/crypto?symbol=${symbol}`;
            paramLabel = symbol;
            type = 'crypto';
        } else if (subcommand === 'stock') {
            const ticker = param || 'AAPL';
            apiUrl = `https://apis.xwolf.space/api/economy/stock?symbol=${ticker}`;
            paramLabel = ticker;
            type = 'stock';
        } else if (subcommand === 'forex') {
            const [from, to] = param ? param.split(',') : ['USD', 'EUR'];
            apiUrl = `https://apis.xwolf.space/api/economy/forex?from=${from}&to=${to}`;
            paramLabel = `${from}/${to}`;
            type = 'forex';
        } else if (subcommand === 'gold') {
            apiUrl = 'https://apis.xwolf.space/api/economy/gold';
            type = 'gold';
        } else if (subcommand === 'market') {
            apiUrl = 'https://apis.xwolf.space/api/economy/market';
            type = 'market';
        } else if (subcommand === 'inflation') {
            const country = param || 'US';
            apiUrl = `https://apis.xwolf.space/api/economy/inflation?country=${country}`;
            paramLabel = country;
            type = 'inflation';
        } else if (subcommand === 'gdp') {
            const country = param || 'US';
            apiUrl = `https://apis.xwolf.space/api/economy/gdp?country=${country}`;
            paramLabel = country;
            type = 'gdp';
        } else if (subcommand === 'bankrate') {
            const country = param || 'US';
            apiUrl = `https://apis.xwolf.space/api/economy/bank-rate?country=${country}`;
            paramLabel = country;
            type = 'bankrate';
        } else if (subcommand === 'news') {
            apiUrl = 'https://apis.xwolf.space/api/economy/news';
            type = 'news';
        } else if (subcommand && subcommand.match(/^[A-Za-z0-9]{26,}$/)) {
            // treat as wallet address (crypto address)
            apiUrl = `https://apis.xwolf.space/api/economy/wallet?address=${subcommand}`;
            paramLabel = subcommand.slice(0, 10) + '...';
            type = 'wallet';
        } else {
            return sock.sendMessage(from, {
                text: '❌ Usage:\n' +
                    '.wallet crypto <symbol> (e.g., BTC)\n' +
                    '.wallet stock <ticker> (e.g., AAPL)\n' +
                    '.wallet forex <from>,<to> (e.g., USD,EUR)\n' +
                    '.wallet gold\n' +
                    '.wallet market\n' +
                    '.wallet inflation <country> (e.g., US)\n' +
                    '.wallet gdp <country>\n' +
                    '.wallet bankrate <country>\n' +
                    '.wallet news\n' +
                    '.wallet <crypto_address>'
            }, { quoted: msg });
        }

        try {
            const apiKey = 'wxa_f_9ddecf073b';
            const urlWithKey = apiUrl + (apiUrl.includes('?') ? '&' : '?') + `key=${apiKey}`;
            const response = await axios.get(urlWithKey, { httpsAgent: agent, timeout: 15000 });
            const data = response.data;

            if (!data.success) throw new Error(data.error || 'No data');

            let output = `📊 *${type.toUpperCase()} DATA*`;
            if (paramLabel) output += ` (${paramLabel})`;
            output += '\n\n';

            if (type === 'crypto') {
                output += `💎 *${data.symbol || paramLabel}*\n`;
                output += `💰 Price: $${formatNumber(data.price_usd)}\n`;
                if (data.change_24h !== undefined) output += `📈 24h Change: ${data.change_24h > 0 ? '+' : ''}${data.change_24h}%\n`;
                if (data.market_cap_usd) output += `🏦 Market Cap: ${formatNumber(data.market_cap_usd)}\n`;
                if (data.volume_24h_usd) output += `📊 24h Volume: ${formatNumber(data.volume_24h_usd)}\n`;
            } else if (type === 'stock') {
                output += `📈 *${data.symbol || paramLabel}*\n`;
                output += `💵 Price: $${formatNumber(data.price)}\n`;
                if (data.change !== undefined) output += `📉 Change: ${data.change > 0 ? '+' : ''}${data.change}%\n`;
                if (data.volume) output += `📊 Volume: ${formatNumber(data.volume)}\n`;
            } else if (type === 'forex') {
                output += `💱 *${data.from || 'USD'} → ${data.to || 'EUR'}*\n`;
                output += `💹 Rate: ${data.rate || data.result}\n`;
                if (data.change) output += `📈 Change: ${data.change}%\n`;
            } else if (type === 'gold') {
                output += `🥇 *Gold & Silver*\n`;
                output += `🪙 Gold: $${formatNumber(data.gold)}/oz\n`;
                if (data.silver) output += `🥈 Silver: $${formatNumber(data.silver)}/oz\n`;
            } else if (type === 'market') {
                output += `🌍 *Market Indices*\n`;
                if (data.sp500) output += `📊 S&P 500: ${formatNumber(data.sp500)}\n`;
                if (data.dow) output += `📈 Dow Jones: ${formatNumber(data.dow)}\n`;
                if (data.nasdaq) output += `📉 Nasdaq: ${formatNumber(data.nasdaq)}\n`;
            } else if (type === 'inflation') {
                output += `📉 *Inflation Rate (${paramLabel || 'US'})*\n`;
                output += `📅 Annual: ${data.rate}%\n`;
                if (data.year) output += `🗓️ Year: ${data.year}\n`;
            } else if (type === 'gdp') {
                output += `📊 *GDP (${paramLabel || 'US'})*\n`;
                output += `💰 GDP: ${formatNumber(data.gdp)}\n`;
                if (data.growth) output += `📈 Growth: ${data.growth}%\n`;
            } else if (type === 'bankrate') {
                output += `🏦 *Central Bank Rate (${paramLabel || 'US'})*\n`;
                output += `💹 Rate: ${data.rate}%\n`;
            } else if (type === 'news') {
                output += `📰 *Financial News*\n\n`;
                const headlines = data.result || data.articles || [];
                if (Array.isArray(headlines) && headlines.length) {
                    headlines.slice(0, 5).forEach((item, i) => {
                        output += `${i+1}. ${item.title || item.headline}\n`;
                        if (item.source) output += `   📍 ${item.source}\n`;
                        output += `\n`;
                    });
                } else {
                    output += `No news available.\n`;
                }
            } else if (type === 'wallet') {
                output += `💳 *Wallet Balance*\n`;
                output += `💰 Balance: ${formatNumber(data.balance)} ${data.currency || 'BTC'}\n`;
                if (data.transactions) output += `🔄 Transactions: ${data.transactions}\n`;
            } else {
                output += JSON.stringify(data.result || data, null, 2);
            }

            await sock.sendMessage(from, { text: output.slice(0, 2000) }, { quoted: msg });
        } catch (err) {
            console.error('Wallet error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: msg });
        }
    }
};
