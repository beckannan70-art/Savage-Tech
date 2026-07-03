const QRCode = require('qrcode');

module.exports = {
  name: 'qrcode',
  category: 'tools',
  description: 'Generate QR code from text (local, no API)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(from, { text: '❓ Usage: .qrcode <text or URL>' }, { quoted: msg });

    try {
      const buffer = await QRCode.toBuffer(text, { errorCorrectionLevel: 'H', margin: 1 });
      await sock.sendMessage(from, {
        image: buffer,
        caption: `📱 *QR Code*\n\nContent: ${text.slice(0, 100)}`
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
    }
  }
};
