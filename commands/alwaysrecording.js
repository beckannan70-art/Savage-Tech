const settings = require('../settings.js');

module.exports = {
    name: 'alwaysrecording',
    category: 'owner',
    description: 'Toggle global always‑recording presence on/off (owner only)',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoUsers?.includes(sender);

        if (!isArchitect && !isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: "This command is restricted to the owner and sudo users only." }, { quoted: msg });
        }

        if (global.alwaysRecording === undefined) global.alwaysRecording = false;
        const newState = !global.alwaysRecording;
        global.alwaysRecording = newState;
        settings.setGlobal('alwaysRecording', newState);
        await sock.sendMessage(from, { text: `🎙️ Always‑recording is now *${newState ? "ON" : "OFF"}* globally.` }, { quoted: msg });
    }
};
