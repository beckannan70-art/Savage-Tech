const settings = require('../settings.js');

module.exports = {
  name: 'goodbye',
  category: 'group',
  description: 'Toggle goodbye messages on/off for this group (admin/owner only)',
  async execute(sock, msg, args, { isMe }) {
    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });

    const sender = msg.key.participant || msg.key.remoteJid;
    const groupMetadata = await sock.groupMetadata(from);
    const participant = groupMetadata.participants.find(p => p.id === sender);
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    
    if (!isAdmin && !isMe) return await sock.sendMessage(from, { text: '❎ You are not worthy of this command.' }, { quoted: msg });
    
    if (global.goodbyeEnabled[from] === undefined) global.goodbyeEnabled[from] = true;
    const newState = !global.goodbyeEnabled[from];
    global.goodbyeEnabled[from] = newState;
    settings.setGroup(from, 'goodbyeEnabled', newState);
    await sock.sendMessage(from, { text: `✅ Goodbye messages are now *${newState ? "ON" : "OFF"}* for this group.` }, { quoted: msg });
  }
};
