const settings = require('../settings.js');

module.exports = {
    name: 'alwaystyping',
    category: 'owner',
    desc: 'Toggle the Ghost Engine typing signal.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;
        if (!isArchitect) return;

        const input = args[0] ? args[0].toLowerCase() : null;

        if (input === 'on' || (input === null && global.autoTyping !== 'on')) {
            global.autoTyping = 'on';
            settings.setGlobal('autoTyping', 'on');
            await sock.sendMessage(from, {
                text: "⌨️ GHOST ENGINE: ONLINE\n\n_Signal broadcast active._"
            }, { quoted: msg });
        } else {
            global.autoTyping = 'off';
            settings.setGlobal('autoTyping', 'off');

            await sock.sendPresenceUpdate('available', from);
            await sock.sendPresenceUpdate('available', sock.user.id);

            await sock.sendMessage(from, {
                text: "⌨️ GHOST ENGINE: OFFLINE\n\n_Signal terminated. Presence reset to idle._"
            }, { quoted: msg });
        }
    }
};
