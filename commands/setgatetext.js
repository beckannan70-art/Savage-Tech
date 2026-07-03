const settings = require('../settings.js');

module.exports = {
    name: 'setgatetext',
    category: 'group',
    execute: async (sock, msg, args, { isMe }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '❌ Group only.' }, { quoted: msg });
        }
        const isAdmin = await global.checkAdmin(sock, from, msg.key.participant || msg.key.remoteJid);
        if (!isAdmin && !isMe) {
            return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });
        }

        if (!args.length) {
            return await sock.sendMessage(from, { text: 'Usage: .setgatetext <your custom text>' }, { quoted: msg });
        }
        const customText = args.join(' ');
        if (!global.gateConfig) global.gateConfig = {};
        if (!global.gateConfig[from]) global.gateConfig[from] = {};
        global.gateConfig[from].customText = customText;
        settings.setGroup(from, 'gateConfig', global.gateConfig[from]);
        await sock.sendMessage(from, { text: `✅ Custom verification message saved:\n\n${customText}` }, { quoted: msg });
    }
};
