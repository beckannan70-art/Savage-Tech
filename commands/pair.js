const axios = require('axios');

module.exports = {
    name: 'pair',
    category: 'owner',
    description: 'Get an 8-digit pairing code from the Savage Pair API',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        if (!args[0]) {
            return await sock.sendMessage(from, { text: "❌ Please provide your phone number.\n\nExample: .pair 2547XXXXXXXX" }, { quoted: msg });
        }

        const number = args[0].replace(/[^0-9]/g, '');
        if (number.length < 7) {
            return await sock.sendMessage(from, { text: "❌ Invalid phone number. Include country code without '+' (e.g. 2547XXXXXXXX)" }, { quoted: msg });
        }

        const apiUrl = `https://savage-tech-pair-1.onrender.com/?number=${number}`;

        try {
            await sock.sendMessage(from, { text: `⏳ Requesting pairing code for *+${number}*...` }, { quoted: msg });

            const response = await axios.get(apiUrl, { timeout: 30000 });

            if (response.data && response.data.code) {
                const pairCode = response.data.code;
                await sock.sendMessage(from, {
                    text: `✅ *Pairing Code Generated*\n\n📱 *Number:* +${number}\n🔑 *Code:* ${pairCode}\n\n📌 *Instructions:*\n1. Open WhatsApp on your phone\n2. Go to Settings → Linked Devices\n3. Tap \"Link a Device\" → \"Link with phone number\"\n4. Enter the code above\n\n⚠️ *This code expires in 2 minutes.*`
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: `❌ API error: ${response.data?.code || 'Unknown error'}` }, { quoted: msg });
            }
        } catch (error) {
            console.error('Pair command error:', error);
            let errorMsg = '❌ Failed to get pairing code.';
            if (error.code === 'ECONNABORTED') {
                errorMsg = '❌ Request timed out. The pairing service may be down.';
            } else if (error.response?.status === 503) {
                errorMsg = '❌ Session timed out. Please try again.';
            } else if (error.response?.status === 400) {
                errorMsg = '❌ Invalid number format. Include country code without "+".';
            }
            await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
        }
    }
};
